'use client';

// Pantalla de planes (paywall). Hoy no cobra nada: pide crear la cuenta y empieza la prueba de
// 7 días sin tarjeta. El cobro real (Hotmart) llega en la fase de servicios y sube esta misma cuenta.
// Copy derivado de FICHA-AVATAR.md; estructura de 50-DISENO-ONBOARDING-PAYWALL.md.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'motion/react';
import { CalendarCheck, Check, Flag, Sparkles } from 'lucide-react';
import { Marco } from '@/components/flujo/Marco';
import { RuedaMini } from '@/components/flujo/RuedaMini';
import { track } from '@/lib/analytics';
import { MODO_DEMO, sesionActual } from '@/lib/auth';
import { guardarPlan, leerInicio, leerPlan, perfilSugerido, type Ciclo, type Perfil } from '@/lib/demo/store';
import { PLANES } from '@/lib/planes';
import { TRIAL_DIAS } from '@/lib/site';
import { useMontado } from '@/lib/useMontado';

const LINEA_TIEMPO = [
  { icono: Sparkles, cuando: 'Hoy', titulo: 'Empiezas' },
  { icono: CalendarCheck, cuando: 'Día 5', titulo: 'Te avisamos' },
  { icono: Flag, cuando: `Día ${TRIAL_DIAS}`, titulo: 'Decides' },
];

export function Planes() {
  const montado = useMontado();
  if (!montado) return <Esqueleto />;
  return <PlanesCliente />;
}

function Esqueleto() {
  return (
    <Marco cerrar={{ href: '/', etiqueta: 'Cerrar y volver a la página principal' }}>
      <div className="h-24 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)]" />
      <div className="mt-6 h-48 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)]" />
    </Marco>
  );
}

