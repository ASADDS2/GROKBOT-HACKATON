import type { ReporteDTO } from "../../../shared/types/api.ts";

export interface ExtraccionReporte {
  barrio_texto: string | null;
  dias_sin_agua: number | null;
  personas: number | null;
  sintomas: string[];
  casos: number;
  via_cerrada: boolean | null;
  es_albergue: boolean | null;
  confianza: number;
  razon_confianza: string;
}

/** Stub B1: la extracción con Grok se implementa en B3. */
export async function extraerReporte(
  _textoCrudo: string,
): Promise<ExtraccionReporte> {
  throw new Error("extraerReporte aún no implementado (B3)");
}

export function extraccionARevision(): Pick<
  ReporteDTO,
  "necesita_revision" | "confianza"
> {
  return { necesita_revision: true, confianza: 0 };
}
