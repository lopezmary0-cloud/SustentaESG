import { describe, expect, it } from 'vitest';
import { DIMENSIONES_RAPIDAS, lecturaRapida, OPCIONES_RAPIDAS, PREGUNTAS_RAPIDAS } from './rapida';

describe('lectura rápida: contenido', () => {
  it('tiene una pregunta por dimensión del índice, en orden', () => {
    expect(PREGUNTAS_RAPIDAS.map((p) => p.dimension)).toEqual(DIMENSIONES_RAPIDAS);
  });

  it('ofrece 4 opciones que equivalen a los niveles 0, 1, 3 y 4 de la escala', () => {
    expect(OPCIONES_RAPIDAS.map((o) => o.valor)).toEqual([0, 1, 3, 4]);
  });
});

describe('lectura rápida: resultado', () => {
  it('sin respuestas no inventa nada', () => {
    const l = lecturaRapida(undefined);
    expect(l.completa).toBe(false);
    expect(l.respondidas).toBe(0);
    expect(l.fortaleza).toBeNull();
    expect(l.atencion).toEqual([]);
    expect(l.filas.every((f) => f.valor === null && f.nivel === null)).toBe(true);
  });

  it('da la palabra del nivel de la escala por dimensión', () => {
    const l = lecturaRapida({ ambiental: 1, social: 4, gobernanza: 3, economica: 0 });
    expect(l.filas.map((f) => f.nivel)).toEqual(['Informal', 'Medida y mejorada', 'Implementada', 'No se realiza']);
    expect(l.completa).toBe(true);
  });

  it('el punto fuerte es la dimensión más alta, solo si llega a «ordenada» o más', () => {
    expect(lecturaRapida({ ambiental: 1, social: 4, gobernanza: 3, economica: 0 }).fortaleza).toBe('social');
    expect(lecturaRapida({ ambiental: 1, social: 1, gobernanza: 0, economica: 1 }).fortaleza).toBeNull();
  });

  it('en un empate de fortaleza gana la primera dimensión del orden', () => {
    expect(lecturaRapida({ ambiental: 3, social: 3, gobernanza: 0, economica: 1 }).fortaleza).toBe('ambiental');
  });

  it('las áreas de atención son hasta 2, de la más baja a la más alta', () => {
    const l = lecturaRapida({ ambiental: 1, social: 4, gobernanza: 0, economica: 1 });
    expect(l.atencion).toEqual(['gobernanza', 'ambiental']);
  });

  it('con todo en nivel alto no hay áreas de atención', () => {
    expect(lecturaRapida({ ambiental: 3, social: 4, gobernanza: 3, economica: 4 }).atencion).toEqual([]);
  });

  it('«No lo sé» no cuenta como cero: queda como sin dato y no es área de atención', () => {
    const l = lecturaRapida({ ambiental: 'no_se', social: 4, gobernanza: 'no_se', economica: 1 });
    expect(l.sinDato).toEqual(['ambiental', 'gobernanza']);
    expect(l.atencion).toEqual(['economica']);
    expect(l.filas[0].nivel).toBeNull();
    expect(l.completa).toBe(true);
    expect(l.respondidas).toBe(4);
  });

  it('es determinista', () => {
    const r = { ambiental: 1, social: 3, gobernanza: 0, economica: 4 } as const;
    expect(lecturaRapida(r)).toEqual(lecturaRapida(r));
  });
});
