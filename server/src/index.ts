import "dotenv/config";
import cors from "cors";
import express from "express";
import { alertasRouter } from "./routes/alertas.ts";
import { cronXSearchRouter } from "./routes/cronXSearch.ts";
import { entregasRouter } from "./routes/entregas.ts";
import { reportesRouter } from "./routes/reportes.ts";
import { rutaRouter } from "./routes/ruta.ts";
import { sedRouter } from "./routes/sed.ts";
import { transcribirRouter } from "./routes/transcribir.ts";

const app = express();
const port = Number(process.env.PORT) || 3001;

app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

app.get("/api/salud", (_req, res) => {
  res.json({ ok: true, servicio: "gota-server" });
});

app.use("/api/reportes", reportesRouter);
app.use("/api/sed", sedRouter);
app.use("/api/ruta", rutaRouter);
app.use("/api/entregas", entregasRouter);
app.use("/api/alertas", alertasRouter);
app.use("/api/transcribir", transcribirRouter);
app.use("/api/cron/x-search", cronXSearchRouter);

app.listen(port, () => {
  console.log(`GOTA server escuchando en http://localhost:${port}`);
});
