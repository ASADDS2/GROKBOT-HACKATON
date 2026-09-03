import type { FeatureCollection, Point } from "geojson";

export interface BarrioSedProperties {
  id: string;
  nombre: string;
  municipio: string;
  dias_sin_agua: number;
  indice_sed: number;
  paso_escala: 0 | 1 | 2 | 3;
  es_albergue: boolean;
  via_abierta: boolean;
}

export type SedFeatureCollection = FeatureCollection<
  Point,
  BarrioSedProperties
>;

export type CanalReporte = "web" | "voz" | "x";

export interface ReporteInput {
  texto_crudo: string;
  canal: CanalReporte;
  sesion_id?: string;
}

export interface ReporteDTO {
  id: string;
  barrio_id: string | null;
  canal: CanalReporte;
  texto_crudo: string;
  dias_sin_agua: number | null;
  personas: number | null;
  sintomas: string[];
  casos: number;
  confianza: number;
  necesita_revision: boolean;
  alternativas_barrio?: string[];
  created_at: string;
}

export interface RutaParada {
  barrio_id: string;
  orden: number;
  litros_sug: number;
}

export interface RutaResponse {
  carrotanque: string;
  fecha: string;
  paradas: RutaParada[];
}

export interface AlertaDTO {
  id: string;
  barrio_id: string;
  sintoma: string;
  casos_72h: number;
  linea_base: number;
  severidad: "observacion" | "alerta" | "urgente";
  created_at: string;
}

export interface EntregaInput {
  barrio_id: string;
  carrotanque: string;
  litros: number;
  confirmada_por: "conductor" | "comunidad";
}

export interface TranscripcionResponse {
  texto: string;
}

export interface ApiError {
  error: string;
}
