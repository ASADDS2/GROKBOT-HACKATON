import { Link } from 'react-router-dom'

export function HomePage() {
  return (
    <div className="mx-auto max-w-xl px-4 py-10">
      <p className="text-[11px] uppercase tracking-[0.25em] text-well">La Guajira · GOTA</p>
      <h1 className="mt-2 font-display text-5xl leading-[0.95] text-ink">
        El agua no es un rumor. Es un mapa.
      </h1>
      <p className="mt-5 text-base leading-relaxed text-ink/80">
        GOTA junta reportes de sed —por web, voz o X— y los pinta por barrio. La escala (color +
        textura + forma) sale de <code>paso_escala</code> que calcula el servidor. Aquí no se
        inventa el índice. Sin nombres, sin teléfonos: solo <code>sesion_id</code>.
      </p>
      <nav className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          to="/mapa"
          className="min-h-12 flex-1 border border-ink bg-well px-4 py-3 text-center text-sm font-semibold text-well-ink"
        >
          Ver el mapa
        </Link>
        <Link
          to="/operador"
          className="min-h-12 flex-1 border border-ink px-4 py-3 text-center text-sm font-semibold"
        >
          Mesa de operación
        </Link>
      </nav>
    </div>
  )
}
