export interface ResolucionBarrio {
  barrio_id: string | null;
  confianza: number;
  alternativas: string[];
}

/** Stub B1: el desambiguador de barrio se implementa en B3. */
export async function resolverBarrio(
  _textoCrudo: string,
  _barrioTexto: string | null,
): Promise<ResolucionBarrio> {
  throw new Error("resolverBarrio aún no implementado (B3)");
}
