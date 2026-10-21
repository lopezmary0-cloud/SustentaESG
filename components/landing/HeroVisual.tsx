// Visual del hero: la Rueda de Madurez sobre el paisaje de datos (imagen propia de la app).
// Server component: SVG puro, sin hooks. Colores solo vía tokens (app/tokens.css).

const SEGMENTOS = [
  { d: 'M278.0 100.0 A118 118 0 0 1 258.3 165.3 L220.0 139.8 A72 72 0 0 0 232.0 100.0Z', color: 'var(--rueda-5)' },
  { d: 'M254.7 170.4 A118 118 0 0 1 200.0 211.0 L184.4 167.7 A72 72 0 0 0 217.8 142.9Z', color: 'var(--rueda-4)' },
  { d: 'M194.1 213.0 A118 118 0 0 1 125.9 213.0 L139.2 168.9 A72 72 0 0 0 180.8 168.9Z', color: 'var(--rueda-3)' },
  { d: 'M120.0 211.0 A118 118 0 0 1 65.3 170.4 L102.2 142.9 A72 72 0 0 0 135.6 167.7Z', color: 'var(--rueda-2)' },
  { d: 'M61.7 165.3 A118 118 0 0 1 42.0 100.0 L88.0 100.0 A72 72 0 0 0 100.0 139.8Z', color: 'var(--rueda-1)' },
];

const LEYENDA = [
  { nombre: 'Ambiental', color: 'var(--rueda-1)' },
  { nombre: 'Social', color: 'var(--rueda-2)' },
  { nombre: 'Cadena de valor', color: 'var(--rueda-3)' },
  { nombre: 'Gobernanza', color: 'var(--rueda-4)' },
  { nombre: 'Económica', color: 'var(--rueda-5)' },
];

const BARRAS_IZQ = [
  { x: 26, y: 222, h: 40 },
  { x: 40, y: 206, h: 56 },
  { x: 54, y: 190, h: 72 },
  { x: 68, y: 214, h: 48 },
  { x: 82, y: 198, h: 64 },
  { x: 96, y: 176, h: 86 },
  { x: 110, y: 204, h: 58 },
];

const BARRAS_DER = [
  { x: 486, y: 214, h: 48 },
  { x: 498, y: 196, h: 66 },
  { x: 510, y: 178, h: 84 },
  { x: 522, y: 160, h: 102 },
  { x: 534, y: 190, h: 72 },
];

function Paisaje() {
  return (
    <svg
      viewBox="0 0 600 300"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      className="absolute inset-x-0 top-0 h-[68%] w-full"
    >
      <defs>
        <linearGradient id="hv-area" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--pais-area-top)', stopOpacity: 0.85 }} />
          <stop offset="1" style={{ stopColor: 'var(--pais-area-bottom)', stopOpacity: 0.25 }} />
        </linearGradient>
        <linearGradient id="hv-colina" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" style={{ stopColor: 'var(--pais-colina-top)', stopOpacity: 0.9 }} />
          <stop offset="1" style={{ stopColor: 'var(--pais-colina-bottom)', stopOpacity: 0.4 }} />
        </linearGradient>
        <linearGradient id="hv-tronco" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" style={{ stopColor: 'var(--tronco-1)' }} />
          <stop offset=".5" style={{ stopColor: 'var(--tronco-2)' }} />
          <stop offset="1" style={{ stopColor: 'var(--tronco-1)' }} />
        </linearGradient>
        <radialGradient id="hv-hoja" cx=".35" cy=".3" r=".8">
          <stop offset="0" style={{ stopColor: 'var(--hoja-1)' }} />
          <stop offset=".55" style={{ stopColor: 'var(--hoja-2)' }} />
          <stop offset="1" style={{ stopColor: 'var(--hoja-3)' }} />
        </radialGradient>
        <radialGradient id="hv-arena" cx=".35" cy=".3" r=".8">
          <stop offset="0" style={{ stopColor: 'var(--hoja-arena-1)' }} />
          <stop offset=".6" style={{ stopColor: 'var(--hoja-arena-2)' }} />
          <stop offset="1" style={{ stopColor: 'var(--hoja-arena-3)' }} />
        </radialGradient>
      </defs>
      <g fill="var(--text-primary)" fillOpacity=".5">
        <circle cx="40" cy="30" r="1.4" />
        <circle cx="110" cy="62" r="1" />
        <circle cx="170" cy="22" r="1.4" />
        <circle cx="250" cy="48" r="1" />
        <circle cx="420" cy="26" r="1.4" />
        <circle cx="500" cy="58" r="1" />
        <circle cx="560" cy="24" r="1.4" />
      </g>
      <polygon
        fill="url(#hv-area)"
        points="0,262 0,214 28,204 50,218 80,172 108,196 140,150 170,180 200,128 232,160 262,112 292,150 322,134 352,176 382,156 412,196 442,182 472,212 502,192 540,214 600,200 600,262"
      />
      <polyline
        fill="none"
        stroke="var(--pais-linea)"
        strokeWidth="1.6"
        strokeLinejoin="round"
        points="0,214 28,204 50,218 80,172 108,196 140,150 170,180 200,128 232,160 262,112 292,150 322,134 352,176 382,156 412,196 442,182 472,212 502,192 540,214 600,200"
      />
      <path fill="url(#hv-colina)" d="M0 262 L0 236 Q80 214 160 238 T330 232 T500 240 T600 232 L600 262Z" />
      <g opacity=".6">
        {BARRAS_IZQ.map((b, i) => (
          <rect key={b.x} x={b.x} y={b.y} width="9" height={b.h} rx="1.5" fill={i % 2 ? 'var(--accent-2)' : 'var(--accent)'} />
        ))}
        {BARRAS_DER.map((b, i) => (
          <rect key={b.x} x={b.x} y={b.y} width="8" height={b.h} rx="1.5" fill={i % 2 ? 'var(--accent-2)' : 'var(--accent)'} />
        ))}
      </g>
      <g>
        <path d="M322 266 C324 236 322 206 316 180 C312 164 304 154 292 142" stroke="url(#hv-tronco)" strokeWidth="11" strokeLinecap="round" fill="none" />
        <path d="M318 188 C326 168 344 156 362 142" stroke="url(#hv-tronco)" strokeWidth="7" strokeLinecap="round" fill="none" />
        <path d="M324 216 C340 200 362 192 384 176" stroke="url(#hv-tronco)" strokeWidth="6" strokeLinecap="round" fill="none" />
        <circle cx="262" cy="128" r="26" fill="url(#hv-hoja)" />
        <circle cx="296" cy="100" r="36" fill="url(#hv-hoja)" />
        <circle cx="336" cy="86" r="40" fill="url(#hv-hoja)" />
        <circle cx="380" cy="104" r="36" fill="url(#hv-hoja)" />
        <circle cx="404" cy="138" r="26" fill="url(#hv-hoja)" />
        <circle cx="330" cy="128" r="34" fill="url(#hv-hoja)" />
        <circle cx="290" cy="138" r="26" fill="url(#hv-arena)" />
        <circle cx="372" cy="146" r="22" fill="url(#hv-arena)" />
      </g>
    </svg>
  );
}

