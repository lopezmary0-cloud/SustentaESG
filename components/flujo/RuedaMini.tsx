// Rueda de 5 segmentos con la gota al centro: la firma visual de la ficha de arte, en pequeño.
// Los segmentos se encienden de a uno (progreso) o todos a la vez (completa).

const CX = 100;
const R_EXT = 92;
const R_INT = 58;
const HUECO = 5;

function punto(radio: number, grados: number) {
  const a = ((grados - 90) * Math.PI) / 180;
  return `${(CX + radio * Math.cos(a)).toFixed(1)} ${(CX + radio * Math.sin(a)).toFixed(1)}`;
}

const SEGMENTOS = [0, 1, 2, 3, 4].map((i) => {
  const ini = i * 72 + HUECO / 2;
  const fin = (i + 1) * 72 - HUECO / 2;
  return [
    `M${punto(R_EXT, ini)}`,
    `A${R_EXT} ${R_EXT} 0 0 1 ${punto(R_EXT, fin)}`,
    `L${punto(R_INT, fin)}`,
    `A${R_INT} ${R_INT} 0 0 0 ${punto(R_INT, ini)}Z`,
  ].join(' ');
});

export function RuedaMini({ encendidos = 5, tamano = 128 }: { encendidos?: number; tamano?: number }) {
  return (
    <svg viewBox="0 0 200 200" width={tamano} height={tamano} aria-hidden="true" className="shrink-0">
      {SEGMENTOS.map((d, i) => (
        <path
          key={i}
          d={d}
          fill={i < encendidos ? `var(--rueda-${i + 1})` : 'color-mix(in oklab, var(--text-tertiary) 22%, transparent)'}
          style={{ transition: 'fill 400ms cubic-bezier(0.32,0.72,0,1)' }}
        />
      ))}
      <circle cx="100" cy="100" r="44" fill="var(--gota)" stroke="var(--gota-borde)" strokeWidth="2" />
      <path
        d="M100 76 C100 76 82 98 82 109 A18 18 0 0 0 118 109 C118 98 100 76 100 76Z"
        fill={encendidos >= 5 ? 'var(--accent)' : 'color-mix(in oklab, var(--accent) 45%, transparent)'}
        style={{ transition: 'fill 400ms cubic-bezier(0.32,0.72,0,1)' }}
      />
    </svg>
  );
}
