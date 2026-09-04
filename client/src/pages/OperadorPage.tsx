import { useEffect, useState, type FormEvent } from 'react'
import type { ReporteDTO, RutaResponse } from '../../../shared/types/api'
import { BandejaRevision } from '../components/BandejaRevision'
import { ListaRuta } from '../components/ListaRuta'
import { ApiFetchError, apiFetch, mensajeErrorApi } from '../lib/apiClient'

function fechaHoy(): string {
  return new Date().toISOString().slice(0, 10)
}

export function OperadorPage() {
  const [borrador, setBorrador] = useState('gota-1')
  const [carrotanque, setCarrotanque] = useState('gota-1')
  const [ruta, setRuta] = useState<RutaResponse | null>(null)
  const [revision, setRevision] = useState<ReporteDTO[]>([])
  const [cargando, setCargando] = useState(true)
  const [aviso, setAviso] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    setCargando(true)
    const qs = new URLSearchParams({
      carrotanque,
      fecha: fechaHoy(),
    })
    Promise.allSettled([
      apiFetch<RutaResponse>(`/api/ruta?${qs.toString()}`),
      apiFetch<ReporteDTO[]>('/api/reportes/revision'),
    ]).then(([rRuta, rRev]) => {
      if (!vivo) return
      const fallos: string[] = []
      if (rRuta.status === 'fulfilled') setRuta(rRuta.value)
      else {
        setRuta(null)
        fallos.push('ruta')
      }
      if (rRev.status === 'fulfilled') setRevision(rRev.value)
      else fallos.push('revisión')
      if (fallos.length) {
        const stub =
          (rRuta.status === 'rejected' && rRuta.reason instanceof ApiFetchError && rRuta.reason.status === 501) ||
          (rRev.status === 'rejected' && rRev.reason instanceof ApiFetchError && rRev.reason.status === 501)
        setAviso(
          stub
            ? `GET ${fallos.join(' / ')}: backend aún no implementa esta ruta.`
            : `No se pudo cargar ${fallos.join(' y ')}. ${
                rRuta.status === 'rejected'
                  ? mensajeErrorApi(rRuta.reason, '')
                  : rRev.status === 'rejected'
                    ? mensajeErrorApi(rRev.reason, '')
                    : ''
              }`.trim(),
        )
      } else {
        setAviso(null)
      }
      setCargando(false)
    })
    return () => {
      vivo = false
    }
  }, [carrotanque])

  function onBuscar(ev: FormEvent) {
    ev.preventDefault()
    const id = borrador.trim()
    if (id) setCarrotanque(id)
  }

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-4">
      <header className="no-print">
        <h1 className="font-display text-3xl text-well">Mesa de operación</h1>
        <p className="mt-1 text-sm text-ink/75">
          Ruta numerada (sirve impresa, no solo en color) y bandeja de reportes dudosos. Esta
          página no escribe en Postgres: solo <code>apiFetch</code> hacia Express (
          <code>GET /api/ruta?carrotanque=</code>).
        </p>
        <form onSubmit={onBuscar} className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
            <span>Carrotanque</span>
            <input
              value={borrador}
              onChange={(e) => setBorrador(e.target.value)}
              className="min-h-11 border border-line bg-paper px-3"
              name="carrotanque"
            />
          </label>
          <button type="submit" className="min-h-11 border border-ink px-4 text-sm font-semibold sm:mt-5">
            Cargar ruta
          </button>
        </form>
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
