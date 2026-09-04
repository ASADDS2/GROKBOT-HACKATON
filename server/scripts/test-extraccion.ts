import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { extraerReporte } from "../src/lib/grok/extraerReporte.ts";
import { resolverBarrio } from "../src/lib/grok/resolverBarrio.ts";
import { getPool } from "../src/lib/db.ts";

const raizServer = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(raizServer, ".env") });

const MENSAJES = [
  "vecinos en el lleras llevamos 6 días sin una gota, somos como 300 personas",
  "el progreso lleva rato sin agua, el tanque está seco",
  "sanpetro o san francisco? 4 días igual, 500 personas más o menos",
  "en la yesca hay 6 niños con diarrea, llevamos 6 días sin agua",
  "la independencia 7 días y la vía pa entrar está cerrada por el derrumbe",
];

async function main(): Promise<void> {
  for (const msg of MENSAJES) {
    console.log("\n=== Mensaje ===");
    console.log(msg);
    const extraccion = await extraerReporte(msg);
    console.log("--- extraerReporte ---");
    console.log(JSON.stringify(extraccion, null, 2));

    if (extraccion.confianza < 0.6) {
      const resolucion = await resolverBarrio(msg, extraccion.barrio_texto);
      console.log("--- resolverBarrio (confianza < 0.6) ---");
      console.log(JSON.stringify(resolucion, null, 2));
    }
  }
  await getPool().end();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
