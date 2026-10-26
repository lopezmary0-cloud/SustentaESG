'use client';

// Pantalla de planes (paywall). Hoy no cobra nada: pide crear la cuenta y empieza la prueba de
// 7 días sin tarjeta. El cobro real (Hotmart) llega en la fase de servicios y sube esta misma cuenta.
// Copy derivado de FICHA-AVATAR.md; estructura de 50-DISENO-ONBOARDING-PAYWALL.md.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { CalendarCheck, Check, ChevronDown, Flag, Sparkles } from 'lucide-react';
import { Marco } from '@/components/flujo/Marco';
import { RuedaMini } from '@/components/flujo/RuedaMini';
import { track } from '@/lib/analytics';
import { MODO_DEMO, sesionActual } from '@/lib/auth';
import { guardarPlan, leerInicio, leerPlan, perfilSugerido, type Ciclo, type Motivo, type Perfil } from '@/lib/demo/store';
import { NOMBRE_DIMENSION } from '@/lib/diagnostico/banco';
import { lecturaRapida } from '@/lib/diagnostico/rapida';
import { PLANES } from '@/lib/planes';
import { TRIAL_DIAS } from '@/lib/site';
import { useMontado } from '@/lib/useMontado';

const LINEA_TIEMPO = [
  { icono: Sparkles, cuando: 'Hoy', dias: 0, titulo: 'Empiezas' },
  { icono: CalendarCheck, cuando: 'Día 5', dias: 5, titulo: 'Aviso' },
  { icono: Flag, cuando: `Día ${TRIAL_DIAS}`, dias: TRIAL_DIAS, titulo: 'Decides' },
];

/** Titular según para qué vino la persona (respuesta del recorrido): la promesa se parece a su motivo. */
const TITULARES: Record<Motivo, { antes: string; acento: string }> = {
  cliente: { antes: 'Responde a clientes y bancos', acento: 'sin reconstruir datos' },
  direccion: { antes: 'Muestra a tu dirección cómo estás,', acento: 'con datos ordenados' },
  ordenar: { antes: 'Deja de reconstruir tus datos:', acento: 'empieza hoy' },
  cero: { antes: 'Deja de reconstruir tus datos:', acento: 'empieza hoy' },
  otra: { antes: 'Deja de reconstruir tus datos:', acento: 'empieza hoy' },
};

