import { describe, expect, it } from 'vitest';
import { activaTrasQuitar, limiteDe, puedeAgregar, validarAlta, type Empresa, type EstadoEmpresas } from './reglas';

const emp = (id: string, nombre: string): Empresa => ({ id, nombre, actividad: 'x', tamano: '11-50', creada: 1 });
const estado = (nombres: string[], activa: string | null = null): EstadoEmpresas => ({
  empresas: nombres.map((n, i) => emp(`e${i}`, n)),
  activa,
});

describe('límites por plan', () => {
  it('Empresa permite 1 y Consultor permite 10', () => {
    expect(limiteDe('empresa')).toBe(1);
    expect(limiteDe('consultor')).toBe(10);
  });

  it('con 1 empresa el plan Empresa ya no puede agregar, el Consultor sí', () => {
    expect(puedeAgregar(estado(['A']), 'empresa')).toBe(false);
    expect(puedeAgregar(estado(['A']), 'consultor')).toBe(true);
  });

  it('el Consultor se detiene en 10', () => {
    const diez = estado(Array.from({ length: 10 }, (_, i) => `Empresa ${i}`));
    expect(puedeAgregar(diez, 'consultor')).toBe(false);
    expect(validarAlta(diez, 'consultor', 'Una más')).toBe('limite');
  });
});

describe('alta de empresa', () => {
  it('rechaza nombres de menos de 2 letras', () => {
    expect(validarAlta(estado([]), 'consultor', ' a ')).toBe('nombre_corto');
  });

  it('rechaza un nombre repetido aunque cambien mayúsculas o espacios', () => {
    expect(validarAlta(estado(['Textiles del Valle']), 'consultor', '  textiles   DEL valle ')).toBe('nombre_repetido');
  });

  it('acepta un alta válida', () => {
    expect(validarAlta(estado(['A']), 'consultor', 'Café La Palma')).toBeNull();
  });
});

describe('empresa activa al quitar', () => {
  it('conserva la activa si se quita otra', () => {
    expect(activaTrasQuitar(estado(['A', 'B', 'C'], 'e1'), 'e0')).toBe('e1');
  });

  it('pasa a la primera que quede si se quita la activa', () => {
    expect(activaTrasQuitar(estado(['A', 'B', 'C'], 'e0'), 'e0')).toBe('e1');
  });

  it('queda sin activa si se quita la única', () => {
    expect(activaTrasQuitar(estado(['A'], 'e0'), 'e0')).toBeNull();
  });
});
