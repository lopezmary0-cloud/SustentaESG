// Reglas puras de las empresas de una cuenta (sin navegador, fáciles de probar).
// Plan Empresa = 1 empresa; plan Consultor = hasta 10 (docs: ESTADO.md → modelo de cuentas).
// Cada empresa es un espacio separado: su diagnóstico, historial y plan nunca se mezclan con los de otra.

import type { Perfil } from '@/lib/demo/store';

export interface Empresa {
  id: string;
  nombre: string;
  actividad: string;
  tamano: string;
  creada: number;
}

export interface EstadoEmpresas {
  empresas: Empresa[];
  activa: string | null;
}

export const LIMITE_POR_PERFIL: Record<Perfil, number> = { empresa: 1, consultor: 10 };

export function limiteDe(perfil: Perfil): number {
  return LIMITE_POR_PERFIL[perfil];
}

export function puedeAgregar(estado: EstadoEmpresas, perfil: Perfil): boolean {
  return estado.empresas.length < limiteDe(perfil);
}

export type ErrorEmpresa = 'nombre_corto' | 'nombre_repetido' | 'limite';

/** Valida un alta; devuelve null si todo está bien. El nombre no distingue mayúsculas ni espacios de más. */
export function validarAlta(estado: EstadoEmpresas, perfil: Perfil, nombre: string): ErrorEmpresa | null {
  const limpio = nombre.trim().replace(/\s+/g, ' ');
  if (limpio.length < 2) return 'nombre_corto';
  if (estado.empresas.some((e) => e.nombre.trim().toLowerCase() === limpio.toLowerCase())) return 'nombre_repetido';
  if (!puedeAgregar(estado, perfil)) return 'limite';
  return null;
}

/** Empresa activa después de quitar una: la misma si sigue, si no la primera que quede (o ninguna). */
export function activaTrasQuitar(estado: EstadoEmpresas, quitadaId: string): string | null {
  const quedan = estado.empresas.filter((e) => e.id !== quitadaId);
  if (estado.activa && estado.activa !== quitadaId && quedan.some((e) => e.id === estado.activa)) return estado.activa;
  return quedan[0]?.id ?? null;
}
