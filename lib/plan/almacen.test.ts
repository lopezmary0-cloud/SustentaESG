import { describe, expect, it } from 'vitest';
import { vencimientoDe } from './almacen';

const hoy = new Date(2026, 9, 23); // 23 de octubre de 2026

describe('vencimiento de una acción', () => {
  it('sin fecha', () => {
    expect(vencimientoDe({ fecha: '', estado: 'pendiente' }, hoy)).toEqual({ tipo: 'sin_fecha', dias: null });
  });

  it('una acción hecha sin fecha queda cerrada y no tiene días', () => {
    expect(vencimientoDe({ fecha: '', estado: 'hecha' }, hoy)).toEqual({ tipo: 'cerrada', dias: null });
  });

  it('una acción hecha no se marca vencida aunque la fecha haya pasado', () => {
    expect(vencimientoDe({ fecha: '2026-01-01', estado: 'hecha' }, hoy).tipo).toBe('cerrada');
  });

  it('vencida si la fecha ya pasó', () => {
    expect(vencimientoDe({ fecha: '2026-10-22', estado: 'pendiente' }, hoy)).toEqual({ tipo: 'vencida', dias: -1 });
  });

  it('hoy cuenta como pronto (0 días)', () => {
    expect(vencimientoDe({ fecha: '2026-10-23', estado: 'en_curso' }, hoy)).toEqual({ tipo: 'pronto', dias: 0 });
  });

  it('pronto hasta 7 días, a tiempo desde el 8.º', () => {
    expect(vencimientoDe({ fecha: '2026-10-30', estado: 'pendiente' }, hoy).tipo).toBe('pronto');
    expect(vencimientoDe({ fecha: '2026-10-31', estado: 'pendiente' }, hoy).tipo).toBe('a_tiempo');
  });
});
