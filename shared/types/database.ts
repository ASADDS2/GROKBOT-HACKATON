export interface BarrioRow {
  id: string;
  nombre: string;
  municipio: string;
  comuna: string | null;
  lat: number;
  lng: number;
  personas_est: number;
  es_albergue: boolean;
  via_abierta: boolean;
  alias: string[];
}

export interface ReporteRow {
  id: string;
  barrio_id: string | null;
  canal: string;
  texto_crudo: string;
  dias_sin_agua: number | null;
  personas: number | null;
  sintomas: string[];
  casos: number;
  confianza: number | null;
  necesita_revision: boolean;
  sesion_id: string | null;
  created_at: string;
}

export interface EntregaRow {
  id: string;
  barrio_id: string | null;
  carrotanque: string | null;
  litros: number | null;
  confirmada_por: string | null;
  created_at: string;
}

export interface RutaRow {
  id: string;
  fecha: string;
  carrotanque: string;
  paradas: unknown;
  estado: string | null;
}

export interface AlertaSaludRow {
  id: string;
  barrio_id: string | null;
  sintoma: string;
  casos_72h: number;
  linea_base: number | null;
  severidad: string | null;
  created_at: string;
}

export interface IndiceSedRow {
  id: string;
  nombre: string;
  municipio: string;
  lat: number;
  lng: number;
  es_albergue: boolean;
  via_abierta: boolean;
  dias_sin_agua: number;
  personas: number;
  vulnerabilidad: number;
  indice_sed: number;
  paso_escala: 0 | 1 | 2 | 3;
}
