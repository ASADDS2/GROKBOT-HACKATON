import type { ReporteDTO } from '../../../shared/types/api'
import { nombreBarrio } from '../lib/datosReplay'

interface TarjetaReporteProps {
  reporte: ReporteDTO
}

function etiquetaCanal(canal: ReporteDTO['canal']): string {
  if (canal === 'web') return 'Web'
  if (canal === 'voz') return 'Voz'
  return 'X'
}

export function TarjetaReporte({ reporte }: TarjetaReporteProps) {
  const barrio = reporte.barrio_id ? nombreBarrio(reporte.barrio_id) : 'Sin barrio'
  const hora = new Date(reporte.created_at).toLocaleString('es-CO', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short',
  })

  return (
    <article className="grid gap-3 border border-line bg-paper p-3 sm:grid-cols-2">
      <div>
        <p className="text-[11px] uppercase tracking-widest text-well">Mensaje crudo</p>
        <p className="mt-1 font-display text-base leading-snug">“{reporte.texto_crudo}”</p>
        <p className="mt-2 text-xs text-ink/60">
          {etiquetaCanal(reporte.canal)} · {hora}
        </p>
      </div>
      <dl className="grid grid-cols-2 gap-x-3 gap-y-2 border-t border-line/30 pt-3 text-sm sm:border-t-0 sm:border-l sm:pl-3 sm:pt-0">
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-ink/50">Barrio</dt>
          <dd>{barrio}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-ink/50">Días sin agua</dt>
          <dd>{reporte.dias_sin_agua ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-ink/50">Personas</dt>
          <dd>{reporte.personas ?? '—'}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-ink/50">Casos</dt>
          <dd>{reporte.casos}</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-[11px] uppercase tracking-wide text-ink/50">Síntomas</dt>
          <dd>{reporte.sintomas.length ? reporte.sintomas.join(', ') : 'ninguno extraído'}</dd>
        </div>
        <div>
          <dt className="text-[11px] uppercase tracking-wide text-ink/50">Confianza</dt>
          <dd>{Math.round(reporte.confianza * 100)}%</dd>
        </div>
        {reporte.necesita_revision ? (
          <div>
            <dt className="text-[11px] uppercase tracking-wide text-crisis">Revisión</dt>
            <dd>pendiente</dd>
          </div>
        ) : null}
      </dl>
    </article>
  )
}
