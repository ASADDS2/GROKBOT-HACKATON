import { useState } from 'react'
import type { EntregaInput, RutaResponse } from '../../../shared/types/api'
import { apiFetch, mensajeErrorApi } from '../lib/apiClient'
import { nombreBarrio } from '../lib/datosReplay'

interface ListaRutaProps {
  ruta: RutaResponse | null
}

export function ListaRuta({ ruta }: ListaRutaProps) {
  const [aviso, setAviso] = useState<string | null>(null)

  if (!ruta) {
    return (
      <p className="border border-dashed border-line p-4 text-sm text-ink/70">
        No hay ruta cargada. Cuando Express publique <code>GET /api/ruta</code> aparecerá aquí.
      </p>
    )
  }

  const rutaLista = ruta
  const ordenada = [...rutaLista.paradas].sort((a, b) => a.orden - b.orden)

  async function confirmar(parada: RutaResponse['paradas'][number]) {
    const body: EntregaInput = {
      barrio_id: parada.barrio_id,
      carrotanque: rutaLista.carrotanque,
      litros: parada.litros_sug,
      confirmada_por: 'conductor',
    }
    setAviso(null)
    try {
      await apiFetch('/api/entregas', {
        method: 'POST',
        body: JSON.stringify(body),
      })
      setAviso(`Entrega en ${nombreBarrio(parada.barrio_id)} registrada.`)
    } catch (err) {
      setAviso(mensajeErrorApi(err, 'No se pudo confirmar la entrega'))
    }
  }

  return (
    <section className="border border-line bg-paper">
      <div className="print-only p-4">
        <h1>GOTA — hoja de ruta</h1>
        <p>
          Carrotanque {rutaLista.carrotanque} · {rutaLista.fecha}
        </p>
      </div>
      <header className="flex flex-wrap items-end justify-between gap-2 border-b border-line px-3 py-2">
        <div>
          <h2 className="font-display text-lg">Ruta del carrotanque</h2>
          <p className="text-sm text-ink/70">
            Unidad <strong>{rutaLista.carrotanque}</strong> · {rutaLista.fecha}
          </p>
        </div>
        <button
          type="button"
          className="no-print min-h-11 border border-ink px-3 py-1 text-sm"
          onClick={() => window.print()}
        >
          Imprimir hoja
        </button>
      </header>
      <ol className="divide-y divide-line">
        {ordenada.map((p) => (
          <li key={`${p.orden}-${p.barrio_id}`} className="flex flex-wrap items-center gap-3 px-3 py-3">
            <span className="flex h-8 w-8 items-center justify-center border border-ink font-display text-lg">
              {p.orden}
            </span>
            <div className="min-w-0 flex-1">
              <p className="font-semibold">{nombreBarrio(p.barrio_id)}</p>
              <p className="text-sm text-ink/70">
                Parada {p.orden} de {ordenada.length} · {p.litros_sug.toLocaleString('es-CO')} litros
                sugeridos
              </p>
            </div>
            <button
              type="button"
              className="no-print min-h-11 border border-well px-3 text-sm text-well"
              onClick={() => void confirmar(p)}
            >
              Confirmar entrega
            </button>
          </li>
        ))}
      </ol>
      {aviso ? (
        <p className="no-print border-t border-line px-3 py-2 text-sm" role="status">
          {aviso}
        </p>
      ) : null}
    </section>
  )
}
