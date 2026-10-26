import { describe, expect, it } from 'vitest';
import { ahorroAnual, dolares, PLANES, PRECIOS_US } from './planes';

describe('ahorro del plan anual', () => {
  it('se calcula desde los precios: 12 meses mes a mes contra el año', () => {
    expect(ahorroAnual('empresa')).toEqual({ antes: 108, porcentaje: 44 });
    expect(ahorroAnual('consultor')).toEqual({ antes: 180, porcentaje: 61 });
  });

  it('nunca promete más descuento del que hay', () => {
    for (const p of ['empresa', 'consultor'] as const) {
      const { mensual, anual } = PRECIOS_US[p];
      expect(ahorroAnual(p).porcentaje).toBeLessThanOrEqual(Math.floor((1 - anual / (mensual * 12)) * 100) + 1);
      expect(anual).toBeLessThan(mensual * 12);
    }
  });
});

describe('textos de los planes', () => {
  it('muestra el equivalente mensual del anual con coma decimal', () => {
    expect(PLANES.empresa.ciclos.anual.precioMes).toBe('US$5');
    expect(PLANES.consultor.ciclos.anual.precioMes).toBe('US$5,83');
  });

  it('el precio «antes» y el porcentaje coinciden con la cuenta', () => {
    expect(PLANES.empresa.ciclos.anual.antes).toBe('US$108');
    expect(PLANES.empresa.ciclos.anual.insignia).toBe('Ahorras 44 %');
    expect(PLANES.consultor.ciclos.anual.insignia).toBe('Ahorras 61 %');
  });

  it('el mensual no tiene descuento ni precio tachado', () => {
    expect(PLANES.empresa.ciclos.mensual.antes).toBeUndefined();
    expect(PLANES.empresa.ciclos.mensual.insignia).toBeUndefined();
  });

  it('da formato a los dólares', () => {
    expect(dolares(9)).toBe('US$9');
    expect(dolares(5.8333)).toBe('US$5,83');
  });
});
