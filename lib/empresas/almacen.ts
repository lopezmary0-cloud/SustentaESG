'use client';

// Las empresas de la cuenta y cuál está activa. Guardado LOCAL (solo navegador); en la fase de servicios
// pasa a la tabla de empresas con membresía y RLS. Si la persona terminó el recorrido de inicio pero todavía
// no hay lista guardada, la primera empresa («principal») se deriva de sus respuestas: así lo ya guardado
// (diagnóstico, plan) sigue siendo suyo sin migrar nada.

import { useSyncExternalStore } from 'react';
import { borrarEvaluacion } from '@/lib/diagnostico/almacen';
import { leerInicio, leerPlan, perfilSugerido, type Perfil } from '@/lib/demo/store';
import { borrarHistorial } from '@/lib/historial/almacen';
import { borrarPlanDeMejora } from '@/lib/plan/almacen';
import { activaTrasQuitar, validarAlta, type Empresa, type ErrorEmpresa, type EstadoEmpresas } from './reglas';

const CLAVE = 'sustentaesg.empresas.v1';
const CLAVE_INICIO = 'sustentaesg.inicio.v1';
const EVENTO = 'sustentaesg:empresas';
const VACIO: EstadoEmpresas = { empresas: [], activa: null };

function derivar(): EstadoEmpresas {
  const i = leerInicio();
  if (!i.empresa) return VACIO;
  return {
    empresas: [{ id: 'principal', nombre: i.empresa, actividad: i.actividad ?? '', tamano: i.tamano ?? '', creada: 0 }],
    activa: 'principal',
  };
}

function parsear(bruto: string): EstadoEmpresas | null {
  try {
    const e = JSON.parse(bruto) as EstadoEmpresas;
    return e && Array.isArray(e.empresas) ? e : null;
  } catch {
    return null;
  }
}

export function leerEmpresas(): EstadoEmpresas {
  try {
    const bruto = window.localStorage.getItem(CLAVE);
    return (bruto ? parsear(bruto) : null) ?? derivar();
  } catch {
    return derivar();
  }
}

function escribir(estado: EstadoEmpresas): boolean {
  try {
    window.localStorage.setItem(CLAVE, JSON.stringify(estado));
    window.dispatchEvent(new Event(EVENTO));
    return true;
  } catch {
    return false;
  }
}

/** Plan elegido por la persona (o el sugerido por sus respuestas): decide cuántas empresas puede tener. */
export function perfilActual(): Perfil {
  return leerPlan()?.perfil ?? perfilSugerido(leerInicio());
}

let cacheClave: string | undefined;
let cacheValor: EstadoEmpresas = VACIO;

function suscribir(cb: () => void) {
  window.addEventListener(EVENTO, cb);
  window.addEventListener('storage', cb);
  return () => {
    window.removeEventListener(EVENTO, cb);
    window.removeEventListener('storage', cb);
  };
}

function instantanea(): EstadoEmpresas {
  let propio: string | null = null;
  let inicio: string | null = null;
  try {
    propio = window.localStorage.getItem(CLAVE);
    inicio = window.localStorage.getItem(CLAVE_INICIO);
  } catch {
    propio = null;
    inicio = null;
  }
  const clave = `${propio}|${propio ? '' : inicio}`;
  if (clave !== cacheClave) {
    cacheClave = clave;
    cacheValor = (propio ? parsear(propio) : null) ?? derivar();
  }
  return cacheValor;
}

export function useEmpresas(): EstadoEmpresas {
  return useSyncExternalStore(suscribir, instantanea, () => VACIO);
}

/** La empresa con la que se está trabajando (null si todavía no hay ninguna). */
export function useEmpresaActiva(): { activa: Empresa | null; estado: EstadoEmpresas } {
  const estado = useEmpresas();
  const activa = estado.empresas.find((e) => e.id === estado.activa) ?? estado.empresas[0] ?? null;
  return { activa, estado };
}

const nuevoId = () => `emp-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`;

export function agregarEmpresa(
  datos: { nombre: string; actividad: string; tamano: string },
  perfil: Perfil = perfilActual()
): { ok: true; id: string } | { ok: false; error: ErrorEmpresa | 'guardado' } {
  const estado = leerEmpresas();
  const error = validarAlta(estado, perfil, datos.nombre);
  if (error) return { ok: false, error };
  const empresa: Empresa = {
    id: nuevoId(),
    nombre: datos.nombre.trim().replace(/\s+/g, ' '),
    actividad: datos.actividad.trim(),
    tamano: datos.tamano,
    creada: Date.now(),
  };
  const ok = escribir({ empresas: [...estado.empresas, empresa], activa: empresa.id });
  return ok ? { ok: true, id: empresa.id } : { ok: false, error: 'guardado' };
}

export function seleccionarEmpresa(id: string): boolean {
  const estado = leerEmpresas();
  if (!estado.empresas.some((e) => e.id === id)) return false;
  return escribir({ ...estado, activa: id });
}

/** Quita la empresa y TODO lo suyo (diagnóstico, plan, historial). No se puede deshacer: la pantalla pide confirmar. */
export function quitarEmpresa(id: string): boolean {
  const estado = leerEmpresas();
  const activa = activaTrasQuitar(estado, id);
  const ok = escribir({ empresas: estado.empresas.filter((e) => e.id !== id), activa });
  if (ok) {
    borrarEvaluacion(id);
    borrarPlanDeMejora(id);
    borrarHistorial(id);
  }
  return ok;
}
