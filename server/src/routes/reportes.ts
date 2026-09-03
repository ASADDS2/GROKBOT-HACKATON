import { Router } from "express";
import type { ApiError } from "../../../shared/types/api.ts";

export const reportesRouter = Router();

reportesRouter.post("/", (_req, res) => {
  const body: ApiError = { error: "POST /api/reportes aún no implementado (B4)" };
  res.status(501).json(body);
});

reportesRouter.get("/revision", (_req, res) => {
  const body: ApiError = {
    error: "GET /api/reportes/revision aún no implementado (B4)",
  };
  res.status(501).json(body);
});

reportesRouter.patch("/:id", (_req, res) => {
  const body: ApiError = { error: "PATCH /api/reportes/:id aún no implementado (B4)" };
  res.status(501).json(body);
});
