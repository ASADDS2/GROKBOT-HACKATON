import { z } from "zod";
import { getPool } from "../db.ts";
import { chatJson, GrokError, type EsquemaJson } from "./cliente.ts";

const SYSTEM_PROMPT = `Se ejecuta solo cuando el prompt A devuelve confianza < 0.6.

Recibes: el texto crudo del mensaje, el "barrio_texto" extraído, y una
lista de barrios candidatos del padrón con su municipio y comuna.

Devuelve SOLO JSON:
{ "barrio_id": string | null, "confianza": float, "alternativas": string[] }

REGLAS
1. Considera errores fonéticos del habla del Pacífico, no solo distancia
   de edición: "Yeras"/"Lleras", "Sanpetro"/"San Pedro".
2. Si dos candidatos quedan casi empatados, devuelve barrio_id = null
   y ambos en alternativas. Un humano decide en la bandeja de revisión.
3. Nunca elijas el barrio más grande solo por ser el más probable a priori.
4. barrio_id y cada alternativa DEBEN ser un id exacto de la lista de
   candidatos. No inventes ids.`;

export const resolucionSchema = z.object({
  barrio_id: z.string().nullable(),
  confianza: z.number().min(0).max(1),
  alternativas: z.array(z.string()),
});

export type ResolucionBarrio = z.infer<typeof resolucionSchema>;

const ESQUEMA_JSON: EsquemaJson = {
  name: "resolucion_barrio",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      barrio_id: { type: ["string", "null"] },
      confianza: { type: "number" },
      alternativas: { type: "array", items: { type: "string" } },
    },
    required: ["barrio_id", "confianza", "alternativas"],
  },
};

interface CandidatoBarrio {
  id: string;
  nombre: string;
  municipio: string;
  comuna: string | null;
  alias: string[];
}

async function cargarCandidatos(): Promise<CandidatoBarrio[]> {
  const { rows } = await getPool().query<CandidatoBarrio>(
    `select id, nombre, municipio, comuna, alias from barrios order by nombre`,
  );
  return rows;
}

/**
 * Desambigua a qué barrio del padrón se refiere un reporte de baja
 * confianza. La lista de candidatos sale de la tabla barrios, no se
 * inventa ni se hardcodea.
 */
export async function resolverBarrio(
  textoCrudo: string,
  barrioTexto: string | null,
): Promise<ResolucionBarrio> {
  const candidatos = await cargarCandidatos();
  const idsValidos = new Set(candidatos.map((c) => c.id));

  const userMsg = [
    `Texto crudo del mensaje: ${JSON.stringify(textoCrudo)}`,
    `barrio_texto extraído: ${JSON.stringify(barrioTexto)}`,
    `Barrios candidatos (elige por id):`,
    JSON.stringify(
      candidatos.map((c) => ({
        id: c.id,
        nombre: c.nombre,
        municipio: c.municipio,
        comuna: c.comuna,
        alias: c.alias,
      })),
      null,
      2,
    ),
  ].join("\n");

  try {
    const crudo = await chatJson({
      system: SYSTEM_PROMPT,
      user: userMsg,
      esquema: ESQUEMA_JSON,
      timeoutMs: 10_000,
    });
    const resuelto = resolucionSchema.parse(crudo);

    // Nunca confiar ciegamente: filtra ids que no estén en el padrón.
    const barrioId =
      resuelto.barrio_id && idsValidos.has(resuelto.barrio_id)
        ? resuelto.barrio_id
        : null;
    const alternativas = resuelto.alternativas.filter((a) => idsValidos.has(a));

    return { barrio_id: barrioId, confianza: resuelto.confianza, alternativas };
  } catch (err: unknown) {
    if (err instanceof GrokError) {
      console.error("[resolverBarrio] GrokError:", err.message);
    } else {
      console.error("[resolverBarrio] error:", err);
    }
    return { barrio_id: null, confianza: 0, alternativas: [] };
  }
}
