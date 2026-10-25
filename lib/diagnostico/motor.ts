// Motor de cálculo del diagnóstico. Determinista y sin IA: las mismas respuestas dan siempre el mismo
// resultado (docs/producto/METODOLOGIA-BORRADOR.md §3). Umbrales y niveles son PROVISIONALES y
// configurables. No calcula riesgo: un puntaje bajo es «área de atención», nunca «alto riesgo».

import { BANCO, DIMENSIONES, VERSION_METODOLOGIA, type Dimension, type Pregunta } from './banco';

export type Valor = 0 | 1 | 2 | 3 | 4;
export type Respuesta =
  | { tipo: 'valor'; valor: Valor }
  | { tipo: 'na'; justificacion?: string }
  | { tipo: 'sin_info' };

export type Respuestas = Record<string, Respuesta>;

export type EstadoResultado = 'completo' | 'provisional' | 'insuficiente';

export interface Configuracion {
  coberturaCompleta: number;
  coberturaMinima: number;
}

export const CONFIG_POR_DEFECTO: Configuracion = { coberturaCompleta: 0.7, coberturaMinima: 0.4 };

export const NIVELES = [
  { max: 20, nombre: 'Inicial' },
  { max: 40, nombre: 'Básico' },
  { max: 60, nombre: 'En desarrollo' },
  { max: 80, nombre: 'Gestionado' },
  { max: 100, nombre: 'Avanzado' },
] as const;

export function nivelDe(puntaje: number): string {
  const p = Math.round(Math.min(100, Math.max(0, puntaje)));
  return (NIVELES.find((n) => p <= n.max) ?? NIVELES[NIVELES.length - 1]).nombre;
}

export interface Exclusion {
  pregunta: string;
  justificacion: string;
  /** «No aplica» sin que el perfil lo habilite: queda marcado para revisar, no se oculta. */
  pendienteRevisar: boolean;
}

export interface ResultadoDimension {
  dimension: Dimension;
  /** null cuando la cobertura es insuficiente o no hay preguntas válidas: no se inventa una cifra. */
  puntaje: number | null;
  nivel: string | null;
  estado: EstadoResultado;
  total: number;
  aplicables: number;
  validas: number;
  sinInfo: number;
  sinResponder: number;
  cobertura: number;
  exclusiones: Exclusion[];
  /** Preguntas con valor ≤ 1: «áreas de atención», ordenadas de menor a mayor puntaje. */
  atencion: string[];
}

export interface ResultadoGeneral {
  puntaje: number | null;
  nivel: string | null;
  estado: EstadoResultado;
  /** Dimensiones que componen el índice (cobertura ≥ umbral completo). */
  incluidas: Dimension[];
  faltantes: Dimension[];
}

export interface ResultadoDiagnostico {
  metodologia: string;
  dimensiones: Record<Dimension, ResultadoDimension>;
  general: ResultadoGeneral;
  respondidas: number;
  totalPreguntas: number;
}

export function calcularDimension(
  dimension: Dimension,
  respuestas: Respuestas,
  config: Configuracion = CONFIG_POR_DEFECTO,
  banco: Pregunta[] = BANCO
): ResultadoDimension {
  const preguntas = banco.filter((p) => p.dimension === dimension);
  let puntos = 0;
  let validas = 0;
  let sinInfo = 0;
  let sinResponder = 0;
  const exclusiones: Exclusion[] = [];
  const bajas: { id: string; valor: number }[] = [];

  for (const p of preguntas) {
    const r = respuestas[p.id];
    if (!r) {
      sinResponder += 1;
    } else if (r.tipo === 'valor') {
      validas += 1;
      puntos += r.valor;
      if (r.valor <= 1) bajas.push({ id: p.id, valor: r.valor });
    } else if (r.tipo === 'sin_info') {
      sinInfo += 1;
    } else {
      exclusiones.push({
        pregunta: p.id,
        justificacion: r.justificacion?.trim() ?? '',
        pendienteRevisar: !p.naHabilitable,
      });
    }
  }

  const aplicables = preguntas.length - exclusiones.length;
  const cobertura = aplicables > 0 ? validas / aplicables : 0;
  const estado: EstadoResultado =
    cobertura >= config.coberturaCompleta ? 'completo' : cobertura >= config.coberturaMinima ? 'provisional' : 'insuficiente';
  const puntaje = estado === 'insuficiente' || validas === 0 ? null : (puntos / (4 * validas)) * 100;

  return {
    dimension,
    puntaje,
    nivel: puntaje === null ? null : nivelDe(puntaje),
    estado,
    total: preguntas.length,
    aplicables,
    validas,
    sinInfo,
    sinResponder,
    cobertura,
    exclusiones,
    atencion: bajas.sort((a, b) => a.valor - b.valor || a.id.localeCompare(b.id)).map((b) => b.id),
  };
}

export function calcularDiagnostico(
  respuestas: Respuestas,
  config: Configuracion = CONFIG_POR_DEFECTO,
  banco: Pregunta[] = BANCO
): ResultadoDiagnostico {
  const dimensiones = Object.fromEntries(
    DIMENSIONES.map((d) => [d.id, calcularDimension(d.id, respuestas, config, banco)])
  ) as Record<Dimension, ResultadoDimension>;

  const delIndice = DIMENSIONES.filter((d) => d.entraAlIndice).map((d) => d.id);
  const incluidas = delIndice.filter((id) => dimensiones[id].estado === 'completo' && dimensiones[id].puntaje !== null);
  const faltantes = delIndice.filter((id) => !incluidas.includes(id));
  const puntaje = incluidas.length === 0 ? null : incluidas.reduce((s, id) => s + (dimensiones[id].puntaje ?? 0), 0) / incluidas.length;
  const estado: EstadoResultado = puntaje === null ? 'insuficiente' : faltantes.length === 0 ? 'completo' : 'provisional';

  return {
    metodologia: VERSION_METODOLOGIA,
    dimensiones,
    general: { puntaje, nivel: puntaje === null ? null : nivelDe(puntaje), estado, incluidas, faltantes },
    respondidas: banco.filter((p) => respuestas[p.id]).length,
    totalPreguntas: banco.length,
  };
}
