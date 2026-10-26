'use client';

// Panel de la app (destino tras crear la cuenta): el diagnóstico es el protagonista; debajo, la prueba
// gratis. Sin sesión, lleva a /entrar. El plan de mejora y las varias empresas llegan en etapas siguientes.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, useReducedMotion } from 'motion/react';
import { Building2, CalendarClock, Check, ChevronRight, ClipboardList, History, LogOut } from 'lucide-react';
import { BANCO, DIMENSIONES, NOMBRE_DIMENSION } from '@/lib/diagnostico/banco';
import { useEvaluacion } from '@/lib/diagnostico/almacen';
import { calcularDiagnostico } from '@/lib/diagnostico/motor';
import { useEmpresaActiva } from '@/lib/empresas/almacen';
import type { Empresa } from '@/lib/empresas/reglas';
import { useHistorial } from '@/lib/historial/almacen';
import { Marco } from '@/components/flujo/Marco';
import { cerrarSesion, MODO_DEMO, sesionActual } from '@/lib/auth';
import { leerInicio, leerPlan, type Cuenta } from '@/lib/demo/store';
import { lecturaRapida } from '@/lib/diagnostico/rapida';
import { TRIAL_DIAS } from '@/lib/site';
import { usePlanDeMejora } from '@/lib/plan/almacen';
import { useCuenta } from '@/lib/useCuenta';
import { useMontado } from '@/lib/useMontado';

const DIA_MS = 24 * 60 * 60 * 1000;
const EASE = [0.32, 0.72, 0, 1] as const;

export function Panel() {
  const montado = useMontado();
  const router = useRouter();
  const [cuenta] = useState<Cuenta | null>(() => (typeof window === 'undefined' ? null : sesionActual()));

  useEffect(() => {
    if (montado && !cuenta) router.replace('/entrar');
  }, [montado, cuenta, router]);

  if (!montado || !cuenta) return <Marco><div className="h-32 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)]" /></Marco>;
  return <PanelAbierto cuenta={cuenta} />;
}

function PanelAbierto({ cuenta }: { cuenta: Cuenta }) {
  const router = useRouter();
  const { activa, estado } = useEmpresaActiva();
  if (!activa) {
    return (
      <Marco ancho={560}>
        <h1 className="text-balance text-3xl font-bold leading-tight [font-family:var(--font-display)]">Empieza añadiendo tu empresa</h1>
        <p className="mt-2 text-base text-[var(--text-secondary)]">El diagnóstico, el plan y el historial se guardan por empresa.</p>
        <Link
          href="/app/empresas"
          className="mt-6 flex h-14 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] transition-transform active:scale-95 [touch-action:manipulation]"
        >
          Añadir mi empresa
        </Link>
        <button
          type="button"
          onClick={() => {
            cerrarSesion();
            router.replace('/');
          }}
          className="mt-8 flex h-12 items-center gap-2 text-base text-[var(--text-secondary)] underline"
        >
          <LogOut size={18} aria-hidden="true" /> Cerrar sesión
        </button>
      </Marco>
    );
  }
  return <PanelEmpresa key={activa.id} cuenta={cuenta} empresa={activa} totalEmpresas={estado.empresas.length} />;
}

