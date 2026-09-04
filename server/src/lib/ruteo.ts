import type { RutaParada } from "../../../shared/types/api.ts";

export const CAPACIDAD_DEFAULT_LITROS = 10_000;

/** Litros sugeridos por persona en una entrega de emergencia. */
export const LITROS_POR_PERSONA = 5;

export interface CandidatoRuteo {
  barrio_id: string;
  personas: number;
  indice_sed: number;
  via_abierta: boolean;
}

/**
 * Ruteo greedy: ordena barrios por índice de sed descendente, excluye
 * los de vía cerrada y reparte la capacidad del carrotanque hasta
 * agotarla. Los litros sugeridos por barrio se estiman por población,
 * acotados a la capacidad restante.
 */
export function ruteoGreedy(
  candidatos: CandidatoRuteo[],
  capacidadLitros: number = CAPACIDAD_DEFAULT_LITROS,
): RutaParada[] {
  const ordenados = candidatos
    .filter((c) => c.via_abierta)
    .sort((a, b) => b.indice_sed - a.indice_sed);

  const paradas: RutaParada[] = [];
  let restante = capacidadLitros;
  let orden = 1;

  for (const c of ordenados) {
    if (restante <= 0) break;
    const objetivo = Math.max(0, Math.ceil(c.personas * LITROS_POR_PERSONA));
    const litros_sug = Math.min(restante, objetivo);
    if (litros_sug <= 0) continue;
    paradas.push({ barrio_id: c.barrio_id, orden, litros_sug });
    restante -= litros_sug;
    orden += 1;
  }

  return paradas;
}
