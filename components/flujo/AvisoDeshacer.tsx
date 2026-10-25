'use client';

// Aviso fijo abajo con «Deshacer»: siempre a la vista aunque la acción se hiciera al final de una lista larga.
// Se cierra solo a los 8 segundos (la acción ya quedó hecha; deshacer es una cortesía, no una obligación).

import { useEffect } from 'react';

export function AvisoDeshacer({ texto, onDeshacer, onCerrar }: { texto: string; onDeshacer: () => void; onCerrar: () => void }) {
  useEffect(() => {
    const t = setTimeout(onCerrar, 8000);
    return () => clearTimeout(t);
  }, [texto, onCerrar]);

  return (
    <div className="fixed inset-x-4 bottom-4 z-40 mx-auto flex max-w-lg justify-center" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
      <p
        role="status"
        className="flex w-full items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_45%,transparent)] bg-[var(--surface)] px-4 py-2 text-sm shadow-[var(--shadow-2)]"
      >
        {texto}
        <button type="button" onClick={onDeshacer} className="h-12 px-3 font-semibold text-[var(--accent)] underline [touch-action:manipulation]">
          Deshacer
        </button>
      </p>
    </div>
  );
}
