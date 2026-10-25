'use client';

// Registro y entrada con código de un solo uso enviado al correo (sin contraseña).
// Hoy usa la versión de DEMOSTRACIÓN de lib/auth (no envía correos): muestra el código en pantalla
// y solo funciona con NEXT_PUBLIC_MODO_DEMO=si. Sin esa variable, avisa que el acceso aún no abre.
// Anti-enumeración: el mismo mensaje exista o no la cuenta.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AlertCircle, Loader2, MailCheck } from 'lucide-react';
import { Marco } from '@/components/flujo/Marco';
import { track } from '@/lib/analytics';
import { MODO_DEMO, solicitarCodigo, verificarCodigo, type ErrorSolicitud, type ErrorVerificacion } from '@/lib/auth';
import { TRIAL_DIAS } from '@/lib/site';

const ESPERA_REENVIO = 60;

const ERRORES_SOLICITUD: Record<ErrorSolicitud, string> = {
  correo_invalido: 'Revisa el correo: parece que le falta algo, como el @ o el final.',
  limite: 'Pediste varios códigos seguidos. Espera unos minutos e inténtalo de nuevo.',
  no_disponible: 'El acceso a las cuentas se abre muy pronto. Tus respuestas quedan guardadas en este navegador.',
};

const ERRORES_CODIGO: Record<ErrorVerificacion, string> = {
  codigo: 'Ese código no coincide o ya venció. Revísalo o pide uno nuevo.',
  limite: 'Demasiados intentos. Pide un código nuevo para seguir.',
};

type Paso = 'correo' | 'codigo';

