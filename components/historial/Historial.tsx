'use client';

// Historial de la empresa activa: sus fotografías fechadas y la comparación entre dos momentos. Se navega
// por períodos con ← →, con fechas reales. Todo viene de datos guardados; aquí solo se presenta.

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { AlertTriangle, ArrowDown, ArrowLeft, ArrowRight, ArrowUp, History, Minus, Trash2 } from 'lucide-react';
import { Marco } from '@/components/flujo/Marco';
import { SinEmpresa } from '@/components/empresas/SinEmpresa';
import { AvisoDeshacer } from '@/components/flujo/AvisoDeshacer';
import { useCuenta } from '@/lib/useCuenta';
import { NOMBRE_DIMENSION } from '@/lib/diagnostico/banco';
import { useEmpresaActiva } from '@/lib/empresas/almacen';
import type { Empresa } from '@/lib/empresas/reglas';
import { comparar, textoCambio, type Cambio, type Fotografia } from '@/lib/historial/comparar';
import { quitarFotografia, restaurarFotografia, useHistorial } from '@/lib/historial/almacen';
import { useSesionRequerida } from '@/lib/useSesion';

const EASE = [0.32, 0.72, 0, 1] as const;
const formatoFecha = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric' });
const fecha = (t: number) => formatoFecha.format(new Date(t));

export function Historial() {
  const { listo } = useSesionRequerida();
  if (!listo) {
    return (
      <Marco atras={{ href: '/app', etiqueta: 'Volver al panel' }} ancho={560}>
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)]" />
      </Marco>
    );
  }
  return <ConEmpresa />;
}

function ConEmpresa() {
  const { activa } = useEmpresaActiva();
  if (!activa) return <SinEmpresa />;
  return <HistorialAbierto key={activa.id} empresa={activa} />;
}

const COLOR_NIVEL = ['var(--nivel-1)', 'var(--nivel-2)', 'var(--nivel-3)', 'var(--nivel-4)', 'var(--accent)'];
/** Nivel 0–4 de un puntaje 0–100 (rangos 0–20, 21–40, 41–60, 61–80, 81–100). */
const nivelIdx = (p: number) => Math.max(0, Math.min(4, Math.ceil(p / 20) - 1));

/** Barra segmentada de madurez: los segmentos se llenan hasta el nivel de «después»; una marca fina señala dónde estaba «antes». */
function BarraNivel({ puntaje, previo, retraso }: { puntaje: number | null; previo: number | null; retraso: number }) {
  const reduce = useReducedMotion();
  const nivel = puntaje === null ? -1 : nivelIdx(puntaje);
  const nivelPrevio = previo === null ? -1 : nivelIdx(previo);
  return (
    <div className="mt-2 flex gap-1" role="img" aria-label={puntaje === null ? 'Sin nivel' : `Nivel ${nivel + 1} de 5`}>
      {COLOR_NIVEL.map((color, i) => (
        <span key={color} className="relative h-2 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_22%,transparent)]">
          {i <= nivel && (
            <motion.span
              className="block h-full w-full origin-left rounded-full"
              style={{ background: color }}
              initial={{ scaleX: reduce ? 1 : 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: reduce ? 0 : 0.35, delay: retraso + i * 0.06, ease: EASE }}
            />
          )}
          {i === nivelPrevio && i !== nivel && <span aria-hidden="true" className="absolute inset-y-0 right-0 w-1 bg-[var(--text-primary)] opacity-70" />}
        </span>
      ))}
    </div>
  );
}

const COLOR: Record<Cambio['tendencia'], string> = {
  sube: 'var(--accent)',
  baja: 'var(--nivel-1)',
  igual: 'var(--text-secondary)',
  sin_dato: 'var(--text-secondary)',
};
const ICONO = { sube: ArrowUp, baja: ArrowDown, igual: Minus, sin_dato: Minus };

