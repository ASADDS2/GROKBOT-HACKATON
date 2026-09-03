import { Router } from "express";
import type { ApiError } from "../../../shared/types/api.ts";

export const rutaRouter = Router();

rutaRouter.get("/", (_req, res) => {
  const body: ApiError = { error: "GET /api/ruta aún no implementado (B4)" };
  res.status(501).json(body);
});
