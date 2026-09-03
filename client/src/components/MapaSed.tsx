import { useEffect, useMemo, useState } from 'react'
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl'
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js'
import type { BarrioSedProperties, ReporteDTO, SedFeatureCollection } from '../../../shared/types/api'
import { supabase, supabaseConfigurado } from '../lib/supabaseClient'
import { visualDePaso, type PasoEscala } from '../lib/escalaVisual'
import 'mapbox-gl/dist/mapbox-gl.css'

interface MapaSedProps {
  datosIniciales: SedFeatureCollection
  onReportesChange?: (reportes: ReporteDTO[]) => void
}

interface PopupBarrio {
  nombre: string
  municipio: string
  dias: number
  indice: number
  paso: PasoEscala
  lon: number
  lat: number
  es_albergue: boolean
  via_abierta: boolean
}

const TOKEN = import.meta.env.VITE_MAPBOX_TOKEN
const CENTRO: [number, number] = [-72.8, 11.52]

function esReporte(row: ReporteDTO | Record<string, never>): row is ReporteDTO {
  return 'id' in row && typeof row.id === 'string'
}

function boundsDe(datos: SedFeatureCollection): { minLon: number; maxLon: number; minLat: number; maxLat: number } {
  const lons = datos.features.map((f) => f.geometry.coordinates[0])
  const lats = datos.features.map((f) => f.geometry.coordinates[1])
  return {
    minLon: Math.min(...lons),
    maxLon: Math.max(...lons),
    minLat: Math.min(...lats),
    maxLat: Math.max(...lats),
  }
}

function FormaPaso({ paso }: { paso: PasoEscala }) {
  const v = visualDePaso(paso)
  if (v.forma === 'triangulo') {
    return (
      <span
        aria-hidden
        className="block"
        style={{
          width: 0,
          height: 0,
          borderLeft: '9px solid transparent',
          borderRight: '9px solid transparent',
          borderBottom: `16px solid ${v.color}`,
          filter: 'drop-shadow(0 0 0 #1c1612)',
        }}
      />
    )
  }
  return (
    <span
      aria-hidden
      className={`${v.claseTex} block h-4 w-4 border border-ink ${
        v.forma === 'circulo' ? 'forma-circulo' : v.forma === 'rombo' ? 'forma-rombo' : 'forma-cuadrado'
      }`}
    />
  )
}

function MapaEsquematico({
  datos,
  onPick,
}: {
  datos: SedFeatureCollection
  onPick: (p: PopupBarrio) => void
}) {
  const b = useMemo(() => {
    if (!datos.features.length) {
      return { minLon: CENTRO[0] - 0.4, maxLon: CENTRO[0] + 0.4, minLat: CENTRO[1] - 0.3, maxLat: CENTRO[1] + 0.3 }
    }
    return boundsDe(datos)
  }, [datos])

  const pad = 0.08
  const w = b.maxLon - b.minLon + pad * 2
  const h = b.maxLat - b.minLat + pad * 2

  return (
    <div className="relative h-full min-h-[320px] w-full overflow-hidden bg-[#d7c9b0]">
      <div
        className="absolute inset-0 opacity-40"
        style={{
          backgroundImage:
            'repeating-linear-gradient(90deg, transparent 0 18px, rgba(14,61,66,0.08) 18px 19px), repeating-linear-gradient(0deg, transparent 0 18px, rgba(14,61,66,0.08) 18px 19px)',
        }}
      />
      {datos.features.map((f) => {
        const [lon, lat] = f.geometry.coordinates
        const left = ((lon - (b.minLon - pad)) / w) * 100
        const top = (1 - (lat - (b.minLat - pad)) / h) * 100
        const p = f.properties
        return (
          <button
            key={p.id}
            type="button"
            className="absolute -translate-x-1/2 -translate-y-1/2"
            style={{ left: `${left}%`, top: `${top}%` }}
            onClick={() =>
              onPick({
                nombre: p.nombre,
                municipio: p.municipio,
                dias: p.dias_sin_agua,
                indice: p.indice_sed,
                paso: p.paso_escala,
                lon,
                lat,
                es_albergue: p.es_albergue,
                via_abierta: p.via_abierta,
              })
            }
            aria-label={`${p.nombre}, ${visualDePaso(p.paso_escala).nombre}`}
          >
            <FormaPaso paso={p.paso_escala} />
          </button>
        )
      })}
      {!datos.features.length ? (
        <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-ink/70">
          Mapa vacío: el API de sed no respondió. Arranca el replay o espera al backend.
        </p>
      ) : null}
    </div>
  )
}

