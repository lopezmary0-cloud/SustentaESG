'use client';

// Plan de mejora: recomendaciones sugeridas por reglas (con «por qué se te sugiere esto») y «Mi plan»,
// donde cada acción tiene responsable, fecha límite y estado. Lo sugerido es borrador hasta que la
// especialista valide el catálogo; el plan es de la persona y se puede editar todo.

import { useId, useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { AlertCircle, CalendarClock, Check, ChevronDown, Circle, ClipboardList, Plus, User } from 'lucide-react';
import { Marco } from '@/components/flujo/Marco';
import { NOMBRE_DIMENSION } from '@/lib/diagnostico/banco';
import { calcularDiagnostico } from '@/lib/diagnostico/motor';
import { generarRecomendaciones, type Prioridad, type Recomendacion } from '@/lib/diagnostico/recomendaciones';
import { useEvaluacion } from '@/lib/diagnostico/almacen';
import { SinEmpresa } from '@/components/empresas/SinEmpresa';
import { AvisoDeshacer } from '@/components/flujo/AvisoDeshacer';
import { useEmpresaActiva } from '@/lib/empresas/almacen';
import type { Empresa } from '@/lib/empresas/reglas';
import {
  actualizarAccion,
  agregarAccion,
  quitarAccion,
  restaurarAccion,
  ultimoGuardadoFallo,
  usePlanDeMejora,
  vencimientoDe,
  type Accion,
  type EstadoAccion,
} from '@/lib/plan/almacen';
import { useSesionRequerida } from '@/lib/useSesion';

const EASE = [0.32, 0.72, 0, 1] as const;

const ETIQUETA_ESTADO: Record<EstadoAccion, string> = { pendiente: 'Pendiente', en_curso: 'En curso', hecha: 'Hecha' };
const ETIQUETA_PRIORIDAD: Record<Prioridad, string> = { alta: 'Prioridad alta', media: 'Prioridad media', baja: 'Prioridad baja' };
const COLOR_PRIORIDAD: Record<Prioridad, string> = { alta: 'var(--nivel-1)', media: 'var(--nivel-2)', baja: 'var(--text-secondary)' };

/** Color de la dimensión (rueda de la ficha): Ambiental, Social, Cadena, Gobernanza, Económica. */
const COLOR_DIMENSION: Record<string, string> = {
  AMB: 'var(--rueda-1)',
  SOC: 'var(--rueda-2)',
  CAD: 'var(--rueda-3)',
  GOB: 'var(--rueda-4)',
  ECO: 'var(--rueda-5)',
};
const colorDeOrigen = (origen: string | null) => COLOR_DIMENSION[origen?.match(/(AMB|SOC|GOB|ECO|CAD)\d\d/)?.[1] ?? ''] ?? 'var(--text-tertiary)';
const PREFIJO: Record<string, string> = { ambiental: 'AMB', social: 'SOC', cadena: 'CAD', gobernanza: 'GOB', economica: 'ECO' };
const colorDeDimension = (d: string) => COLOR_DIMENSION[PREFIJO[d] ?? ''] ?? 'var(--text-tertiary)';

const formatoFecha = new Intl.DateTimeFormat('es-CO', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' });
/** Fecha AAAA-MM-DD en palabras; una fecha vacía o dañada nunca rompe la pantalla. */
const fechaLegible = (f: string) => {
  const [a, m, d] = f.split('-').map(Number);
  const fecha = new Date(Date.UTC(a, m - 1, d));
  return f && !Number.isNaN(fecha.getTime()) ? formatoFecha.format(fecha) : 'Sin fecha';
};

export function PlanDeMejora() {
  const { listo } = useSesionRequerida();
  if (!listo) {
    return (
      <Marco atras={{ href: '/app', etiqueta: 'Volver al panel' }} ancho={560}>
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)]" />
      </Marco>
    );
  }
  return <ConEmpresa />;
}

function ConEmpresa() {
  const { activa } = useEmpresaActiva();
  if (!activa) return <SinEmpresa />;
  return <PlanAbierto key={activa.id} empresa={activa} />;
}

type Pestana = 'sugeridas' | 'plan';
type Filtro = 'todas' | EstadoAccion;

