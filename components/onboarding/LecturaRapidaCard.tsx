'use client';

// Tarjeta de la lectura rápida: una fila por dimensión con la palabra del nivel y una barra segmentada.
// Sin puntaje de 0 a 100 (ver lib/diagnostico/rapida.ts). Se usa al final del recorrido y en la pantalla de planes.

import { motion, useReducedMotion } from 'motion/react';
import { Leaf, Scale, TrendingUp, Users, type LucideIcon } from 'lucide-react';
import type { DimRapida, LecturaRapida } from '@/lib/diagnostico/rapida';

const ICONOS: Record<DimRapida, LucideIcon> = { ambiental: Leaf, social: Users, gobernanza: Scale, economica: TrendingUp };
const COLOR_NIVEL = ['var(--nivel-1)', 'var(--nivel-2)', 'var(--nivel-3)', 'var(--nivel-4)', 'var(--accent)'];
const EASE = [0.32, 0.72, 0, 1] as const;

export function LecturaRapidaCard({
  lectura,
  retraso = 0,
  onEditar,
}: {
  lectura: LecturaRapida;
  retraso?: number;
  /** Si se da, cada fila es tocable y lleva a su pregunta para cambiarla. */
  onEditar?: (dimension: DimRapida) => void;
}) {
  const reduce = useReducedMotion();
  return (
    <ul className="flex flex-col gap-2">
      {lectura.filas.map((f, fila) => {
        const Icono = ICONOS[f.dimension];
        return (
          <li key={f.dimension}>
            <Fila onEditar={onEditar ? () => onEditar(f.dimension) : undefined} etiqueta={`Cambiar mi respuesta de ${f.nombre}`}>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
                <Icono size={18} color="var(--accent)" />
              </span>
              <div className="flex min-w-0 flex-1 items-baseline justify-between gap-3">
                <p className="text-base font-semibold">{f.nombre}</p>
                <p className="text-sm text-[var(--text-secondary)]">{f.nivel ?? 'Aún no lo sabes'}</p>
              </div>
            </div>
            {/* Sin respuesta no se dibujan barras vacías: «Aún no lo sabes» ya lo dice y no se lee como un hueco. */}
            <div className={`mt-2 flex gap-1 ${f.valor === null ? 'hidden' : ''}`} role="img" aria-label={f.nivel ? `${f.nombre}: ${f.nivel}` : `${f.nombre}: sin dato`}>
              {COLOR_NIVEL.map((color, i) => (
                <span key={color} className="h-2 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_22%,transparent)]">
                  {f.valor !== null && i <= f.valor && (
                    <motion.span
                      className="block h-full w-full origin-left rounded-full"
                      style={{ background: color }}
                      initial={{ scaleX: reduce ? 1 : 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: reduce ? 0 : 0.35, delay: reduce ? 0 : retraso + fila * 0.1 + i * 0.05, ease: EASE }}
                    />
                  )}
                </span>
              ))}
            </div>
            </Fila>
          </li>
        );
      })}
    </ul>
  );
}

/** Contenedor de una fila: botón tocable si hay acción de editar; si no, solo un bloque. */
function Fila({ onEditar, etiqueta, children }: { onEditar?: () => void; etiqueta: string; children: React.ReactNode }) {
  if (!onEditar) return <div className="py-2">{children}</div>;
  return (
    <button
      type="button"
      onClick={onEditar}
      aria-label={etiqueta}
      className="-mx-2 block w-[calc(100%+1rem)] rounded-[var(--radius-button)] px-2 py-2 text-left transition-colors hover:bg-[color-mix(in_oklab,var(--text-tertiary)_10%,transparent)] active:scale-95 [touch-action:manipulation]"
    >
      {children}
    </button>
  );
}
