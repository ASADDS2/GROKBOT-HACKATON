import { Router } from "express";
import type { AlertaDTO, ApiError } from "../../../shared/types/api.ts";
import type { AlertaSaludRow } from "../../../shared/types/database.ts";
import { getPool } from "../lib/db.ts";

export const alertasRouter = Router();

type Severidad = AlertaDTO["severidad"];
const NIVELES: Severidad[] = ["observacion", "alerta", "urgente"];

interface Conteo {
  barrio_id: string;
  sintoma: string;
  casos: number;
}

/**
 * La línea base es el promedio de casos por ventana de 72h en las dos
 * semanas previas (excluyendo las últimas 72h). El periodo previo mide
 * 14d - 72h = 11 días ≈ 3.667 ventanas de 72h.
 */
const VENTANAS_BASE = (14 * 24 - 72) / 72;

function nivelBase(casos72h: number, lineaBase: number): number {
  if (casos72h < 3) return 0;
  if (casos72h >= 4 * lineaBase) return 3; // urgente
  if (casos72h >= 2 * lineaBase) return 2; // alerta
  return 0;
}

alertasRouter.get("/", async (_req, res) => {
  try {
    const pool = getPool();

    const q72 = await pool.query<Conteo>(
      `select barrio_id, sintoma, sum(casos)::int as casos
         from reportes, unnest(sintomas) as sintoma
        where created_at >= now() - interval '72 hours'
          and barrio_id is not null
        group by barrio_id, sintoma
       having sum(casos) > 0`,
    );

    const qBase = await pool.query<Conteo>(
      `select barrio_id, sintoma, sum(casos)::int as casos
         from reportes, unnest(sintomas) as sintoma
        where created_at >= now() - interval '14 days'
          and created_at <  now() - interval '72 hours'
          and barrio_id is not null
        group by barrio_id, sintoma`,
    );

    const diasQ = await pool.query<{ id: string; dias_sin_agua: number }>(
      `select id, dias_sin_agua from indice_sed`,
    );
    const diasPorBarrio = new Map<string, number>(
      diasQ.rows.map((r) => [r.id, Number(r.dias_sin_agua)]),
    );

    const baseline = new Map<string, number>();
    for (const b of qBase.rows) {
      baseline.set(`${b.barrio_id}|${b.sintoma}`, b.casos / VENTANAS_BASE);
    }

    const activas: AlertaDTO[] = [];
    for (const c of q72.rows) {
      const lineaBase = baseline.get(`${c.barrio_id}|${c.sintoma}`) ?? 0;
      let nivel = nivelBase(c.casos, lineaBase);

      // Si el barrio tiene 5+ días sin agua, sube un nivel de severidad.
      const dias = diasPorBarrio.get(c.barrio_id) ?? 0;
      if (dias >= 5) nivel = Math.min(3, nivel + 1);

      if (nivel < 1) continue;
      const severidad = NIVELES[nivel - 1];

      const insertada = await pool.query<AlertaSaludRow>(
        `insert into alertas_salud
           (barrio_id, sintoma, casos_72h, linea_base, severidad)
         values ($1,$2,$3,$4,$5)
         returning *`,
        [c.barrio_id, c.sintoma, c.casos, Number(lineaBase.toFixed(2)), severidad],
      );
      const row = insertada.rows[0];
      activas.push({
        id: row.id,
        barrio_id: row.barrio_id ?? c.barrio_id,
        sintoma: row.sintoma,
        casos_72h: row.casos_72h,
        linea_base: Number(row.linea_base ?? 0),
        severidad: (row.severidad as Severidad) ?? severidad,
        created_at: new Date(row.created_at).toISOString(),
      });
    }

    return res.json(activas);
  } catch (err: unknown) {
    console.error("[GET /api/alertas] error:", err);
    const body: ApiError = { error: "No se pudieron calcular las alertas" };
    return res.status(500).json(body);
  }
});
