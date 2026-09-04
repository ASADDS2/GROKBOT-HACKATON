import { Router } from "express";
import { z } from "zod";
import type { ApiError, ReporteDTO } from "../../../shared/types/api.ts";
import type { ReporteRow } from "../../../shared/types/database.ts";
import { getPool } from "../lib/db.ts";
import { extraerReporte } from "../lib/grok/extraerReporte.ts";
import { resolverBarrio } from "../lib/grok/resolverBarrio.ts";
import { buscarBarrioPorTexto, filaAReporteDTO } from "../lib/reportes.ts";

export const reportesRouter = Router();

const UMBRAL_REVISION = 0.6;

const reporteInputSchema = z.object({
  texto_crudo: z.string().min(1),
  canal: z.enum(["web", "voz", "x"]),
  sesion_id: z.string().optional(),
});

const patchSchema = z
  .object({
    barrio_id: z.string().nullable().optional(),
    necesita_revision: z.boolean().optional(),
  })
  .refine((v) => v.barrio_id !== undefined || v.necesita_revision !== undefined, {
    message: "Se requiere barrio_id o necesita_revision",
  });

reportesRouter.post("/", async (req, res) => {
  const parsed = reporteInputSchema.safeParse(req.body);
  if (!parsed.success) {
    const body: ApiError = { error: "Body inválido: se requiere texto_crudo y canal" };
    return res.status(400).json(body);
  }
  const { texto_crudo, canal, sesion_id } = parsed.data;
  // Loguea el payload crudo antes de procesar (regla de la Parte 0).
  console.log("[POST /api/reportes] payload:", JSON.stringify(parsed.data));

  try {
    const extraccion = await extraerReporte(texto_crudo);

    // Canal 'x' nunca supera 0.5 de confianza (regla no negociable 6).
    const confianza =
      canal === "x" ? Math.min(extraccion.confianza, 0.5) : extraccion.confianza;

    let barrioId: string | null = null;
    let alternativas: string[] = [];

    if (confianza < UMBRAL_REVISION) {
      const resolucion = await resolverBarrio(texto_crudo, extraccion.barrio_texto);
      barrioId = resolucion.barrio_id;
      alternativas = resolucion.alternativas;
    } else {
      barrioId = await buscarBarrioPorTexto(extraccion.barrio_texto);
    }

    const necesitaRevision = confianza < UMBRAL_REVISION;

    const { rows } = await getPool().query<ReporteRow>(
      `insert into reportes (
         barrio_id, canal, texto_crudo, dias_sin_agua, personas,
         sintomas, casos, confianza, necesita_revision, sesion_id
       ) values ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
       returning *`,
      [
        barrioId,
        canal,
        texto_crudo,
        extraccion.dias_sin_agua,
        extraccion.personas,
        extraccion.sintomas,
        extraccion.casos,
        confianza,
        necesitaRevision,
        sesion_id ?? null,
      ],
    );

    const dto: ReporteDTO = filaAReporteDTO(rows[0], alternativas);
    return res.status(201).json(dto);
  } catch (err: unknown) {
    console.error("[POST /api/reportes] error:", err);
    const body: ApiError = { error: "No se pudo procesar el reporte" };
    return res.status(500).json(body);
  }
});

reportesRouter.get("/revision", async (_req, res) => {
  try {
    const { rows } = await getPool().query<ReporteRow>(
      `select * from reportes
        where necesita_revision = true
        order by created_at desc`,
    );
    // alternativas_barrio no se persiste (schema congelado); la bandeja
    // deja al operador elegir del padrón completo.
    const dtos: ReporteDTO[] = rows.map((r) => filaAReporteDTO(r));
    return res.json(dtos);
  } catch (err: unknown) {
    console.error("[GET /api/reportes/revision] error:", err);
    const body: ApiError = { error: "No se pudieron leer los reportes" };
    return res.status(500).json(body);
  }
});

reportesRouter.patch("/:id", async (req, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    const body: ApiError = { error: "Body inválido para PATCH" };
    return res.status(400).json(body);
  }

  const sets: string[] = [];
  const valores: unknown[] = [];
  if (parsed.data.barrio_id !== undefined) {
    valores.push(parsed.data.barrio_id);
    sets.push(`barrio_id = $${valores.length}`);
  }
  if (parsed.data.necesita_revision !== undefined) {
    valores.push(parsed.data.necesita_revision);
    sets.push(`necesita_revision = $${valores.length}`);
  }
  valores.push(req.params.id);

  try {
    const { rows } = await getPool().query<ReporteRow>(
      `update reportes set ${sets.join(", ")}
        where id = $${valores.length}
        returning *`,
      valores,
    );
    if (rows.length === 0) {
      const body: ApiError = { error: "Reporte no encontrado" };
      return res.status(404).json(body);
    }
    return res.json(filaAReporteDTO(rows[0]));
  } catch (err: unknown) {
    console.error("[PATCH /api/reportes/:id] error:", err);
    const body: ApiError = { error: "No se pudo actualizar el reporte" };
    return res.status(500).json(body);
  }
});
