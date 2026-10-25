// Guardado LOCAL (solo navegador) de las respuestas del diagnóstico: una evaluación vigente por empresa,
// con la versión de metodología con la que se respondió. En la fase de servicios se reemplaza por
// Supabase (con RLS por empresa). Las «fotografías» fechadas viven en lib/historial.

import { crearAlmacenPorEmpresa } from '@/lib/almacenPorEmpresa';
import { BANCO, VERSION_METODOLOGIA } from './banco';
import type { Respuesta, Respuestas } from './motor';

export interface Evaluacion {
  empresaId: string;
  metodologia: string;
  respuestas: Respuestas;
  actualizado: number;
}

const almacen = crearAlmacenPorEmpresa<Evaluacion>({
  clave: (id) => `sustentaesg.diag.${id}.v1`,
  evento: 'sustentaesg:diagnostico',
  vacio: (id) => ({ empresaId: id, metodologia: VERSION_METODOLOGIA, respuestas: {}, actualizado: 0 }),
  parsear: (bruto) => {
    try {
      const e = JSON.parse(bruto) as Evaluacion;
      return e && typeof e.respuestas === 'object' ? e : null;
    } catch {
      return null;
    }
  },
});

export const leerEvaluacion = almacen.leer;
export const useEvaluacion = almacen.useValor;
export const borrarEvaluacion = almacen.quitar;

/** Guarda una respuesta de la empresa; devuelve si se pudo guardar en este navegador. */
export function guardarRespuesta(empresaId: string, preguntaId: string, respuesta: Respuesta | null): { guardado: boolean } {
  const actual = leerEvaluacion(empresaId);
  const respuestas = { ...actual.respuestas };
  if (respuesta === null) delete respuestas[preguntaId];
  else respuestas[preguntaId] = respuesta;
  return { guardado: almacen.escribir(empresaId, { ...actual, empresaId, respuestas, actualizado: Date.now() }) };
}

/** Reemplaza todas las respuestas (p. ej. para empezar de nuevo a partir de una fotografía). */
export function reemplazarRespuestas(empresaId: string, respuestas: Respuestas): boolean {
  const actual = leerEvaluacion(empresaId);
  return almacen.escribir(empresaId, { ...actual, empresaId, respuestas: { ...respuestas }, actualizado: Date.now() });
}

/** Índice de la primera pregunta sin responder (o el total si todas tienen respuesta). */
export function primeraPendiente(respuestas: Respuestas): number {
  const i = BANCO.findIndex((p) => !respuestas[p.id]);
  return i === -1 ? BANCO.length : i;
}
