'use client';

// Resultados del diagnóstico: índice general, una barra segmentada por dimensión, áreas de atención y
// «cómo se calculó». Todo viene del motor determinista; aquí solo se presenta. Lenguaje de
// «área de atención», nunca de «riesgo»: madurez no es cumplimiento legal ni exposición.

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { AlertCircle, AlertTriangle, Check, ChevronDown, ChevronRight, History, Info } from 'lucide-react';
import { Marco } from '@/components/flujo/Marco';
import { RuedaMini } from '@/components/flujo/RuedaMini';
import { BANCO, DIMENSIONES, VERSION_METODOLOGIA } from '@/lib/diagnostico/banco';
import { useEvaluacion } from '@/lib/diagnostico/almacen';
import { SinEmpresa } from '@/components/empresas/SinEmpresa';
import { useEmpresaActiva } from '@/lib/empresas/almacen';
import type { Empresa } from '@/lib/empresas/reglas';
import { etiquetaPorDefecto } from '@/lib/historial/comparar';
import { guardarFotografia, useHistorial } from '@/lib/historial/almacen';
import { calcularDiagnostico, NIVELES, type ResultadoDimension } from '@/lib/diagnostico/motor';
import { useCuenta } from '@/lib/useCuenta';
import { useSesionRequerida } from '@/lib/useSesion';

const COLOR_NIVEL = ['var(--nivel-1)', 'var(--nivel-2)', 'var(--nivel-3)', 'var(--nivel-4)', 'var(--accent)'];
const pct = (n: number) => `${Math.round(n * 100)}%`;
const indiceNivel = (nombre: string | null) => (nombre ? NIVELES.findIndex((n) => n.nombre === nombre) : -1);
const EASE = [0.32, 0.72, 0, 1] as const;
const VISIBLES_ATENCION = 4;

export function Resultados() {
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
  return <ResultadosAbiertos key={activa.id} empresa={activa} />;
}

