'use client';

// Cuestionario del diagnóstico: una pregunta por pantalla, escala de madurez 0–4, «No aplica» con
// justificación y «No tengo la información». Guarda cada respuesta al instante (se puede salir y
// volver). Auto-avanza a los 300 ms en la escala. Las respuestas no puntúan hasta ver resultados.

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { AlertCircle, Check, HelpCircle, MinusCircle } from 'lucide-react';
import { Marco } from '@/components/flujo/Marco';
import { BANCO, DIMENSIONES, ESCALA, NOMBRE_DIMENSION } from '@/lib/diagnostico/banco';
import { guardarRespuesta, leerEvaluacion, primeraPendiente, useEvaluacion } from '@/lib/diagnostico/almacen';
import { SinEmpresa } from '@/components/empresas/SinEmpresa';
import { useEmpresaActiva } from '@/lib/empresas/almacen';
import type { Empresa } from '@/lib/empresas/reglas';
import type { Respuesta, Valor } from '@/lib/diagnostico/motor';
import { useSesionRequerida } from '@/lib/useSesion';

const EASE = [0.32, 0.72, 0, 1] as const;

export function Cuestionario({ pedida }: { pedida: string | null }) {
  const { listo } = useSesionRequerida();
  if (!listo) {
    return (
      <Marco atras={{ href: '/app', etiqueta: 'Volver al panel' }}>
        <div className="h-32 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)]" />
      </Marco>
    );
  }
  return <ConEmpresa pedida={pedida} />;
}

function ConEmpresa({ pedida }: { pedida: string | null }) {
  const { activa } = useEmpresaActiva();
  if (!activa) return <SinEmpresa />;
  // key: al cambiar de empresa el cuestionario se vuelve a montar en SU primera pregunta pendiente.
  return <CuestionarioAbierto key={activa.id} pedida={pedida} empresa={activa} />;
}

