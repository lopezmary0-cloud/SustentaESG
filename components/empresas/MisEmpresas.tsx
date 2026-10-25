'use client';

// Mis empresas: cada empresa es un espacio separado (diagnóstico, plan e historial propios). Plan Empresa =
// 1 empresa; plan Consultor = hasta 10. Cambiar de empresa cambia TODO lo que se ve en la app.

import { useState } from 'react';
import Link from 'next/link';
import { motion, useReducedMotion } from 'motion/react';
import { AlertCircle, Building2, Check, Lock, Plus, Trash2 } from 'lucide-react';
import { Marco } from '@/components/flujo/Marco';
import { BANCO } from '@/lib/diagnostico/banco';
import { leerEvaluacion } from '@/lib/diagnostico/almacen';
import { calcularDiagnostico } from '@/lib/diagnostico/motor';
import { agregarEmpresa, perfilActual, quitarEmpresa, seleccionarEmpresa, useEmpresas } from '@/lib/empresas/almacen';
import { limiteDe, puedeAgregar, type Empresa, type ErrorEmpresa } from '@/lib/empresas/reglas';
import { useSesionRequerida } from '@/lib/useSesion';

const EASE = [0.32, 0.72, 0, 1] as const;

const TAMANOS = [
  { id: '1-10', texto: '1 a 10 personas' },
  { id: '11-50', texto: '11 a 50' },
  { id: '51-200', texto: '51 a 200' },
  { id: '200+', texto: 'Más de 200' },
];

const ERRORES: Record<ErrorEmpresa | 'guardado', string> = {
  nombre_corto: 'Escribe el nombre de la empresa (al menos 2 letras).',
  nombre_repetido: 'Ya tienes una empresa con ese nombre. Usa otro para distinguirlas.',
  limite: 'Llegaste al máximo de empresas de tu plan.',
  guardado: 'No pudimos guardar en este navegador. Sal del modo privado o libera espacio.',
};

export function MisEmpresas() {
  const { listo } = useSesionRequerida();
  if (!listo) {
    return (
      <Marco atras={{ href: '/app', etiqueta: 'Volver al panel' }} ancho={560}>
        <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)]" />
      </Marco>
    );
  }
  return <MisEmpresasAbierto />;
}

function MisEmpresasAbierto() {
  const reduce = useReducedMotion();
  const estado = useEmpresas();
  const [perfil] = useState(() => perfilActual());
  const [creando, setCreando] = useState(false);
  const [quitando, setQuitando] = useState<string | null>(null);
  const [avisoFallo, setAvisoFallo] = useState(false);
  const limite = limiteDe(perfil);
  const puede = puedeAgregar(estado, perfil);

  const entrada = (i: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 12 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3, delay: reduce ? 0 : Math.min(i, 8) * 0.05, ease: EASE },
  });

  return (
    <Marco atras={{ href: '/app', etiqueta: 'Volver al panel' }} ancho={560}>
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Mis empresas</p>
      <h1 className="mt-2 text-balance text-3xl font-bold leading-tight [font-family:var(--font-display)]">
        {perfil === 'consultor' ? 'Tus clientes y empresas' : 'Tu empresa'}
      </h1>
      <p className="mt-2 text-base text-[var(--text-secondary)]">
        Cada una tiene su propio diagnóstico, plan e historial. Nunca se mezclan.{' '}
        {estado.empresas.length > limite ? (
          <>
            Tienes {estado.empresas.length} empresas y tu plan {perfil === 'consultor' ? 'Consultor' : 'Empresa'} incluye {limite}: puedes seguir viéndolas todas, pero no añadir más.
          </>
        ) : (
          <>
            <span className="tabular-nums">
              {estado.empresas.length} de {limite}
            </span>{' '}
            en tu plan {perfil === 'consultor' ? 'Consultor' : 'Empresa'}.
          </>
        )}
      </p>

      {avisoFallo && (
        <p role="alert" className="mt-4 flex items-start gap-2 text-sm text-[var(--accent-2)]">
          <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
          {ERRORES.guardado}
        </p>
      )}

      {estado.empresas.length === 0 ? (
        <div className="mt-6 flex flex-col items-center rounded-[var(--radius-card)] bg-[var(--surface)] p-6 text-center shadow-[var(--shadow-1)]">
          <span aria-hidden="true" className="flex size-12 items-center justify-center rounded-full bg-[var(--chip-bg)]">
            <Building2 size={22} color="var(--accent)" />
          </span>
          <p className="mt-4 text-xl font-semibold [font-family:var(--font-display)]">Aún no tienes ninguna empresa</p>
          <p className="mt-2 text-base text-[var(--text-secondary)]">Añade la primera para empezar su diagnóstico.</p>
        </div>
      ) : (
        <ul className="mt-6 flex flex-col gap-3">
          {estado.empresas.map((e, i) => (
            <motion.li key={e.id} {...entrada(i)}>
              <TarjetaEmpresa
                empresa={e}
                activa={estado.activa === e.id}
                confirmando={quitando === e.id}
                onElegir={() => setAvisoFallo(!seleccionarEmpresa(e.id))}
                onPedirQuitar={() => setQuitando(e.id)}
                onCancelarQuitar={() => setQuitando(null)}
                onQuitar={() => {
                  setAvisoFallo(!quitarEmpresa(e.id));
                  setQuitando(null);
                }}
              />
            </motion.li>
          ))}
        </ul>
      )}

      {creando ? (
        <FormularioEmpresa
          onCancelar={() => setCreando(false)}
          onCreada={() => {
            setCreando(false);
          }}
        />
      ) : puede ? (
        <button
          type="button"
          onClick={() => setCreando(true)}
          className="mt-4 flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] transition-transform active:scale-95 [touch-action:manipulation]"
        >
          <Plus size={18} aria-hidden="true" /> Añadir {estado.empresas.length === 0 ? 'mi empresa' : 'otra empresa'}
        </button>
      ) : (
        <div className="mt-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] p-4">
          <p className="flex items-center gap-2 text-base font-semibold">
            <Lock size={16} className="text-[var(--text-secondary)]" aria-hidden="true" />
            {perfil === 'empresa' ? 'Tu plan incluye 1 empresa' : `Llegaste al máximo de ${limite} empresas`}
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            {perfil === 'empresa'
              ? 'Con el plan Consultor puedes llevar hasta 10 empresas, cada una por separado.'
              : 'Quita una que ya no uses para añadir otra.'}
          </p>
          {perfil === 'empresa' && (
            <Link
              href="/planes"
              className="mt-3 flex h-12 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_60%,transparent)] text-base font-semibold text-[var(--accent)] [touch-action:manipulation]"
            >
              Ver el plan Consultor
            </Link>
          )}
        </div>
      )}
    </Marco>
  );
}

