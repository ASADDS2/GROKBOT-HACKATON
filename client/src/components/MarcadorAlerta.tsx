import { useEffect, useState } from 'react'
import type { AlertaDTO } from '../../../shared/types/api'
import { apiFetch, mensajeErrorApi } from '../lib/apiClient'
import { nombreBarrio } from '../lib/datosReplay'
import { VISUAL_ALERTA } from '../lib/escalaVisual'

interface MarcadorAlertaProps {
  barrioId?: string
}

export function MarcadorAlerta({ barrioId }: MarcadorAlertaProps) {
  const [alertas, setAlertas] = useState<AlertaDTO[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let vivo = true
    apiFetch<AlertaDTO[]>('/api/alertas')
      .then((data) => {
        if (!vivo) return
        const lista = barrioId ? data.filter((a) => a.barrio_id === barrioId) : data
        setAlertas(lista)
      })
      .catch((err: unknown) => {
        if (!vivo) return
        setError(mensajeErrorApi(err, 'Alertas no disponibles'))
        setAlertas([])
      })
    return () => {
      vivo = false
    }
  }, [barrioId])

  if (error) {
    return <p className="text-xs text-ink/60">{error}</p>
  }

  if (!alertas.length) {
    return <p className="text-xs text-ink/60">Sin alertas de síntomas en 72 h.</p>
  }

  return (
    <ul className="flex flex-col gap-2" aria-label="Alertas sanitarias">
      {alertas.map((alerta) => {
        const visual = VISUAL_ALERTA[alerta.severidad]
        return (
          <li
            key={alerta.id}
            className="flex items-start gap-3 border border-line bg-paper px-3 py-2"
          >
            <span className={`${visual.clase} mt-1 shrink-0`} aria-hidden />
            <div className="min-w-0">
              <p className="text-[11px] uppercase tracking-widest">
                {visual.nombre} · {visual.forma}
              </p>
              <p className="font-display text-base leading-snug">
                {alerta.sintoma} en {nombreBarrio(alerta.barrio_id)}
              </p>
              <p className="text-xs text-ink/70">
                {alerta.casos_72h} casos / 72 h (línea base {alerta.linea_base})
              </p>
            </div>
          </li>
        )
      })}
    </ul>
  )
}
