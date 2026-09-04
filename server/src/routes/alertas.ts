import { Router } from "express";
import type { ApiError } from "../../../shared/types/api.ts";

export const alertasRouter = Router();

alertasRouter.get("/", (_req, res) => {
  const body: ApiError = { error: "GET /api/alertas aún no implementado (B4)" };
  res.status(501).json(body);
});
