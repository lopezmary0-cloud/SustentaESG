import { describe, expect, it } from 'vitest';
import { BANCO } from '@/lib/diagnostico/banco';
import type { Respuestas, Valor } from '@/lib/diagnostico/motor';
import { comparar, crearFotografia, textoCambio } from './comparar';

const todas = (dimension: string, v: Valor): Respuestas =>
  Object.fromEntries(BANCO.filter((p) => p.dimension === dimension).map((p) => [p.id, { tipo: 'valor' as const, valor: v }]));
const completa = (v: Valor): Respuestas => ({ ...todas('ambiental', v), ...todas('social', v), ...todas('gobernanza', v), ...todas('economica', v), ...todas('cadena', v) });
const foto = (r: Respuestas, t: number) => crearFotografia('e1', 'Prueba', r, `f${t}`, t);

describe('fotografía', () => {
  it('guarda una copia de las respuestas, no la referencia', () => {
    const r = completa(2);
    const f = foto(r, 1);
    r.AMB01 = { tipo: 'valor', valor: 0 };
    expect(f.respuestas.AMB01).toEqual({ tipo: 'valor', valor: 2 });
  });

  it('guarda el resultado con la versión de metodología', () => {
    const f = foto(completa(4), 1);
    expect(f.general.puntaje).toBe(100);
    expect(f.metodologia).toBe('0.1-borrador');
    expect(f.respondidas).toBe(40);
  });
});

describe('comparación', () => {
  it('detecta mejoras con puntos y con palabras', () => {
    const c = comparar(foto(completa(1), 1), foto(completa(3), 2));
    expect(c.general.delta).toBe(50);
    expect(c.general.tendencia).toBe('sube');
    expect(textoCambio(c.general)).toBe('Sube 50 puntos');
  });

  it('detecta retrocesos y deja la cadena de valor aparte', () => {
    const c = comparar(foto(completa(3), 1), foto({ ...completa(3), ...todas('cadena', 0) }, 2));
    expect(c.general.tendencia).toBe('igual');
    expect(c.dimensiones.find((d) => d.dimension === 'cadena')?.tendencia).toBe('baja');
    expect(textoCambio(c.dimensiones.find((d) => d.dimension === 'cadena')!)).toBe('Baja 75 puntos');
  });

  it('sin cifra en una de las dos no inventa diferencia', () => {
    const c = comparar(foto({}, 1), foto(completa(3), 2));
    expect(c.general.delta).toBeNull();
    expect(c.general.tendencia).toBe('sin_dato');
    expect(textoCambio(c.general)).toBe('Sin datos para comparar');
  });

  it('marca como orientativa la comparación con un resultado provisional', () => {
    const parcial: Respuestas = { ...todas('ambiental', 2), ...todas('social', 2) };
    const c = comparar(foto(parcial, 1), foto(completa(3), 2));
    expect(c.general.orientativo).toBe(true);
  });

  it('avisa si cambió la versión de la metodología', () => {
    const a = foto(completa(2), 1);
    const b = { ...foto(completa(2), 2), metodologia: '0.2' };
    expect(comparar(a, b).metodologiaDistinta).toBe(true);
    expect(comparar(a, foto(completa(2), 3)).metodologiaDistinta).toBe(false);
  });

  it('singular y plural en el texto', () => {
    const base = foto(completa(2), 1);
    const c = comparar(base, { ...base, general: { ...base.general, puntaje: (base.general.puntaje as number) + 1 } });
    expect(textoCambio(c.general)).toBe('Sube 1 punto');
  });
});
