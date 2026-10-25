// Acceso por código de un solo uso (sin contraseñas), método primario de 26-AUTH-MODERNO.
// ESTA ES LA VERSIÓN DE DEMOSTRACIÓN: no envía correos ni protege cuentas reales. Solo funciona
// con NEXT_PUBLIC_MODO_DEMO=si; sin esa variable falla CERRADO (no hay acceso). La versión real
// (Supabase Auth + Resend, con límite de intentos en el servidor) reemplaza este archivo en la
// fase de servicios, respetando la misma interfaz. NO publicar con el modo demostración activo.

import {
  abrirSesion,
  cerrarSesionLocal,
  guardarCuenta,
  haySesion,
  leerCuenta,
  type Cuenta,
} from '@/lib/demo/store';

export const MODO_DEMO = process.env.NEXT_PUBLIC_MODO_DEMO === 'si';

export type ErrorSolicitud = 'correo_invalido' | 'limite' | 'no_disponible';
export type ErrorVerificacion = 'codigo' | 'limite';

export type ResultadoSolicitud = { ok: true; codigoDemo: string } | { ok: false; error: ErrorSolicitud };
export type ResultadoVerificacion = { ok: true; cuenta: Cuenta } | { ok: false; error: ErrorVerificacion };

const VENTANA_MS = 5 * 60 * 1000;
const MAX_SOLICITUDES = 3;
const MAX_INTENTOS = 5;
const VIGENCIA_MS = 10 * 60 * 1000;
const CLAVE_PENDIENTE = 'sustentaesg.codigo.v1';
const CLAVE_SOLICITUDES = 'sustentaesg.solicitudes.v1';

interface Pendiente {
  email: string;
  nombre: string;
  codigo: string;
  expira: number;
  intentos: number;
}

const esCorreo = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());

function codigoAleatorio(): string {
  const n = new Uint32Array(1);
  window.crypto.getRandomValues(n);
  return String(n[0] % 1_000_000).padStart(6, '0');
}

function solicitudesRecientes(ahora: number): number[] {
  try {
    const todas = JSON.parse(window.sessionStorage.getItem(CLAVE_SOLICITUDES) ?? '[]') as number[];
    return todas.filter((t) => ahora - t < VENTANA_MS);
  } catch {
    return [];
  }
}

export async function solicitarCodigo(email: string, nombre = ''): Promise<ResultadoSolicitud> {
  if (!MODO_DEMO) return { ok: false, error: 'no_disponible' };
  if (!esCorreo(email)) return { ok: false, error: 'correo_invalido' };
  const ahora = Date.now();
  const recientes = solicitudesRecientes(ahora);
  if (recientes.length >= MAX_SOLICITUDES) return { ok: false, error: 'limite' };
  const codigo = codigoAleatorio();
  const pendiente: Pendiente = {
    email: email.trim().toLowerCase(),
    nombre: nombre.trim(),
    codigo,
    expira: ahora + VIGENCIA_MS,
    intentos: 0,
  };
  window.sessionStorage.setItem(CLAVE_PENDIENTE, JSON.stringify(pendiente));
  window.sessionStorage.setItem(CLAVE_SOLICITUDES, JSON.stringify([...recientes, ahora]));
  await new Promise((r) => setTimeout(r, 700)); // la red real tarda; aquí se simula para mostrar el estado de carga
  return { ok: true, codigoDemo: codigo };
}

/**
 * modo 'registro': crea la cuenta. modo 'entrada': solo entra si la cuenta ya existe en este navegador.
 * El error es el mismo («codigo») exista o no la cuenta: no se revela quién tiene cuenta (anti-enumeración).
 */
export async function verificarCodigo(codigo: string, modo: 'registro' | 'entrada'): Promise<ResultadoVerificacion> {
  if (!MODO_DEMO) return { ok: false, error: 'codigo' };
  let pendiente: Pendiente | null = null;
  try {
    pendiente = JSON.parse(window.sessionStorage.getItem(CLAVE_PENDIENTE) ?? 'null') as Pendiente | null;
  } catch {
    pendiente = null;
  }
  await new Promise((r) => setTimeout(r, 500));
  if (!pendiente || Date.now() > pendiente.expira) return { ok: false, error: 'codigo' };
  if (pendiente.intentos >= MAX_INTENTOS) return { ok: false, error: 'limite' };

  if (pendiente.codigo !== codigo.trim()) {
    pendiente.intentos += 1;
    window.sessionStorage.setItem(CLAVE_PENDIENTE, JSON.stringify(pendiente));
    return { ok: false, error: pendiente.intentos >= MAX_INTENTOS ? 'limite' : 'codigo' };
  }

  const existente = leerCuenta();
  let cuenta: Cuenta;
  if (modo === 'entrada') {
    if (!existente || existente.email !== pendiente.email) return { ok: false, error: 'codigo' };
    cuenta = existente;
  } else {
    const ahora = Date.now();
    cuenta =
      existente && existente.email === pendiente.email
        ? existente
        : { email: pendiente.email, nombre: pendiente.nombre, creada: ahora, pruebaInicio: ahora };
    guardarCuenta(cuenta);
  }
  window.sessionStorage.removeItem(CLAVE_PENDIENTE);
  abrirSesion();
  return { ok: true, cuenta };
}

export function sesionActual(): Cuenta | null {
  return haySesion() ? leerCuenta() : null;
}

export function cerrarSesion() {
  cerrarSesionLocal();
}
