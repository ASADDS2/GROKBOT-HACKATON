import { Link, NavLink, Outlet } from 'react-router-dom'

export function Layout() {
  const link = ({ isActive }: { isActive: boolean }) =>
    `min-h-11 px-3 py-2 text-sm ${isActive ? 'bg-well text-well-ink' : 'text-ink'}`

  return (
    <div className="min-h-svh">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:bg-paper focus:px-3 focus:py-2"
      >
        Saltar al contenido
      </a>
      <header className="no-print sticky top-0 z-20 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2">
          <Link to="/" className="font-display text-xl tracking-tight text-well">
            GOTA
          </Link>
          <nav className="flex border border-line" aria-label="Principal">
            <NavLink to="/mapa" className={link}>
              Mapa
            </NavLink>
            <NavLink to="/operador" className={link}>
              Operador
            </NavLink>
          </nav>
        </div>
      </header>
      <main id="contenido">
        <Outlet />
      </main>
    </div>
  )
}