function TarjetaEmpresa({
  empresa,
  activa,
  confirmando,
  onElegir,
  onPedirQuitar,
  onCancelarQuitar,
  onQuitar,
}: {
  empresa: Empresa;
  activa: boolean;
  confirmando: boolean;
  onElegir: () => void;
  onPedirQuitar: () => void;
  onCancelarQuitar: () => void;
  onQuitar: () => void;
}) {
  // Resumen leído al abrir la pantalla: no hace falta que cambie mientras se mira.
  const [resumen] = useState(() => {
    const ev = leerEvaluacion(empresa.id);
    const r = calcularDiagnostico(ev.respuestas);
    return { respondidas: r.respondidas, puntaje: r.general.puntaje, nivel: r.general.nivel };
  });

  return (
    <div
      className="rounded-[var(--radius-card)] bg-[var(--surface)] p-4 shadow-[var(--shadow-1)]"
      style={activa ? { outline: '2px solid var(--accent)', outlineOffset: '-2px' } : undefined}
    >
      <div className="flex items-start gap-3">
        <span aria-hidden="true" className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
          <Building2 size={22} color="var(--accent)" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="truncate text-lg font-semibold">{empresa.nombre}</p>
          <p className="truncate text-sm text-[var(--text-secondary)]">{empresa.actividad || 'Sin actividad indicada'}</p>
          <p className="mt-2 text-sm text-[var(--text-secondary)]">
            {resumen.respondidas === 0
              ? 'Diagnóstico sin empezar'
              : resumen.puntaje === null
                ? `${resumen.respondidas} de ${BANCO.length} respondidas`
                : `${Math.round(resumen.puntaje)}/100 · nivel ${(resumen.nivel ?? '').toLowerCase()} · ${resumen.respondidas} de ${BANCO.length}`}
          </p>
        </div>
      </div>

      {confirmando ? (
        <div className="mt-4 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent-2)_55%,transparent)] p-3">
          <p className="text-sm text-[var(--text-primary)]">
            ¿Quitar <strong className="font-semibold">{empresa.nombre}</strong>? Se borran su diagnóstico, su plan y su historial. No se puede deshacer.
          </p>
          <div className="mt-3 grid grid-cols-2 gap-2">
            <button type="button" onClick={onCancelarQuitar} className="h-12 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] text-base font-medium [touch-action:manipulation]">
              Cancelar
            </button>
            <button type="button" onClick={onQuitar} className="h-12 rounded-[var(--radius-button)] bg-[var(--accent-2)] text-base font-semibold text-[var(--bg)] [touch-action:manipulation]">
              Sí, quitar
            </button>
          </div>
        </div>
      ) : (
        <div className="mt-4 grid grid-cols-[1fr_auto] gap-2">
          {activa ? (
            <Link
              href="/app"
              className="flex h-12 items-center justify-center gap-2 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_60%,transparent)] bg-[var(--chip-bg)] text-base font-semibold text-[var(--accent)] transition-transform active:scale-95 [touch-action:manipulation]"
            >
              <Check size={18} aria-hidden="true" /> En uso · Ir al panel
            </Link>
          ) : (
            <button
              type="button"
              onClick={onElegir}
              className="h-12 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--accent)_60%,transparent)] text-base font-semibold text-[var(--accent)] transition-transform active:scale-95 [touch-action:manipulation]"
            >
              Trabajar con esta
            </button>
          )}
          <button
            type="button"
            onClick={onPedirQuitar}
            aria-label={`Quitar ${empresa.nombre}`}
            className="flex size-12 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] text-[var(--text-secondary)] transition-transform active:scale-95 [touch-action:manipulation]"
          >
            <Trash2 size={18} aria-hidden="true" />
          </button>
        </div>
      )}
    </div>
  );
}

