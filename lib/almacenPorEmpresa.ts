'use client';

// Guardado LOCAL (solo navegador) de un dato que pertenece a UNA empresa: diagnóstico, plan o historial.
// Cada empresa tiene su propia clave, así que nunca se mezclan. Con la forma de las futuras tablas
// (una fila por empresa); en la fase de servicios se reemplaza por Supabase con RLS por empresa.
// `usar(id)` se mantiene al día solo (esta pestaña, otras pestañas, otras pantallas ya abiertas).

import { useSyncExternalStore } from 'react';

interface Opciones<T> {
  clave: (empresaId: string) => string;
  evento: string;
  vacio: (empresaId: string) => T;
  parsear: (bruto: string) => T | null;
}

export function crearAlmacenPorEmpresa<T>({ clave, evento, vacio, parsear }: Opciones<T>) {
  const cache = new Map<string, { crudo: string | null; valor: T }>();
  const vacios = new Map<string, T>();
  let huboFallo = false;

  const vacioDe = (id: string): T => {
    let v = vacios.get(id);
    if (v === undefined) {
      v = vacio(id);
      vacios.set(id, v);
    }
    return v;
  };

  function leer(empresaId: string): T {
    try {
      const bruto = window.localStorage.getItem(clave(empresaId));
      return (bruto ? parsear(bruto) : null) ?? vacioDe(empresaId);
    } catch {
      return vacioDe(empresaId);
    }
  }

  function escribir(empresaId: string, valor: T): boolean {
    try {
      window.localStorage.setItem(clave(empresaId), JSON.stringify(valor));
      window.dispatchEvent(new Event(evento));
      huboFallo = false;
      return true;
    } catch {
      huboFallo = true;
      return false;
    }
  }

  function quitar(empresaId: string) {
    try {
      window.localStorage.removeItem(clave(empresaId));
      window.dispatchEvent(new Event(evento));
    } catch {
      // nada que quitar
    }
  }

  function suscribir(cb: () => void) {
    window.addEventListener(evento, cb);
    window.addEventListener('storage', cb);
    return () => {
      window.removeEventListener(evento, cb);
      window.removeEventListener('storage', cb);
    };
  }

  function instantanea(empresaId: string): T {
    let crudo: string | null = null;
    try {
      crudo = window.localStorage.getItem(clave(empresaId));
    } catch {
      crudo = null;
    }
    const previo = cache.get(empresaId);
    if (previo && previo.crudo === crudo) return previo.valor;
    const valor = (crudo ? parsear(crudo) : null) ?? vacioDe(empresaId);
    cache.set(empresaId, { crudo, valor });
    return valor;
  }

  function useValor(empresaId: string): T {
    return useSyncExternalStore(
      suscribir,
      () => instantanea(empresaId),
      () => vacioDe(empresaId)
    );
  }

  return { leer, escribir, quitar, useValor, ultimoFallo: () => huboFallo };
}
