'use client';

// Recorrido de inicio: 4 preguntas (una decisión por pantalla) → «Construyendo tu ruta» → ruta lista.
// Las respuestas se guardan paso a paso (lib/demo/store.ts) para poder volver sin perderlas.
// Copy derivado de FICHA-AVATAR.md (quien lleva la sostenibilidad de una o varias empresas).

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { AnimatePresence, animate, motion, useReducedMotion } from 'motion/react';
import { AlertCircle, Check, Layers, Leaf, RotateCcw, Scale, TrendingUp, Users } from 'lucide-react';
import { Marco } from '@/components/flujo/Marco';
import { Opciones, type Opcion } from '@/components/flujo/Opciones';
import { RuedaMini } from '@/components/flujo/RuedaMini';
import { track } from '@/lib/analytics';
import { TRIAL_DIAS } from '@/lib/site';
import { useMontado } from '@/lib/useMontado';
import {
  guardarInicio,
  inicioCompleto,
  leerInicio,
  perfilSugerido,
  type Motivo,
  type RespuestasInicio,
  type Rol,
  type Tamano,
} from '@/lib/demo/store';

const ROLES: Opcion<Rol>[] = [
  { id: 'propia', titulo: 'De mi propia empresa', detalle: 'La dirijo o trabajo en ella.' },
  { id: 'varias', titulo: 'De varias empresas', detalle: 'Soy consultor/a o asesor/a externo.' },
];

const TAMANOS: Opcion<Tamano>[] = [
  { id: '1-10', titulo: 'De 1 a 10 personas' },
  { id: '11-50', titulo: 'De 11 a 50 personas' },
  { id: '51-200', titulo: 'De 51 a 200 personas' },
  { id: '200+', titulo: 'Más de 200 personas' },
];

const MOTIVOS_OPCIONES: Opcion<Motivo>[] = [
  { id: 'cliente', titulo: 'Responder a un cliente o a un banco', detalle: 'Me pidieron información de sostenibilidad.' },
  { id: 'direccion', titulo: 'Informar a la dirección', detalle: 'Necesito mostrar cómo estamos.' },
  { id: 'ordenar', titulo: 'Ordenar o arrancar mi sostenibilidad', detalle: 'Tengo datos dispersos o parto de cero.' },
];

const RESULTADO_POR_MOTIVO: Record<Motivo, string> = {
  cliente: 'Dejarás ordenada la información que te piden clientes y bancos, en un solo lugar.',
  direccion: 'Tendrás cada dimensión resumida, lista para mostrarla a tu dirección.',
  ordenar: 'Verás qué ya tienen y qué falta, dimensión por dimensión.',
  cero: 'Empezarás por lo básico y sabrás por dónde seguir.',
  otra: 'Empezarás por lo que más te importa y verás cómo avanzas.',
};

const TAMANO_TEXTO: Record<Tamano, string> = {
  '1-10': 'de 1 a 10 personas',
  '11-50': 'de 11 a 50 personas',
  '51-200': 'de 51 a 200 personas',
  '200+': 'de más de 200 personas',
};

const TOTAL_PASOS = 4;
const EASE = [0.32, 0.72, 0.0, 1] as const;

type Fase = { tipo: 'pregunta'; paso: number } | { tipo: 'construyendo' } | { tipo: 'lista' };

function faseInicial(r: RespuestasInicio): Fase {
  if (inicioCompleto(r)) return { tipo: 'lista' };
  if (!r.rol) return { tipo: 'pregunta', paso: 0 };
  if (!r.empresa || !r.actividad) return { tipo: 'pregunta', paso: 1 };
  if (!r.tamano) return { tipo: 'pregunta', paso: 2 };
  return { tipo: 'pregunta', paso: 3 };
}

/** Solo se monta en el navegador: las respuestas viven en localStorage y no existen al renderizar en el servidor. */
export function Recorrido() {
  const montado = useMontado();
  if (!montado) return <Esqueleto />;
  return <RecorridoCliente />;
}

