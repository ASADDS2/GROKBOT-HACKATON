/**
 * Cliente Postgres de servidor.
 * NUNCA importar este archivo desde /client.
 */
import pg from "pg";

let pool: pg.Pool | undefined;

export function getPool(): pg.Pool {
  if (!pool) {
    const url = process.env.DATABASE_URL;
    if (!url) {
      throw new Error("DATABASE_URL no está definida en /server/.env");
    }
    // Render (y otros Postgres gestionados) exigen SSL en conexiones
    // externas. Localmente (Docker) se deja apagado con DATABASE_SSL=false.
    const usarSsl = process.env.DATABASE_SSL === "true";
    pool = new pg.Pool({
      connectionString: url,
      ssl: usarSsl ? { rejectUnauthorized: false } : undefined,
    });
  }
  return pool;
}
