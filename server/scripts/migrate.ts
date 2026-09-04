import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { getPool } from "../src/lib/db.ts";

const raizServer = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
dotenv.config({ path: path.join(raizServer, ".env") });

async function migrar(): Promise<void> {
  const sqlPath = path.join(raizServer, "db/migrations/001_schema.sql");
  const sql = fs.readFileSync(sqlPath, "utf8");
  const pool = getPool();
  await pool.query(sql);
  console.log("Migración 001_schema aplicada en gota");
  await pool.end();
}

migrar().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
