import { Router } from "express";
import type { ApiError } from "../../../shared/types/api.ts";

export const transcribirRouter = Router();

transcribirRouter.post("/", (_req, res) => {
  const body: ApiError = {
    error: "POST /api/transcribir aún no implementado (B5)",
  };
  res.status(501).json(body);
});