const formatoDia = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short' });
const formatoDiaLargo = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'long' });
const sumarDias = (base: Date, dias: number) => new Date(base.getFullYear(), base.getMonth(), base.getDate() + dias);

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
  const [motivo] = useState<Motivo>(() => leerInicio().motivo ?? 'otra');
  const [hoy] = useState(() => new Date());
  const titular = TITULARES[motivo];
  const reduce = useReducedMotion();
  /** Entrada escalonada (60 ms entre bloques); sin desplazamiento si la persona pidió menos movimiento. */
  const entrada = (i: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: reduce ? 0 : 0.06 * i, ease: [0.32, 0.72, 0, 1] as const },
  });
  const [lectura] = useState(() => lecturaRapida(leerInicio().rapida));
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
          {titular.antes} <span className="text-[var(--accent)]">{titular.acento}</span>
        </h1>
        <RuedaMini tamano={56} />
      </div>
      <p className="mt-2 text-base text-[var(--text-secondary)]">
        Tu prueba de {TRIAL_DIAS} días termina el {formatoDiaLargo.format(sumarDias(hoy, TRIAL_DIAS))}. Sin tarjeta y sin cobro automático.
      </p>

      {lectura.completa && (lectura.fortaleza || lectura.atencion.length > 0) && (
        <p className="mt-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_35%,transparent)] bg-[var(--chip-bg)] p-3 text-sm leading-relaxed">
          <strong className="font-semibold">Tu lectura rápida:</strong>{' '}
          {lectura.fortaleza && <>punto fuerte, {NOMBRE_DIMENSION[lectura.fortaleza]}; </>}
          {lectura.atencion.length > 0 && <>por dónde empezar, {lectura.atencion.map((d) => NOMBRE_DIMENSION[d]).join(' y ')}.</>}
        </p>
      )}

      <ol className="mt-6 grid grid-cols-[repeat(3,minmax(0,1fr))] gap-3" aria-label="Qué pasa durante la prueba">
        {LINEA_TIEMPO.map((paso, i) => (
          <motion.li key={paso.cuando} {...entrada(i)} className="rounded-[var(--radius-card)] bg-[var(--surface)] p-3 shadow-[var(--shadow-1)]">
            <span aria-hidden="true" className="flex size-10 items-center justify-center rounded-full bg-[var(--chip-bg)]">
              <paso.icono size={18} color="var(--accent)" />
            </span>
            <p className="mt-3 text-xs font-semibold uppercase tracking-widest text-[var(--text-secondary)]">{paso.cuando}</p>
            <p className="mt-1 text-base font-semibold leading-snug">{paso.titulo}</p>
            <p className="mt-1 text-sm tabular-nums text-[var(--text-secondary)]">{formatoDia.format(sumarDias(hoy, paso.dias))}</p>
          </motion.li>
        ))}
      </ol>
      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        Todo desbloqueado desde hoy. El día {TRIAL_DIAS} eliges si sigues; si no, tu diagnóstico queda guardado para consultarlo.
      </p>

      <motion.section {...entrada(2)} aria-label="Elige tu plan para después de la prueba" className="mt-6">
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
                  <span className="mt-1 block text-sm text-[var(--text-secondary)]">
                    {info.detalle}
                    {info.antes && (
                      <>
                        {' '}
                        <s className="opacity-70" aria-label={`antes ${info.antes}`}>
                          {info.antes}
                        </s>
                      </>
                    )}
                  </span>
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

      </motion.section>

      <motion.div {...entrada(3)} className="mt-6">
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
        <p className="mt-3 text-center text-sm text-[var(--text-secondary)]">Sin tarjeta. No se cobra nada automáticamente.</p>
        <Link
          href="/"
          onClick={() => track('planes_salida', { perfil, ciclo })}
          className="mx-auto mt-2 flex h-12 w-fit items-center px-4 text-sm text-[var(--text-secondary)] underline"
        >
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
        <div className="mt-6 flex flex-col">
          <Pregunta pregunta="¿Cuándo se me cobrará?">
            No se cobra nada automáticamente. El {formatoDiaLargo.format(sumarDias(hoy, TRIAL_DIAS))} termina tu prueba y, si quieres seguir, ese día eliges un plan (precios en dólares).
          </Pregunta>
          <Pregunta pregunta="¿Y si no sigo?">
            Tu diagnóstico queda guardado para consultarlo. Los datos de tus empresas son privados: nadie más los ve.
          </Pregunta>
        </div>
        {MODO_DEMO && (
          <p className="mt-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent-2)_45%,transparent)] bg-[color-mix(in_oklab,var(--accent-2)_10%,transparent)] p-3 text-sm">
            Versión de demostración: el aviso por correo del día 5 todavía no se envía.
          </p>
        )}
        <p className="mt-4 flex flex-wrap justify-center gap-x-4 text-sm text-[var(--text-secondary)]">
          <Link href="/terminos" className="flex h-12 items-center underline">
            Términos
          </Link>
          <Link href="/privacidad" className="flex h-12 items-center underline">
            Privacidad
          </Link>
          <Link href="/reembolsos" className="flex h-12 items-center underline">
            Reembolsos
          </Link>
        </p>
      </motion.div>
    </Marco>
  );
}

/** Pregunta frecuente en el punto de decisión: se abre y se cierra, con el texto a la vista al abrir. */
function Pregunta({ pregunta, children }: { pregunta: string; children: React.ReactNode }) {
  return (
    <details className="group border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)]">
      <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between gap-3 text-base font-medium">
        {pregunta}
        <ChevronDown size={18} className="shrink-0 transition-transform group-open:rotate-180" aria-hidden="true" />
      </summary>
      <p className="pb-3 text-sm leading-relaxed text-[var(--text-secondary)]">{children}</p>
    </details>
  );
}

function useVisto() {
  useEffect(() => {
    track('planes_visto');
  }, []);
}
