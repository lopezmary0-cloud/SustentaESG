'use client';

// Lista de opciones de una sola decisión (chips grandes de 60 px) con salida «Otra cosa».
// Selección única: al elegir, avisa al padre (que avanza solo a los 300 ms).

import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { Check } from 'lucide-react';

export interface Opcion<T extends string> {
  id: T;
  titulo: string;
  detalle?: string;
}

export function Opciones<T extends string>({
  opciones,
  valor,
  onElegir,
  otra,
}: {
  opciones: Opcion<T>[];
  valor?: T;
  onElegir: (id: T) => void;
  otra?: { id: T; etiqueta: string; marcador: string; textoInicial?: string; onGuardar: (texto: string) => void };
}) {
  const [abierta, setAbierta] = useState(valor !== undefined && otra?.id === valor);
  const [texto, setTexto] = useState(otra?.textoInicial ?? '');
  const valido = texto.trim().length >= 3;

  return (
    <div className="flex flex-col gap-3" role="radiogroup">
      {opciones.map((o, i) => (
        <Chip
          key={o.id}
          retraso={i * 0.06}
          titulo={o.titulo}
          detalle={o.detalle}
          activo={valor === o.id && !abierta}
          onClick={() => {
            setAbierta(false);
            onElegir(o.id);
          }}
        />
      ))}
      {otra && (
        <>
          <Chip
            titulo={otra.etiqueta}
            detalle="Cuéntanos en pocas palabras."
            retraso={opciones.length * 0.06}
            activo={abierta}
            onClick={() => setAbierta(true)}
          />
          {abierta && (
            <form
              className="flex flex-col gap-3"
              onSubmit={(e) => {
                e.preventDefault();
                if (valido) otra.onGuardar(texto.trim());
              }}
            >
              <label htmlFor="otra-cosa" className="sr-only">
                {otra.etiqueta}
              </label>
              <input
                id="otra-cosa"
                autoFocus
                value={texto}
                maxLength={120}
                onChange={(e) => setTexto(e.target.value)}
                placeholder={otra.marcador}
                className="h-14 w-full rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] bg-[var(--surface)] px-4 text-[16px] text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)]"
              />
              <button
                type="submit"
                disabled={!valido}
                className="h-14 rounded-[var(--radius-button)] bg-[var(--accent)] text-base font-semibold text-[var(--bg)] disabled:opacity-40 [touch-action:manipulation]"
              >
                Continuar
              </button>
            </form>
          )}
        </>
      )}
    </div>
  );
}

function Chip({
  titulo,
  detalle,
  activo,
  retraso,
  onClick,
}: {
  titulo: string;
  detalle?: string;
  activo: boolean;
  retraso: number;
  onClick: () => void;
}) {
  const reduce = useReducedMotion();
  return (
    <motion.button
      type="button"
      role="radio"
      aria-checked={activo}
      initial={{ opacity: 0, y: reduce ? 0 : 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: reduce ? 0 : retraso, ease: [0.32, 0.72, 0, 1] }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`flex min-h-16 w-full items-center gap-3 rounded-[var(--radius-card)] border px-4 py-3 text-left transition-colors duration-150 [touch-action:manipulation] ${
        activo
          ? 'border-[var(--accent)] bg-[var(--chip-bg)]'
          : 'border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface)] hover:border-[color-mix(in_oklab,var(--accent)_45%,transparent)]'
      }`}
    >
      <span className="flex-1">
        <span className="block text-lg font-semibold leading-snug text-[var(--text-primary)]">{titulo}</span>
        {detalle && <span className="mt-1 block text-sm leading-snug text-[var(--text-secondary)]">{detalle}</span>}
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
}
