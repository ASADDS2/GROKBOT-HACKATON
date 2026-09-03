import { useEffect, useRef, useState, type FormEvent } from 'react'
import type { CrearReporteInput, ReporteDTO, TranscribirResponse } from '../../../shared/types/api'
import { apiFetch } from '../lib/apiClient'
import { getSesionId } from '../lib/sesion'

interface ChatReporteProps {
  onEnviado?: (reporte: ReporteDTO) => void
}

type FaseVoz = 'idle' | 'grabando' | 'transcribiendo' | 'confirmar'

function mimeAudio(): string {
  if (typeof MediaRecorder === 'undefined') return ''
  if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus'
  if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm'
  if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4'
  return ''
}

export function ChatReporte({ onEnviado }: ChatReporteProps) {
  const [texto, setTexto] = useState('')
  const [enviando, setEnviando] = useState(false)
  const [aviso, setAviso] = useState<string | null>(null)
  const [faseVoz, setFaseVoz] = useState<FaseVoz>('idle')
  const [textoVoz, setTextoVoz] = useState('')
  const [soportaVoz, setSoportaVoz] = useState(false)
  const recorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef = useRef<Blob[]>([])
  const streamRef = useRef<MediaStream | null>(null)

  useEffect(() => {
    setSoportaVoz(typeof MediaRecorder !== 'undefined' && Boolean(navigator.mediaDevices?.getUserMedia))
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop())
    }
  }, [])

  async function enviar(canal: 'web' | 'voz', crudo: string) {
    const body: CrearReporteInput = {
      texto_crudo: crudo.trim(),
      canal,
      sesion_id: getSesionId(),
    }
    setEnviando(true)
    setAviso(null)
    try {
      const creado = await apiFetch<ReporteDTO>('/api/reportes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      onEnviado?.(creado)
      setTexto('')
      setTextoVoz('')
      setFaseVoz('idle')
      setAviso('Reporte enviado. Sin nombre ni teléfono: solo sesion_id.')
    } catch {
      setAviso(
        'No se pudo enviar. El backend Express aún no está listo. Tu texto se quedó en pantalla.',
      )
    } finally {
      setEnviando(false)
    }
  }

  async function onSubmit(ev: FormEvent) {
    ev.preventDefault()
    if (!texto.trim()) return
    await enviar('web', texto)
  }

  async function iniciarGrabacion() {
    setAviso(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      const mime = mimeAudio()
      const rec = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream)
      chunksRef.current = []
      rec.ondataavailable = (e) => {
        if (e.data.size) chunksRef.current.push(e.data)
      }
      rec.onstop = () => {
        void transcribir()
      }
      recorderRef.current = rec
      rec.start()
      setFaseVoz('grabando')
    } catch {
      setAviso('No hay permiso de micrófono. Escribe el reporte.')
    }
  }

  function detenerGrabacion() {
    recorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }

  async function transcribir() {
    setFaseVoz('transcribiendo')
    const blob = new Blob(chunksRef.current, { type: recorderRef.current?.mimeType || 'audio/webm' })
    const fd = new FormData()
    fd.append('audio', blob, 'nota.webm')
    try {
      const res = await apiFetch<TranscribirResponse>('/api/transcribir', {
        method: 'POST',
        body: fd,
      })
      setTextoVoz(res.texto)
      setFaseVoz('confirmar')
    } catch {
      setAviso('No pudimos transcribir (backend apagado). Escribe el reporte a mano.')
      setFaseVoz('idle')
    }
  }

  return (
    <section className="border border-line bg-paper shadow-[4px_4px_0_#0e3d42]">
      <header className="border-b border-line px-3 py-2">
        <h2 className="font-display text-lg">Contar la sed</h2>
        <p className="text-xs text-ink/60">
          Web o voz. Sin datos personales. Canal X lo ingiere el servidor.
        </p>
      </header>

      <form onSubmit={onSubmit} className="flex flex-col gap-2 p-3">
        <label className="text-sm" htmlFor="texto-reporte">
          ¿Qué está pasando en tu barrio?
        </label>
        <textarea
          id="texto-reporte"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          rows={3}
          placeholder="Ej. En Villa Fátima llevamos 5 días sin agua, hay niños con diarrea."
          className="min-h-20 w-full resize-y border border-line bg-paper-2/40 p-3 text-base outline-none focus:ring-2 focus:ring-well"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={enviando || !texto.trim()}
            className="min-h-11 flex-1 border border-ink bg-well px-4 py-2 text-sm font-semibold text-well-ink disabled:opacity-50"
          >
            {enviando ? 'Enviando…' : 'Enviar por web'}
          </button>
          {soportaVoz ? (
            <button
              type="button"
              onClick={faseVoz === 'grabando' ? detenerGrabacion : iniciarGrabacion}
              disabled={enviando || faseVoz === 'transcribiendo'}
              className="min-h-11 border border-ink px-4 py-2 text-sm font-semibold"
            >
              {faseVoz === 'grabando'
                ? 'Detener voz'
                : faseVoz === 'transcribiendo'
                  ? 'Transcribiendo…'
                  : 'Grabar voz'}
            </button>
          ) : (
            <p className="self-center text-xs text-ink/60">Este navegador no graba audio.</p>
          )}
        </div>
      </form>

      {faseVoz === 'confirmar' ? (
        <div className="border-t border-line bg-paper-2/50 p-3">
          <p className="text-[11px] uppercase tracking-widest text-well">Confirma la transcripción</p>
          <textarea
            value={textoVoz}
            onChange={(e) => setTextoVoz(e.target.value)}
            rows={3}
            className="mt-2 w-full border border-line bg-paper p-2 text-sm"
          />
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              disabled={enviando || !textoVoz.trim()}
              onClick={() => void enviar('voz', textoVoz)}
              className="min-h-11 border border-ink bg-well px-3 text-sm text-well-ink"
            >
              Enviar como voz
            </button>
            <button
              type="button"
              onClick={() => {
                setFaseVoz('idle')
                setTextoVoz('')
              }}
              className="min-h-11 border border-line px-3 text-sm"
            >
              Descartar audio
            </button>
          </div>
        </div>
      ) : null}

      {aviso ? (
        <p className="border-t border-line px-3 py-2 text-sm" role="status">
          {aviso}
        </p>
      ) : null}
    </section>
  )
}
