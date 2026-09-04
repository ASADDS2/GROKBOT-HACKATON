import type { BarrioSedProperties } from "../../../shared/types/api.ts";

export function pasoEscala(diasSinAgua: number): BarrioSedProperties["paso_escala"] {
  if (diasSinAgua <= 1) return 0;
  if (diasSinAgua <= 3) return 1;
  if (diasSinAgua <= 5) return 2;
  return 3;
}

/** Stub B1: el cálculo vivo se hace en la vista SQL indice_sed (B2). */
export function calcularIndiceSed(
  diasSinAgua: number,
  personas: number,
  vulnerabilidad: number,
): number {
  return diasSinAgua * Math.log(1 + personas) * vulnerabilidad;
}