function ResultadosAbiertos({ empresa }: { empresa: Empresa }) {
  const reduce = useReducedMotion();
  const evaluacion = useEvaluacion(empresa.id);
  const [verTodas, setVerTodas] = useState(false);
  const r = calcularDiagnostico(evaluacion.respuestas);
  const g = r.general;
  const puntajeVisible = useCuenta(g.puntaje === null ? 0 : Math.round(g.puntaje));
  const pendientes = r.totalPreguntas - r.respondidas;
  const nivelGeneral = indiceNivel(g.nivel);

  const atencion = BANCO.filter((p) => {
    const resp = evaluacion.respuestas[p.id];
    return resp?.tipo === 'valor' && resp.valor <= 1;
  }).sort((a, b) => {
    const va = (evaluacion.respuestas[a.id] as { valor: number }).valor;
    const vb = (evaluacion.respuestas[b.id] as { valor: number }).valor;
    return va - vb || a.id.localeCompare(b.id);
  });
  const atencionVista = verTodas ? atencion : atencion.slice(0, VISIBLES_ATENCION);
  const sinInfo = BANCO.filter((p) => evaluacion.respuestas[p.id]?.tipo === 'sin_info');
  const porRevisar = DIMENSIONES.flatMap((d) => r.dimensiones[d.id].exclusiones.filter((e) => e.pendienteRevisar));

  const entrada = (i: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 16 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.4, delay: reduce ? 0 : 0.06 * i, ease: EASE },
  });

  return (
    <Marco atras={{ href: '/app', etiqueta: 'Volver al panel' }} ancho={560}>
      <p className="truncate text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Resultado · {empresa.nombre}</p>
      <h1 className="mt-2 text-balance text-3xl font-bold leading-tight [font-family:var(--font-display)]">
        {r.respondidas === 0 ? 'Todavía no hay respuestas' : g.puntaje === null ? 'Aún falta información' : 'Así está tu empresa hoy'}
      </h1>

      <motion.section
        {...entrada(0)}
        aria-label="Índice general"
        className="mt-6 flex items-center gap-4 rounded-[var(--radius-card)] p-5 shadow-[var(--shadow-2)]"
        style={{
          border: '1px solid transparent',
          background:
            'linear-gradient(var(--surface), var(--surface)) padding-box, linear-gradient(135deg, color-mix(in oklab, var(--accent) 55%, transparent), transparent 65%) border-box',
        }}
      >
        <RuedaMini tamano={96} encendidos={nivelGeneral >= 0 ? nivelGeneral + 1 : 0} />
        <div className="min-w-0">
          {g.puntaje === null ? (
            <>
              <p className="text-lg font-semibold">Sin cifra todavía</p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                Responde al menos el 70% de una dimensión para ver su resultado.
              </p>
            </>
          ) : (
            <>
              <p className="text-4xl font-bold tabular-nums [font-family:var(--font-display)]">
                {puntajeVisible}
                <span className="text-lg font-semibold text-[var(--text-secondary)]"> / 100</span>
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-2 text-base font-semibold text-[var(--accent)]">
                Nivel {g.nivel}
                <span className="rounded-full border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] px-2 py-0.5 text-xs font-medium text-[var(--text-secondary)]">
                  Niveles provisionales
                </span>
              </p>
              <p className="mt-1 text-sm text-[var(--text-secondary)]">
                {g.estado === 'provisional'
                  ? `Provisional: usa ${g.incluidas.length} de 4 dimensiones.`
                  : 'Promedio de las cuatro dimensiones.'}
              </p>
            </>
          )}
        </div>
      </motion.section>

      <section aria-label="Resultado por dimensión" className="mt-6">
        <h2 className="text-lg font-semibold">Por dimensión</h2>
        <ul className="mt-3 flex flex-col gap-3">
          {DIMENSIONES.map((d, i) => (
            <motion.li key={d.id} {...entrada(i + 1)} className="rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
              <FilaDimension nombre={d.nombre} aparte={!d.entraAlIndice} dim={r.dimensiones[d.id]} retraso={0.06 * (i + 2)} />
            </motion.li>
          ))}
        </ul>
      </section>

      {atencion.length > 0 && (
        <section aria-label="Áreas de atención" className="mt-8">
          <h2 className="text-lg font-semibold">Áreas de atención</h2>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            Prácticas que respondiste como «no se realiza» o «informal». No es un nivel de riesgo: es por dónde conviene empezar. Toca una para revisar tu respuesta.
          </p>
          <ul className="mt-3 flex flex-col gap-2">
            {atencionVista.map((p) => (
              <li key={p.id}>
                <Link
                  href={`/app/diagnostico?p=${p.id}`}
                  className="flex min-h-14 items-center gap-3 rounded-[var(--radius-card)] bg-[var(--surface)] p-4 text-base leading-snug transition-transform active:scale-95 [touch-action:manipulation]"
                >
                  <AlertTriangle size={18} className="shrink-0 text-[var(--accent-2)]" aria-hidden="true" />
                  <span className="flex-1">{p.texto}</span>
                  <ChevronRight size={18} className="shrink-0 text-[var(--text-tertiary)]" aria-hidden="true" />
                </Link>
              </li>
            ))}
          </ul>
          {atencion.length > VISIBLES_ATENCION && (
            <button
              type="button"
              onClick={() => setVerTodas((v) => !v)}
              className="mt-2 h-12 text-base font-medium text-[var(--accent)] underline"
            >
              {verTodas ? 'Ver menos' : `Ver las ${atencion.length}`}
            </button>
          )}
        </section>
      )}

      {(sinInfo.length > 0 || porRevisar.length > 0) && (
        <section aria-label="Información por completar" className="mt-8 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] p-4">
          <div className="flex items-center gap-2">
            <Info size={16} className="text-[var(--text-secondary)]" aria-hidden="true" />
            <h2 className="text-base font-semibold">Información por completar</h2>
          </div>
          {sinInfo.length > 0 && (
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              En {sinInfo.length} {sinInfo.length === 1 ? 'pregunta' : 'preguntas'} marcaste que no tienes la información. No cuentan como cero: no suman ni restan hasta que las respondas.
            </p>
          )}
          {sinInfo.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {sinInfo.map((p) => (
                <li key={p.id}>
                  <Link
                    href={`/app/diagnostico?p=${p.id}`}
                    className="flex h-12 items-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_40%,transparent)] px-4 text-sm font-semibold text-[var(--accent)] [touch-action:manipulation]"
                  >
                    Responder {p.id}
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {porRevisar.length > 0 && (
            <p className="mt-2 text-sm text-[var(--text-secondary)]">
              {porRevisar.length} {porRevisar.length === 1 ? 'pregunta marcada' : 'preguntas marcadas'} como «No aplica» quedan para revisar: {porRevisar.map((e) => e.pregunta).join(', ')}.
            </p>
          )}
        </section>
      )}

      <details className="group mt-8 rounded-[var(--radius-card)] bg-[var(--surface)] p-4">
        <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between text-base font-semibold">
          Cómo se calculó
          <ChevronDown size={18} className="transition-transform group-open:rotate-180" aria-hidden="true" />
        </summary>
        <div className="mt-2 flex flex-col gap-2 text-sm leading-relaxed text-[var(--text-secondary)]">
          <p>Cada pregunta vale de 0 a 4. El puntaje de una dimensión es lo que sumaste dividido entre lo máximo posible de las preguntas que sí aplican y respondiste, por 100.</p>
          <p>«No aplica» sale del cálculo y queda registrado. «No tengo la información» no suma ni resta, pero baja el porcentaje de respondidas. Con menos de 40% respondidas no mostramos cifra; entre 40% y 70% el resultado es provisional.</p>
          <p>El resultado general es el promedio de las dimensiones con 70% o más respondidas. La cadena de valor se muestra aparte.</p>
          <p>
            Metodología {VERSION_METODOLOGIA}: borrador en revisión. Los niveles y umbrales son provisionales y no son un estándar oficial ni una certificación de cumplimiento legal.
          </p>
        </div>
      </details>

      {r.respondidas > 0 && <GuardarEnHistorial empresa={empresa} respuestas={evaluacion.respuestas} />}

      <div className="mt-auto flex flex-col gap-3 pt-8">
        <Link
          href="/app/diagnostico"
          className="flex h-14 items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] transition-transform active:scale-95 [touch-action:manipulation]"
        >
          {pendientes > 0 ? `Completar las ${pendientes} pendientes` : 'Revisar mis respuestas'}
        </Link>
        <Link
          href="/app/plan"
          className="flex h-14 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_50%,transparent)] text-base font-semibold text-[var(--accent)] transition-transform active:scale-95 [touch-action:manipulation]"
        >
          Ver mi plan de mejora
        </Link>
        <Link href="/app" className="flex h-12 items-center justify-center text-base text-[var(--text-secondary)] underline">
          Volver al panel
        </Link>
      </div>
    </Marco>
  );
}

/** Guarda una «fotografía» fechada del diagnóstico de hoy para poder compararla con las futuras. */
function GuardarEnHistorial({ empresa, respuestas }: { empresa: Empresa; respuestas: Parameters<typeof guardarFotografia>[1] }) {
  const historial = useHistorial(empresa.id);
  const [abierto, setAbierto] = useState(false);
  const [etiqueta, setEtiqueta] = useState('');
  const [sugerida] = useState(() => etiquetaPorDefecto(Date.now()));
  const [hecho, setHecho] = useState<string | null>(null);
  const [fallo, setFallo] = useState(false);
  const n = historial.fotografias.length;

  return (
    <section aria-label="Historial" className="mt-8 rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]">
      <div className="flex items-center gap-2">
        <History size={18} className="text-[var(--accent)]" aria-hidden="true" />
        <h2 className="text-base font-semibold">Historial</h2>
      </div>
      <p className="mt-2 text-sm text-[var(--text-secondary)]">
        {n === 0
          ? 'Guarda este resultado como una fotografía con fecha. Más adelante podrás comparar cómo avanza la empresa.'
          : `Tienes ${n} ${n === 1 ? 'fotografía guardada' : 'fotografías guardadas'}. Guarda otra para ver el avance.`}
      </p>

      {hecho ? (
        <p role="status" className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--accent)]">
          <Check size={16} aria-hidden="true" /> Guardada: {hecho}
        </p>
      ) : abierto ? (
        <form
          className="mt-3 flex flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            const foto = guardarFotografia(empresa.id, respuestas, etiqueta);
            if (foto) {
              setHecho(foto.etiqueta);
              setFallo(false);
            } else setFallo(true);
          }}
        >
          <label htmlFor="etiqueta-foto" className="text-sm font-medium text-[var(--text-secondary)]">
            Nombre de la fotografía (opcional)
          </label>
          <input
            id="etiqueta-foto"
            value={etiqueta}
            maxLength={60}
            onChange={(e) => setEtiqueta(e.target.value)}
            placeholder={sugerida}
            className="h-14 w-full rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] bg-[var(--bg)] px-4 text-base placeholder:text-[var(--text-tertiary)]"
          />
          {fallo && (
            <p role="alert" className="flex items-start gap-2 text-sm text-[var(--accent-2)]">
              <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
              No pudimos guardar en este navegador. Sal del modo privado o libera espacio.
            </p>
          )}
          <button
            type="submit"
            className="h-14 rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] transition-transform active:scale-95 [touch-action:manipulation]"
          >
            Guardar en el historial
          </button>
        </form>
      ) : (
        <button
          type="button"
          onClick={() => setAbierto(true)}
          className="mt-3 flex h-12 w-full items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_60%,transparent)] text-base font-semibold text-[var(--accent)] [touch-action:manipulation]"
        >
          Guardar como fotografía
        </button>
      )}

      {n > 0 && (
        <Link href="/app/historial" className="mt-2 flex h-12 items-center justify-center text-base text-[var(--text-secondary)] underline">
          Ver el historial y comparar
        </Link>
      )}
    </section>
  );
}

