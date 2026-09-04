# GOTA

Coordinación de agua para Buenaventura y Quibdó. Monorepo `client` (React + Vite) y `server` (Express).

## Requisitos

- Node 20 (`nvm use` lee `.nvmrc`)
- Postgres 17 en `localhost:5432` (usuario/clave `postgres`)

## Arranque

```bash
nvm use
npm install
createdb -h localhost -U postgres gota   # si aún no existe
npm run db:migrate
npm run db:seed
npm run dev
```

Backend en `http://localhost:3001`. Frontend Vite en `http://localhost:5173`.

## Frontend (`/client`)

SPA React 18 + Vite + Tailwind. Rutas `/`, `/mapa`, `/operador`.

```bash
cp client/.env.example client/.env   # VITE_API_BASE_URL=http://localhost:3001
npm run build                         # typecheck + Vite
```

`apiFetch` habla con Express. No hay Supabase: el mapa hace polling a `GET /api/sed`. Si una ruta responde **501** (p. ej. `POST /api/transcribir`, B5) la UI muestra aviso y no se cae; el replay 48 h corre offline. Tipos en `shared/types/api.ts`.

## API (backend B4)

- `GET  /api/salud` — healthcheck
- `POST /api/reportes` — `{ texto_crudo, canal, sesion_id? }`; extrae con Grok, resuelve barrio y guarda
- `GET  /api/reportes/revision` — reportes con `necesita_revision = true`
- `PATCH /api/reportes/:id` — `{ barrio_id?, necesita_revision? }`
- `GET  /api/sed` — GeoJSON del índice de sed por barrio (escala de 4 pasos)
- `GET  /api/ruta?carrotanque=X&fecha=YYYY-MM-DD` — ruta greedy (cachea en `rutas`)
- `POST /api/entregas` — `{ barrio_id, carrotanque, litros, confirmada_por }`
- `GET  /api/alertas` — brotes por síntoma (72h vs línea base)

Backlog (fuera de esta sesión): `POST /api/transcribir` (B5 voz) y `POST /api/cron/x-search` (B6).

Variables en `server/.env` (ver `server/.env.example`): `XAI_API_KEY`, `XAI_MODEL`, `DATABASE_URL`, `PORT`.
