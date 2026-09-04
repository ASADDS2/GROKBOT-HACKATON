import type { Point } from 'geojson'
import type { BarrioSedProperties, SedFeatureCollection } from '../../../shared/types/api'
import type { PasoEscala } from './escalaVisual'

/** 48 h comprimidas en 30 s. Offline: no pega al API. */
export const REPLAY_HORAS = 48
export const REPLAY_DURACION_MS = 30_000
export const REPLAY_FOTOGRAMAS = 25

interface BarrioReplay {
  id: string
  nombre: string
  municipio: string
  lon: number
  lat: number
  es_albergue: boolean
  via_abierta: boolean
  /** paso_escala ya calculado en origen (fixture). No hay fórmula aquí. */
  pasos: PasoEscala[]
  dias: number[]
  indices: number[]
}

/**
 * Keyframes por barrio (25 valores = t0 + 24 tramos de 2 h).
 * Los tres arrays van juntos: el servidor habría emitido ese triplete.
 */
const BARRIOS: BarrioReplay[] = [
  {
    id: 'bue-lleras',
    nombre: 'Lleras',
    municipio: 'Buenaventura',
    lon: -77.0194,
    lat: 3.8892,
    es_albergue: false,
    via_abierta: true,
    pasos: [0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3],
    dias: [0, 0, 1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10],
    indices: [4, 6, 12, 18, 26, 28, 32, 36, 40, 48, 52, 56, 60, 64, 68, 70, 74, 78, 82, 86, 88, 90, 92, 96, 98],
  },
  {
    id: 'bue-juan23',
    nombre: 'Juan XXIII',
    municipio: 'Buenaventura',
    lon: -77.0287,
    lat: 3.8915,
    es_albergue: true,
    via_abierta: true,
    pasos: [1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    dias: [2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12],
    indices: [28, 30, 34, 38, 44, 52, 54, 58, 62, 66, 70, 74, 78, 80, 84, 86, 88, 90, 92, 94, 95, 96, 97, 98, 99],
  },
  {
    id: 'bue-san-francisco',
    nombre: 'San Francisco',
    municipio: 'Buenaventura',
    lon: -77.0312,
    lat: 3.8861,
    es_albergue: false,
    via_abierta: true,
    pasos: [0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3],
    dias: [0, 0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 9],
    indices: [2, 4, 8, 10, 14, 18, 26, 28, 32, 36, 40, 44, 48, 52, 56, 58, 62, 66, 68, 70, 72, 74, 78, 82, 86],
  },
  {
    id: 'bue-independencia',
    nombre: 'La Independencia',
    municipio: 'Buenaventura',
    lon: -77.0384,
    lat: 3.882,
    es_albergue: false,
    via_abierta: false,
    pasos: [2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    dias: [5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 12, 12, 13, 13, 14],
    indices: [58, 60, 62, 66, 68, 70, 74, 78, 80, 82, 84, 86, 88, 89, 90, 91, 92, 93, 94, 95, 96, 96, 97, 98, 99],
  },
  {
    id: 'bue-progreso',
    nombre: 'El Progreso',
    municipio: 'Buenaventura',
    lon: -77.0258,
    lat: 3.8754,
    es_albergue: false,
    via_abierta: true,
    pasos: [0, 0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3],
    dias: [1, 1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 7, 8, 8, 9, 9, 9, 10],
    indices: [12, 16, 20, 26, 30, 34, 38, 42, 48, 52, 56, 58, 62, 64, 66, 68, 70, 72, 74, 78, 80, 84, 86, 88, 90],
  },
  {
    id: 'bue-cascajal',
    nombre: 'Cascajal',
    municipio: 'Buenaventura',
    lon: -77.0103,
    lat: 3.8951,
    es_albergue: false,
    via_abierta: true,
    pasos: [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 2],
    dias: [0, 0, 0, 0, 1, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7],
    indices: [0, 2, 4, 8, 10, 12, 16, 20, 26, 28, 32, 36, 40, 44, 48, 52, 54, 58, 60, 64, 66, 68, 70, 72, 74],
  },
  {
    id: 'bue-napoles',
    nombre: 'Nápoles',
    municipio: 'Buenaventura',
    lon: -77.0356,
    lat: 3.8684,
    es_albergue: false,
    via_abierta: true,
    pasos: [1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    dias: [3, 3, 3, 4, 4, 5, 5, 5, 6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 10, 11, 11, 12, 12, 12],
    indices: [36, 40, 48, 52, 56, 60, 64, 68, 70, 74, 78, 80, 84, 86, 88, 90, 91, 92, 93, 94, 95, 96, 97, 98, 98],
  },
  {
    id: 'bue-inmaculada',
    nombre: 'La Inmaculada',
    municipio: 'Buenaventura',
    lon: -77.0228,
    lat: 3.8843,
    es_albergue: false,
    via_abierta: true,
    pasos: [0, 0, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    dias: [1, 1, 2, 2, 2, 3, 3, 4, 4, 4, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9, 9, 9, 10, 10],
    indices: [14, 20, 26, 30, 34, 38, 44, 48, 52, 56, 60, 64, 68, 70, 74, 78, 80, 84, 86, 88, 90, 91, 92, 94, 96],
  },
  {
    id: 'bue-pueblo-nuevo',
    nombre: 'Pueblo Nuevo',
    municipio: 'Buenaventura',
    lon: -77.0151,
    lat: 3.8702,
    es_albergue: false,
    via_abierta: true,
    pasos: [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 1, 1, 2, 2, 2, 2, 2, 2, 2, 2, 2, 3, 3, 3, 3],
    dias: [0, 0, 1, 1, 1, 2, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 6, 6, 6, 7, 7, 8, 8, 8, 9],
    indices: [6, 8, 12, 16, 22, 26, 30, 34, 38, 42, 46, 48, 54, 58, 62, 66, 68, 70, 72, 74, 74, 78, 82, 84, 88],
  },
  {
    id: 'bue-pianguita',
    nombre: 'Piangüita',
    municipio: 'Buenaventura',
    lon: -77.2214,
    lat: 3.8419,
    es_albergue: false,
    via_abierta: false,
    pasos: [2, 2, 2, 2, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3, 3],
    dias: [6, 6, 7, 7, 8, 8, 8, 9, 9, 10, 10, 10, 11, 11, 12, 12, 12, 13, 13, 14, 14, 14, 15, 15, 16],
    indices: [64, 68, 72, 74, 78, 80, 84, 86, 88, 90, 91, 92, 93, 94, 95, 95, 96, 96, 97, 97, 98, 98, 99, 99, 100],
  },
]

function fotogramaEn(indice: number): SedFeatureCollection {
  const i = Math.min(Math.max(indice, 0), REPLAY_FOTOGRAMAS - 1)
  return {
    type: 'FeatureCollection',
    features: BARRIOS.map((b) => {
      const properties: BarrioSedProperties = {
        id: b.id,
        nombre: b.nombre,
        municipio: b.municipio,
        dias_sin_agua: b.dias[i] ?? 0,
        indice_sed: b.indices[i] ?? 0,
        paso_escala: b.pasos[i] ?? 0,
        es_albergue: b.es_albergue,
        via_abierta: b.via_abierta,
      }
      const geometry: Point = { type: 'Point', coordinates: [b.lon, b.lat] }
      return {
        type: 'Feature' as const,
        id: b.id,
        geometry,
        properties,
      }
    }),
  }
}

export function getFotogramasReplay(): SedFeatureCollection[] {
  return Array.from({ length: REPLAY_FOTOGRAMAS }, (_, i) => fotogramaEn(i))
}

export function horaDeFotograma(indice: number): number {
  return Math.round((indice / (REPLAY_FOTOGRAMAS - 1)) * REPLAY_HORAS)
}

export function nombreBarrio(id: string): string {
  return BARRIOS.find((b) => b.id === id)?.nombre ?? id
}

export const CATALOGO_BARRIOS = BARRIOS.map((b) => ({
  id: b.id,
  nombre: b.nombre,
  municipio: b.municipio,
}))