function FormularioEmpresa({ onCancelar, onCreada }: { onCancelar: () => void; onCreada: () => void }) {
  const [nombre, setNombre] = useState('');
  const [actividad, setActividad] = useState('');
  const [tamano, setTamano] = useState('11-50');
  const [error, setError] = useState<string | null>(null);

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        const r = agregarEmpresa({ nombre, actividad, tamano });
        if (!r.ok) {
          setError(ERRORES[r.error]);
          return;
        }
        onCreada();
      }}
      className="mt-4 flex flex-col gap-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_40%,transparent)] bg-[var(--surface)] p-4"
    >
      <p className="text-base font-semibold">Nueva empresa</p>
      <div>
        <label htmlFor="nueva-nombre" className="block text-sm font-medium text-[var(--text-secondary)]">
          Nombre de la empresa o del cliente
        </label>
        <input
          id="nueva-nombre"
          autoFocus
          value={nombre}
          maxLength={80}
          autoComplete="off"
          placeholder="Ej.: Café La Palma S.A.S."
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? 'nueva-error' : undefined}
          onChange={(e) => {
            setNombre(e.target.value);
            setError(null);
          }}
          className="mt-2 h-14 w-full rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] bg-[var(--bg)] px-4 text-base placeholder:text-[var(--text-tertiary)]"
        />
        {error && (
          <p id="nueva-error" role="alert" className="mt-2 flex items-start gap-2 text-sm text-[var(--accent-2)]">
            <AlertCircle size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            {error}
          </p>
        )}
      </div>
      <div>
        <label htmlFor="nueva-actividad" className="block text-sm font-medium text-[var(--text-secondary)]">
          ¿A qué se dedica? (opcional)
        </label>
        <input
          id="nueva-actividad"
          value={actividad}
          maxLength={80}
          placeholder="Ej.: Cultivo y tostión de café"
          onChange={(e) => setActividad(e.target.value)}
          className="mt-2 h-14 w-full rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] bg-[var(--bg)] px-4 text-base placeholder:text-[var(--text-tertiary)]"
        />
      </div>
      <fieldset>
        <legend className="text-sm font-medium text-[var(--text-secondary)]">Personas que trabajan ahí</legend>
        <div role="radiogroup" className="mt-2 grid grid-cols-2 gap-2">
          {TAMANOS.map((t) => (
            <button
              key={t.id}
              type="button"
              role="radio"
              aria-checked={tamano === t.id}
              onClick={() => setTamano(t.id)}
              className={`min-h-12 rounded-[var(--radius-button)] border px-2 text-sm font-medium [touch-action:manipulation] ${
                tamano === t.id
                  ? 'border-[var(--accent)] bg-[var(--chip-bg)] text-[var(--text-primary)]'
                  : 'border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] text-[var(--text-secondary)]'
              }`}
            >
              {t.texto}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-col gap-2">
        <button
          type="submit"
          className="h-14 rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] transition-transform active:scale-95 [touch-action:manipulation]"
        >
          Añadir y trabajar con ella
        </button>
        <button type="button" onClick={onCancelar} className="h-12 text-base text-[var(--text-secondary)] underline">
          Cancelar
        </button>
      </div>
    </form>
  );
}
