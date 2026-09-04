import { VISUAL_PASO, type PasoEscala } from '../lib/escalaVisual'

const PASOS: PasoEscala[] = [0, 1, 2, 3]

interface EscalaDeSedProps {
  compacta?: boolean
}

export function EscalaDeSed({ compacta = false }: EscalaDeSedProps) {
  return (
    <section
      aria-label="Escala de sed"
      className="border border-line bg-paper/90 p-3 shadow-[3px_3px_0_#0e3d42]"
    >
      <p className="font-display text-sm tracking-wide text-well">
        Escala de sed
      </p>
      <p className={`mt-1 text-xs text-ink/70 ${compacta ? 'sr-only' : ''}`}>
        Color y textura vienen de <code>paso_escala</code>. Aquí no se recalcula.
      </p>
      <ol className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {PASOS.map((paso) => {
          const v = VISUAL_PASO[paso]
          return (
            <li key={paso} className="flex items-center gap-2">
              <span
                aria-hidden
                className={`${v.claseTex} inline-block h-7 w-7 shrink-0 border border-ink ${
                  v.forma === 'circulo'
                    ? 'forma-circulo'
                    : v.forma === 'rombo'
                      ? 'forma-rombo'
                      : 'forma-cuadrado'
                }`}
              />
              <span className="leading-tight">
                <span className="block text-sm font-semibold">{v.nombre}</span>
                <span className="block text-[11px] uppercase tracking-wide text-ink/60">
                  {v.forma} · {v.textura}
                </span>
              </span>
            </li>
          )
        })}
      </ol>
    </section>
  )
}