function PlanesCliente() {
  const [perfil, setPerfil] = useState<Perfil>(() => leerPlan()?.perfil ?? perfilSugerido(leerInicio()));
  const [ciclo, setCiclo] = useState<Ciclo>(() => leerPlan()?.ciclo ?? 'anual');
  const [empresa] = useState(() => leerInicio().empresa);
  const [conSesion] = useState(() => sesionActual() !== null);
  const [abriendo, setAbriendo] = useState(false);
  const plan = PLANES[perfil];
  const destino = conSesion ? '/app' : '/registro';

  useVisto();

  return (
    <Marco atras={{ href: '/onboarding', etiqueta: 'Volver a mis respuestas' }} cerrar={{ href: '/', etiqueta: 'Cerrar y volver a la página principal' }} ancho={480}>
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
        {empresa ? `Para ${empresa}` : 'Tu prueba gratis'}
      </p>
      <div className="mt-2 flex items-center justify-between gap-4">
        <h1 className="text-balance text-3xl font-bold leading-tight [font-family:var(--font-display)]">
          Deja de reconstruir tus datos: <span className="text-[var(--accent)]">empieza hoy</span>
        </h1>
        <RuedaMini tamano={80} />
      </div>
      <p className="mt-2 text-base text-[var(--text-secondary)]">
        {TRIAL_DIAS} días gratis, sin tarjeta. Cuando un cliente o un banco te pida información, que ya esté ordenada.
      </p>

      <ol className="mt-6 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-3" aria-label="Qué pasa durante la prueba">
        {LINEA_TIEMPO.map((paso) => (
          <li key={paso.cuando} className="rounded-[var(--radius-card)] bg-[var(--surface)] p-3 shadow-[var(--shadow-1)]">
            <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-[var(--chip-bg)]">
              <paso.icono size={18} color="var(--accent)" />
            </span>
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">{paso.cuando}</p>
            <p className="mt-1 text-base font-semibold leading-snug">{paso.titulo}</p>
          </li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        Todo desbloqueado desde hoy. Si no eliges un plan al final, tu diagnóstico queda guardado para consultarlo.
      </p>

      {MODO_DEMO && (
        <p className="mb-6 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent-2)_45%,transparent)] bg-[color-mix(in_oklab,var(--accent-2)_10%,transparent)] p-3 text-sm">
          Versión de demostración: el aviso por correo del día 5 todavía no se envía.
        </p>
      )}

      <section aria-label="Elige tu plan para después de la prueba" className="mt-2">
        <h2 className="text-lg font-semibold">Después de la prueba, elige cómo seguir</h2>

        <div role="tablist" aria-label="Tipo de plan" className="mt-4 flex gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] p-1">
          {(Object.keys(PLANES) as Perfil[]).map((id) => {
            const activo = id === perfil;
            return (
              <button
                key={id}
                type="button"
                role="tab"
                aria-selected={activo}
                onClick={() => setPerfil(id)}
                className={`flex min-h-12 flex-1 flex-col items-center justify-center rounded-[var(--radius-button)] px-2 text-sm font-semibold transition-colors duration-200 [touch-action:manipulation] ${
                  activo ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-secondary)]'
                }`}
              >
                {PLANES[id].nombre}
                <span className="text-xs font-medium opacity-80">{PLANES[id].alcance}</span>
              </button>
            );
          })}
        </div>

        <div role="radiogroup" aria-label="Pago anual o mensual" className="mt-4 flex flex-col gap-3">
          {(['anual', 'mensual'] as Ciclo[]).map((c) => {
            const info = plan.ciclos[c];
            const activo = ciclo === c;
            return (
              <motion.button
                key={c}
                type="button"
                role="radio"
                aria-checked={activo}
                whileTap={{ scale: 0.98 }}
                onClick={() => setCiclo(c)}
                style={
                  activo
                    ? {
                        border: '2px solid transparent',
                        background:
                          'linear-gradient(var(--surface), var(--surface)) padding-box, linear-gradient(135deg, color-mix(in oklab, var(--accent) 80%, transparent), color-mix(in oklab, var(--accent-2) 35%, transparent) 70%) border-box',
                      }
                    : undefined
                }
                className={`relative flex items-center gap-4 rounded-[var(--radius-card)] border-2 p-4 text-left transition-colors duration-150 [touch-action:manipulation] ${
                  activo
                    ? ''
                    : 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface)]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                    activo ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[color-mix(in_oklab,var(--text-tertiary)_50%,transparent)]'
                  }`}
                >
                  {activo && <Check size={14} strokeWidth={3} color="var(--bg)" />}
                </span>
                <span className="flex-1">
                  <span className="flex items-center gap-2 text-base font-semibold">
                    {info.etiqueta}
                  </span>
                  <span className="mt-1 block text-sm text-[var(--text-secondary)]">{info.detalle}</span>
                  {info.insignia && (
                    <span className="mt-2 inline-block whitespace-nowrap rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-semibold text-[var(--bg)]">{info.insignia}</span>
                  )}
                </span>
                <span className="text-right">
                  <span className="block text-2xl font-bold tabular-nums [font-family:var(--font-display)]">{info.precioMes}</span>
                  <span className="block text-xs text-[var(--text-secondary)]">al mes</span>
                </span>
              </motion.button>
            );
          })}
        </div>

      </section>

      <div className="mt-6">
        <Link
          href={destino}
          aria-busy={abriendo}
          onClick={(e) => {
            if (abriendo) {
              e.preventDefault();
              return;
            }
            setAbriendo(true);
            guardarPlan({ perfil, ciclo });
            track('prueba_elegida', { perfil, ciclo });
          }}
          className="flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] shadow-[0_8px_32px_color-mix(in_oklab,var(--accent)_25%,transparent)] transition-transform active:scale-95 [touch-action:manipulation]"
        >
          {abriendo ? 'Abriendo…' : `Empezar mis ${TRIAL_DIAS} días gratis`}
        </Link>
        <Link href="/" className="mx-auto mt-2 flex h-12 w-fit items-center px-4 text-sm text-[var(--text-secondary)] underline">
          Ahora no
        </Link>

        <ul className="mt-6 flex flex-col gap-2">
          {plan.incluye.map((linea) => (
            <li key={linea} className="flex items-start gap-3 text-sm text-[var(--text-secondary)]">
              <span aria-hidden="true" className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,transparent)]">
                <Check size={12} strokeWidth={2.5} color="var(--accent)" />
              </span>
              {linea}
            </li>
          ))}
        </ul>
        <p className="mt-4 text-sm text-[var(--text-secondary)]">
          Al terminar la prueba te pedimos el pago solo si decides seguir (precios en dólares). Cancelas cuando quieras. Los datos de tus empresas son privados: nadie más los ve.
        </p>
      </div>
    </Marco>
  );
}

function useVisto() {
  useEffect(() => {
    track('planes_visto');
  }, []);
}
