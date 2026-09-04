import type { CanalReporte, ReporteDTO } from "../../../shared/types/api.ts";
import type { ReporteRow } from "../../../shared/types/database.ts";
import { getPool } from "./db.ts";

/**
 * Busca deterministamente un barrio por su nombre o alias, comparando
 * en minúsculas. Se usa cuando la extracción tiene confianza alta y no
 * hace falta gastar una llamada a Grok para desambiguar.
 */
export async function buscarBarrioPorTexto(
  barrioTexto: string | null,
): Promise<string | null> {
  if (!barrioTexto) return null;
  const clave = barrioTexto.trim().toLowerCase();
  if (!clave) return null;

  const { rows } = await getPool().query<{ id: string }>(
    `select id
       from barrios
      where lower(nombre) = $1
         or $1 = any (select lower(a) from unnest(alias) as a)
      limit 1`,
    [clave],
  );
  return rows[0]?.id ?? null;
}

/** Convierte una fila de reportes al DTO compartido con el frontend. */
export function filaAReporteDTO(
  row: ReporteRow,
  alternativas?: string[],
): ReporteDTO {
  const dto: ReporteDTO = {
    id: row.id,
    barrio_id: row.barrio_id,
    canal: row.canal as CanalReporte,
    texto_crudo: row.texto_crudo,
    dias_sin_agua: row.dias_sin_agua,
    personas: row.personas,
    sintomas: row.sintomas ?? [],
    casos: row.casos ?? 0,
    confianza: row.confianza === null ? 0 : Number(row.confianza),
    necesita_revision: row.necesita_revision,
    created_at: new Date(row.created_at).toISOString(),
  };
  if (alternativas && alternativas.length > 0) {
    dto.alternativas_barrio = alternativas;
  }
  return dto;
}
