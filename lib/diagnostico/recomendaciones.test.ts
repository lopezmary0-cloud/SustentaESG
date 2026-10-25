import { describe, expect, it } from 'vitest';
import { BANCO } from './banco';
import { calcularDiagnostico, type Respuestas, type Valor } from './motor';
import { generarRecomendaciones, REGLAS } from './recomendaciones';

const generar = (r: Respuestas) => generarRecomendaciones(r, calcularDiagnostico(r));
const valor = (v: Valor) => ({ tipo: 'valor' as const, valor: v });
const todas = (dimension: string, v: Valor): Respuestas =>
  Object.fromEntries(BANCO.filter((p) => p.dimension === dimension).map((p) => [p.id, valor(v)]));

describe('catálogo', () => {
  it('tiene exactamente una regla por pregunta del banco', () => {
    expect(REGLAS).toHaveLength(BANCO.length);
    expect(new Set(REGLAS.map((r) => r.pregunta))).toEqual(new Set(BANCO.map((p) => p.id)));
  });

  it('cada regla trae acción, indicador y evidencia', () => {
    for (const r of REGLAS) {
      expect(r.accion.length).toBeGreaterThan(20);
      expect(r.indicador).not.toBe('');
      expect(r.evidencia).not.toBe('');
    }
  });
});

describe('generación', () => {
  it('no recomienda nada cuando la práctica está implementada o medida', () => {
    expect(generar({ AMB02: valor(3), AMB03: valor(4) })).toEqual([]);
  });

  it('prioridad base: 0 alta, 1 media, 2 baja (sin promedio general que la mueva)', () => {
    const recs = generar({ AMB02: valor(0), AMB03: valor(1), AMB04: valor(2) });
    expect(Object.fromEntries(recs.map((r) => [r.pregunta, r.prioridad]))).toEqual({ AMB02: 'alta', AMB03: 'media', AMB04: 'baja' });
  });

  it('sube un nivel si la dimensión está por debajo del resultado general', () => {
    // Ambiental completa en 1 (25) contra Social completa en 4 (100): general 62,5 → Ambiental está por debajo.
    const r: Respuestas = { ...todas('ambiental', 1), ...todas('social', 4) };
    const rec = generar(r).find((x) => x.pregunta === 'AMB02');
    expect(rec?.prioridad).toBe('alta');
    expect(rec?.porQue).toContain('por debajo');
  });

  it('«No tengo la información» genera una recomendación de reunir información, nunca de práctica', () => {
    const rec = generar({ GOB05: { tipo: 'sin_info' } })[0];
    expect(rec.tipo).toBe('informacion');
    expect(rec.id).toBe('REC-INFO-GOB05');
  });

  it('«No aplica» no genera recomendación', () => {
    expect(generar({ AMB07: { tipo: 'na', justificacion: 'Solo oficina' } })).toEqual([]);
  });

  it('cada recomendación se explica con la respuesta que la originó y nunca califica «alto riesgo»', () => {
    const rec = generar({ SOC03: valor(1) })[0];
    expect(rec.porQue).toContain('Informal');
    expect(rec.porQue).toContain(BANCO.find((p) => p.id === 'SOC03')!.texto);
    for (const r of generar({ AMB02: valor(0), SOC03: valor(1), GOB05: valor(2) })) {
      expect(r.porQue.toLowerCase()).not.toContain('alto riesgo');
    }
  });

  it('ordena por prioridad y luego por dimensión', () => {
    const recs = generar({ ECO01: valor(0), AMB02: valor(0), GOB05: valor(2) });
    expect(recs.map((r) => r.pregunta)).toEqual(['AMB02', 'ECO01', 'GOB05']);
  });

  it('es determinista', () => {
    const r: Respuestas = { AMB02: valor(0), SOC03: valor(1), GOB05: { tipo: 'sin_info' } };
    expect(generar(r)).toEqual(generar(r));
  });
});
