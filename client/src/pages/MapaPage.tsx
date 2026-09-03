import { useCallback, useEffect, useRef, useState } from 'react'
import type { ReporteDTO, SedFeatureCollection } from '../../../shared/types/api'
import { BotonReplay } from '../components/BotonReplay'
import { ChatReporte } from '../components/ChatReporte'
import { EscalaDeSed } from '../components/EscalaDeSed'
import { MapaSed } from '../components/MapaSed'
import { MarcadorAlerta } from '../components/MarcadorAlerta'
import { PanelReportes } from '../components/PanelReportes'
import { apiFetch } from '../lib/apiClient'
import { getFotogramasReplay, REPLAY_DURACION_MS } from '../lib/datosReplay'
import { EMPTY_SED } from '../lib/escalaVisual'

export function MapaPage() {
  const [datosVivo, setDatosVivo] = useState<SedFeatureCollection>(EMPTY_SED)
  const [cargando, setCargando] = useState(true)
  const [avisoApi, setAvisoApi] = useState<string | null>(null)
  const [reportes, setReportes] = useState<ReporteDTO[]>([])
  const [replayOn, setReplayOn] = useState(false)
  const [reproduciendo, setReproduciendo] = useState(false)
  const [fotograma, setFotograma] = useState(0)
  const framesRef = useRef<SedFeatureCollection[]>(getFotogramasReplay())
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    let vivo = true
    setCargando(true)
    apiFetch<SedFeatureCollection>('/api/sed')
      .then((fc) => {
        if (!vivo) return
        setDatosVivo(fc)
        setAvisoApi(null)
      })
      .catch(() => {
        if (!vivo) return
        setDatosVivo(EMPTY_SED)
        setAvisoApi(
          'GET /api/sed no respondió. Mapa vacío, replay y chat siguen activos (backend pendiente).',
        )
      })
      .finally(() => {
        if (vivo) setCargando(false)
      })
    return () => {
      vivo = false
    }
  }, [])

  useEffect(() => {
    if (!reproduciendo) {
      if (timerRef.current !== null) {
        window.clearInterval(timerRef.current)
        timerRef.current = null
      }
      return undefined
    }
    const total = framesRef.current.length || 1
    const pasoMs = REPLAY_DURACION_MS / total
    timerRef.current = window.setInterval(() => {
      setFotograma((n) => {
        const next = n + 1
        if (next >= total) {
          setReproduciendo(false)
          return total - 1
        }
        return next
      })
    }, pasoMs)
    return () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current)
    }
  }, [reproduciendo])

  const onReportesChange = useCallback((lista: ReporteDTO[]) => {
    setReportes((prev) => {
      const ids = new Set(lista.map((r) => r.id))
      const extra = prev.filter((r) => !ids.has(r.id))
      return [...lista, ...extra]
    })
  }, [])

  function toggleReplay() {
    if (!replayOn) {
      setReplayOn(true)
      setFotograma(0)
      setReproduciendo(true)
      return
    }
    setReproduciendo((v) => !v)
  }

  function detenerReplay() {
    setReproduciendo(false)
    setReplayOn(false)
    setFotograma(0)
  }

  const datosMapa = replayOn ? (framesRef.current[fotograma] ?? EMPTY_SED) : datosVivo

  return (
    <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-4">
      <header>
        <h1 className="font-display text-3xl text-well">Mapa de sed</h1>
        <p className="mt-1 max-w-xl text-sm text-ink/75">
          Cada marca usa <strong>paso_escala</strong> del servidor: forma + color + textura. El
          chat reemplaza Twilio. El replay corre sin red.
        </p>
        {cargando ? <p className="mt-2 text-sm">Cargando capa de sed…</p> : null}
        {avisoApi ? (
          <p className="mt-2 border border-tension bg-tension/15 px-3 py-2 text-sm">{avisoApi}</p>
        ) : null}
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)]">
        <div className="flex min-h-[360px] flex-col gap-3">
          <div className="h-[52vh] min-h-[320px] lg:h-[560px]">
            <MapaSed datosIniciales={datosMapa} onReportesChange={onReportesChange} />
          </div>
          <EscalaDeSed />
          <BotonReplay
            reproduciendo={reproduciendo}
            fotograma={fotograma}
            total={framesRef.current.length || 25}
            onToggle={toggleReplay}
            onDetener={detenerReplay}
          />
        </div>
        <div className="flex flex-col gap-3">
          <section className="border border-line bg-paper p-3">
            <h2 className="font-display text-lg">Alertas 72 h</h2>
            <p className="mb-2 text-xs text-ink/60">Forma distinta por severidad, no solo color.</p>
            <MarcadorAlerta />
          </section>
          <PanelReportes reportes={reportes} />
        </div>
      </div>

      <ChatReporte
        onEnviado={(r) => setReportes((prev) => [r, ...prev.filter((x) => x.id !== r.id)])}
      />
    </div>
  )
}
