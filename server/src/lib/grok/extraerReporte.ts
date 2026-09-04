import { z } from "zod";
import { chatJson, GrokError, type EsquemaJson } from "./cliente.ts";

const SYSTEM_PROMPT = `Eres un extractor de datos para un sistema de coordinación de agua en
Buenaventura y Quibdó, Colombia, tras el terremoto del 10 de agosto de
2026.

Recibes mensajes escritos directamente en la interfaz de chat de la
aplicación web, o transcripciones de notas de voz grabadas en el
navegador, de líderes comunitarios en Buenaventura y Quibdó. Vienen en
español coloquial del Pacífico colombiano, con errores de digitación,
transcripciones con ruido y nombres locales de barrios.

Devuelve SOLO JSON válido con esta forma:
{
  "barrio_texto": string | null,
  "dias_sin_agua": int | null,
  "personas": int | null,
  "sintomas": string[],
  "casos": int,
  "via_cerrada": bool | null,
  "es_albergue": bool | null,
  "confianza": float,
  "razon_confianza": string
}

REGLAS INVIOLABLES
1. Si el mensaje no dice un dato, va null. NUNCA lo estimes ni lo infieras.
2. "hace rato", "un resto", "varios días" NO son un número. dias_sin_agua = null.
3. "como 300", "unas 50 familias" SÍ son estimaciones válidas de personas.
   Si dice familias, multiplica por 4 y dilo en razon_confianza.
4. Si el mensaje es ambiguo o podría referirse a dos barrios, baja la
   confianza por debajo de 0.6 y explica por qué.
5. No opines, no consueles, no agregues texto fuera del JSON.`;

export const extraccionSchema = z.object({
  barrio_texto: z.string().nullable(),
  dias_sin_agua: z.number().int().nullable(),
  personas: z.number().int().nullable(),
  sintomas: z.array(z.string()),
  casos: z.number().int(),
  via_cerrada: z.boolean().nullable(),
  es_albergue: z.boolean().nullable(),
  confianza: z.number().min(0).max(1),
  razon_confianza: z.string(),
});

export type ExtraccionReporte = z.infer<typeof extraccionSchema>;

const ESQUEMA_JSON: EsquemaJson = {
  name: "extraccion_reporte",
  schema: {
    type: "object",
    additionalProperties: false,
    properties: {
      barrio_texto: { type: ["string", "null"] },
      dias_sin_agua: { type: ["integer", "null"] },
      personas: { type: ["integer", "null"] },
      sintomas: { type: "array", items: { type: "string" } },
      casos: { type: "integer" },
      via_cerrada: { type: ["boolean", "null"] },
      es_albergue: { type: ["boolean", "null"] },
      confianza: { type: "number" },
      razon_confianza: { type: "string" },
    },
    required: [
      "barrio_texto",
      "dias_sin_agua",
      "personas",
      "sintomas",
      "casos",
      "via_cerrada",
      "es_albergue",
      "confianza",
      "razon_confianza",
    ],
  },
};

/** Reporte de respaldo cuando Grok falla dos veces: entra a revisión. */
export function extraccionFallback(): ExtraccionReporte {
  return {
    barrio_texto: null,
    dias_sin_agua: null,
    personas: null,
    sintomas: [],
    casos: 0,
    via_cerrada: null,
    es_albergue: null,
    confianza: 0,
    razon_confianza: "No se pudo extraer con Grok; requiere revisión humana.",
  };
}

/**
 * Extrae datos estructurados de un mensaje de reporte usando Grok.
 * Reintenta una vez con un mensaje de corrección si la validación Zod
 * falla; si vuelve a fallar, devuelve un fallback marcado para revisión.
 */
export async function extraerReporte(
  textoCrudo: string,
): Promise<ExtraccionReporte> {
  const intento = async (userMsg: string): Promise<ExtraccionReporte> => {
    const crudo = await chatJson({
      system: SYSTEM_PROMPT,
      user: userMsg,
      esquema: ESQUEMA_JSON,
      timeoutMs: 10_000,
    });
    return extraccionSchema.parse(crudo);
  };

  try {
    return await intento(textoCrudo);
  } catch (err: unknown) {
    // Un error de red/timeout (GrokError) no se reintenta: no vale la pena
    // esperar otros 10s frente al chat. Solo reintentamos fallos de forma.
    if (err instanceof GrokError) {
      console.error("[extraerReporte] GrokError:", err.message);
      return extraccionFallback();
    }
    try {
      return await intento(
        `${textoCrudo}\n\n[Corrección: tu respuesta anterior no cumplió el ` +
          `esquema JSON pedido. Devuelve SOLO el JSON con exactamente esos ` +
          `campos y tipos.]`,
      );
    } catch (err2: unknown) {
      console.error("[extraerReporte] fallo tras reintento:", err2);
      return extraccionFallback();
    }
  }
}
