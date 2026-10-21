import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Tu diagnóstico — SustentaESG' };

// Destino de todos los botones de la página de ventas. El recorrido de inicio real se construye
// en la Etapa 3 (docs/sistema/SECUENCIA-MAESTRA-CONSTRUCCION.md). Hasta entonces, esta pantalla es honesta.
export default function Onboarding() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-[var(--bg)] px-5 text-center text-[var(--text-primary)] [font-family:var(--font-body)]">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold leading-tight [font-family:var(--font-display)]">
          Estamos terminando tu <span className="text-[var(--accent)]">recorrido de inicio</span>
        </h1>
        <p className="mt-4 text-base leading-relaxed text-[var(--text-secondary)]">
          La app todavía se está construyendo. Muy pronto podrás crear tu cuenta y empezar tu diagnóstico con 7
          días de prueba, sin tarjeta.
        </p>
        <Link
          href="/"
          className="mt-8 inline-flex min-h-12 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] px-6 text-base font-semibold text-[var(--bg)]"
        >
          Volver al inicio
        </Link>
      </div>
    </main>
  );
}
