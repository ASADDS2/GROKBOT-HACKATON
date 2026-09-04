/**
 * Cliente mínimo de la API de xAI (Grok) para /v1/chat/completions.
 * Solo servidor. Lee XAI_API_KEY y XAI_MODEL de process.env.
 * NUNCA se importa desde /client.
 */

const ENDPOINT = "https://api.x.ai/v1/chat/completions";

export interface EsquemaJson {
  name: string;
  schema: Record<string, unknown>;
}

export interface OpcionesChat {
  system: string;
  user: string;
  esquema: EsquemaJson;
  timeoutMs?: number;
}

export class GrokError extends Error {}

function apiKey(): string {
  const key = process.env.XAI_API_KEY;
  if (!key) {
    throw new GrokError("Falta XAI_API_KEY en el entorno (server/.env)");
  }
  return key;
}

function modelo(): string {
  return process.env.XAI_MODEL ?? "grok-4";
}

/**
 * Llama a Grok pidiendo salida JSON estricta contra un json_schema y
 * devuelve el objeto ya parseado (sin validar contra Zod: eso lo hace
 * el llamador). Aborta si supera timeoutMs.
 */
export async function chatJson(opts: OpcionesChat): Promise<unknown> {
  const { system, user, esquema, timeoutMs = 10_000 } = opts;
  const controlador = new AbortController();
  const temporizador = setTimeout(() => controlador.abort(), timeoutMs);

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey()}`,
      },
      body: JSON.stringify({
        model: modelo(),
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        temperature: 0,
        response_format: {
          type: "json_schema",
          json_schema: {
            name: esquema.name,
            schema: esquema.schema,
            strict: true,
          },
        },
      }),
      signal: controlador.signal,
    });

    if (!res.ok) {
      const detalle = await res.text().catch(() => "");
      throw new GrokError(
        `xAI respondió ${res.status}: ${detalle.slice(0, 500)}`,
      );
    }

    const cuerpo = (await res.json()) as {
      choices?: { message?: { content?: string } }[];
    };
    const contenido = cuerpo.choices?.[0]?.message?.content;
    if (!contenido) {
      throw new GrokError("Respuesta de xAI sin contenido");
    }

    try {
      return JSON.parse(contenido);
    } catch {
      throw new GrokError("El contenido de xAI no es JSON válido");
    }
  } catch (err: unknown) {
    if (err instanceof Error && err.name === "AbortError") {
      throw new GrokError(`Timeout de ${timeoutMs}ms llamando a xAI`);
    }
    throw err;
  } finally {
    clearTimeout(temporizador);
  }
}