function CuestionarioAbierto({ pedida, empresa }: { pedida: string | null; empresa: Empresa }) {
  const reduce = useReducedMotion();
  const { respuestas } = useEvaluacion(empresa.id);
  const [indice, setIndice] = useState(() => {
    // Se abre en la pregunta pedida (desde «Áreas de atención»); si no, en la primera pendiente.
    const i = BANCO.findIndex((p) => p.id === pedida);
    return i >= 0 ? i : Math.min(primeraPendiente(leerEvaluacion(empresa.id).respuestas), BANCO.length);
  });
  const [naAbierto, setNaAbierto] = useState(false);
  const [justificacion, setJustificacion] = useState('');
  const [pistaNa, setPistaNa] = useState(false);
  const [deshacer, setDeshacer] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);
  const formularioNa = useRef<HTMLFormElement>(null);
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(
    () => () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    },
    []
  );

  useEffect(() => {
    titulo.current?.focus({ preventScroll: true });
  }, [indice]);

  const respondidas = BANCO.filter((p) => respuestas[p.id]).length;
  const enFin = indice >= BANCO.length;
  const pregunta = enFin ? null : BANCO[indice];
  const actual = pregunta ? respuestas[pregunta.id] : undefined;

  const ir = (i: number) => {
    setNaAbierto(false);
    setJustificacion('');
    setPistaNa(false);
    setDeshacer(null);
    setIndice(Math.max(0, Math.min(BANCO.length, i)));
  };

  const responder = (r: Respuesta, avanzarEn = 300) => {
    if (!pregunta) return;
    const { guardado } = guardarRespuesta(empresa.id, pregunta.id, r);
    setFallo(!guardado);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => ir(indice + 1), reduce ? 0 : avanzarEn);
  };

  /** «No tengo la información»: se guarda, avisa y deja 2 s para deshacer antes de pasar a la siguiente. */
  const marcarSinInfo = () => {
    if (!pregunta) return;
    responder({ tipo: 'sin_info' }, 4000);
    setDeshacer(pregunta.id);
  };

  const deshacerSinInfo = () => {
    if (!pregunta) return;
    if (temporizador.current) clearTimeout(temporizador.current);
    guardarRespuesta(empresa.id, pregunta.id, null);
    setDeshacer(null);
  };

  const dimensionPreguntas = pregunta ? BANCO.filter((p) => p.dimension === pregunta.dimension) : [];
  const posicion = pregunta ? dimensionPreguntas.findIndex((p) => p.id === pregunta.id) + 1 : 0;
  const justificacionValida = pregunta?.naHabilitable ? true : justificacion.trim().length >= 5;

  return (
    <Marco
      atras={indice > 0 ? { onClick: () => ir(indice - 1), etiqueta: 'Volver a la pregunta anterior' } : { href: '/app', etiqueta: 'Volver al panel' }}
      cerrar={{ href: '/app', etiqueta: 'Guardar y salir al panel' }}
      progreso={Math.max(4, (respondidas / BANCO.length) * 100)}
      segmentos={DIMENSIONES.map((d) => {
        const delaDim = BANCO.filter((p) => p.dimension === d.id);
        return delaDim.filter((p) => respuestas[p.id]).length / delaDim.length;
      })}
      progresoEtiqueta={`${respondidas} de ${BANCO.length} preguntas respondidas`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={indice}
          initial={reduce ? { opacity: 0 } : { opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: EASE }}
          className="flex flex-1 flex-col"
        >
          {pregunta ? (
            <>
              <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
                {NOMBRE_DIMENSION[pregunta.dimension]} · {posicion} de {dimensionPreguntas.length}
              </p>
              <h1
                ref={titulo}
                tabIndex={-1}
                className="mt-2 text-balance text-2xl font-bold leading-snug outline-none [font-family:var(--font-display)]"
              >
                {pregunta.texto}
              </h1>

              {deshacer === pregunta.id && (
                <p role="status" className="mt-4 flex items-center justify-between gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[var(--chip-bg)] px-4 py-2 text-sm">
                  Marcada sin información.
                  <button type="button" onClick={deshacerSinInfo} className="h-12 px-3 font-semibold text-[var(--accent)] underline">
                    Deshacer
                  </button>
                </p>
              )}

              <div role="radiogroup" aria-label="Qué tan madura es esta práctica" className="mt-6 flex flex-col gap-2">
                {ESCALA.map((o) => {
                  const activo = actual?.tipo === 'valor' && actual.valor === o.valor;
                  return (
                    <motion.button
                      key={o.valor}
                      type="button"
                      role="radio"
                      aria-checked={activo}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => responder({ tipo: 'valor', valor: o.valor as Valor })}
                      className={`flex min-h-14 w-full items-center gap-3 rounded-[var(--radius-card)] border px-4 py-3 text-left transition-colors duration-150 [touch-action:manipulation] ${
                        activo
                          ? 'border-[var(--accent)] bg-[var(--chip-bg)]'
                          : 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface)]'
                      }`}
                    >
                      <span className="flex-1">
                        <span className="block text-base font-semibold leading-snug">{o.titulo}</span>
                        <span className="mt-1 block text-sm leading-snug text-[var(--text-secondary)]">{o.detalle}</span>
                      </span>
                      <span
                        aria-hidden="true"
                        className={`flex size-6 shrink-0 items-center justify-center rounded-full border ${
                          activo ? 'border-[var(--accent)] bg-[var(--accent)]' : 'border-[color-mix(in_oklab,var(--text-tertiary)_50%,transparent)]'
                        }`}
                      >
                        {activo && <Check size={14} strokeWidth={3} color="var(--bg)" />}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <div className="mt-3 grid grid-cols-2 gap-2">
                <BotonSecundario
                  activo={actual?.tipo === 'na' || naAbierto}
                  icono={<MinusCircle size={16} aria-hidden="true" />}
                  onClick={() => {
                    setNaAbierto(true);
                    setJustificacion(actual?.tipo === 'na' ? (actual.justificacion ?? '') : '');
                    setTimeout(() => formularioNa.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'nearest' }), 50);
                  }}
                >
                  No aplica
                </BotonSecundario>
                <BotonSecundario
                  activo={actual?.tipo === 'sin_info'}
                  icono={<HelpCircle size={16} aria-hidden="true" />}
                  onClick={marcarSinInfo}
                >
                  No tengo la información
                </BotonSecundario>
              </div>

              {naAbierto && (
                <form
                  ref={formularioNa}
                  noValidate
                  className="mt-3 flex flex-col gap-3"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!justificacionValida) {
                      setPistaNa(true);
                      return;
                    }
                    responder({ tipo: 'na', justificacion: justificacion.trim() }, 0);
                  }}
                >
                  <label htmlFor="justificacion" className="text-sm font-medium text-[var(--text-secondary)]">
                    {pregunta.naHabilitable ? '¿Por qué no aplica? (opcional)' : '¿Por qué no aplica a tu empresa?'}
                  </label>
                  <input
                    id="justificacion"
                    autoFocus
                    value={justificacion}
                    maxLength={140}
                    onChange={(e) => setJustificacion(e.target.value)}
                    placeholder="Ej.: Solo trabajamos en oficina"
                    className="h-14 w-full rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] bg-[var(--surface)] px-4 text-base placeholder:text-[var(--text-tertiary)]"
                  />
                  {pistaNa && !justificacionValida ? (
                    <p role="alert" className="flex items-start gap-2 text-sm text-[var(--accent-2)]">
                      <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                      Escribe una frase corta (mínimo 5 letras) para explicar por qué no aplica.
                    </p>
                  ) : (
                    !pregunta.naHabilitable && (
                      <p className="text-sm text-[var(--text-secondary)]">
                        Si el perfil de tu empresa no lo justifica, esta pregunta queda marcada para revisarla en el resultado.
                      </p>
                    )
                  )}
                  <button
                    type="submit"
                    className="h-14 rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] transition-transform active:scale-95 [touch-action:manipulation]"
                  >
                    Guardar y seguir
                  </button>
                </form>
              )}

              {fallo && (
                <p role="alert" className="mt-3 flex items-start gap-2 text-sm text-[var(--accent-2)]">
                  <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
                  No pudimos guardar en este navegador. Tu respuesta sigue aquí, pero podrías perderla al salir.
                </p>
              )}

              <div className="mt-auto flex items-center justify-between pt-6">
                <p className="text-sm text-[var(--text-secondary)]">
                  {respondidas} de {BANCO.length} respondidas
                </p>
                <button type="button" onClick={() => ir(indice + 1)} className="h-12 px-2 text-sm text-[var(--text-secondary)] underline">
                  Saltar por ahora
                </button>
              </div>
            </>
          ) : (
            <Fin respondidas={respondidas} onVolver={() => ir(Math.min(primeraPendiente(respuestas), BANCO.length - 1))} refTitulo={titulo} />
          )}
        </motion.div>
      </AnimatePresence>
    </Marco>
  );
}

