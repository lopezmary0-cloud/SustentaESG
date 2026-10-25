'use client';

// Si algo falla dentro de la app, la persona ve qué hacer (no una pantalla rota). Sus datos siguen
// guardados en este navegador.

import Link from 'next/link';
import { AlertCircle, RotateCcw } from 'lucide-react';
import { Marco } from '@/components/flujo/Marco';

export default function ErrorApp({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <Marco atras={{ href: '/app', etiqueta: 'Volver al panel' }}>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <AlertCircle size={32} className="text-[var(--accent-2)]" aria-hidden="true" />
        <h1 className="mt-4 text-balance text-2xl font-bold [font-family:var(--font-display)]">Algo no salió bien en esta pantalla</h1>
        <p className="mt-2 text-base text-[var(--text-secondary)]">Tus respuestas y tu plan siguen guardados. Inténtalo de nuevo o vuelve al panel.</p>
        <button
          type="button"
          onClick={reset}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] transition-transform active:scale-95 [touch-action:manipulation]"
        >
          <RotateCcw size={18} aria-hidden="true" /> Reintentar
        </button>
        <Link href="/app" className="mt-3 flex h-12 items-center text-base text-[var(--text-secondary)] underline">
          Volver al panel
        </Link>
      </div>
    </Marco>
  );
}
