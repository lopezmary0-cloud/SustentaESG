'use client';

// Ejemplo de resultado (prueba concreta del mecanismo). Rotulado SIEMPRE como ejemplo:
// la empresa y los puntajes son de muestra, no son resultados de ningún cliente (19 §5).
// Dispositivo propio de la marca (FICHA-ARTE): la barra segmentada de madurez muestra cómo se
// reparten las respuestas por nivel. Movimiento: los números cuentan y los segmentos se dibujan
// al entrar en vista (una sola vez); con prefers-reduced-motion aparecen ya completos.

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'motion/react';

const NIVELES = [
  { etiqueta: 'Nivel 0–1', color: 'var(--nivel-1)' },
  { etiqueta: 'Nivel 2', color: 'var(--nivel-2)' },
  { etiqueta: 'Nivel 3', color: 'var(--nivel-3)' },
  { etiqueta: 'Nivel 4', color: 'var(--nivel-4)' },
];

const DIMENSIONES = [
  { nombre: 'Ambiental', valor: 48.9, reparto: [3, 3, 2, 1], nota: 'Brecha: residuos y energía sin medición' },
  { nombre: 'Social', valor: 61.3, reparto: [1, 4, 3, 2], nota: 'Fortaleza: bienestar y formación' },
  { nombre: 'Gobernanza', valor: 52, reparto: [2, 3, 2, 1], nota: 'Brecha: evidencias sin ordenar' },
  { nombre: 'Económica', valor: 66.7, reparto: [1, 1, 3, 1], nota: 'Fortaleza: control de desperdicios' },
];

const formato = new Intl.NumberFormat('es-CO', { minimumFractionDigits: 1, maximumFractionDigits: 1 });

function Conteo({ hasta, activo, reducir }: { hasta: number; activo: boolean; reducir: boolean | null }) {
  const [valor, setValor] = useState(0);
  useEffect(() => {
    if (reducir || !activo) return;
    const control = animate(0, hasta, { duration: 0.9, ease: [0.32, 0.72, 0, 1], onUpdate: setValor });
    return () => control.stop();
  }, [activo, hasta, reducir]);
  return <span className="tabular-nums">{formato.format(reducir ? hasta : valor)}</span>;
}

export function EjemploResultado() {
  const ref = useRef<HTMLElement | null>(null);
  const visible = useInView(ref, { once: true, amount: 0.3 });
  const reducir = useReducedMotion();
  const mostrar = visible || Boolean(reducir);

  return (
    <figure
      ref={ref}
      className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface)] p-5 md:p-6"
    >
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Ejemplo de resultado · empresa de ejemplo
        </span>
        <span className="rounded-full bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
          57,2 de 100 · En desarrollo
        </span>
      </figcaption>

      <ul className="mt-4 flex flex-col gap-4">
        {DIMENSIONES.map((d, i) => {
          const total = d.reparto.reduce((a, b) => a + b, 0);
          return (
            <li key={d.nombre}>
              <div className="flex items-baseline justify-between gap-3">
                <span className="text-base font-semibold text-[var(--text-primary)]">{d.nombre}</span>
                <span className="text-base font-semibold text-[var(--text-primary)] [font-family:var(--font-display)]">
                  <Conteo hasta={d.valor} activo={visible} reducir={reducir} />
                </span>
              </div>
              <div
                role="img"
                aria-label={`${d.nombre}: ${formato.format(d.valor)} de 100. Reparto de respuestas por nivel: ${d.reparto.join(', ')}.`}
                className="mt-2 flex h-2 w-full gap-0.5 overflow-hidden rounded-full"
              >
                {d.reparto.map((n, k) => (
                  <motion.div
                    key={NIVELES[k].etiqueta}
                    className="h-full"
                    style={{ background: NIVELES[k].color, flexBasis: `${(n / total) * 100}%`, transformOrigin: 'left' }}
                    initial={{ scaleX: reducir ? 1 : 0 }}
                    animate={{ scaleX: mostrar ? 1 : 0 }}
                    transition={{ duration: reducir ? 0 : 0.5, delay: reducir ? 0 : 0.06 * i + 0.08 * k, ease: [0.32, 0.72, 0, 1] }}
                  />
                ))}
              </div>
              <p className="mt-2 text-sm text-[var(--text-secondary)]">{d.nota}</p>
            </li>
          );
        })}
      </ul>

      <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] pt-4 text-xs text-[var(--text-secondary)]">
        <li className="w-full font-semibold">Cada barra muestra cómo se reparten tus respuestas:</li>
        {NIVELES.map((n) => (
          <li key={n.etiqueta} className="flex items-center gap-2">
            <span aria-hidden="true" className="size-2 rounded-sm" style={{ background: n.color }} />
            {n.etiqueta}
          </li>
        ))}
      </ul>
    </figure>
  );
}
