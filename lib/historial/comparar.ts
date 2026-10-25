// Historial: «fotografías» de un diagnóstico en una fecha, y su comparación. Puro y determinista.
// Una fotografía guarda las respuestas y el resultado con la versión de metodología con la que se
// calculó, para que cambiar la metodología después no reescriba el pasado (especificación §8.1).

import { DIMENSIONES, type Dimension } from '@/lib/diagnostico/banco';
import { calcularDiagnostico, type EstadoResultado, type Respuestas } from '@/lib/diagnostico/motor';

export interface ResumenResultado {
  puntaje: number | null;
  nivel: string | null;
  estado: EstadoResultado;
}

export interface Fotografia {
  id: string;
  empresaId: string;
  creada: number;
  etiqueta: string;
  metodologia: string;
  respuestas: Respuestas;
  respondidas: number;
  general: ResumenResultado;
  dimensiones: Record<Dimension, ResumenResultado>;
}

export function crearFotografia(empresaId: string, etiqueta: string, respuestas: Respuestas, id: string, ahora: number): Fotografia {
  const r = calcularDiagnostico(respuestas);
  const resumen = (x: { puntaje: number | null; nivel: string | null; estado: EstadoResultado }): ResumenResultado => ({
    puntaje: x.puntaje === null ? null : Math.round(x.puntaje),
    nivel: x.nivel,
    estado: x.estado,
  });
  return {
    id,
    empresaId,
    creada: ahora,
    etiqueta: etiqueta.trim(),
    metodologia: r.metodologia,
    respuestas: { ...respuestas },
    respondidas: r.respondidas,
    general: resumen(r.general),
    dimensiones: Object.fromEntries(DIMENSIONES.map((d) => [d.id, resumen(r.dimensiones[d.id])])) as Record<Dimension, ResumenResultado>,
  };
}

export type Tendencia = 'sube' | 'baja' | 'igual' | 'sin_dato';

export interface Cambio {
  dimension: Dimension | 'general';
  antes: number | null;
  despues: number | null;
  delta: number | null;
  tendencia: Tendencia;
  /** Una de las dos mediciones es provisional o insuficiente: la comparación es orientativa. */
  orientativo: boolean;
}

function cambio(dimension: Cambio['dimension'], antes: ResumenResultado, despues: ResumenResultado): Cambio {
  const hayDatos = antes.puntaje !== null && despues.puntaje !== null;
  const delta = hayDatos ? (despues.puntaje as number) - (antes.puntaje as number) : null;
  return {
    dimension,
    antes: antes.puntaje,
    despues: despues.puntaje,
    delta,
    tendencia: delta === null ? 'sin_dato' : delta > 0 ? 'sube' : delta < 0 ? 'baja' : 'igual',
    orientativo: antes.estado !== 'completo' || despues.estado !== 'completo',
  };
}

export interface Comparacion {
  general: Cambio;
  dimensiones: Cambio[];
  /** Se calcularon con versiones distintas de la metodología: los números no son del todo comparables. */
  metodologiaDistinta: boolean;
}

/** Compara dos fotografías de la MISMA empresa (la más antigua primero). */
export function comparar(antes: Fotografia, despues: Fotografia): Comparacion {
  return {
    general: cambio('general', antes.general, despues.general),
    dimensiones: DIMENSIONES.map((d) => cambio(d.id, antes.dimensiones[d.id], despues.dimensiones[d.id])),
    metodologiaDistinta: antes.metodologia !== despues.metodologia,
  };
}

/** Texto en palabras de un cambio, para no depender de flechas o colores. */
export function textoCambio(c: Cambio): string {
  if (c.tendencia === 'sin_dato') return 'Sin datos para comparar';
  if (c.tendencia === 'igual') return 'Sin cambio';
  const n = Math.abs(c.delta as number);
  return `${c.tendencia === 'sube' ? 'Sube' : 'Baja'} ${n} ${n === 1 ? 'punto' : 'puntos'}`;
}

/** Etiqueta por defecto con la fecha en palabras, p. ej. «23 de octubre de 2026». */
export function etiquetaPorDefecto(ahora: number): string {
  return new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(ahora));
}
