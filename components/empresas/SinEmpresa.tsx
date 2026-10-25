'use client';

import Link from 'next/link';
import { Building2 } from 'lucide-react';
import { Marco } from '@/components/flujo/Marco';

/** Pantalla que se muestra si la cuenta todavía no tiene ninguna empresa (por ejemplo, tras quitar la única). */
export function SinEmpresa() {
  return (
    <Marco atras={{ href: '/app', etiqueta: 'Volver al panel' }} ancho={560}>
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-[var(--chip-bg)]">
          <Building2 size={22} color="var(--accent)" />
        </span>
        <h1 className="mt-4 text-balance text-2xl font-bold [font-family:var(--font-display)]">Primero añade una empresa</h1>
        <p className="mt-2 text-base text-[var(--text-secondary)]">El diagnóstico, el plan y el historial se guardan por empresa.</p>
        <Link
          href="/app/empresas"
          className="mt-6 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] transition-transform active:scale-95 [touch-action:manipulation]"
        >
          Añadir mi empresa
        </Link>
      </div>
    </Marco>
  );
}