function PanelEmpresa({ cuenta, empresa, totalEmpresas }: { cuenta: Cuenta; empresa: Empresa; totalEmpresas: number }) {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [plan] = useState(() => leerPlan());
  const evaluacion = useEvaluacion(empresa.id);
  const plan_ = usePlanDeMejora(empresa.id);
  const historial = useHistorial(empresa.id);
  const respondidas = BANCO.filter((p) => evaluacion.respuestas[p.id]).length;
  const completo = respondidas === BANCO.length;
  const general = calcularDiagnostico(evaluacion.respuestas).general;
  const puntajeVisible = useCuenta(general.puntaje === null ? 0 : Math.round(general.puntaje));
  const [lectura] = useState(() => lecturaRapida(leerInicio().rapida));
  const lecturaHecha = lectura.completa;
  // «Primeros pasos»: la lectura rápida se hizo en el recorrido de inicio, solo vale para la primera empresa.
  const pasos = [
    ...(empresa.id === 'principal' ? [{ texto: 'Haz tu lectura rápida', hecho: lecturaHecha, href: '/onboarding' }] : []),
    { texto: 'Completa tu diagnóstico de 40 preguntas', hecho: completo, href: '/app/diagnostico' },
    { texto: 'Añade tu primera acción al plan', hecho: plan_.acciones.length > 0, href: '/app/plan' },
    { texto: 'Guarda tu primera fotografía en el historial', hecho: historial.fotografias.length > 0, href: '/app/resultados' },
  ];
  const pasosHechos = pasos.filter((p) => p.hecho).length;
  const [diasRestantes] = useState(() =>
    Math.max(0, TRIAL_DIAS - Math.floor((Date.now() - cuenta.pruebaInicio) / DIA_MS))
  );

  const entrada = (i: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: reduce ? 0 : 0.06 * i, ease: EASE },
  });

  const claseBotonPrimario =
    'mt-5 flex h-14 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] shadow-[0_8px_32px_color-mix(in_oklab,var(--accent)_25%,transparent)] transition-transform active:scale-95 [touch-action:manipulation]';
  const claseBotonSecundario =
    'mt-2 flex h-12 items-center justify-center text-base text-[var(--text-secondary)] underline';

  return (
    <Marco ancho={560}>
      {MODO_DEMO && (
        <p className="mb-6 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent-2)_45%,transparent)] bg-[color-mix(in_oklab,var(--accent-2)_10%,transparent)] p-3 text-sm text-[var(--text-primary)]">
          Versión de demostración: tus datos se guardan solo en este navegador.
        </p>
      )}

      <Link
        href="/app/empresas"
        aria-label={`Empresa activa: ${empresa.nombre}. Cambiar de empresa`}
        className="flex min-h-12 items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] px-4 transition-transform active:scale-95 [touch-action:manipulation]"
      >
        <span className="flex min-w-0 items-center gap-3">
          <Building2 size={18} className="shrink-0 text-[var(--accent)]" aria-hidden="true" />
          <span className="truncate text-base font-semibold">{empresa.nombre}</span>
        </span>
        <span className="flex shrink-0 items-center gap-1 text-sm text-[var(--text-secondary)]">
          {totalEmpresas > 1 ? `${totalEmpresas} empresas` : 'Mis empresas'}
          <ChevronRight size={16} aria-hidden="true" />
        </span>
      </Link>
      <h1 className="mt-6 text-balance text-3xl font-bold leading-tight [font-family:var(--font-display)]">Tu diagnóstico de sostenibilidad</h1>

      <motion.section
        {...entrada(0)}
        aria-label="Tu diagnóstico"
        className="mt-6 rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-2)]"
        style={{
          border: '1px solid transparent',
          background:
            'linear-gradient(var(--surface), var(--surface)) padding-box, linear-gradient(135deg, color-mix(in oklab, var(--accent) 55%, transparent), transparent 65%) border-box',
        }}
      >
        {respondidas > 0 && general.puntaje !== null ? (
          <div className="flex items-baseline justify-between gap-3">
            <p className="text-4xl font-bold tabular-nums [font-family:var(--font-display)]">
              {puntajeVisible}
              <span className="text-lg font-semibold text-[var(--text-secondary)]"> / 100</span>
            </p>
            <p className="text-base font-semibold text-[var(--accent)]">Nivel {general.nivel}</p>
          </div>
        ) : (
          <p className="text-xl font-semibold leading-snug [font-family:var(--font-display)]">
            {respondidas === 0 ? 'Empieza por la primera dimensión' : `Llevas ${respondidas} de ${BANCO.length} preguntas`}
          </p>
        )}
        {respondidas > 0 && (
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {completo ? 'Respondiste las 40 preguntas.' : `${respondidas} de ${BANCO.length} preguntas respondidas.`}
            {general.estado === 'provisional' && ' Resultado provisional.'}
          </p>
        )}

        {lecturaHecha && empresa.id === 'principal' && (lectura.fortaleza || lectura.atencion.length > 0) && (
          <p className="mt-3 text-sm leading-relaxed text-[var(--text-secondary)]">
            <strong className="font-semibold text-[var(--text-primary)]">Tu lectura rápida:</strong>{' '}
            {lectura.fortaleza && <>punto fuerte, {NOMBRE_DIMENSION[lectura.fortaleza]}; </>}
            {lectura.atencion.length > 0 && <>por dónde empezar, {lectura.atencion.map((d) => NOMBRE_DIMENSION[d]).join(' y ')}.</>}{' '}
            <Link href="/onboarding" className="font-medium text-[var(--accent)] underline">
              Verla
            </Link>
          </p>
        )}

        <ul className="mt-4 flex flex-col gap-3">
          {DIMENSIONES.map((d) => {
            const total = BANCO.filter((p) => p.dimension === d.id).length;
            const hechas = BANCO.filter((p) => p.dimension === d.id && evaluacion.respuestas[p.id]).length;
            return (
              <li key={d.id}>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--text-primary)]">{d.nombre}</span>
                  <span className="tabular-nums text-[var(--text-secondary)]">
                    {hechas} de {total}
                  </span>
                </div>
                <div className="mt-1 h-1 overflow-hidden rounded-full bg-[var(--surface-2)]">
                  <motion.div
                    className="h-full origin-left rounded-full bg-[var(--accent)]"
                    initial={{ scaleX: reduce ? hechas / total : 0 }}
                    animate={{ scaleX: hechas / total }}
                    transition={{ duration: 0.5, delay: reduce ? 0 : 0.2, ease: EASE }}
                  />
                </div>
              </li>
            );
          })}
        </ul>

        {completo ? (
          <>
            <Link href="/app/resultados" className={claseBotonPrimario}>
              Ver mis resultados
            </Link>
            <Link href="/app/diagnostico" className={claseBotonSecundario}>
              Revisar mis respuestas
            </Link>
          </>
        ) : (
          <>
            <Link href="/app/diagnostico" className={claseBotonPrimario}>
              {respondidas === 0 ? 'Empezar mi diagnóstico' : 'Continuar mi diagnóstico'}
            </Link>
            {respondidas > 0 && (
              <Link href="/app/resultados" className={claseBotonSecundario}>
                Ver mis resultados
              </Link>
            )}
          </>
        )}
      </motion.section>

      {respondidas > 0 && (
        <motion.section {...entrada(1)} aria-label="Tu plan de mejora" className="mt-4 rounded-[var(--radius-card)] bg-[var(--surface)] p-5 shadow-[var(--shadow-1)]">
          <div className="flex items-center gap-4">
            <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
              <ClipboardList size={22} color="var(--accent)" />
            </span>
            <div>
              <p className="text-xl font-bold [font-family:var(--font-display)]">Tu plan de mejora</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {plan_.acciones.length === 0
                  ? 'Elige qué hacer primero a partir de tus respuestas.'
                  : `${plan_.acciones.filter((a) => a.estado === 'hecha').length} de ${plan_.acciones.length} acciones hechas.`}
              </p>
            </div>
          </div>
          <Link
            href="/app/plan"
            className="mt-4 flex h-12 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_50%,transparent)] text-base font-semibold text-[var(--accent)] transition-transform active:scale-95 [touch-action:manipulation]"
          >
            {plan_.acciones.length === 0 ? 'Ver acciones sugeridas' : 'Abrir mi plan'}
          </Link>
          <Link href="/app/historial" className="mt-2 flex h-12 items-center justify-center gap-2 text-base text-[var(--text-secondary)] underline">
            <History size={16} aria-hidden="true" />
            {historial.fotografias.length === 0 ? 'Historial: aún sin fotografías' : `Historial (${historial.fotografias.length})`}
          </Link>
        </motion.section>
      )}

      {pasosHechos < pasos.length && (
        <motion.section
          {...entrada(2)}
          aria-label="Primeros pasos"
          className="mt-4 rounded-[var(--radius-card)] bg-[var(--surface)] p-5 shadow-[var(--shadow-1)]"
        >
          <div className="flex items-baseline justify-between">
            <h2 className="text-lg font-semibold">Primeros pasos</h2>
            <p className="text-sm tabular-nums text-[var(--text-secondary)]">
              {pasosHechos} de {pasos.length}
            </p>
          </div>
          <ul className="mt-3 flex flex-col">
            {pasos.map((p) => (
              <li key={p.texto}>
                <Link
                  href={p.href}
                  className="flex min-h-12 items-center gap-3 py-2 text-base [touch-action:manipulation]"
                  aria-label={`${p.texto}${p.hecho ? ' (hecho)' : ''}`}
                >
                  <span
                    aria-hidden="true"
                    className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                      p.hecho ? 'bg-[var(--accent)]' : 'border border-[color-mix(in_oklab,var(--text-tertiary)_55%,transparent)]'
                    }`}
                  >
                    {p.hecho && <Check size={14} strokeWidth={3} color="var(--bg)" />}
                  </span>
                  <span className={p.hecho ? 'text-[var(--text-secondary)] line-through decoration-1' : 'font-medium'}>{p.texto}</span>
                  {!p.hecho && <ChevronRight size={16} className="ml-auto shrink-0 text-[var(--text-tertiary)]" aria-hidden="true" />}
                </Link>
              </li>
            ))}
          </ul>
        </motion.section>
      )}

      <motion.section
        {...entrada(3)}
        aria-label="Tu prueba gratis"
        className="mt-4 flex items-center gap-4 rounded-[var(--radius-card)] bg-[var(--surface)] p-5 shadow-[var(--shadow-1)]"
      >
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
          <CalendarClock size={22} color="var(--accent)" />
        </span>
        <div>
          <p className="text-xl font-bold tabular-nums [font-family:var(--font-display)]">
            {diasRestantes} {diasRestantes === 1 ? 'día' : 'días'} de prueba
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {plan ? `Plan elegido para después: ${plan.perfil === 'consultor' ? 'consultor/a' : 'una empresa'}, ${plan.ciclo}.` : 'Sin tarjeta y sin cobros automáticos.'}
          </p>
        </div>
      </motion.section>

      <div className="mt-auto pt-8">
        <button
          type="button"
          onClick={() => {
            cerrarSesion();
            router.replace('/');
          }}
          className="flex h-12 items-center gap-2 text-base text-[var(--text-secondary)] underline"
        >
          <LogOut size={18} aria-hidden="true" /> Cerrar sesión
        </button>
        <p className="mt-2 text-xs text-[var(--text-tertiary)]">
          ¿Algo no funciona? <Link href="/aviso" className="underline">Contáctanos</Link>.
        </p>
      </div>
    </Marco>
  );
}