function HistorialAbierto({ empresa }: { empresa: Empresa }) {
  const reduce = useReducedMotion();
  const { fotografias } = useHistorial(empresa.id);
  const [elegida, setElegida] = useState<string | null>(null);
  const [quitada, setQuitada] = useState<Fotografia | null>(null);

  const n = fotografias.length;
  // «Después» = la fotografía elegida (por defecto, la más reciente); «antes» = la anterior.
  const posDespues = Math.max(0, Math.min(n - 1, elegida ? fotografias.findIndex((f) => f.id === elegida) : n - 1));
  const despues = fotografias[posDespues];
  const antes = posDespues > 0 ? fotografias[posDespues - 1] : null;
  const c = antes && despues ? comparar(antes, despues) : null;
  const puntajeVisible = useCuenta(despues?.general.puntaje ?? 0);
  const ir = (i: number) => setElegida(fotografias[Math.max(0, Math.min(n - 1, i))]?.id ?? null);

  return (
    <Marco atras={{ href: '/app', etiqueta: 'Volver al panel' }} ancho={560}>
      <p className="truncate text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Historial · {empresa.nombre}</p>
      <h1 className="mt-2 text-balance text-3xl font-bold leading-tight [font-family:var(--font-display)]">Cómo avanza tu empresa</h1>

      {quitada && (
        <AvisoDeshacer
          texto="Fotografía quitada."
          onCerrar={() => setQuitada(null)}
          onDeshacer={() => {
            restaurarFotografia(empresa.id, quitada);
            setQuitada(null);
          }}
        />
      )}

      {n === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-[var(--radius-card)] bg-[var(--surface)] p-6 text-center shadow-[var(--shadow-1)]">
          <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-[var(--chip-bg)]">
            <History size={22} color="var(--accent)" />
          </span>
          <p className="mt-4 text-xl font-semibold [font-family:var(--font-display)]">Todavía no hay fotografías</p>
          <p className="mt-2 text-base text-[var(--text-secondary)]">
            Una fotografía guarda tu resultado de hoy con su fecha. Con dos o más podrás ver qué mejoró.
          </p>
          <Link
            href="/app/resultados"
            className="mt-5 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] transition-transform active:scale-95 [touch-action:manipulation]"
          >
            Ir a mis resultados
          </Link>
        </div>
      ) : (
        <>
          <section aria-label="Período" className="mt-6 flex items-center gap-2 rounded-[var(--radius-card)] bg-[var(--surface)] p-2 shadow-[var(--shadow-1)]">
            <button
              type="button"
              aria-label="Fotografía anterior"
              disabled={posDespues === 0}
              onClick={() => ir(posDespues - 1)}
              className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] text-[var(--text-primary)] transition-transform active:scale-95 disabled:opacity-30 [touch-action:manipulation]"
            >
              <ArrowLeft size={20} aria-hidden="true" />
            </button>
            <div className="min-w-0 flex-1 text-center">
              <p className="truncate text-base font-semibold">{despues.etiqueta}</p>
              <p className="text-sm text-[var(--text-secondary)]">
                {fecha(despues.creada)} · {posDespues + 1} de {n}
              </p>
            </div>
            <button
              type="button"
              aria-label="Fotografía siguiente"
              disabled={posDespues === n - 1}
              onClick={() => ir(posDespues + 1)}
              className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] text-[var(--text-primary)] transition-transform active:scale-95 disabled:opacity-30 [touch-action:manipulation]"
            >
              <ArrowRight size={20} aria-hidden="true" />
            </button>
          </section>

          {c && antes ? (
            <section aria-label="Comparación" className="mt-4">
              <div
                className="rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-2)]"
                style={{
                  border: '1px solid transparent',
                  background:
                    'linear-gradient(var(--surface), var(--surface)) padding-box, linear-gradient(135deg, color-mix(in oklab, var(--accent) 55%, transparent), transparent 65%) border-box',
                }}
              >
                <p className="text-sm text-[var(--text-secondary)]">
                  Frente a {antes.etiqueta} ({fecha(antes.creada)})
                </p>
                <p className="mt-2 flex flex-wrap items-baseline gap-x-3 text-4xl font-bold tabular-nums [font-family:var(--font-display)]">
                  {despues.general.puntaje === null ? '—' : puntajeVisible}
                  <span className="text-lg font-semibold text-[var(--text-secondary)]">/ 100</span>
                </p>
                <p className="mt-1 flex items-center gap-2 text-base font-semibold" style={{ color: COLOR[c.general.tendencia] }}>
                  {(() => {
                    const Icono = ICONO[c.general.tendencia];
                    return <Icono size={18} aria-hidden="true" />;
                  })()}
                  {textoCambio(c.general)}
                </p>
              </div>

              <ul className="mt-3 flex flex-col gap-2">
                {c.dimensiones.map((d, i) => {
                  const Icono = ICONO[d.tendencia];
                  return (
                    <motion.li
                      key={d.dimension}
                      initial={{ opacity: 0, y: reduce ? 0 : 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3, delay: reduce ? 0 : i * 0.05, ease: EASE }}
                      className="flex items-center justify-between gap-3 rounded-[var(--radius-card)] bg-[var(--surface)] p-4"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="text-base font-semibold">{d.dimension === 'general' ? 'General' : NOMBRE_DIMENSION[d.dimension]}</p>
                        <p className="mt-1 text-sm tabular-nums text-[var(--text-secondary)]">
                          {d.antes ?? '—'} → {d.despues ?? '—'}
                        </p>
                        <BarraNivel puntaje={d.despues} previo={d.antes} retraso={reduce ? 0 : 0.2 + i * 0.05} />
                      </div>
                      <p className="flex shrink-0 items-center gap-1 text-sm font-semibold" style={{ color: COLOR[d.tendencia] }}>
                        <Icono size={16} aria-hidden="true" />
                        {textoCambio(d)}
                      </p>
                    </motion.li>
                  );
                })}
              </ul>

              {(c.general.orientativo || c.metodologiaDistinta) && (
                <p className="mt-3 flex items-start gap-2 text-sm text-[var(--text-secondary)]">
                  <AlertTriangle size={16} className="mt-0.5 shrink-0 text-[var(--accent-2)]" aria-hidden="true" />
                  {c.metodologiaDistinta
                    ? 'Estas fotografías se calcularon con versiones distintas de la metodología: los números no son del todo comparables.'
                    : 'Una de las dos fotografías tiene resultados provisionales (pocas respuestas). La comparación es orientativa.'}
                </p>
              )}
            </section>
          ) : (
            <p className="mt-4 rounded-[var(--radius-card)] bg-[var(--surface)] p-4 text-base text-[var(--text-secondary)]">
              {n === 1
                ? 'Esta es tu primera fotografía. Guarda otra más adelante, desde tus resultados, para ver el avance.'
                : 'Esta es la fotografía más antigua: no hay una anterior con la que compararla. Usa → para ver las siguientes.'}
            </p>
          )}

          <section aria-label="Todas las fotografías" className="mt-8">
            <h2 className="text-lg font-semibold">Todas las fotografías</h2>
            <ul className="mt-3 flex flex-col gap-2">
              {[...fotografias].reverse().map((f) => {
                const activa = f.id === despues.id;
                return (
                  <li key={f.id} className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-pressed={activa}
                      onClick={() => setElegida(f.id)}
                      className={`flex min-h-14 flex-1 items-center justify-between gap-3 rounded-[var(--radius-card)] border px-4 py-2 text-left transition-transform active:scale-95 [touch-action:manipulation] ${
                        activa
                          ? 'border-[var(--accent)] bg-[var(--chip-bg)]'
                          : 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface)]'
                      }`}
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-base font-medium">{f.etiqueta}</span>
                        <span className="block text-sm text-[var(--text-secondary)]">{fecha(f.creada)}</span>
                      </span>
                      <span className="shrink-0 text-right">
                        <span className="block text-xl font-bold tabular-nums [font-family:var(--font-display)]">{f.general.puntaje ?? '—'}</span>
                        <span className="block text-xs text-[var(--text-secondary)]">{f.general.nivel ?? 'Sin cifra'}</span>
                      </span>
                    </button>
                    <button
                      type="button"
                      aria-label={`Quitar la fotografía ${f.etiqueta}`}
                      onClick={() => {
                        setQuitada(quitarFotografia(empresa.id, f.id));
                        setElegida(null);
                      }}
                      className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] text-[var(--text-secondary)] transition-transform active:scale-95 [touch-action:manipulation]"
                    >
                      <Trash2 size={18} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <Link
            href="/app/resultados"
            className="mt-6 flex h-14 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_60%,transparent)] text-base font-semibold text-[var(--accent)] transition-transform active:scale-95 [touch-action:manipulation]"
          >
            Guardar otra fotografía de hoy
          </Link>
        </>
      )}
    </Marco>
  );
}
