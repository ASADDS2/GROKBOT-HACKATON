import { Router } from "express";
import type { ApiError } from "../../../shared/types/api.ts";

export const entregasRouter = Router();

entregasRouter.post("/", (_req, res) => {
  const body: ApiError = { error: "POST /api/entregas aún no implementado (B4)" };
  res.status(501).json(body);
});