export function Acceso({ modo }: { modo: 'registro' | 'entrada' }) {
  const router = useRouter();
  const [paso, setPaso] = useState<Paso>('correo');
  const [correo, setCorreo] = useState('');
  const [codigo, setCodigo] = useState('');
  const [codigoDemo, setCodigoDemo] = useState('');
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [espera, setEspera] = useState(0);
  const campoCodigo = useRef<HTMLInputElement>(null);
  const registro = modo === 'registro';

  useEffect(() => {
    if (registro) track('registro_iniciado');
  }, [registro]);

  useEffect(() => {
    if (espera <= 0) return;
    const t = setTimeout(() => setEspera((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [espera]);

  useEffect(() => {
    if (paso === 'codigo') campoCodigo.current?.focus();
  }, [paso]);

  const pedirCodigo = async () => {
    if (cargando) return;
    setCargando(true);
    setError(null);
    const r = await solicitarCodigo(correo);
    setCargando(false);
    if (!r.ok) {
      setError(ERRORES_SOLICITUD[r.error]);
      return;
    }
    setCodigoDemo(r.codigoDemo);
    setCodigo('');
    setEspera(ESPERA_REENVIO);
    setPaso('codigo');
  };

  const comprobar = async (valor: string) => {
    if (cargando) return;
    setCargando(true);
    setError(null);
    const r = await verificarCodigo(valor, modo);
    if (!r.ok) {
      setCargando(false);
      setCodigo('');
      setError(ERRORES_CODIGO[r.error]);
      campoCodigo.current?.focus();
      return;
    }
    track(registro ? 'cuenta_creada' : 'entrada_exitosa');
    router.push('/app');
  };

  return (
    <Marco
      atras={
        paso === 'codigo'
          ? { onClick: () => { setPaso('correo'); setError(null); }, etiqueta: 'Cambiar el correo' }
          : { href: registro ? '/planes' : '/', etiqueta: registro ? 'Volver a los planes' : 'Volver a la página principal' }
      }
    >
      {paso === 'correo' ? (
        <form
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            void pedirCodigo();
          }}
          className="flex flex-1 flex-col"
        >
          <h1 className="text-balance text-3xl font-bold leading-tight [font-family:var(--font-display)]">
            {registro ? 'Crea tu cuenta para empezar' : 'Entra a tu cuenta'}
          </h1>
          <p className="mt-2 text-base text-[var(--text-secondary)]">
            {registro
              ? `Tus ${TRIAL_DIAS} días gratis empiezan al entrar. Sin contraseña y sin tarjeta.`
              : 'Te enviamos un código a tu correo. No necesitas contraseña.'}
          </p>

          <div className="mt-8">
            <label htmlFor="correo" className="block text-sm font-medium text-[var(--text-secondary)]">
              Tu correo
            </label>
            <input
              id="correo"
              type="email"
              inputMode="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              value={correo}
              placeholder="nombre@empresa.com"
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'error-acceso' : undefined}
              onChange={(e) => setCorreo(e.target.value)}
              className="mt-2 h-14 w-full rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] bg-[var(--surface)] px-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
            />
            <Aviso id="error-acceso" texto={error} />
          </div>

          <div className="mt-auto pt-8">
            <button
              type="submit"
              disabled={cargando || correo.trim().length === 0}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] disabled:opacity-40 [touch-action:manipulation]"
            >
              {cargando ? (
                <>
                  <Loader2 size={18} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Enviando…
                </>
              ) : (
                'Enviarme el código'
              )}
            </button>
            <p className="mt-4 text-center text-sm text-[var(--text-secondary)]">
              {registro ? (
                <>
                  ¿Ya tienes cuenta? <Link href="/entrar" className="font-semibold text-[var(--accent)] underline">Entrar</Link>
                </>
              ) : (
                <>
                  ¿Primera vez? <Link href="/onboarding" className="font-semibold text-[var(--accent)] underline">Empieza gratis</Link>
                </>
              )}
            </p>
            {registro && (
              <p className="mt-3 text-center text-xs text-[var(--text-tertiary)]">
                Al continuar aceptas los <Link href="/terminos" className="underline">Términos</Link> y la{' '}
                <Link href="/privacidad" className="underline">Política de privacidad</Link>.
              </p>
            )}
          </div>
        </form>
      ) : (
        <div className="flex flex-1 flex-col">
          <MailCheck size={32} className="text-[var(--accent)]" aria-hidden="true" />
          <h1 className="mt-4 text-balance text-3xl font-bold leading-tight [font-family:var(--font-display)]">Revisa tu correo</h1>
          <p className="mt-2 text-base text-[var(--text-secondary)]">
            Si <strong className="font-semibold text-[var(--text-primary)]">{correo.trim()}</strong> puede entrar, te enviamos un código de 6 números.
          </p>

          {MODO_DEMO && (
            <p className="mt-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent-2)_45%,transparent)] bg-[color-mix(in_oklab,var(--accent-2)_10%,transparent)] p-4 text-sm text-[var(--text-primary)]">
              <strong className="font-semibold">Versión de demostración:</strong> no se envían correos reales. Tu código es{' '}
              <span className="font-semibold tabular-nums tracking-widest">{codigoDemo}</span>.
            </p>
          )}

          <div className="mt-8">
            <label htmlFor="codigo" className="block text-sm font-medium text-[var(--text-secondary)]">
              Código de 6 números
            </label>
            <input
              id="codigo"
              ref={campoCodigo}
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={6}
              value={codigo}
              disabled={cargando}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? 'error-codigo' : undefined}
              onChange={(e) => {
                const limpio = e.target.value.replace(/\D/g, '').slice(0, 6);
                setCodigo(limpio);
                if (limpio.length === 6) void comprobar(limpio);
              }}
              className="mt-2 h-16 w-full rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] bg-[var(--surface)] px-4 text-center text-3xl font-semibold tabular-nums tracking-widest text-[var(--text-primary)] disabled:opacity-60"
            />
            <Aviso id="error-codigo" texto={error} />
            {cargando && (
              <p className="mt-3 flex items-center gap-2 text-sm text-[var(--text-secondary)]" role="status">
                <Loader2 size={16} className="animate-spin motion-reduce:animate-none" aria-hidden="true" /> Comprobando…
              </p>
            )}
          </div>

          <div className="mt-auto pt-8 text-center">
            <button
              type="button"
              disabled={espera > 0 || cargando}
              onClick={() => void pedirCodigo()}
              className="h-12 text-base font-semibold text-[var(--accent)] underline disabled:text-[var(--text-secondary)] disabled:no-underline"
            >
              {espera > 0 ? `Pedir otro código en ${espera} s` : 'Pedir otro código'}
            </button>
          </div>
        </div>
      )}
    </Marco>
  );
}

function Aviso({ id, texto }: { id: string; texto: string | null }) {
  if (!texto) return null;
  return (
    <p id={id} role="alert" className="mt-3 flex items-start gap-2 text-sm text-[var(--accent-2)]">
      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
      {texto}
    </p>
  );
}
