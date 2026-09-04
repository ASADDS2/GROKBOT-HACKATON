# GOTA — cliente (`/client`)

SPA Vite + React 18 + TypeScript + Tailwind + react-router-dom.

Habla con **Express en `:3001`** (`VITE_API_BASE_URL`). Los datos viven en **Postgres** (`DATABASE_URL` del servidor). No hay Supabase ni Next.js.

## Arranque

Desde la raíz (levanta server + client):

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Solo este workspace:

```bash
cd client
cp .env.example .env
npm install
npm run dev
npm run build
```

Abre `http://localhost:5173`. Mobile-first a **375px**.

## Variables

| Variable | Uso |
| --- | --- |
| `VITE_API_BASE_URL` | Express, default `http://localhost:3001` |
| `VITE_MAPBOX_TOKEN` | Mapbox GL. Si falta, plano esquemático |

## Endpoints (contrato en `shared/types/api.ts`)

| Método | Ruta | Tipo |
| --- | --- | --- |
| `GET` | `/api/salud` | `{ ok, servicio }` |
| `GET` | `/api/sed` | `SedFeatureCollection` |
| `GET` | `/api/alertas` | `AlertaDTO[]` |
| `GET` | `/api/ruta?carrotanque=&fecha=` | `RutaResponse` |
| `GET` | `/api/reportes/revision` | `ReporteDTO[]` |
| `POST` | `/api/reportes` | `ReporteInput` → `ReporteDTO` |
| `PATCH` | `/api/reportes/:id` | `{ barrio_id?, necesita_revision? }` |
| `POST` | `/api/transcribir` | multipart `audio` → `TranscripcionResponse` |
| `POST` | `/api/entregas` | `EntregaInput` |

B4 ya sirve sed/reportes/ruta/alertas/entregas. `POST /api/transcribir` (B5) puede devolver **501**: la UI avisa «backend aún no implementa esta ruta» y no se cae. Replay 48 h / 30 s offline. Polling de sed cada 12 s.