function Esqueleto() {
  return (
    <Marco atras={{ href: '/', etiqueta: 'Volver a la página principal' }} progreso={8} progresoEtiqueta="Cargando tu recorrido">
      <div className="h-8 w-3/4 animate-pulse rounded-[var(--radius-button)] bg-[var(--surface)]" />
      <div className="mt-6 flex flex-col gap-3">
        {[0, 1].map((i) => (
          <div key={i} className="h-16 animate-pulse rounded-[var(--radius-card)] bg-[var(--surface)]" />
        ))}
      </div>
    </Marco>
  );
}

function RecorridoCliente() {
  const [respuestas, setRespuestas] = useState<RespuestasInicio>(() => leerInicio());
  const [fase, setFase] = useState<Fase>(() => faseInicial(leerInicio()));
  const reduce = useReducedMotion();
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null);
  const titulo = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    track('onboarding_iniciado');
    return () => {
      if (temporizador.current) clearTimeout(temporizador.current);
    };
  }, []);

  const claveFase = fase.tipo === 'pregunta' ? `p${fase.paso}` : fase.tipo;
  useEffect(() => {
    titulo.current?.focus({ preventScroll: true });
  }, [claveFase]);

  const guardar = (parcial: Partial<RespuestasInicio>) => setRespuestas(guardarInicio(parcial));

  const irAPaso = (paso: number) => {
    if (paso >= TOTAL_PASOS) {
      setFase({ tipo: 'construyendo' });
      return;
    }
    track('onboarding_paso', { paso: paso + 1 });
    setFase({ tipo: 'pregunta', paso });
  };

  /** Selección única: guarda y avanza a los 300 ms para que se vea la elección. */
  const elegirYAvanzar = (parcial: Partial<RespuestasInicio>, siguiente: number) => {
    guardar(parcial);
    if (temporizador.current) clearTimeout(temporizador.current);
    temporizador.current = setTimeout(() => irAPaso(siguiente), reduce ? 0 : 300);
  };

  const volver = () => {
    if (temporizador.current) clearTimeout(temporizador.current);
    if (fase.tipo === 'pregunta' && fase.paso > 0) setFase({ tipo: 'pregunta', paso: fase.paso - 1 });
    if (fase.tipo === 'lista') setFase({ tipo: 'pregunta', paso: TOTAL_PASOS - 1 });
  };

  // Vuelve a la primera pregunta conservando las respuestas: no se pierde nada al revisar.
  const reiniciar = () => setFase({ tipo: 'pregunta', paso: 0 });

  const progreso = fase.tipo === 'pregunta' ? 8 + (fase.paso / TOTAL_PASOS) * 84 : 100;
  const etiquetaProgreso =
    fase.tipo === 'pregunta' ? `Paso ${fase.paso + 1} de ${TOTAL_PASOS}` : fase.tipo === 'construyendo' ? 'Armando tu ruta' : 'Tu ruta está lista';

  const atras =
    fase.tipo === 'pregunta'
      ? fase.paso === 0
        ? { href: '/', etiqueta: 'Volver a la página principal' }
        : { onClick: volver, etiqueta: 'Volver a la pregunta anterior' }
      : fase.tipo === 'lista'
        ? { onClick: volver, etiqueta: 'Volver a mis respuestas' }
        : undefined;

  const entrada = reduce ? { opacity: 0 } : { opacity: 0, x: 16 };
  const salida = reduce ? { opacity: 0 } : { opacity: 0, x: -16 };

  return (
    <Marco atras={atras} progreso={progreso} progresoEtiqueta={etiquetaProgreso}>
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={claveFase}
          initial={entrada}
          animate={{ opacity: 1, x: 0 }}
          exit={salida}
          transition={{ duration: 0.25, ease: EASE }}
          className="flex flex-1 flex-col"
        >
          {fase.tipo === 'pregunta' && fase.paso === 0 && (
            <Pregunta
              refTitulo={titulo}
              pasoTexto={`Pregunta 1 de ${TOTAL_PASOS}`}
              titulo="¿Cómo llevas la sostenibilidad?"
              ayuda="Así ajustamos el lenguaje y los planes a tu caso."
            >
              <Opciones
                opciones={ROLES}
                valor={respuestas.rol}
                onElegir={(rol) => elegirYAvanzar({ rol, rolTexto: undefined }, 1)}
                otra={{
                  id: 'otra',
                  etiqueta: 'Otra situación',
                  marcador: 'Cuéntanos en pocas palabras',
                  textoInicial: respuestas.rolTexto,
                  onGuardar: (texto) => {
                    guardar({ rol: 'otra', rolTexto: texto });
                    irAPaso(1);
                  },
                }}
              />
            </Pregunta>
          )}

          {fase.tipo === 'pregunta' && fase.paso === 1 && (
            <PasoEmpresa
              refTitulo={titulo}
              varias={respuestas.rol === 'varias'}
              empresa={respuestas.empresa ?? ''}
              actividad={respuestas.actividad ?? ''}
              onContinuar={(empresa, actividad) => {
                guardar({ empresa, actividad });
                irAPaso(2);
              }}
            />
          )}

          {fase.tipo === 'pregunta' && fase.paso === 2 && (
            <Pregunta
              refTitulo={titulo}
              pasoTexto={`Pregunta 3 de ${TOTAL_PASOS}`}
              titulo="¿Cuántas personas trabajan ahí?"
              ayuda="Una estimación basta; puedes cambiarla después."
            >
              <Opciones opciones={TAMANOS} valor={respuestas.tamano} onElegir={(tamano) => elegirYAvanzar({ tamano }, 3)} />
            </Pregunta>
          )}

          {fase.tipo === 'pregunta' && fase.paso === 3 && (
            <Pregunta
              refTitulo={titulo}
              pasoTexto={`Pregunta 4 de ${TOTAL_PASOS}`}
              titulo="¿Para qué lo necesitas ahora?"
              ayuda="Elige lo más cercano a tu situación."
            >
              <Opciones
                opciones={MOTIVOS_OPCIONES}
                valor={respuestas.motivo}
                onElegir={(motivo) => elegirYAvanzar({ motivo, motivoTexto: undefined }, 4)}
                otra={{
                  id: 'otra',
                  etiqueta: 'Otra razón',
                  marcador: 'Cuéntanos en pocas palabras',
                  textoInicial: respuestas.motivoTexto,
                  onGuardar: (texto) => {
                    guardar({ motivo: 'otra', motivoTexto: texto });
                    irAPaso(4);
                  },
                }}
              />
            </Pregunta>
          )}

          {fase.tipo === 'construyendo' && (
            <Construyendo
              refTitulo={titulo}
              respuestas={respuestas}
              alTerminar={() => {
                track('resultado_visto', { perfil: perfilSugerido(respuestas) });
                setFase({ tipo: 'lista' });
              }}
              alFallar={() => setFase({ tipo: 'pregunta', paso: 0 })}
            />
          )}

          {fase.tipo === 'lista' && <RutaLista refTitulo={titulo} respuestas={respuestas} onReiniciar={reiniciar} />}
        </motion.div>
      </AnimatePresence>
    </Marco>
  );
}

