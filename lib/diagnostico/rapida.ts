// Lectura rápida del recorrido de inicio: 1 pregunta por dimensión (4 en total) para dar un primer resultado
// ANTES de la pantalla de planes. NO es el diagnóstico: no usa el motor ni da un puntaje de 0 a 100 (con una
// sola pregunta por dimensión la cobertura es insuficiente según la metodología). Muestra la palabra del
// nivel de la escala, un punto fuerte y hasta dos áreas de atención. Sus respuestas no cuentan en las 40.

import { ESCALA, NOMBRE_DIMENSION, type Dimension } from './banco';

export type DimRapida = Extract<Dimension, 'ambiental' | 'social' | 'gobernanza' | 'economica'>;
export type ValorRapido = 0 | 1 | 3 | 4;
export type RespuestaRapida = ValorRapido | 'no_se';
export type RapidaGuardada = Partial<Record<DimRapida, RespuestaRapida>>;

export const DIMENSIONES_RAPIDAS: DimRapida[] = ['ambiental', 'social', 'gobernanza', 'economica'];

export const PREGUNTAS_RAPIDAS: { dimension: DimRapida; texto: string; ejemplo: string }[] = [
  {
    dimension: 'ambiental',
    texto: '¿Llevan registro de lo que consumen y desechan: energía, agua y residuos?',
    ejemplo: 'Por ejemplo: guardar las facturas de energía o separar los residuos. Una estimación basta.',
  },
  {
    dimension: 'social',
    texto: '¿Tienen prácticas definidas de bienestar, capacitación y seguridad para sus trabajadores?',
    ejemplo: 'Por ejemplo: inducciones, capacitaciones o revisión de las condiciones de seguridad.',
  },
  {
    dimension: 'gobernanza',
    texto: '¿Hay responsables, reglas de conducta y evidencias de lo que la empresa hace en sostenibilidad?',
    ejemplo: 'Por ejemplo: un código de conducta o una carpeta donde se guardan los soportes.',
  },
  {
    dimension: 'economica',
    texto: '¿Revisan sus procesos y proveedores para reducir desperdicios y costos?',
    ejemplo: 'Por ejemplo: comparar proveedores o medir cuánto material se desperdicia.',
  },
];

/** 4 opciones (no 5) para no cargar la pantalla; equivalen a los niveles 0, 1, 3 y 4 de la escala de madurez. */
export const OPCIONES_RAPIDAS: { valor: ValorRapido; titulo: string; detalle: string }[] = [
  { valor: 0, titulo: 'No lo hacemos', detalle: 'Todavía no existe.' },
  { valor: 1, titulo: 'Algo informal', detalle: 'Hay acciones sueltas, sin un método.' },
  { valor: 3, titulo: 'De forma ordenada', detalle: 'Se hace siempre y alguien responde.' },
  { valor: 4, titulo: 'Lo medimos y mejoramos', detalle: 'Hay datos y se usan para mejorar.' },
];

export function nivelPalabra(valor: ValorRapido): string {
  return ESCALA[valor].titulo;
}

export interface FilaLectura {
  dimension: DimRapida;
  nombre: string;
  valor: ValorRapido | null;
  /** Palabra del nivel en la escala (null si respondió «No lo sé» o no respondió). */
  nivel: string | null;
}

export interface LecturaRapida {
  filas: FilaLectura[];
  /** Dimensión mejor valorada, solo si llega a «De forma ordenada» o más. */
  fortaleza: DimRapida | null;
  /** Hasta 2 dimensiones con respuesta 0 o 1, de menor a mayor (empate: orden de las dimensiones). */
  atencion: DimRapida[];
  /** Dimensiones sin dato (respondió «No lo sé»). */
  sinDato: DimRapida[];
  respondidas: number;
  completa: boolean;
}

export function lecturaRapida(r: RapidaGuardada | undefined): LecturaRapida {
  const datos = r ?? {};
  const filas: FilaLectura[] = DIMENSIONES_RAPIDAS.map((d) => {
    const v = datos[d];
    const valor = v === undefined || v === 'no_se' ? null : v;
    return { dimension: d, nombre: NOMBRE_DIMENSION[d], valor, nivel: valor === null ? null : nivelPalabra(valor) };
  });
  const conValor = filas.filter((f) => f.valor !== null) as (FilaLectura & { valor: ValorRapido })[];

  const mejor = conValor.reduce<(typeof conValor)[number] | null>((acc, f) => (acc === null || f.valor > acc.valor ? f : acc), null);
  const atencion = conValor
    .filter((f) => f.valor <= 1)
    .sort((a, b) => a.valor - b.valor)
    .slice(0, 2)
    .map((f) => f.dimension);

  return {
    filas,
    fortaleza: mejor && mejor.valor >= 3 ? mejor.dimension : null,
    atencion,
    sinDato: filas.filter((f) => datos[f.dimension] === 'no_se').map((f) => f.dimension),
    respondidas: DIMENSIONES_RAPIDAS.filter((d) => datos[d] !== undefined).length,
    completa: DIMENSIONES_RAPIDAS.every((d) => datos[d] !== undefined),
  };
}
