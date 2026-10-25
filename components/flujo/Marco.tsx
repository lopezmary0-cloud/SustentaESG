'use client';

// Marco común de las pantallas del flujo (recorrido de inicio, planes, registro, entrada):
// cabecera con volver + marca, barra de avance opcional y columna centrada de 480 px.

import Link from 'next/link';
import { ArrowLeft, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { APP_NAME } from '@/lib/site';

export interface AccionMarco {
  href?: string;
  onClick?: () => void;
  etiqueta: string;
}

export function Marco({
  atras,
  cerrar,
  progreso,
  segmentos,
  progresoEtiqueta,
  ancho = 480,
  children,
}: {
  atras?: AccionMarco;
  cerrar?: AccionMarco;
  progreso?: number;
  /** Un avance (0 a 1) por segmento; si se da, manda sobre `progreso` y dibuja uno por dimensión. */
  segmentos?: number[];
  progresoEtiqueta?: string;
  ancho?: number;
  children: ReactNode;
}) {
  return (
    <div
      className="flex min-h-dvh flex-col bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]"
      style={{
        backgroundImage:
          'radial-gradient(ellipse 120% 40% at 50% 0%, color-mix(in oklab, var(--accent) 9%, transparent), transparent 70%), radial-gradient(ellipse 80% 30% at 100% 100%, color-mix(in oklab, var(--accent-2) 6%, transparent), transparent 70%)',
      }}
    >
      <header className="mx-auto flex h-14 w-full items-center justify-between px-3" style={{ maxWidth: ancho + 40 }}>
        <div className="w-11">
          {atras && <BotonIcono accion={atras} icono={<ArrowLeft size={22} aria-hidden="true" />} />}
        </div>
        <Link href="/" className="text-xl font-semibold tracking-tight [font-family:var(--font-display)]">
          {APP_NAME}
        </Link>
        <div className="flex w-11 justify-end">
          {cerrar && <BotonIcono accion={cerrar} icono={<X size={22} aria-hidden="true" />} />}
        </div>
      </header>

      {progreso !== undefined && (
        <div className="mx-auto mt-1 w-full px-5" style={{ maxWidth: ancho + 40 }}>
          <div
            role="progressbar"
            aria-label={progresoEtiqueta ?? 'Avance'}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progreso)}
            className="flex gap-1"
          >
            {(segmentos ?? [0, 1, 2, 3].map((i) => (progreso - i * 25) / 25)).map((valor, i) => {
              const lleno = Math.min(1, Math.max(0, valor));
              return (
                <div key={i} className="h-1 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_28%,transparent)]">
                  <div
                    className="h-full rounded-full bg-[var(--accent)] transition-[width] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] motion-reduce:transition-none"
                    style={{ width: `${lleno * 100}%` }}
                  />
                </div>
              );
            })}
          </div>
        </div>
      )}

      <main className="mx-auto flex w-full flex-1 flex-col px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-8" style={{ maxWidth: ancho + 40 }}>
        {children}
      </main>
    </div>
  );
}

function BotonIcono({ accion, icono }: { accion: AccionMarco; icono: ReactNode }) {
  const clases =
    'flex size-11 items-center justify-center rounded-[var(--radius-button)] text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] [touch-action:manipulation]';
  if (accion.href) {
    return (
      <Link href={accion.href} aria-label={accion.etiqueta} className={clases}>
        {icono}
      </Link>
    );
  }
  return (
    <button type="button" aria-label={accion.etiqueta} onClick={accion.onClick} className={clases}>
      {icono}
    </button>
  );
}
