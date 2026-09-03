import { horaDeFotograma, REPLAY_DURACION_MS, REPLAY_HORAS } from '../lib/datosReplay'

interface BotonReplayProps {
  reproduciendo: boolean
  fotograma: number
  total: number
  onToggle: () => void
  onDetener: () => void
}

export function BotonReplay({
  reproduciendo,
  fotograma,
  total,
  onToggle,
  onDetener,
}: BotonReplayProps) {
  const hora = horaDeFotograma(fotograma)
  const pct = total <= 1 ? 0 : (fotograma / (total - 1)) * 100

  return (
    <div className="border border-line bg-well px-3 py-3 text-well-ink">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={onToggle}
          className="min-h-11 border border-well-ink bg-paper px-4 py-2 text-sm font-semibold text-ink"
        >
          {reproduciendo ? 'Pausar replay' : 'Replay 48 h'}
        </button>
        <button
          type="button"
          onClick={onDetener}
          className="min-h-11 border border-well-ink/50 px-3 py-2 text-sm text-well-ink"
        >
          Volver al vivo
        </button>
        <p className="text-xs sm:ml-auto">
          {REPLAY_HORAS} h en {REPLAY_DURACION_MS / 1000} s · hora {hora} de {REPLAY_HORAS}
        </p>
      </div>
      <div
        className="mt-3 h-2 w-full border border-well-ink/40"
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={REPLAY_HORAS}
        aria-valuenow={hora}
        aria-label="Progreso del replay"
      >
        <div className="h-full bg-paper-2" style={{ width: `${pct}%` }} />
      </div>
      <p className="mt-2 text-[11px] text-well-ink/80">
        Offline: fotogramas locales. No usa el servidor ni recalcula la fórmula.
      </p>
    </div>
  )
}