function FilaDimension({ nombre, aparte, dim, retraso }: { nombre: string; aparte: boolean; dim: ResultadoDimension; retraso: number }) {
  const reduce = useReducedMotion();
  const nivel = indiceNivel(dim.nivel);
  const valor = useCuenta(dim.puntaje === null ? 0 : Math.round(dim.puntaje), 0.9);
  return (
    <>
      <div className="flex items-baseline justify-between gap-3">
        <p className="text-base font-semibold">{nombre}</p>
        {dim.puntaje === null ? (
          <p className="text-sm text-[var(--text-secondary)]">Sin cifra</p>
        ) : (
          <p className="text-xl font-bold tabular-nums [font-family:var(--font-display)]">{valor}</p>
        )}
      </div>

      <div className="mt-3 flex gap-1 rounded-full bg-[var(--surface-2)] p-1" role="img" aria-label={dim.nivel ? `Nivel ${dim.nivel}` : 'Sin nivel todavía'}>
        {COLOR_NIVEL.map((color, i) => (
          <span key={color} className="h-2 flex-1 overflow-hidden rounded-full bg-[color-mix(in_oklab,var(--text-tertiary)_22%,transparent)]">
            {i <= nivel && (
              <motion.span
                className="block h-full w-full origin-left rounded-full"
                style={{ background: color }}
                initial={{ scaleX: reduce ? 1 : 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.35, delay: reduce ? 0 : retraso + i * 0.08, ease: EASE }}
              />
            )}
          </span>
        ))}
      </div>

      <p className="mt-3 text-sm text-[var(--text-secondary)]">
        {dim.nivel ? `Nivel ${dim.nivel} · ` : ''}
        {dim.validas} de {dim.aplicables} respondidas ({pct(dim.cobertura)})
        {dim.estado === 'provisional' && ' · provisional'}
        {aparte && ' · se muestra aparte, no entra al promedio'}
      </p>
    </>
  );
}
