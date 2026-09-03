import { Router } from "express";
import type { ApiError } from "../../../shared/types/api.ts";

/** Backlog B6: x_search queda fuera de esta sesión. */
export const cronXSearchRouter = Router();

cronXSearchRouter.post("/", (_req, res) => {
  const body: ApiError = {
    error: "POST /api/cron/x-search fuera de alcance (B6 backlog)",
  };
  res.status(501).json(body);
});