function Pregunta({
  pasoTexto,
  titulo,
  ayuda,
  refTitulo,
  children,
}: {
  pasoTexto: string;
  titulo: string;
  ayuda: string;
  refTitulo: React.RefObject<HTMLHeadingElement | null>;
  children: React.ReactNode;
}) {
  return (
    <>
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">{pasoTexto}</p>
      <h1
        ref={refTitulo}
        tabIndex={-1}
        className="mt-2 text-balance text-3xl font-bold leading-tight outline-none [font-family:var(--font-display)]"
      >
        {titulo}
      </h1>
      <p className="mt-2 text-base text-[var(--text-secondary)]">{ayuda}</p>
      <div className="mt-8">{children}</div>
      <p className="mt-auto pt-8 text-center text-sm text-[var(--text-secondary)]">
        Sin tarjeta. Tus respuestas quedan guardadas.
      </p>
    </>
  );
}

function PasoEmpresa({
  refTitulo,
  varias,
  empresa,
  actividad,
  onContinuar,
}: {
  refTitulo: React.RefObject<HTMLHeadingElement | null>;
  varias: boolean;
  empresa: string;
  actividad: string;
  onContinuar: (empresa: string, actividad: string) => void;
}) {
  const [nombre, setNombre] = useState(empresa);
  const [giro, setGiro] = useState(actividad);
  const [tocado, setTocado] = useState({ nombre: false, giro: false });
  const nombreOk = nombre.trim().length >= 2;
  const giroOk = giro.trim().length >= 3;

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        setTocado({ nombre: true, giro: true });
        if (nombreOk && giroOk) onContinuar(nombre.trim(), giro.trim());
      }}
      className="flex flex-1 flex-col"
    >
      <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Pregunta 2 de {TOTAL_PASOS}</p>
      <h1
        ref={refTitulo}
        tabIndex={-1}
        className="mt-2 text-balance text-3xl font-bold leading-tight outline-none [font-family:var(--font-display)]"
      >
        {varias ? 'Empecemos por una de tus empresas' : 'Cuéntanos de tu empresa'}
      </h1>
      <p className="mt-2 text-base text-[var(--text-secondary)]">
        {varias ? 'Podrás sumar las demás cuando quieras.' : 'Solo la usamos para armar tu diagnóstico.'}
      </p>

      <div className="mt-8 flex flex-col gap-6">
        <Campo
          id="empresa"
          etiqueta={varias ? 'Nombre de la empresa o del cliente' : 'Nombre de tu empresa'}
          valor={nombre}
          marcador="Ej.: Textiles del Valle S.A.S."
          autoComplete="organization"
          error={tocado.nombre && !nombreOk ? 'Escribe el nombre de la empresa.' : undefined}
          onCambio={setNombre}
          onSalir={() => setTocado((t) => ({ ...t, nombre: true }))}
        />
        <Campo
          id="actividad"
          etiqueta="¿A qué se dedica?"
          valor={giro}
          marcador="Ej.: Confección de ropa deportiva"
          error={tocado.giro && !giroOk ? 'Cuéntanos a qué se dedica, en pocas palabras.' : undefined}
          onCambio={setGiro}
          onSalir={() => setTocado((t) => ({ ...t, giro: true }))}
        />
      </div>

      <div className="mt-auto pt-8">
        <button
          type="submit"
          className="h-14 w-full rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] transition-transform active:scale-95 [touch-action:manipulation]"
          aria-disabled={!nombreOk || !giroOk}
        >
          Continuar
        </button>
      </div>
    </form>
  );
}

