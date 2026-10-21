// Ejemplo de resultado (prueba concreta del mecanismo). Rotulado SIEMPRE como ejemplo:
// la empresa y los puntajes son de muestra, no son resultados de ningún cliente (19 §5).

const DIMENSIONES = [
  { nombre: 'Ambiental', puntaje: '48,9', valor: 48.9, color: 'var(--rueda-1)', nota: 'Brecha: residuos y energía sin medición' },
  { nombre: 'Social', puntaje: '61,3', valor: 61.3, color: 'var(--rueda-2)', nota: 'Fortaleza: bienestar y formación' },
  { nombre: 'Gobernanza', puntaje: '52,0', valor: 52, color: 'var(--rueda-4)', nota: 'Brecha: evidencias sin ordenar' },
  { nombre: 'Económica', puntaje: '66,7', valor: 66.7, color: 'var(--rueda-5)', nota: 'Fortaleza: control de desperdicios' },
];

export function EjemploResultado() {
  return (
    <figure className="rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--text-tertiary)_30%,transparent)] bg-[var(--surface)] p-5 md:p-6">
      <figcaption className="flex flex-wrap items-center justify-between gap-2">
        <span className="text-xs font-semibold uppercase tracking-wider text-[var(--text-tertiary)]">
          Ejemplo de resultado · empresa de ejemplo
        </span>
        <span className="rounded-full bg-[var(--chip-bg)] px-3 py-1 text-xs font-semibold text-[var(--accent)]">
          57,2 de 100 · En desarrollo
        </span>
      </figcaption>
      <ul className="mt-4 flex flex-col gap-4">
        {DIMENSIONES.map((d) => (
          <li key={d.nombre}>
            <div className="flex items-baseline justify-between gap-3">
              <span className="text-base font-semibold text-[var(--text-primary)]">{d.nombre}</span>
              <span className="text-base font-semibold tabular-nums text-[var(--text-primary)] [font-family:var(--font-display)]">
                {d.puntaje}
              </span>
            </div>
            <div
              role="img"
              aria-label={`${d.nombre}: ${d.puntaje} de 100`}
              className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[var(--surface-2)]"
            >
              <div className="h-full rounded-full" style={{ width: `${d.valor}%`, background: d.color }} />
            </div>
            <p className="mt-2 text-sm text-[var(--text-secondary)]">{d.nota}</p>
          </li>
        ))}
      </ul>
    </figure>
  );
}
