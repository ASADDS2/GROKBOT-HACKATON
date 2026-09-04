import { useEffect, useMemo, useState } from 'react'
import Map, { Marker, NavigationControl, Popup } from 'react-map-gl/maplibre'
import type { BarrioSedProperties, SedFeatureCollection } from '../../../shared/types/api'
import { visualDePaso, type PasoEscala } from '../lib/escalaVisual'
import 'maplibre-gl/dist/maplibre-gl.css'

interface MapaSedProps {
  datosIniciales: SedFeatureCollection
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

/** Estilo vectorial público (OpenFreeMap) — no requiere token. */
const ESTILO_MAPA = 'https://tiles.openfreemap.org/styles/liberty'
const CENTRO: [number, number] = [-77.025, 3.883]

function boundsDe(datos: SedFeatureCollection): {
  minLon: number
  maxLon: number
  minLat: number
  maxLat: number
} {
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
      return { minLon: CENTRO[0] - 0.04, maxLon: CENTRO[0] + 0.04, minLat: CENTRO[1] - 0.03, maxLat: CENTRO[1] + 0.03 }
    }
    return boundsDe(datos)
  }, [datos])

  const pad = 0.008
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
          Mapa vacío: el API de sed no respondió (o devolvió 501). Arranca el replay o espera B4.
        </p>
      ) : null}
    </div>
  )
}

export function MapaSed({ datosIniciales }: MapaSedProps) {
  const [datos, setDatos] = useState<SedFeatureCollection>(datosIniciales)
  const [popup, setPopup] = useState<PopupBarrio | null>(null)
  const [mapError, setMapError] = useState(false)

  useEffect(() => {
    setDatos(datosIniciales)
  }, [datosIniciales])

  const vistaInicial = useMemo(() => {
    if (!datos.features.length) {
      return { longitude: CENTRO[0], latitude: CENTRO[1], zoom: 12.2 }
    }
    const b = boundsDe(datos)
    const longitude = (b.minLon + b.maxLon) / 2
    const latitude = (b.minLat + b.maxLat) / 2
    const span = Math.max(b.maxLon - b.minLon, b.maxLat - b.minLat)
    // Buenaventura + Quibdó están lejos: zoom bajo para ver ambos municipios.
    const zoom = span > 1 ? 7.2 : span > 0.15 ? 10.5 : 12.2
    return { longitude, latitude, zoom }
  }, [datos])

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
        <MapaEsquematico datos={datos} onPick={setPopup} />
        {popup ? (
          <div className="absolute bottom-3 left-3 right-3 border border-ink bg-paper p-3 shadow-[3px_3px_0_#0e3d42] sm:right-auto">
            {ficha}
            <button type="button" className="mt-2 text-xs underline" onClick={() => setPopup(null)}>
              Cerrar
            </button>
          </div>
        ) : null}
        <p className="pointer-events-none absolute right-2 top-2 bg-paper/90 px-2 py-1 text-[10px] uppercase tracking-widest">
          Plano esquemático · tiles no cargaron
        </p>
      </div>
    )
  }

  // Remonta cuando llegan puntos reales: initialViewState solo aplica al montar.
  const mapKey = datos.features.length
    ? `${vistaInicial.longitude.toFixed(3)}-${vistaInicial.latitude.toFixed(3)}-${vistaInicial.zoom}`
    : 'vacio'

  return (
    <div className="relative h-full min-h-[320px] w-full border border-line">
      <Map
        key={mapKey}
        initialViewState={vistaInicial}
        mapStyle={ESTILO_MAPA}
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
