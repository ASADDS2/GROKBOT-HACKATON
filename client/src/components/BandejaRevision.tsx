import { useState } from 'react'
import type { ReporteDTO } from '../../../shared/types/api'
import { apiFetch, mensajeErrorApi } from '../lib/apiClient'
import { CATALOGO_BARRIOS, nombreBarrio } from '../lib/datosReplay'

interface BandejaRevisionProps {
  reportes: ReporteDTO[]
  onCambio: (id: string) => void
}

export function BandejaRevision({ reportes, onCambio }: BandejaRevisionProps) {
  const [aviso, setAviso] = useState<string | null>(null)
  const [ocupado, setOcupado] = useState<string | null>(null)

  async function parchear(id: string, body: { barrio_id?: string | null; necesita_revision?: boolean }) {
    setOcupado(id)
    setAviso(null)
    try {
      await apiFetch<ReporteDTO>(`/api/reportes/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      })
      onCambio(id)
    } catch (err) {
      setAviso(mensajeErrorApi(err, 'PATCH /api/reportes/:id falló'))
    } finally {
      setOcupado(null)
    }
  }

  if (!reportes.length) {
    return (
      <p className="border border-dashed border-line p-4 text-sm text-ink/70">
        Bandeja vacía. Esperamos <code>GET /api/reportes/revision</code>.
      </p>
    )
  }

  return (
    <section className="border border-line bg-paper">
      <header className="border-b border-line px-3 py-2">
        <h2 className="font-display text-lg">Bandeja de revisión</h2>
        <p className="text-xs text-ink/60">Texto crudo + alternativas. Asignar o descartar por API.</p>
      </header>
      <ul className="divide-y divide-line">
        {reportes.map((r) => {
          const alts =
            r.alternativas_barrio && r.alternativas_barrio.length
              ? r.alternativas_barrio
              : CATALOGO_BARRIOS.slice(0, 4).map((b) => b.id)
          return (
            <li key={r.id} className="grid gap-3 p-3 sm:grid-cols-[1.2fr_1fr]">
              <div>
                <p className="text-[11px] uppercase tracking-widest text-well">Texto crudo</p>
                <p className="font-display text-base leading-snug">“{r.texto_crudo}”</p>
                <p className="mt-1 text-xs text-ink/60">
                  {r.canal} · confianza {Math.round(r.confianza * 100)}%
                </p>
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-widest">Asignar barrio</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {alts.map((id) => (
                    <button
                      key={id}
                      type="button"
                      disabled={ocupado === r.id}
                      className="min-h-11 border border-ink px-2 text-sm"
                      onClick={() =>
                        void parchear(r.id, { barrio_id: id, necesita_revision: false })
                      }
                    >
                      {nombreBarrio(id)}
                    </button>
                  ))}
                  <button
                    type="button"
                    disabled={ocupado === r.id}
                    className="min-h-11 border border-crisis px-2 text-sm text-crisis"
                    onClick={() =>
                      void parchear(r.id, { barrio_id: null, necesita_revision: false })
                    }
                  >
                    Descartar
                  </button>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
      {aviso ? (
        <p className="border-t border-line px-3 py-2 text-sm" role="status">
          {aviso}
        </p>
      ) : null}
    </section>
  )
}
