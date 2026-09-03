import { useEffect, useState } from 'react'
import type { ReporteDTO, RutaResponse } from '../../../shared/types/api'
import { BandejaRevision } from '../components/BandejaRevision'
import { ListaRuta } from '../components/ListaRuta'
import { apiFetch } from '../lib/apiClient'

export function OperadorPage() {
  const [ruta, setRuta] = useState<RutaResponse | null>(null)
  const [revision, setRevision] = useState<ReporteDTO[]>([])
  const [cargando, setCargando] = useState(true)
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    setCargando(true)
    Promise.allSettled([
      apiFetch<RutaResponse>('/api/ruta'),
      apiFetch<ReporteDTO[]>('/api/reportes/revision'),
    ]).then(([rRuta, rRev]) => {
      if (!vivo) return
      const fallos: string[] = []
      if (rRuta.status === 'fulfilled') setRuta(rRuta.value)
      else fallos.push('ruta')
      if (rRev.status === 'fulfilled') setRevision(rRev.value)
      else fallos.push('revisión')
      if (fallos.length) {
        setAviso(
          `Backend no respondió (${fallos.join(' y ')}). Mesa lista; los datos llegan cuando Express exista.`,
        )
      }
      setCargando(false)
    })
    return () => {
      vivo = false
    }
  }, [])

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4">
      <header className="no-print">
        <h1 className="font-display text-3xl text-well">Mesa de operación</h1>
        <p className="mt-1 text-sm text-ink/75">
          Ruta numerada (sirve impresa, no solo en color) y bandeja de reportes dudosos. Esta
          página no escribe en Supabase: solo <code>apiFetch</code>.
        </p>
        {cargando ? <p className="mt-2 text-sm">Cargando ruta y revisión…</p> : null}
        {aviso ? (
          <p className="mt-2 border border-tension bg-tension/15 px-3 py-2 text-sm">{aviso}</p>
        ) : null}
      </header>
      <ListaRuta ruta={ruta} />
      <div className="no-print">
        <BandejaRevision
          reportes={revision}
          onCambio={(id) => setRevision((prev) => prev.filter((r) => r.id !== id))}
        />
      </div>
    </div>
  )
}