function BotonSecundario({
  activo,
  icono,
  onClick,
  children,
}: {
  activo: boolean;
  icono: React.ReactNode;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={activo}
      className={`flex min-h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] border px-3 py-2 text-center text-sm font-medium leading-snug transition-colors [touch-action:manipulation] ${
        activo
          ? 'border-[var(--accent)] bg-[var(--chip-bg)] text-[var(--text-primary)]'
          : 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] text-[var(--text-secondary)]'
      }`}
    >
      {icono}
      {children}
    </button>
  );
}

function Fin({
  respondidas,
  onVolver,
  refTitulo,
}: {
  respondidas: number;
  onVolver: () => void;
  refTitulo: React.RefObject<HTMLHeadingElement | null>;
}) {
  const pendientes = BANCO.length - respondidas;
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">
        {pendientes === 0 ? 'Diagnóstico completo' : 'Llegaste al final'}
      </p>
      <h1 ref={refTitulo} tabIndex={-1} className="mt-2 text-balance text-3xl font-bold leading-tight outline-none [font-family:var(--font-display)]">
        {pendientes === 0 ? 'Respondiste las 40 preguntas' : `Te quedan ${pendientes} sin responder`}
      </h1>
      <p className="mt-3 text-base text-[var(--text-secondary)]">
        {pendientes === 0
          ? 'Ya puedes ver tu resultado por dimensión y las áreas de atención.'
          : 'Puedes ver el resultado ahora (será provisional) o volver a las pendientes.'}
      </p>
      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Link
          href="/app/resultados"
          className="flex h-14 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] transition-transform active:scale-95 [touch-action:manipulation]"
        >
          Ver mis resultados
        </Link>
        {pendientes > 0 && (
          <button
            type="button"
            onClick={onVolver}
            className="h-14 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] text-base font-medium [touch-action:manipulation]"
          >
            Volver a las pendientes
          </button>
        )}
      </div>
    </>
  );
}
