import { Router } from "express";
import type {
  ApiError,
  BarrioSedProperties,
  SedFeatureCollection,
} from "../../../shared/types/api.ts";
import type { IndiceSedRow } from "../../../shared/types/database.ts";
import { getPool } from "../lib/db.ts";

export const sedRouter = Router();

sedRouter.get("/", async (_req, res) => {
  try {
    const { rows } = await getPool().query<IndiceSedRow>(
      `select id, nombre, municipio, lat, lng, es_albergue, via_abierta,
              dias_sin_agua, indice_sed, paso_escala
         from indice_sed`,
    );

    const fc: SedFeatureCollection = {
      type: "FeatureCollection",
      features: rows.map((r) => {
        const properties: BarrioSedProperties = {
          id: r.id,
          nombre: r.nombre,
          municipio: r.municipio,
          dias_sin_agua: Number(r.dias_sin_agua),
          indice_sed: Number(r.indice_sed),
          paso_escala: r.paso_escala,
          es_albergue: r.es_albergue,
          via_abierta: r.via_abierta,
        };
        return {
          type: "Feature",
          geometry: { type: "Point", coordinates: [Number(r.lng), Number(r.lat)] },
          properties,
        };
      }),
    };

    return res.json(fc);
  } catch (err: unknown) {
    console.error("[GET /api/sed] error:", err);
    const body: ApiError = { error: "No se pudo calcular el índice de sed" };
    return res.status(500).json(body);
  }
});
