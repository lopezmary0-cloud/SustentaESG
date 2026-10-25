// Historial de una empresa: lista de «fotografías» fechadas de su diagnóstico. Guardado LOCAL (solo
// navegador); en la fase de servicios pasa a Supabase con RLS por empresa.

import { crearAlmacenPorEmpresa } from '@/lib/almacenPorEmpresa';
import type { Respuestas } from '@/lib/diagnostico/motor';
import { crearFotografia, etiquetaPorDefecto, type Fotografia } from './comparar';

export interface Historial {
  empresaId: string;
  fotografias: Fotografia[];
}

const almacen = crearAlmacenPorEmpresa<Historial>({
  clave: (id) => `sustentaesg.hist.${id}.v1`,
  evento: 'sustentaesg:historial',
  vacio: (id) => ({ empresaId: id, fotografias: [] }),
  parsear: (bruto) => {
    try {
      const h = JSON.parse(bruto) as Historial;
      return h && Array.isArray(h.fotografias) ? h : null;
    } catch {
      return null;
    }
  },
});

export const leerHistorial = almacen.leer;
export const useHistorial = almacen.useValor;
export const borrarHistorial = almacen.quitar;

const nuevoId = () => `foto-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

/** Guarda una fotografía con las respuestas de hoy. Devuelve null si no se pudo guardar. */
export function guardarFotografia(empresaId: string, respuestas: Respuestas, etiqueta?: string): Fotografia | null {
  const ahora = Date.now();
  const foto = crearFotografia(empresaId, etiqueta?.trim() || etiquetaPorDefecto(ahora), respuestas, nuevoId(), ahora);
  const actual = leerHistorial(empresaId);
  const ok = almacen.escribir(empresaId, { empresaId, fotografias: [...actual.fotografias, foto] });
  return ok ? foto : null;
}

export function quitarFotografia(empresaId: string, id: string): Fotografia | null {
  const actual = leerHistorial(empresaId);
  const quitada = actual.fotografias.find((f) => f.id === id) ?? null;
  if (quitada) almacen.escribir(empresaId, { empresaId, fotografias: actual.fotografias.filter((f) => f.id !== id) });
  return quitada;
}

export function restaurarFotografia(empresaId: string, foto: Fotografia) {
  const actual = leerHistorial(empresaId);
  if (actual.fotografias.some((f) => f.id === foto.id)) return;
  almacen.escribir(empresaId, {
    empresaId,
    fotografias: [...actual.fotografias, foto].sort((a, b) => a.creada - b.creada),
  });
}
