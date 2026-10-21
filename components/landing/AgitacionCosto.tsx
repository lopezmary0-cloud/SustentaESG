'use client';

// §3 AGITACIÓN (versión escaneable). Sustituye a la Agitación del kit, que solo admite frases y
// una caja de contraste. Aquí: título que se entiende solo, 3 mini-tarjetas con ícono y una
// calculadora con los números DE LA PERSONA (el costo de la inacción sin inventar cifras).
// Mismo fondo elevado que el Problema (un solo movimiento visual, 55 §3). Desviación del kit
// anotada en ESTADO.md.

import { useState } from 'react';
import { motion } from 'motion/react';
import { FileSpreadsheet, Minus, Plus, Repeat, SearchX } from 'lucide-react';
import { IconChip, SectionShell, useReveal, VIEWPORT_ONCE } from './ui';
import { MarkedCopy } from './MarkedCopy';

const TARJETAS = [
  { icon: Repeat, titulo: 'Rehaces', detalle: 'El mismo diagnóstico, cada vez que te lo piden.' },
  { icon: FileSpreadsheet, titulo: 'Buscas', detalle: 'La última versión entre Excel y correos.' },
  { icon: SearchX, titulo: 'Adivinas', detalle: 'Qué te falta, hasta que alguien lo pregunta.' },
];

const formato = new Intl.NumberFormat('es-CO', { maximumFractionDigits: 1 });

function Contador({
  etiqueta,
  valor,
  onCambio,
  max,
}: {
  etiqueta: string;
  valor: number;
  onCambio: (n: number) => void;
  max: number;
}) {
  const ajustar = (n: number) => onCambio(Math.min(max, Math.max(0, n)));
  return (
    <div>
      <label className="block text-sm font-medium text-[var(--text-secondary)]">{etiqueta}</label>
      <div className="mt-2 flex items-center gap-2">
        <button
          type="button"
          aria-label={`Menos: ${etiqueta}`}
          onClick={() => ajustar(valor - 1)}
          className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] text-[var(--text-primary)] [touch-action:manipulation]"
        >
          <Minus size={20} aria-hidden="true" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          max={max}
          value={valor}
          aria-label={etiqueta}
          onChange={(e) => ajustar(Number(e.target.value) || 0)}
          className="h-12 w-full min-w-0 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] bg-[var(--bg)] px-2 text-center text-xl font-semibold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]"
        />
        <button
          type="button"
          aria-label={`Más: ${etiqueta}`}
          onClick={() => ajustar(valor + 1)}
          className="flex size-12 shrink-0 items-center justify-center rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_40%,transparent)] text-[var(--text-primary)] [touch-action:manipulation]"
        >
          <Plus size={20} aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}

export function AgitacionCosto({ id }: { id?: string }) {
  const { contenedor, item } = useReveal();
  // Valores de ejemplo para que la tarjeta no se vea vacía; la persona los cambia por los suyos.
  const [horas, setHoras] = useState(4);
  const [informes, setInformes] = useState(6);
  const total = horas * informes;
  const jornadas = total / 8;

  return (
    <SectionShell id={id} elevacion="elevada" flush="top" ariaLabel="El costo de seguir igual">
      <motion.div
        variants={contenedor}
        initial="hidden"
        whileInView="visible"
        viewport={VIEWPORT_ONCE}
        className="mx-auto max-w-[620px]"
      >
        <motion.h2
          variants={item}
          className="text-balance text-[30px] font-bold leading-[1.15] text-[var(--text-primary)] [font-family:var(--font-display)] md:text-[40px]"
        >
          <MarkedCopy text="Cada pedido te cuesta [acento]volver a empezar[/acento]" />
        </motion.h2>

        <ul className="mt-8 flex flex-col gap-3">
          {TARJETAS.map((t) => (
            <motion.li
              key={t.titulo}
              variants={item}
              className="flex items-center gap-4 rounded-[var(--radius-card)] bg-[var(--bg)] p-4 shadow-[var(--shadow-1)]"
            >
              <IconChip icon={t.icon} tone="muted" />
              <div>
                <p className="text-[17px] font-semibold text-[var(--text-primary)]">{t.titulo}</p>
                <p className="mt-0.5 text-[15px] leading-snug text-[var(--text-secondary)]">{t.detalle}</p>
              </div>
            </motion.li>
          ))}
        </ul>

        <motion.div
          variants={item}
          className="mt-8 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--accent)_30%,transparent)] bg-[var(--bg)] p-5"
        >
          <p className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[var(--accent)]">
            Calcula tu costo de rehacer
          </p>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">Ejemplo: cámbialo por tus números.</p>

          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <Contador etiqueta="Horas por informe" valor={horas} onCambio={setHoras} max={200} />
            <Contador etiqueta="Informes al año" valor={informes} onCambio={setInformes} max={500} />
          </div>

          <div className="mt-5 border-t border-[color-mix(in_oklab,var(--text-tertiary)_25%,transparent)] pt-4" aria-live="polite">
            <p className="text-[36px] font-bold leading-none tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
              {formato.format(total)} <span className="text-[17px] font-semibold text-[var(--text-secondary)]">horas al año</span>
            </p>
            <p className="mt-2 text-[15px] text-[var(--text-secondary)]">
              son <strong className="font-semibold text-[var(--text-primary)]">{formato.format(jornadas)} jornadas</strong> de 8 horas rehaciendo lo mismo.
            </p>
          </div>
          <p className="mt-3 text-xs text-[var(--text-tertiary)]">Es una cuenta con tus números, no una estadística.</p>
        </motion.div>
      </motion.div>
    </SectionShell>
  );
}
