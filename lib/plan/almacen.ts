// Plan de mejora: acciones con responsable, fecha y estado, una lista por empresa. Guardado LOCAL (solo
// navegador) con la forma de la futura tabla; en la fase de servicios pasa a Supabase con RLS por empresa.
// Las fechas se guardan como texto AAAA-MM-DD (sin zona horaria).

import { crearAlmacenPorEmpresa } from '@/lib/almacenPorEmpresa';

export type EstadoAccion = 'pendiente' | 'en_curso' | 'hecha';

export interface Accion {
  id: string;
  titulo: string;
  responsable: string;
  /** AAAA-MM-DD o vacío si todavía no tiene fecha. */
  fecha: string;
  estado: EstadoAccion;
  nota: string;
  /** Recomendación de origen (REC-AMB02…) o null si es una acción propia. */
  origen: string | null;
  indicador: string;
  evidencia: string;
  creada: number;
}

export interface Plan {
  empresaId: string;
  acciones: Accion[];
}

const almacen = crearAlmacenPorEmpresa<Plan>({
  clave: (id) => `sustentaesg.plan.${id}.v1`,
  evento: 'sustentaesg:plan',
  vacio: (id) => ({ empresaId: id, acciones: [] }),
  parsear: (bruto) => {
    try {
      const p = JSON.parse(bruto) as Plan;
      return p && Array.isArray(p.acciones) ? p : null;
    } catch {
      return null;
    }
  },
});

export const leerPlanDeMejora = almacen.leer;
export const usePlanDeMejora = almacen.useValor;
export const borrarPlanDeMejora = almacen.quitar;
/** true si el último intento de guardar falló (modo privado, almacenamiento lleno o bloqueado). */
export const ultimoGuardadoFallo = almacen.ultimoFallo;

const nuevoId = () => `acc-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;

function guardar(empresaId: string, acciones: Accion[]) {
  almacen.escribir(empresaId, { empresaId, acciones });
}

export function agregarAccion(empresaId: string, parcial: Partial<Accion> & Pick<Accion, 'titulo'>): Accion {
  const accion: Accion = {
    id: nuevoId(),
    responsable: '',
    fecha: '',
    estado: 'pendiente',
    nota: '',
    origen: null,
    indicador: '',
    evidencia: '',
    creada: Date.now(),
    ...parcial,
  };
  guardar(empresaId, [...leerPlanDeMejora(empresaId).acciones, accion]);
  return accion;
}

export function actualizarAccion(empresaId: string, id: string, cambios: Partial<Omit<Accion, 'id' | 'creada'>>) {
  guardar(
    empresaId,
    leerPlanDeMejora(empresaId).acciones.map((a) => (a.id === id ? { ...a, ...cambios } : a))
  );
}

export function quitarAccion(empresaId: string, id: string): Accion | null {
  const acciones = leerPlanDeMejora(empresaId).acciones;
  const quitada = acciones.find((a) => a.id === id) ?? null;
  if (quitada) guardar(empresaId, acciones.filter((a) => a.id !== id));
  return quitada;
}

/** Vuelve a poner una acción quitada (deshacer), en su sitio original por fecha de creación. */
export function restaurarAccion(empresaId: string, accion: Accion) {
  const acciones = leerPlanDeMejora(empresaId).acciones;
  if (acciones.some((a) => a.id === accion.id)) return;
  guardar(empresaId, [...acciones, accion].sort((a, b) => a.creada - b.creada));
}

/** Estado de vencimiento para mostrarlo con color Y con texto: neutro, pronto (≤7 días) o vencida. */
export type Vencimiento = 'sin_fecha' | 'a_tiempo' | 'pronto' | 'vencida' | 'cerrada';

export function vencimientoDe(accion: Pick<Accion, 'fecha' | 'estado'>, hoy: Date): { tipo: Vencimiento; dias: number | null } {
  if (accion.estado === 'hecha') return { tipo: 'cerrada', dias: null };
  if (!accion.fecha) return { tipo: 'sin_fecha', dias: null };
  const [a, m, d] = accion.fecha.split('-').map(Number);
  const limite = Date.UTC(a, m - 1, d);
  const base = Date.UTC(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
  const dias = Math.round((limite - base) / 86_400_000);
  return { tipo: dias < 0 ? 'vencida' : dias <= 7 ? 'pronto' : 'a_tiempo', dias };
}
