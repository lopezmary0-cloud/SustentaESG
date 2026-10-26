// Almacén LOCAL de demostración (solo navegador). Guarda lo que la persona responde en el recorrido
// de inicio y su preferencia de plan. NO es la base de datos real: en la fase de servicios se
// reemplaza por Supabase con las mismas formas de datos (docs: ESTADO.md → Decisiones técnicas).
// Nada de esto guarda contraseñas ni datos de pago.

import { lecturaRapida, type RapidaGuardada } from '@/lib/diagnostico/rapida';

export type Rol = 'propia' | 'varias' | 'otra';
export type Motivo = 'cliente' | 'direccion' | 'ordenar' | 'cero' | 'otra';
export type Tamano = '1-10' | '11-50' | '51-200' | '200+';
export type Perfil = 'empresa' | 'consultor';
export type Ciclo = 'anual' | 'mensual';

export interface RespuestasInicio {
  rol?: Rol;
  rolTexto?: string;
  motivo?: Motivo;
  motivoTexto?: string;
  empresa?: string;
  actividad?: string;
  tamano?: Tamano;
  /** Lectura rápida: 1 respuesta por dimensión (o «no_se»). No cuenta en las 40 preguntas del diagnóstico. */
  rapida?: RapidaGuardada;
  pais: 'Colombia';
}

export interface PreferenciaPlan {
  perfil: Perfil;
  ciclo: Ciclo;
}

export interface Cuenta {
  email: string;
  nombre: string;
  creada: number;
  pruebaInicio: number;
}

const CLAVES = {
  inicio: 'sustentaesg.inicio.v1',
  plan: 'sustentaesg.plan.v1',
  cuenta: 'sustentaesg.cuenta.v1',
  sesion: 'sustentaesg.sesion.v1',
} as const;

function leer<T>(clave: string): T | null {
  try {
    const bruto = window.localStorage.getItem(clave);
    return bruto ? (JSON.parse(bruto) as T) : null;
  } catch {
    return null;
  }
}

function escribir(clave: string, valor: unknown) {
  try {
    window.localStorage.setItem(clave, JSON.stringify(valor));
  } catch {
    // Navegación privada o almacenamiento bloqueado: la pantalla sigue funcionando sin guardar.
  }
}

export const MOTIVOS: Record<Motivo, string> = {
  cliente: 'Información de un cliente o banco',
  direccion: 'Un informe para mi dirección',
  ordenar: 'Ordenar lo que ya hacemos',
  cero: 'Empezar desde cero',
  otra: 'Otra cosa',
};

export function leerInicio(): RespuestasInicio {
  return { pais: 'Colombia', ...(leer<RespuestasInicio>(CLAVES.inicio) ?? {}) };
}

export function guardarInicio(parcial: Partial<RespuestasInicio>): RespuestasInicio {
  const nuevo = { ...leerInicio(), ...parcial, pais: 'Colombia' as const };
  escribir(CLAVES.inicio, nuevo);
  return nuevo;
}

export function inicioCompleto(r: RespuestasInicio): boolean {
  return Boolean(r.rol && r.motivo && r.empresa && r.actividad && r.tamano && lecturaRapida(r.rapida).completa);
}

export function leerPlan(): PreferenciaPlan | null {
  return leer<PreferenciaPlan>(CLAVES.plan);
}

export function guardarPlan(plan: PreferenciaPlan) {
  escribir(CLAVES.plan, plan);
}

export function leerCuenta(): Cuenta | null {
  return leer<Cuenta>(CLAVES.cuenta);
}

export function guardarCuenta(cuenta: Cuenta) {
  escribir(CLAVES.cuenta, cuenta);
}

export function haySesion(): boolean {
  return leer<{ activa: boolean }>(CLAVES.sesion)?.activa === true && leerCuenta() !== null;
}

export function abrirSesion() {
  escribir(CLAVES.sesion, { activa: true });
}

export function cerrarSesionLocal() {
  try {
    window.localStorage.removeItem(CLAVES.sesion);
  } catch {
    // sin almacenamiento: nada que cerrar
  }
}

/** Perfil de plan sugerido según quién lleva la sostenibilidad. */
export function perfilSugerido(r: RespuestasInicio): Perfil {
  return r.rol === 'varias' ? 'consultor' : 'empresa';
}
