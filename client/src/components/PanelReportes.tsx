import type { ReporteDTO } from '../../../shared/types/api'
import { TarjetaReporte } from './TarjetaReporte'

interface PanelReportesProps {
  reportes: ReporteDTO[]
}

export function PanelReportes({ reportes }: PanelReportesProps) {
  return (
    <section className="flex min-h-0 flex-col border border-line bg-paper/80">
      <header className="border-b border-line px-3 py-2">
        <h2 className="font-display text-lg">Reportes en vivo</h2>
        <p className="text-xs text-ink/60">Crudo a la izquierda · campos extraídos a la derecha</p>
      </header>
      <div className="flex max-h-[28rem] flex-col gap-2 overflow-y-auto p-3">
        {reportes.length === 0 ? (
          <p className="text-sm text-ink/60">
            Aún no hay reportes en esta sesión. Escribe o graba abajo. Si el backend está
            apagado, el envío fallará con un aviso — el mapa y el replay siguen.
          </p>
        ) : (
          reportes.map((r) => <TarjetaReporte key={r.id} reporte={r} />)
        )}
      </div>
    </section>
  )
}
