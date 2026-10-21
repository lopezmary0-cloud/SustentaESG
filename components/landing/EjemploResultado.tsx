'use client';

// Ejemplo de resultado (prueba concreta del mecanismo). Rotulado SIEMPRE como ejemplo:
// la empresa y los puntajes son de muestra, no son resultados de ningún cliente (19 §5).
// Movimiento baseline: las barras se dibujan y los números cuentan al entrar en vista
// (una sola vez); con prefers-reduced-motion aparecen ya completos.

import { useEffect, useRef, useState } from 'react';
import { animate, motion, useInView, useReducedMotion } from 'motion/react';

const DIMENSIONES = [
  { nombre: 'Ambiental', valor: 48.9, color: 'var(--rueda-1)', nota: 'Brecha: residuos y energía sin medición' },
  { nombre: 'Social', valor: 61.3, color: 'var(--rueda-2)', nota: 'Fortaleza: bienestar y formación' },
  { nombre: 'Gobernanza', valor: 52, color: 'var(--rueda-4)', nota: 'Brecha: evidencias sin ordenar' },
  { nombre: 'Económica', valor: 66.7, color: 'var(--rueda-5)', nota: 'Fortaleza: control de desperdicios' },
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
        {DIMENSIONES.map((d, i) => (
          <li key={d.nombre}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-base font-semibold text-[var(--text-primary)]">{d.nombre}</span>
              <span className="text-base font-semibold text-[var(--text-primary)] [font-family:var(--font-display)]">
                <Conteo hasta={d.valor} activo={visible} reducir={reducir} />
              </span>
            </div>
            <div
              role="img"
              aria-label={`${d.nombre}: ${formato.format(d.valor)} de 100`}
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]"
            >
              <motion.div
                className="h-full rounded-full"
                style={{ background: d.color }}
                initial={{ width: reducir ? `${d.valor}%` : 0 }}
                animate={{ width: visible || reducir ? `${d.valor}%` : 0 }}
                transition={{ duration: reducir ? 0 : 0.9, delay: reducir ? 0 : 0.06 * i, ease: [0.32, 0.72, 0, 1] }}
              />
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{d.nota}</p>
          </li>
        ))}
      </ul>
    </figure>
  );
}