export function MapaSed({ datosIniciales, onReportesChange }: MapaSedProps) {
  const [datos, setDatos] = useState<SedFeatureCollection>(datosIniciales)
  const [reportes, setReportes] = useState<ReporteDTO[]>([])
  const [popup, setPopup] = useState<PopupBarrio | null>(null)
  const [mapError, setMapError] = useState(!TOKEN)

  useEffect(() => {
    setDatos(datosIniciales)
  }, [datosIniciales])

  useEffect(() => {
    onReportesChange?.(reportes)
  }, [reportes, onReportesChange])

  useEffect(() => {
    if (!supabaseConfigurado()) return undefined
    const channel = supabase
      .channel('reportes-inserts')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'reportes' },
        (payload: RealtimePostgresChangesPayload<ReporteDTO>) => {
          const row = payload.new
          if (esReporte(row)) {
            setReportes((prev) => [row, ...prev.filter((r) => r.id !== row.id)])
          }
        },
      )
      .subscribe()

    return () => {
      void supabase.removeChannel(channel)
    }
  }, [])

  function abrir(p: BarrioSedProperties, lon: number, lat: number) {
    setPopup({
      nombre: p.nombre,
      municipio: p.municipio,
      dias: p.dias_sin_agua,
      indice: p.indice_sed,
      paso: p.paso_escala,
      lon,
      lat,
      es_albergue: p.es_albergue,
      via_abierta: p.via_abierta,
    })
  }

  const ficha = popup ? (
    <div className="min-w-40 text-sm">
      <p className="font-display text-base">{popup.nombre}</p>
      <p className="text-xs text-ink/60">{popup.municipio}</p>
      <p className="mt-1">
        {visualDePaso(popup.paso).nombre} ({visualDePaso(popup.paso).forma}) · {popup.dias} días
      </p>
      <p className="text-xs">índice {popup.indice} (servidor)</p>
      <p className="text-xs">
        {popup.es_albergue ? 'Albergue · ' : ''}
        {popup.via_abierta ? 'vía abierta' : 'vía cerrada'}
      </p>
    </div>
  ) : null

  if (mapError) {
    return (
      <div className="relative h-full min-h-[320px] w-full border border-line">
        <MapaEsquematico
          datos={datos}
          onPick={(p) => {
            setPopup(p)
          }}
        />
        {popup ? (
          <div className="absolute bottom-3 left-3 right-3 border border-ink bg-paper p-3 shadow-[3px_3px_0_#0e3d42] sm:right-auto">
            {ficha}
            <button type="button" className="mt-2 text-xs underline" onClick={() => setPopup(null)}>
              Cerrar
            </button>
          </div>
        ) : null}
        <p className="pointer-events-none absolute right-2 top-2 bg-paper/90 px-2 py-1 text-[10px] uppercase tracking-widest">
          Plano esquemático · sin token Mapbox
        </p>
      </div>
    )
  }

  return (
    <div className="relative h-full min-h-[320px] w-full border border-line">
      <Map
        mapboxAccessToken={TOKEN}
        initialViewState={{ longitude: CENTRO[0], latitude: CENTRO[1], zoom: 8.2 }}
        mapStyle="mapbox://styles/mapbox/light-v11"
        style={{ width: '100%', height: '100%' }}
        onError={() => setMapError(true)}
      >
        <NavigationControl position="top-right" />
        {datos.features.map((f) => {
          const [lon, lat] = f.geometry.coordinates
          const p = f.properties
          return (
            <Marker key={p.id} longitude={lon} latitude={lat} anchor="center">
              <button type="button" onClick={() => abrir(p, lon, lat)} aria-label={p.nombre}>
                <FormaPaso paso={p.paso_escala} />
              </button>
            </Marker>
          )
        })}
        {popup ? (
          <Popup
            longitude={popup.lon}
            latitude={popup.lat}
            anchor="bottom"
            onClose={() => setPopup(null)}
            closeButton
          >
            {ficha}
          </Popup>
        ) : null}
      </Map>
    </div>
  )
}
