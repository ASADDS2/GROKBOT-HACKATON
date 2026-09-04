import { Router } from "express";
import { z } from "zod";
import type { ApiError } from "../../../shared/types/api.ts";
import type { EntregaRow } from "../../../shared/types/database.ts";
import { getPool } from "../lib/db.ts";

export const entregasRouter = Router();

const entregaSchema = z.object({
  barrio_id: z.string().min(1),
  carrotanque: z.string().min(1),
  litros: z.number().int().positive(),
  confirmada_por: z.enum(["conductor", "comunidad"]),
});

entregasRouter.post("/", async (req, res) => {
  const parsed = entregaSchema.safeParse(req.body);
  if (!parsed.success) {
    const body: ApiError = { error: "Body inválido para entrega" };
    return res.status(400).json(body);
  }
  console.log("[POST /api/entregas] payload:", JSON.stringify(parsed.data));

  const { barrio_id, carrotanque, litros, confirmada_por } = parsed.data;

  try {
    const { rows } = await getPool().query<EntregaRow>(
      `insert into entregas (barrio_id, carrotanque, litros, confirmada_por)
       values ($1,$2,$3,$4)
       returning *`,
      [barrio_id, carrotanque, litros, confirmada_por],
    );
    // Al insertar una entrega reciente, indice_sed recalcula dias_sin_agua
    // de ese barrio a 0 en el siguiente GET /api/sed.
    return res.status(201).json(rows[0]);
  } catch (err: unknown) {
    console.error("[POST /api/entregas] error:", err);
    const body: ApiError = { error: "No se pudo registrar la entrega" };
    return res.status(500).json(body);
  }
});
