// Precios y contenido de los planes. Son HIPÓTESIS del dueño (por validar); la página de ventas
// (components/landing/OfertaPorPerfil.tsx) repite estas cifras: si cambian, cambian en los dos sitios.

import type { Ciclo, Perfil } from '@/lib/demo/store';

export interface PlanCiclo {
  etiqueta: string;
  precioMes: string;
  detalle: string;
  insignia?: string;
}

export interface PlanPerfil {
  nombre: string;
  alcance: string;
  incluye: string[];
  ciclos: Record<Ciclo, PlanCiclo>;
}

export const PLANES: Record<Perfil, PlanPerfil> = {
  empresa: {
    nombre: 'Mi empresa',
    alcance: '1 empresa',
    incluye: [
      'Diagnóstico completo de las cuatro dimensiones',
      'Plan de mejora con responsable y fecha',
      'Historial y comparación entre periodos',
    ],
    ciclos: {
      anual: { etiqueta: 'Anual', precioMes: 'US$5', detalle: 'Se cobra US$60 una vez al año', insignia: 'Ahorras 5 meses' },
      mensual: { etiqueta: 'Mensual', precioMes: 'US$9', detalle: 'Cancelas cuando quieras' },
    },
  },
  consultor: {
    nombre: 'Soy consultor/a',
    alcance: 'hasta 10 empresas',
    incluye: [
      'Un espacio separado por cada empresa',
      'Historial por empresa, sin mezclar datos',
      'Todo lo del plan para una empresa',
    ],
    ciclos: {
      anual: { etiqueta: 'Anual', precioMes: 'US$5,83', detalle: 'Se cobra US$70 una vez al año', insignia: 'Ahorras 7 meses' },
      mensual: { etiqueta: 'Mensual', precioMes: 'US$15', detalle: 'Cancelas cuando quieras' },
    },
  },
};