function PlanAbierto({ empresa }: { empresa: Empresa }) {
  const reduce = useReducedMotion();
  const evaluacion = useEvaluacion(empresa.id);
  const plan = usePlanDeMejora(empresa.id);
  const [hoy] = useState(() => new Date());
  const [pestana, setPestana] = useState<Pestana>('sugeridas');
  const [filtro, setFiltro] = useState<Filtro>('todas');
  const [abierta, setAbierta] = useState<string | null>(null);
  const [creando, setCreando] = useState(false);
  const [quitada, setQuitada] = useState<Accion | null>(null);
  const [filtroPrioridad, setFiltroPrioridad] = useState<'todas' | Prioridad>('todas');
  const [limite, setLimite] = useState(6);
  const [noGuardo, setNoGuardo] = useState(false);
  const tras = () => setNoGuardo(ultimoGuardadoFallo());

  const resultado = calcularDiagnostico(evaluacion.respuestas);
  const sugeridas = generarRecomendaciones(evaluacion.respuestas, resultado);
  const sugeridasFiltradas = sugeridas.filter((r) => filtroPrioridad === 'todas' || r.prioridad === filtroPrioridad);
  const sugeridasVistas = sugeridasFiltradas.slice(0, limite);
  const porPrioridad = {
    todas: sugeridas.length,
    alta: sugeridas.filter((r) => r.prioridad === 'alta').length,
    media: sugeridas.filter((r) => r.prioridad === 'media').length,
    baja: sugeridas.filter((r) => r.prioridad === 'baja').length,
  };
  const enPlan = new Set(plan.acciones.map((a) => a.origen).filter(Boolean));
  const respondidas = resultado.respondidas;

  const conteo = {
    todas: plan.acciones.length,
    pendiente: plan.acciones.filter((a) => a.estado === 'pendiente').length,
    en_curso: plan.acciones.filter((a) => a.estado === 'en_curso').length,
    hecha: plan.acciones.filter((a) => a.estado === 'hecha').length,
  };
  const visibles = plan.acciones
    .filter((a) => filtro === 'todas' || a.estado === filtro)
    .sort((a, b) => {
      if ((a.estado === 'hecha') !== (b.estado === 'hecha')) return a.estado === 'hecha' ? 1 : -1;
      if (a.fecha && b.fecha) return a.fecha.localeCompare(b.fecha);
      if (a.fecha || b.fecha) return a.fecha ? -1 : 1;
      return a.creada - b.creada;
    });

  const anadir = (r: Recomendacion) => {
    agregarAccion(empresa.id, { titulo: r.accion, origen: r.id, indicador: r.indicador, evidencia: r.evidencia });
    tras();
  };

  const entrada = (i: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay: reduce ? 0 : Math.min(i, 8) * 0.05, ease: EASE },
  });

  return (
    <Marco atras={{ href: '/app', etiqueta: 'Volver al panel' }} ancho={560}>
      <p className="truncate text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Plan de mejora · {empresa.nombre}</p>
      <h1 className="mt-2 text-balance text-3xl font-bold leading-tight [font-family:var(--font-display)]">Qué hacer primero</h1>

      {noGuardo && (
        <p role="alert" className="mt-4 flex items-start gap-2 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent-2)_50%,transparent)] p-3 text-sm text-[var(--accent-2)]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          No pudimos guardar este cambio en el navegador. Sal del modo privado o libera espacio, e inténtalo de nuevo.
        </p>
      )}

      <div role="tablist" aria-label="Plan de mejora" className="mt-6 flex gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] p-1">
        {(
          [
            ['sugeridas', 'Sugeridas', sugeridas.length],
            ['plan', 'Mi plan', plan.acciones.length],
          ] as const
        ).map(([id, nombre, n]) => (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={pestana === id}
            onClick={() => setPestana(id)}
            className={`flex min-h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-button)] px-3 text-base font-semibold transition-colors duration-200 [touch-action:manipulation] ${
              pestana === id ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-secondary)]'
            }`}
          >
            {nombre}
            <span className={`text-sm font-medium tabular-nums ${pestana === id ? 'opacity-80' : 'opacity-70'}`}>{n}</span>
          </button>
        ))}
      </div>

      {pestana === 'sugeridas' ? (
        <section aria-label="Acciones sugeridas" className="mt-6">
          {respondidas === 0 ? (
            <Vacio
              titulo="Primero responde tu diagnóstico"
              texto="Las acciones sugeridas salen de tus respuestas. Con unas pocas ya podemos empezar."
              href="/app/diagnostico"
              boton="Empezar mi diagnóstico"
            />
          ) : sugeridas.length === 0 ? (
            <Vacio
              titulo="No hay acciones sugeridas por ahora"
              texto="Todas tus respuestas están en «Implementada» o «Medida y mejorada». Puedes añadir tus propias acciones en «Mi plan»."
              href="/app/resultados"
              boton="Ver mis resultados"
            />
          ) : (
            <>
              <p className="text-sm text-[var(--text-secondary)]">
                Salen de tus respuestas, ordenadas por prioridad. Son un borrador: una especialista revisará este catálogo antes del lanzamiento.
              </p>
              {sugeridas.length > 6 && (
                <div role="group" aria-label="Filtrar por prioridad" className="mt-4 grid grid-cols-4 gap-2">
                  {(
                    [
                      ['todas', 'Todas'],
                      ['alta', 'Alta'],
                      ['media', 'Media'],
                      ['baja', 'Baja'],
                    ] as const
                  ).map(([id, nombre]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={filtroPrioridad === id}
                      onClick={() => {
                        setFiltroPrioridad(id);
                        setLimite(6);
                      }}
                      className={`flex h-14 flex-col items-center justify-center rounded-[var(--radius-button)] border px-1 text-sm font-medium leading-tight [touch-action:manipulation] ${
                        filtroPrioridad === id
                          ? 'border-[var(--accent)] bg-[var(--chip-bg)] text-[var(--text-primary)]'
                          : 'border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {nombre}
                      <span className="tabular-nums opacity-70">{porPrioridad[id]}</span>
                    </button>
                  ))}
                </div>
              )}
              <ul className="mt-4 flex flex-col gap-3">
                {sugeridasVistas.map((r, i) => {
                  const ya = enPlan.has(r.id);
                  return (
                    <motion.li key={r.id} {...entrada(i)} className="rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
                      <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
                        <span
                          className="rounded-full border px-2 py-0.5"
                          style={{ color: COLOR_PRIORIDAD[r.prioridad], borderColor: `color-mix(in oklab, ${COLOR_PRIORIDAD[r.prioridad]} 55%, transparent)` }}
                        >
                          {ETIQUETA_PRIORIDAD[r.prioridad]}
                        </span>
                        <span className="flex items-center gap-2 text-[var(--text-secondary)]">
                          <span aria-hidden="true" className="size-2 rounded-full" style={{ background: colorDeDimension(r.dimension) }} />
                          {NOMBRE_DIMENSION[r.dimension]}
                        </span>
                        {filtroPrioridad === 'todas' && i < 3 && <span className="text-[var(--accent)]">· Empieza por esta</span>}
                        {r.tipo === 'informacion' && <span className="text-[var(--text-secondary)]">· Falta información</span>}
                      </div>
                      <p className="mt-3 text-base font-medium leading-snug">{r.accion}</p>

                      <details className="group mt-2">
                        <summary className="flex min-h-12 cursor-pointer list-none items-center gap-2 text-sm font-medium text-[var(--accent)]">
                          Por qué se te sugiere esto
                          <ChevronDown size={16} className="transition-transform group-open:rotate-180" aria-hidden="true" />
                        </summary>
                        <div className="flex flex-col gap-2 pb-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                          <p>{r.porQue}</p>
                          <p>
                            <strong className="font-semibold text-[var(--text-primary)]">Cómo saber que avanzas:</strong> {r.indicador}.
                          </p>
                          <p>
                            <strong className="font-semibold text-[var(--text-primary)]">Qué guardar como evidencia:</strong> {r.evidencia}.
                          </p>
                        </div>
                      </details>

                      {ya ? (
                        <button
                          type="button"
                          onClick={() => setPestana('plan')}
                          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_40%,transparent)] text-base font-medium text-[var(--accent)] [touch-action:manipulation]"
                        >
                          <Check size={18} aria-hidden="true" /> En tu plan · Ver
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => anadir(r)}
                          className="mt-2 flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_60%,transparent)] text-base font-semibold text-[var(--accent)] transition-transform active:scale-95 [touch-action:manipulation]"
                        >
                          <Plus size={18} aria-hidden="true" /> Añadir a mi plan
                        </button>
                      )}
                    </motion.li>
                  );
                })}
              </ul>
              {sugeridasFiltradas.length > limite && (
                <button
                  type="button"
                  onClick={() => setLimite((n) => n + 6)}
                  className="mt-4 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] text-base font-semibold [touch-action:manipulation]"
                >
                  Ver {Math.min(6, sugeridasFiltradas.length - limite)} más ({sugeridasFiltradas.length - limite} restantes)
                </button>
              )}
            </>
          )}
        </section>
      ) : (
        <section aria-label="Mi plan" className="mt-6">
          {plan.acciones.length > 0 && (
            <div className="rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
              <div className="flex items-baseline justify-between">
                <p className="text-base font-semibold">
                  {conteo.hecha} de {conteo.todas} hechas
                </p>
                <p className="text-sm tabular-nums text-[var(--text-secondary)]">{Math.round((conteo.hecha / conteo.todas) * 100)}%</p>
              </div>
              <div
                className="mt-2 flex h-2 gap-1"
                role="img"
                aria-label={`${conteo.hecha} hechas, ${conteo.en_curso} en curso, ${conteo.pendiente} pendientes`}
              >
                {(
                  [
                    ['hecha', 'var(--accent)'],
                    ['en_curso', 'var(--nivel-2)'],
                    ['pendiente', 'color-mix(in oklab, var(--text-tertiary) 35%, transparent)'],
                  ] as const
                ).map(([estado, color]) =>
                  conteo[estado] > 0 ? (
                    <motion.span
                      key={estado}
                      className="h-full origin-left rounded-full"
                      style={{ background: color, flexGrow: conteo[estado], flexBasis: 0 }}
                      initial={{ scaleX: reduce ? 1 : 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: reduce ? 0 : 0.4, ease: EASE }}
                    />
                  ) : null
                )}
              </div>
              <p className="mt-2 flex gap-4 text-xs text-[var(--text-secondary)]">
                <span>{conteo.hecha} hechas</span>
                <span>{conteo.en_curso} en curso</span>
                <span>{conteo.pendiente} pendientes</span>
              </p>
            </div>
          )}

          {quitada && (
            <AvisoDeshacer
              texto="Acción quitada del plan."
              onCerrar={() => setQuitada(null)}
              onDeshacer={() => {
                restaurarAccion(empresa.id, quitada);
                setQuitada(null);
              }}
            />
          )}

          {creando ? (
            <div className="mt-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[var(--surface)] p-4">
              <p className="text-base font-semibold">Nueva acción</p>
              <EditorAccion
                inicial={{ titulo: '', responsable: '', fecha: '', estado: 'pendiente', nota: '' }}
                etiquetaGuardar="Añadir al plan"
                onGuardar={(c) => {
                  agregarAccion(empresa.id, c);
                  tras();
                  setCreando(false);
                  setFiltro('todas');
                }}
                onCancelar={() => setCreando(false)}
              />
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setCreando(true)}
              className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] text-base font-semibold [touch-action:manipulation]"
            >
              <Plus size={18} aria-hidden="true" /> Añadir una acción propia
            </button>
          )}

          {plan.acciones.length === 0 && !creando ? (
            <div className="mt-6">
              <Vacio
                titulo="Tu plan está vacío"
                texto="Añade desde «Sugeridas» las acciones que quieras hacer, o escribe una propia. Cada una lleva responsable y fecha."
                boton="Ver las sugeridas"
                onClick={() => setPestana('sugeridas')}
              />
            </div>
          ) : (
            plan.acciones.length > 0 && (
              <>
                <div role="group" aria-label="Filtrar por estado" className="mt-4 grid grid-cols-4 gap-2">
                  {(
                    [
                      ['todas', 'Todas'],
                      ['pendiente', 'Pendientes'],
                      ['en_curso', 'En curso'],
                      ['hecha', 'Hechas'],
                    ] as const
                  ).map(([id, nombre]) => (
                    <button
                      key={id}
                      type="button"
                      aria-pressed={filtro === id}
                      onClick={() => setFiltro(id)}
                      className={`flex h-14 flex-col items-center justify-center rounded-[var(--radius-button)] border px-1 text-sm font-medium leading-tight [touch-action:manipulation] ${
                        filtro === id
                          ? 'border-[var(--accent)] bg-[var(--chip-bg)] text-[var(--text-primary)]'
                          : 'border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] text-[var(--text-secondary)]'
                      }`}
                    >
                      {nombre}
                      <span className="tabular-nums opacity-70">{conteo[id]}</span>
                    </button>
                  ))}
                </div>

                {visibles.length === 0 ? (
                  <p className="mt-6 text-center text-base text-[var(--text-secondary)]">No hay acciones con este filtro.</p>
                ) : (
                  <ul className="mt-4 flex flex-col gap-3">
                    {visibles.map((a, i) => (
                      <motion.li key={a.id} {...entrada(i)}>
                        <TarjetaAccion
                          accion={a}
                          empresaId={empresa.id}
                          hoy={hoy}
                          abierta={abierta === a.id}
                          onAbrir={() => setAbierta(abierta === a.id ? null : a.id)}
                          tras={tras}
                          onQuitar={() => {
                            const q = quitarAccion(empresa.id, a.id);
                            tras();
                            setAbierta(null);
                            setQuitada(q);
                          }}
                        />
                      </motion.li>
                    ))}
                  </ul>
                )}
              </>
            )
          )}
        </section>
      )}
    </Marco>
  );
}

function Vacio({
  titulo,
  texto,
  href,
  boton,
  onClick,
}: {
  titulo: string;
  texto: string;
  href?: string;
  boton: string;
  onClick?: () => void;
}) {
  const clases =
    'mt-5 flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] transition-transform active:scale-95 [touch-action:manipulation]';
  return (
    <div className="flex flex-col items-center rounded-[var(--radius-card)] bg-[var(--surface)] p-6 text-center shadow-[var(--shadow-1)]">
      <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-[var(--chip-bg)]">
        <ClipboardList size={22} color="var(--accent)" />
      </span>
      <p className="mt-4 text-xl font-semibold leading-snug [font-family:var(--font-display)]">{titulo}</p>
      <p className="mt-2 text-base text-[var(--text-secondary)]">{texto}</p>
      {href ? (
        <Link href={href} className={clases}>
          {boton}
        </Link>
      ) : (
        <button type="button" onClick={onClick} className={clases}>
          {boton}
        </button>
      )}
    </div>
  );
}

function TarjetaAccion({
  accion,
  empresaId,
  hoy,
  abierta,
  onAbrir,
  onQuitar,
  tras,
}: {
  accion: Accion;
  empresaId: string;
  hoy: Date;
  abierta: boolean;
  onAbrir: () => void;
  onQuitar: () => void;
  tras: () => void;
}) {
  const hecha = accion.estado === 'hecha';
  const venc = vencimientoDe(accion, hoy);
  const colorFecha = venc.tipo === 'vencida' ? 'var(--nivel-1)' : venc.tipo === 'pronto' ? 'var(--nivel-2)' : 'var(--text-secondary)';
  const textoFecha =
    venc.tipo === 'sin_fecha' || (venc.tipo === 'cerrada' && !accion.fecha)
      ? 'Sin fecha'
      : venc.tipo === 'vencida'
        ? `Vencida hace ${Math.abs(venc.dias ?? 0)} ${Math.abs(venc.dias ?? 0) === 1 ? 'día' : 'días'} · ${fechaLegible(accion.fecha)}`
        : venc.tipo === 'pronto'
          ? venc.dias === 0
            ? `Vence hoy · ${fechaLegible(accion.fecha)}`
            : `Vence en ${venc.dias} ${venc.dias === 1 ? 'día' : 'días'} · ${fechaLegible(accion.fecha)}`
          : fechaLegible(accion.fecha);

  return (
    <div className="rounded-[var(--radius-card)] bg-[var(--surface)] shadow-[var(--shadow-1)]">
      <div className="flex items-start gap-1 p-2">
        <button
          type="button"
          role="checkbox"
          aria-checked={hecha}
          aria-label={hecha ? 'Marcar como pendiente' : 'Marcar como hecha'}
          onClick={() => {
            actualizarAccion(empresaId, accion.id, { estado: hecha ? 'pendiente' : 'hecha' });
            tras();
          }}
          className="flex size-12 shrink-0 items-center justify-center [touch-action:manipulation]"
        >
          {hecha ? (
            <span className="flex size-6 items-center justify-center rounded-full bg-[var(--accent)]">
              <Check size={14} strokeWidth={3} color="var(--bg)" />
            </span>
          ) : (
            <Circle size={24} className="text-[var(--text-tertiary)]" aria-hidden="true" />
          )}
        </button>
        <button
          type="button"
          aria-expanded={abierta}
          onClick={onAbrir}
          className="flex min-h-12 min-w-0 flex-1 flex-col gap-2 py-2 pr-2 text-left [touch-action:manipulation]"
        >
          <span className={`text-base font-medium leading-snug ${hecha ? 'text-[var(--text-secondary)] line-through decoration-1' : ''}`}>{accion.titulo}</span>
          <span className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span aria-hidden="true" className="size-2 rounded-full" style={{ background: colorDeOrigen(accion.origen) }} />
            <span className="font-semibold text-[var(--text-secondary)]">{ETIQUETA_ESTADO[accion.estado]}</span>
            {(!hecha || accion.fecha) && (
              <span className="flex items-center gap-1" style={{ color: colorFecha }}>
                <CalendarClock size={14} aria-hidden="true" />
                {textoFecha}
              </span>
            )}
            {(!hecha || accion.responsable) && (
              <span className="flex items-center gap-1 text-[var(--text-secondary)]">
                <User size={14} aria-hidden="true" />
                {accion.responsable || 'Sin responsable'}
              </span>
            )}
          </span>
        </button>
      </div>

      {abierta && (
        <div className="border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] p-4">
          {(accion.indicador || accion.evidencia) && (
            <div className="mb-4 flex flex-col gap-1 text-sm text-[var(--text-secondary)]">
              {accion.indicador && (
                <p>
                  <strong className="font-semibold text-[var(--text-primary)]">Cómo saber que avanzas:</strong> {accion.indicador}.
                </p>
              )}
              {accion.evidencia && (
                <p>
                  <strong className="font-semibold text-[var(--text-primary)]">Evidencia:</strong> {accion.evidencia}.
                </p>
              )}
            </div>
          )}
          <EditorAccion
            inicial={accion}
            etiquetaGuardar="Guardar cambios"
            onGuardar={(c) => {
              actualizarAccion(empresaId, accion.id, c);
              tras();
              onAbrir();
            }}
            onCancelar={onAbrir}
            onQuitar={onQuitar}
          />
        </div>
      )}
    </div>
  );
}

interface Borrador {
  titulo: string;
  responsable: string;
  fecha: string;
  estado: EstadoAccion;
  nota: string;
}

function EditorAccion({
  inicial,
  etiquetaGuardar,
  onGuardar,
  onCancelar,
  onQuitar,
}: {
  inicial: Borrador;
  etiquetaGuardar: string;
  onGuardar: (cambios: Borrador) => void;
  onCancelar: () => void;
  onQuitar?: () => void;
}) {
  const [b, setB] = useState<Borrador>({
    titulo: inicial.titulo,
    responsable: inicial.responsable,
    fecha: inicial.fecha,
    estado: inicial.estado,
    nota: inicial.nota,
  });
  const [intento, setIntento] = useState(false);
  const tituloOk = b.titulo.trim().length >= 5;
  const uid = useId();
  const sumarDias = (dias: number) => {
    const d = new Date();
    d.setDate(d.getDate() + dias);
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    setB((x) => ({ ...x, fecha: `${d.getFullYear()}-${mm}-${dd}` }));
  };
  const campo =
    'mt-2 w-full rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] bg-[var(--bg)] px-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]';

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setIntento(true);
        if (!tituloOk) return;
        onGuardar({ ...b, titulo: b.titulo.trim(), responsable: b.responsable.trim(), nota: b.nota.trim() });
      }}
      className="flex flex-col gap-4"
    >
      <div>
        <label htmlFor={`${uid}-titulo`} className="block text-sm font-medium text-[var(--text-secondary)]">
          Qué se va a hacer
        </label>
        <textarea
          id={`${uid}-titulo`}
          rows={3}
          maxLength={240}
          value={b.titulo}
          aria-invalid={intento && !tituloOk ? true : undefined}
          onChange={(e) => setB({ ...b, titulo: e.target.value })}
          className={`${campo} py-3`}
        />
        {intento && !tituloOk && (
          <p role="alert" className="mt-2 flex items-center gap-2 text-sm text-[var(--accent-2)]">
            <AlertCircle size={16} aria-hidden="true" /> Escribe qué se va a hacer, en una frase.
          </p>
        )}
      </div>

      <div>
        <label htmlFor={`${uid}-resp`} className="block text-sm font-medium text-[var(--text-secondary)]">
          Responsable
        </label>
        <input
          id={`${uid}-resp`}
          value={b.responsable}
          maxLength={60}
          placeholder="Ej.: María, jefa de producción"
          autoComplete="off"
          onChange={(e) => setB({ ...b, responsable: e.target.value })}
          className={`${campo} h-14`}
        />
      </div>

      <div>
        <label htmlFor={`${uid}-fecha`} className="block text-sm font-medium text-[var(--text-secondary)]">
          Fecha límite
        </label>
        <input
          id={`${uid}-fecha`}
          type="date"
          value={b.fecha}
          onChange={(e) => setB({ ...b, fecha: e.target.value })}
          className={`${campo} h-14`}
        />
        <div className="mt-2 flex gap-2">
          {(
            [
              ['En 1 semana', 7],
              ['En 1 mes', 30],
            ] as const
          ).map(([nombre, dias]) => (
            <button
              key={nombre}
              type="button"
              onClick={() => sumarDias(dias)}
              className="h-12 rounded-full border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] px-4 text-sm font-medium text-[var(--text-secondary)] [touch-action:manipulation]"
            >
              {nombre}
            </button>
          ))}
        </div>
      </div>

      <fieldset>
        <legend className="text-sm font-medium text-[var(--text-secondary)]">Estado</legend>
        <div role="radiogroup" className="mt-2 grid grid-cols-3 gap-2">
          {(['pendiente', 'en_curso', 'hecha'] as EstadoAccion[]).map((e) => (
            <button
              key={e}
              type="button"
              role="radio"
              aria-checked={b.estado === e}
              onClick={() => setB({ ...b, estado: e })}
              className={`min-h-12 rounded-[var(--radius-button)] border px-2 text-sm font-medium [touch-action:manipulation] ${
                b.estado === e
                  ? 'border-[var(--accent)] bg-[var(--chip-bg)] text-[var(--text-primary)]'
                  : 'border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] text-[var(--text-secondary)]'
              }`}
            >
              {ETIQUETA_ESTADO[e]}
            </button>
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor={`${uid}-nota`} className="block text-sm font-medium text-[var(--text-secondary)]">
          Nota o enlace a la evidencia (opcional)
        </label>
        <textarea
          id={`${uid}-nota`}
          rows={2}
          maxLength={300}
          value={b.nota}
          placeholder="Ej.: Carpeta compartida con las facturas"
          onChange={(e) => setB({ ...b, nota: e.target.value })}
          className={`${campo} py-3`}
        />
      </div>

      <div className="flex flex-col gap-2">
        <button
          type="submit"
          className="h-14 rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] transition-transform active:scale-95 [touch-action:manipulation]"
        >
          {etiquetaGuardar}
        </button>
        <button type="button" onClick={onCancelar} className="h-12 text-base text-[var(--text-secondary)] underline">
          Cancelar
        </button>
        {onQuitar && (
          <button type="button" onClick={onQuitar} className="h-12 text-base text-[var(--accent-2)] underline">
            Quitar del plan
          </button>
        )}
      </div>
    </form>
  );
}
