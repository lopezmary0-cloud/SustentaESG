// Plantilla de las páginas legales (privacidad, términos, reembolsos, aviso).
// Server component. Estilo de la landing; sin enlaces muertos (19 §10).

import type { ReactNode } from 'react';
import Link from 'next/link';
import { APP_NAME, SOPORTE_EMAIL } from '@/lib/site';

export interface SeccionLegal {
  titulo: string;
  contenido: ReactNode;
}

export function LegalPage({
  titulo,
  actualizado,
  secciones,
}: {
  titulo: string;
  actualizado: string;
  secciones: SeccionLegal[];
}) {
  return (
    <main className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="mx-auto w-full max-w-2xl px-5 py-12 md:py-16">
        <Link href="/" className="inline-flex min-h-12 items-center text-sm font-semibold text-[var(--accent)]">
          ← Volver a {APP_NAME}
        </Link>
        <h1 className="mt-4 text-4xl font-bold leading-tight [font-family:var(--font-display)]">{titulo}</h1>
        <p className="mt-2 text-sm text-[var(--text-secondary)]">Última actualización: {actualizado}</p>

        <p
          role="note"
          className="mt-6 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent-2)_40%,transparent)] bg-[color-mix(in_oklab,var(--accent-2)_10%,transparent)] p-4 text-sm leading-relaxed text-[var(--text-primary)]"
        >
          <strong className="font-semibold">Versión preliminar.</strong> Este texto está en revisión legal y se
          actualizará antes del lanzamiento público.
        </p>

        <div className="mt-8 flex flex-col gap-8">
          {secciones.map((s) => (
            <section key={s.titulo}>
              <h2 className="text-xl font-semibold [font-family:var(--font-display)]">{s.titulo}</h2>
              <div className="mt-2 flex flex-col gap-3 text-base leading-relaxed text-[var(--text-secondary)]">
                {s.contenido}
              </div>
            </section>
          ))}
        </div>

        <p className="mt-12 text-sm text-[var(--text-secondary)]">
          ¿Dudas? Escríbenos a{' '}
          <a className="font-semibold text-[var(--accent)] underline underline-offset-4" href={`mailto:${SOPORTE_EMAIL}`}>
            {SOPORTE_EMAIL}
          </a>
          .
        </p>
      </div>
    </main>
  );
}