function Rueda() {
  return (
    <svg
      viewBox="0 0 320 250"
      role="img"
      aria-label="Rueda de Madurez: cuatro dimensiones y la cadena de valor en la base"
      className="relative mx-auto block w-[88%] max-w-md"
    >
      <defs>
        <filter id="hv-sombra" x="-20%" y="-20%" width="140%" height="150%">
          <feDropShadow dx="0" dy="6" stdDeviation="6" floodColor="var(--bg)" floodOpacity=".7" />
        </filter>
      </defs>
      {SEGMENTOS.map((s) => (
        <path key={s.d} d={s.d} fill={s.color} />
      ))}
      <g fill="none" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <g stroke="var(--bg)" transform="translate(240.9 117.5) scale(.85)">
          <path d="M3 3v18h18" />
          <path d="M7 15l4-4 3 3 5-6" />
        </g>
        <g stroke="var(--bg)" transform="translate(206.6 166.3) scale(.85)">
          <path d="M12 3 3 8v2h18V8Z" />
          <path d="M5 10v8M9.5 10v8M14.5 10v8M19 10v8M3 21h18" />
        </g>
        <g stroke="var(--bg)" transform="translate(150 185) scale(.85)">
          <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1" />
          <path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
        </g>
        <g stroke="var(--on-rueda-claro)" transform="translate(93.4 166.3) scale(.85)">
          <circle cx="9" cy="8" r="3.5" />
          <path d="M2 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
          <path d="M17 4.5a3.5 3.5 0 0 1 0 7M22 20c0-2.6-1.6-4.6-4-5.5" />
        </g>
        <g stroke="var(--on-rueda-claro)" transform="translate(59.1 117.5) scale(.85)">
          <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.5 19 2c1 2 2 4.2 2 8 0 5.5-4.8 10-10 10Z" />
          <path d="M2 21c0-3 1.9-5.4 5.4-6" />
        </g>
      </g>
      <path
        filter="url(#hv-sombra)"
        d="M160 6 C160 6 100 62 100 104 A60 60 0 0 0 220 104 C220 62 160 6 160 6Z"
        fill="var(--gota)"
        stroke="var(--gota-borde)"
      />
      <text x="160" y="72" textAnchor="middle" fill="var(--text-secondary)" style={{ fontFamily: 'var(--font-body)', fontSize: 9.5, fontWeight: 600 }}>
        Rueda de
      </text>
      <text textAnchor="middle" fill="var(--text-primary)" style={{ fontFamily: 'var(--font-display)', fontSize: 21, fontWeight: 500, letterSpacing: '.02em' }}>
        <tspan x="160" y="96">MADUREZ</tspan>
        <tspan x="160" y="120" style={{ fontSize: 12, letterSpacing: '.12em' }}>SUSTENTAESG</tspan>
      </text>
    </svg>
  );
}

export function HeroVisual() {
  return (
    <div
      className="relative overflow-hidden pb-4 pt-[34%] md:pt-[22%]"
      style={{ background: 'linear-gradient(180deg, var(--pais-cielo-1) 0%, var(--pais-cielo-2) 45%, var(--bg) 100%)' }}
    >
      <Paisaje />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 h-[68%]"
        style={{ background: 'linear-gradient(180deg, transparent 45%, var(--bg) 100%)' }}
      />
      <div className="relative">
        <Rueda />
        <ul className="mx-auto mt-3 flex max-w-md flex-wrap justify-center gap-x-4 gap-y-2 px-4 text-[12px] font-medium text-[var(--text-secondary)]">
          {LEYENDA.map((l) => (
            <li key={l.nombre} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2 rounded-sm" style={{ background: l.color }} />
              {l.nombre}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
