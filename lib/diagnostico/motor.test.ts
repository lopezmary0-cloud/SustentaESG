import { describe, expect, it } from 'vitest';
import { BANCO } from './banco';
import { calcularDiagnostico, calcularDimension, nivelDe, type Respuestas, type Valor } from './motor';

const de = (dimension: string) => BANCO.filter((p) => p.dimension === dimension);

function todas(dimension: string, valor: Valor): Respuestas {
  return Object.fromEntries(de(dimension).map((p) => [p.id, { tipo: 'valor' as const, valor }]));
}

describe('banco', () => {
  it('tiene 40 preguntas con la distribución 10-10-10-6-4', () => {
    expect(BANCO).toHaveLength(40);
    expect(de('ambiental')).toHaveLength(10);
    expect(de('social')).toHaveLength(10);
    expect(de('gobernanza')).toHaveLength(10);
    expect(de('economica')).toHaveLength(6);
    expect(de('cadena')).toHaveLength(4);
  });

  it('no repite identificadores y marca las 5 preguntas nuevas', () => {
    expect(new Set(BANCO.map((p) => p.id)).size).toBe(40);
    expect(BANCO.filter((p) => p.nueva).map((p) => p.id).sort()).toEqual(['AMB10', 'CAD04', 'GOB10', 'SOC09', 'SOC10']);
  });
});

describe('puntaje por dimensión', () => {
  it('todo en 4 da 100 y todo en 0 da 0', () => {
    expect(calcularDimension('economica', todas('economica', 4)).puntaje).toBe(100);
    expect(calcularDimension('economica', todas('economica', 0)).puntaje).toBe(0);
  });

  it('calcula Σpuntos / (4 × válidas) × 100', () => {
    const r: Respuestas = {
      ECO01: { tipo: 'valor', valor: 4 },
      ECO02: { tipo: 'valor', valor: 2 },
      ECO03: { tipo: 'valor', valor: 2 },
      ECO04: { tipo: 'valor', valor: 0 },
      ECO05: { tipo: 'valor', valor: 4 },
      ECO06: { tipo: 'valor', valor: 4 },
    };
    // 16 puntos de 24 posibles
    expect(calcularDimension('economica', r).puntaje).toBeCloseTo(66.67, 1);
  });

  it('«No aplica» sale del denominador y queda registrado', () => {
    const r: Respuestas = { ...todas('ambiental', 4), AMB07: { tipo: 'na', justificacion: 'Solo oficina' } };
    const d = calcularDimension('ambiental', r);
    expect(d.puntaje).toBe(100);
    expect(d.aplicables).toBe(9);
    expect(d.exclusiones).toEqual([{ pregunta: 'AMB07', justificacion: 'Solo oficina', pendienteRevisar: false }]);
  });

  it('«No aplica» que el perfil no habilita queda pendiente de revisar, no se oculta', () => {
    const r: Respuestas = { ...todas('economica', 3), ECO01: { tipo: 'na', justificacion: 'No lo medimos' } };
    const d = calcularDimension('economica', r);
    expect(d.exclusiones[0].pendienteRevisar).toBe(true);
    expect(d.aplicables).toBe(5);
  });

  it('«No tengo información» no suma, no cuenta como cero y baja la cobertura', () => {
    const r: Respuestas = {
      ECO01: { tipo: 'valor', valor: 4 },
      ECO02: { tipo: 'valor', valor: 4 },
      ECO03: { tipo: 'valor', valor: 4 },
      ECO04: { tipo: 'valor', valor: 4 },
      ECO05: { tipo: 'sin_info' },
      ECO06: { tipo: 'sin_info' },
    };
    const d = calcularDimension('economica', r);
    expect(d.puntaje).toBe(100);
    expect(d.sinInfo).toBe(2);
    expect(d.aplicables).toBe(6);
    expect(d.cobertura).toBeCloseTo(4 / 6, 5);
    expect(d.estado).toBe('provisional');
  });

  it('con cobertura menor a 40% no muestra cifra', () => {
    const r: Respuestas = { AMB01: { tipo: 'valor', valor: 4 }, AMB02: { tipo: 'valor', valor: 4 } };
    const d = calcularDimension('ambiental', r);
    expect(d.estado).toBe('insuficiente');
    expect(d.puntaje).toBeNull();
    expect(d.nivel).toBeNull();
  });

  it('con 70% o más el resultado es completo', () => {
    const r: Respuestas = {};
    de('social').slice(0, 7).forEach((p) => (r[p.id] = { tipo: 'valor', valor: 3 }));
    expect(calcularDimension('social', r).estado).toBe('completo');
  });

  it('lista las áreas de atención (valor 0–1) de menor a mayor', () => {
    const r: Respuestas = { ...todas('gobernanza', 3), GOB05: { tipo: 'valor', valor: 1 }, GOB07: { tipo: 'valor', valor: 0 } };
    expect(calcularDimension('gobernanza', r).atencion).toEqual(['GOB07', 'GOB05']);
  });

  it('es determinista: mismas respuestas, mismo resultado', () => {
    const r = { ...todas('ambiental', 2), ...todas('social', 3) };
    expect(calcularDiagnostico(r)).toEqual(calcularDiagnostico(r));
  });
});

describe('índice general', () => {
  it('es el promedio simple de las cuatro dimensiones cuando todas están completas', () => {
    const r = { ...todas('ambiental', 4), ...todas('social', 2), ...todas('gobernanza', 2), ...todas('economica', 0) };
    const g = calcularDiagnostico(r).general;
    expect(g.puntaje).toBe(50);
    expect(g.estado).toBe('completo');
    expect(g.nivel).toBe('En desarrollo');
  });

  it('la cadena de valor no entra al índice', () => {
    const base = { ...todas('ambiental', 4), ...todas('social', 4), ...todas('gobernanza', 4), ...todas('economica', 4) };
    expect(calcularDiagnostico({ ...base, ...todas('cadena', 0) }).general.puntaje).toBe(100);
  });

  it('es provisional si falta una dimensión y dice cuáles lo componen', () => {
    const r = { ...todas('ambiental', 4), ...todas('social', 2) };
    const g = calcularDiagnostico(r).general;
    expect(g.estado).toBe('provisional');
    expect(g.puntaje).toBe(75);
    expect(g.incluidas).toEqual(['ambiental', 'social']);
    expect(g.faltantes).toEqual(['gobernanza', 'economica']);
  });

  it('sin ninguna dimensión completa no inventa una cifra', () => {
    const g = calcularDiagnostico({}).general;
    expect(g.puntaje).toBeNull();
    expect(g.estado).toBe('insuficiente');
  });
});

describe('niveles', () => {
  it('respeta los rangos 0–20, 21–40, 41–60, 61–80 y 81–100', () => {
    expect([0, 20, 21, 40, 41, 60, 61, 80, 81, 100].map(nivelDe)).toEqual([
      'Inicial',
      'Inicial',
      'Básico',
      'Básico',
      'En desarrollo',
      'En desarrollo',
      'Gestionado',
      'Gestionado',
      'Avanzado',
      'Avanzado',
    ]);
  });
});
