import type { SedFeatureCollection, SeveridadAlerta } from '../../../shared/types/api'

export type PasoEscala = 0 | 1 | 2 | 3

export interface VisualPaso {
  paso: PasoEscala
  nombre: string
  color: string
  textura: string
  forma: 'circulo' | 'rombo' | 'cuadrado' | 'triangulo'
  claseTex: string
}

/** Paleta + textura + forma. No recalcula el índice: solo traduce paso_escala. */
export const VISUAL_PASO: Record<PasoEscala, VisualPaso> = {
  0: {
    paso: 0,
    nombre: 'Agua',
    color: '#2A6F6A',
    textura: 'puntos finos',
    forma: 'circulo',
    claseTex: 'tex-paso-0',
  },
  1: {
    paso: 1,
    nombre: 'Tensión',
    color: '#C4A035',
    textura: 'rayas',
    forma: 'rombo',
    claseTex: 'tex-paso-1',
  },
  2: {
    paso: 2,
    nombre: 'Sed',
    color: '#C45C26',
    textura: 'cruzado',
    forma: 'cuadrado',
    claseTex: 'tex-paso-2',
  },
  3: {
    paso: 3,
    nombre: 'Crisis',
    color: '#8B1E2D',
    textura: 'punteado denso',
    forma: 'triangulo',
    claseTex: 'tex-paso-3',
  },
}

export function visualDePaso(paso: PasoEscala): VisualPaso {
  return VISUAL_PASO[paso]
}

export interface VisualAlerta {
  severidad: SeveridadAlerta
  nombre: string
  forma: 'anillo' | 'rombo' | 'triangulo'
  clase: string
}

export const VISUAL_ALERTA: Record<SeveridadAlerta, VisualAlerta> = {
  observacion: {
    severidad: 'observacion',
    nombre: 'Observación',
    forma: 'anillo',
    clase: 'alerta-observacion',
  },
  alerta: {
    severidad: 'alerta',
    nombre: 'Alerta',
    forma: 'rombo',
    clase: 'alerta-media',
  },
  urgente: {
    severidad: 'urgente',
    nombre: 'Urgente',
    forma: 'triangulo',
    clase: 'alerta-urgente',
  },
}

export const EMPTY_SED: SedFeatureCollection = {
  type: 'FeatureCollection',
  features: [],
}