function Campo({
  id,
  etiqueta,
  valor,
  marcador,
  error,
  autoComplete,
  onCambio,
  onSalir,
}: {
  id: string;
  etiqueta: string;
  valor: string;
  marcador: string;
  error?: string;
  autoComplete?: string;
  onCambio: (v: string) => void;
  onSalir: () => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-[var(--text-secondary)]">
        {etiqueta}
      </label>
      <input
        id={id}
        value={valor}
        maxLength={80}
        autoComplete={autoComplete}
        placeholder={marcador}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${id}-error` : undefined}
        onChange={(e) => onCambio(e.target.value)}
        onBlur={onSalir}
        className={`mt-2 h-14 w-full rounded-[var(--radius-card)] border bg-[var(--surface)] px-4 text-base text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] ${
          error ? 'border-[var(--nivel-1)]' : 'border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)]'
        }`}
      />
      {error && (
        <p id={`${id}-error`} role="alert" className="mt-2 flex items-center gap-2 text-sm text-[var(--accent-2)]">
          <AlertCircle size={16} aria-hidden="true" />
          {error}
        </p>
      )}
    </div>
  );
}

/* ── «Construyendo tu ruta»: 4 líneas con las respuestas reales, anillo con mesetas ── */
function Construyendo({
  refTitulo,
  respuestas,
  alTerminar,
  alFallar,
}: {
  refTitulo: React.RefObject<HTMLHeadingElement | null>;
  respuestas: RespuestasInicio;
  alTerminar: () => void;
  alFallar: () => void;
}) {
  const reduce = useReducedMotion();
  const [hecho, setHecho] = useState(0);
  const [error, setError] = useState(false);
  const [intento, setIntento] = useState(0);

  const lineas = [
    `Armando la ruta de ${respuestas.empresa ?? 'tu empresa'}`,
    `Ajustando las preguntas a una empresa ${respuestas.tamano ? TAMANO_TEXTO[respuestas.tamano] : ''}`.trim(),
    'Ordenando Ambiental, Social, Gobernanza y Económica',
    respuestas.rol === 'varias' ? 'Dejando espacio para tus demás empresas' : 'Preparando tu primer diagnóstico',
  ];

  useEffect(() => {
    const pausa = reduce ? 250 : 600;
    const ids = lineas.map((_, i) => setTimeout(() => setHecho(i + 1), pausa * (i + 1)));
    const fin = setTimeout(() => {
      if (inicioCompleto(leerInicio())) alTerminar();
      else setError(true);
    }, pausa * (lineas.length + 1));
    return () => {
      ids.forEach(clearTimeout);
      clearTimeout(fin);
    };
    // lineas depende de respuestas, que no cambian durante la pantalla.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [intento]);

  if (error) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <AlertCircle size={32} className="text-[var(--accent-2)]" aria-hidden="true" />
        <h1 ref={refTitulo} tabIndex={-1} className="mt-4 text-2xl font-bold outline-none [font-family:var(--font-display)]">
          No pudimos guardar tus respuestas
        </h1>
        <p className="mt-2 text-base text-[var(--text-secondary)]">
          Puede ser que tu navegador no deje guardar datos. Inténtalo de nuevo o vuelve a responder.
        </p>
        <button
          type="button"
          onClick={() => {
            setError(false);
            setHecho(0);
            setIntento((n) => n + 1);
          }}
          className="mt-6 flex h-14 w-full items-center justify-center gap-2 rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] [touch-action:manipulation]"
        >
          <RotateCcw size={18} aria-hidden="true" /> Reintentar
        </button>
        <button type="button" onClick={alFallar} className="mt-3 h-12 text-base text-[var(--text-secondary)] underline">
          Volver a responder
        </button>
      </div>
    );
  }

  const progreso = [8, 30, 55, 80, 96][hecho] ?? 96;
  return (
    <ConstruyendoVista
      refTitulo={refTitulo}
      lineas={lineas}
      hecho={hecho}
      progreso={progreso}
      reduce={Boolean(reduce)}
      onSaltar={() => {
        if (inicioCompleto(leerInicio())) alTerminar();
        else setError(true);
      }}
    />
  );
}

function ConstruyendoVista({
  refTitulo,
  lineas,
  hecho,
  progreso,
  reduce,
  onSaltar,
}: {
  refTitulo: React.RefObject<HTMLHeadingElement | null>;
  lineas: string[];
  hecho: number;
  progreso: number;
  reduce: boolean;
  onSaltar: () => void;
}) {
  const [mostrado, setMostrado] = useState(progreso);
  const desde = useRef(progreso);

  useEffect(() => {
    if (reduce) {
      desde.current = progreso;
      return;
    }
    const control = animate(desde.current, progreso, {
      duration: 0.55,
      ease: EASE,
      onUpdate: (v) => setMostrado(Math.round(v)),
      onComplete: () => {
        desde.current = progreso;
      },
    });
    return () => control.stop();
  }, [progreso, reduce]);

  const valor = reduce ? progreso : mostrado;

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <RuedaMini encendidos={Math.min(5, hecho)} tamano={144} />
      <p className="mt-2 text-2xl font-semibold tabular-nums text-[var(--accent)] [font-family:var(--font-display)]" aria-hidden="true">
        {valor}%
      </p>

      <h1 ref={refTitulo} tabIndex={-1} className="mt-8 text-balance text-3xl font-bold leading-tight outline-none [font-family:var(--font-display)]">
        Construyendo tu ruta
      </h1>

      <ul className="mt-8 flex w-full flex-col gap-4 text-left" aria-live="polite">
        {lineas.map((texto, i) => (
          <motion.li
            key={texto}
            initial={false}
            animate={{ opacity: hecho > i ? 1 : 0.65 }}
            transition={{ duration: 0.25 }}
            className="flex items-center gap-3 text-base"
          >
            <span
              aria-hidden="true"
              className={`flex size-6 shrink-0 items-center justify-center rounded-full ${
                hecho > i ? 'bg-[var(--accent)]' : 'border border-[color-mix(in_oklab,var(--text-tertiary)_50%,transparent)]'
              }`}
            >
              {hecho > i && <Check size={14} strokeWidth={3} color="var(--bg)" />}
            </span>
            <span className={hecho > i ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}>{texto}</span>
          </motion.li>
        ))}
      </ul>

      <button
        type="button"
        onClick={onSaltar}
        className="mt-8 h-12 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] px-6 text-base font-medium text-[var(--text-primary)] transition-transform active:scale-95 [touch-action:manipulation]"
      >
        Saltar
      </button>
    </div>
  );
}

/* ── Ruta lista: resumen personalizado y paso a la prueba gratis ── */
function RutaLista({
  refTitulo,
  respuestas,
  onReiniciar,
}: {
  refTitulo: React.RefObject<HTMLHeadingElement | null>;
  respuestas: RespuestasInicio;
  onReiniciar: () => void;
}) {
  const motivo = respuestas.motivo ?? 'otra';
  const dimensiones = [
    { nombre: 'Ambiental', icono: Leaf },
    { nombre: 'Social', icono: Users },
    { nombre: 'Gobernanza', icono: Scale },
    { nombre: 'Económica', icono: TrendingUp },
  ];

  return (
    <>
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--accent)]">Tu ruta está lista</p>
          <h1
            ref={refTitulo}
            tabIndex={-1}
            className="mt-2 text-balance text-3xl font-bold leading-tight outline-none [font-family:var(--font-display)]"
          >
            Ya sabes por dónde empezar
          </h1>
        </div>
        <motion.div initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5, ease: EASE }}>
          <RuedaMini tamano={96} />
        </motion.div>
      </div>
      <p className="mt-2 truncate text-base font-semibold text-[var(--text-primary)]">{respuestas.empresa}</p>
      <p className="mt-3 text-base text-[var(--text-secondary)]">{RESULTADO_POR_MOTIVO[motivo]}</p>

      <section aria-label="Lo que vas a diligenciar" className="mt-8 rounded-[var(--radius-card)] bg-[var(--surface)] p-5 shadow-[var(--shadow-1)]">
        <p className="text-sm font-semibold text-[var(--text-secondary)]">Vas a diligenciar</p>
        <ul className="mt-4 grid grid-cols-2 gap-3">
          {dimensiones.map(({ nombre, icono: Icono }) => (
            <li key={nombre} className="flex items-center gap-3 text-base">
              <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[var(--chip-bg)]">
                <Icono size={18} color="var(--accent)" />
              </span>
              {nombre}
            </li>
          ))}
          <li className="col-span-2 flex items-center gap-3 text-base">
            <span aria-hidden="true" className="flex size-10 shrink-0 items-center justify-center rounded-[var(--radius-button)] bg-[color-mix(in_oklab,var(--accent-2)_12%,transparent)]">
              <Layers size={18} color="var(--accent-2)" />
            </span>
            Cadena de valor
          </li>
        </ul>
        <p className="mt-4 border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] pt-4 text-sm text-[var(--text-secondary)]">
          Son cerca de 40 preguntas. Puedes parar y seguir otro día: lo que respondas queda guardado.
        </p>
      </section>

      <div className="mt-auto pt-8">
        <Link
          href="/planes"
          className="flex h-14 w-full items-center justify-center rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] shadow-[0_8px_32px_color-mix(in_oklab,var(--accent)_25%,transparent)] transition-transform active:scale-95 [touch-action:manipulation]"
        >
          Ver mis {TRIAL_DIAS} días gratis
        </Link>
        <p className="mt-3 text-center text-sm text-[var(--text-secondary)]">Sin tarjeta. No se cobra nada automáticamente.</p>
        <button type="button" onClick={onReiniciar} className="mx-auto mt-4 flex h-12 items-center text-sm text-[var(--text-secondary)] underline">
          Cambiar mis respuestas
        </button>
      </div>
    </>
  );
}
