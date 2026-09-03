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
    pool = new pg.Pool({ connectionString: url });
  }
  return pool;
}
