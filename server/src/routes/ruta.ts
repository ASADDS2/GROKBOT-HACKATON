import { Router } from "express";
import type {
  ApiError,
  RutaParada,
  RutaResponse,
} from "../../../shared/types/api.ts";
import type { IndiceSedRow, RutaRow } from "../../../shared/types/database.ts";
import { getPool } from "../lib/db.ts";
import {
  CAPACIDAD_DEFAULT_LITROS,
  ruteoGreedy,
  type CandidatoRuteo,
} from "../lib/ruteo.ts";

export const rutaRouter = Router();

rutaRouter.get("/", async (req, res) => {
  const carrotanque = typeof req.query.carrotanque === "string" ? req.query.carrotanque : "";
  const fecha =
    typeof req.query.fecha === "string" && req.query.fecha
      ? req.query.fecha
      : new Date().toISOString().slice(0, 10);
  const capacidad = Number(req.query.capacidad) || CAPACIDAD_DEFAULT_LITROS;

  if (!carrotanque) {
    const body: ApiError = { error: "Falta el parámetro carrotanque" };
    return res.status(400).json(body);
  }

  try {
    const pool = getPool();

    const existente = await pool.query<RutaRow>(
      `select * from rutas where carrotanque = $1 and fecha = $2 limit 1`,
      [carrotanque, fecha],
    );
    if (existente.rows.length > 0) {
      const fila = existente.rows[0];
      const resp: RutaResponse = {
        carrotanque: fila.carrotanque,
        fecha: String(fila.fecha).slice(0, 10),
        paradas: fila.paradas as RutaParada[],
      };
      return res.json(resp);
    }

    const { rows: candidatos } = await pool.query<IndiceSedRow>(
      `select id, personas, indice_sed, via_abierta
         from indice_sed
        order by indice_sed desc`,
    );
    const paradas = ruteoGreedy(
      candidatos.map(
        (c): CandidatoRuteo => ({
          barrio_id: c.id,
          personas: Number(c.personas),
          indice_sed: Number(c.indice_sed),
          via_abierta: c.via_abierta,
        }),
      ),
      capacidad,
    );

    await pool.query(
      `insert into rutas (fecha, carrotanque, paradas, estado)
       values ($1, $2, $3::jsonb, 'planificada')`,
      [fecha, carrotanque, JSON.stringify(paradas)],
    );

    const resp: RutaResponse = { carrotanque, fecha, paradas };
    return res.json(resp);
  } catch (err: unknown) {
    console.error("[GET /api/ruta] error:", err);
    const body: ApiError = { error: "No se pudo calcular la ruta" };
    return res.status(500).json(body);
  }
});
