// Precios y contenido de los planes. Los precios son HIPÓTESIS del dueño (por validar); la página de ventas
// (components/landing/OfertaPorPerfil.tsx) repite estas cifras: si cambian, cambian en los dos sitios.
// Todo lo que se muestra (equivalente mensual, «antes», porcentaje de ahorro) se CALCULA desde estos números:
// nunca se escribe a mano un descuento que no salga de la cuenta.

import type { Ciclo, Perfil } from '@/lib/demo/store';

export const PRECIOS_US: Record<Perfil, { mensual: number; anual: number }> = {
  empresa: { mensual: 9, anual: 60 },
  consultor: { mensual: 15, anual: 70 },
};

const formatoUS = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 2, minimumFractionDigits: 0 });
export const dolares = (n: number) => `US$${formatoUS.format(Math.round(n * 100) / 100)}`;

/** Lo que costarían 12 meses pagando mes a mes, y cuánto se ahorra (en %, redondeado) pagando el año. */
export function ahorroAnual(perfil: Perfil): { antes: number; porcentaje: number } {
  const { mensual, anual } = PRECIOS_US[perfil];
  const antes = mensual * 12;
  return { antes, porcentaje: Math.round((1 - anual / antes) * 100) };
}

export interface PlanCiclo {
  etiqueta: string;
  precioMes: string;
  detalle: string;
  /** Solo el anual: precio de 12 meses mes a mes, para mostrarlo tachado. */
  antes?: string;
  insignia?: string;
}

export interface PlanPerfil {
  nombre: string;
  alcance: string;
  incluye: string[];
  ciclos: Record<Ciclo, PlanCiclo>;
}

function ciclos(perfil: Perfil): Record<Ciclo, PlanCiclo> {
  const { mensual, anual } = PRECIOS_US[perfil];
  const ahorro = ahorroAnual(perfil);
  return {
    anual: {
      etiqueta: 'Anual',
      precioMes: dolares(anual / 12),
      detalle: `Se cobra ${dolares(anual)} una vez al año`,
      antes: dolares(ahorro.antes),
      insignia: `Ahorras ${ahorro.porcentaje} %`,
    },
    mensual: { etiqueta: 'Mensual', precioMes: dolares(mensual), detalle: 'Cancelas cuando quieras' },
  };
}

export const PLANES: Record<Perfil, PlanPerfil> = {
  empresa: {
    nombre: 'Mi empresa',
    alcance: '1 empresa',
    incluye: [
      'Responde a clientes y bancos con tu información ya ordenada',
      'Sabe qué hacer primero: acciones ordenadas por prioridad',
      'Mira cómo avanza tu empresa de un periodo a otro',
    ],
    ciclos: ciclos('empresa'),
  },
  consultor: {
    nombre: 'Soy consultor/a',
    alcance: 'hasta 10 empresas',
    incluye: [
      'Un espacio separado por cada cliente, hasta 10',
      'Diagnóstico, plan e historial propios para cada uno',
      'Cambia de cliente en un toque, sin mezclar datos',
    ],
    ciclos: ciclos('consultor'),
  },
};
