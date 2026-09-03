# GOTA

Coordinación de agua para Buenaventura y Quibdó. Monorepo `client` (React + Vite, F1) y `server` (Express).

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

Backend en `http://localhost:3001` (`GET /api/salud`). El frontend Vite entra en la fase F1.
