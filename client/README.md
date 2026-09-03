# GOTA — cliente (`/client`)

SPA Vite + React 18 + TypeScript + Tailwind + react-router-dom.

El compañero/a dueño de **`/server`** (Express) implementa los endpoints. Este paquete **no** crea rutas Express, no usa Next.js, no usa `@supabase/ssr` y no escribe tablas desde el navegador.

## Arranque

Desde la raíz del monorepo:

```bash
npm install
npm run dev
```

O solo este workspace:

```bash
cd client
npm install
npm run dev
npm run build
```

Abre `http://localhost:5173`. Mobile-first pensado a **375px**.

## Variables (`/.env` a partir de `.env.example`)

| Variable | Uso |
| --- | --- |
| `VITE_API_BASE_URL` | Base Express, default `http://localhost:3001` |
| `VITE_MAPBOX_TOKEN` | Mapa GL. Si falta, plano esquemático |
| `VITE_SUPABASE_URL` | `createClient` + Realtime `INSERT` en `reportes` |
| `VITE_SUPABASE_ANON_KEY` | clave anónima (solo lectura en vivo) |

## Endpoints que espera la UI

| Método | Ruta | Tipo |
| --- | --- | --- |
| `GET` | `/api/sed` | `SedFeatureCollection` |
| `GET` | `/api/alertas` | `AlertaDTO[]` |
| `GET` | `/api/ruta` | `RutaResponse` |
| `GET` | `/api/reportes/revision` | `ReporteDTO[]` |
| `POST` | `/api/reportes` | `{ texto_crudo, canal, sesion_id }` → `ReporteDTO` |
| `PATCH` | `/api/reportes/:id` | `{ barrio_id?, necesita_revision? }` |
| `POST` | `/api/transcribir` | multipart campo `audio` → `{ texto }` |
| `POST` | `/api/entregas` | `EntregaInput` |

Si el API falla, el mapa usa un `FeatureCollection` vacío. **Replay 48 h / 30 s** es offline (`src/lib/datosReplay.ts`). El chat muestra error y no se cae.

Tipos: import relativo a `../../../shared/types/api`. El cliente **nunca** recalcula la fórmula de sed: solo pinta `paso_escala`.
