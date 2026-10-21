'use client';

// La oferta del kit (anual + mensual, prueba en ambos) con un selector de perfil encima:
// Empresa (1 empresa) y Consultor (hasta 10 empresas). La estructura de la sección no cambia.
// Precios = hipótesis del usuario (US$9/60 y US$15/70), por validar. Ver docs/copy/landing.md §6.

import { useState } from 'react';
import { Oferta, type OfertaProps } from './Oferta';
import { CTA_HREF, CTA_LABEL, TRIAL_DIAS } from '@/lib/site';

type Perfil = 'empresa' | 'consultor';

const PLANES: Record<Perfil, Pick<OfertaProps, 'anual' | 'mensual'>> = {
  empresa: {
    anual: {
      nombre: 'Anual',
      badge: 'MEJOR VALOR',
      precioMes: 'US$5',
      totalAnual: 'Se cobra US$60/año',
      ahorro: '5 meses gratis',
      descomposicionDia: 'menos de US$0,17 al día',
      ctaLabel: CTA_LABEL,
      ctaHref: CTA_HREF,
      features: [
        'Diagnóstico completo de las cuatro dimensiones',
        'Plan de mejora con responsable y fecha',
        'Historial y comparación entre periodos',
        'Un espacio para tu empresa',
      ],
    },
    mensual: {
      nombre: 'Mensual',
      precioMes: 'US$9',
      ctaLabel: CTA_LABEL,
      ctaHref: CTA_HREF,
      features: [
        'Diagnóstico completo de las cuatro dimensiones',
        'Plan de mejora con responsable y fecha',
        'Historial y comparación entre periodos',
        'Cancelas cuando quieras',
      ],
    },
  },
  consultor: {
    anual: {
      nombre: 'Anual',
      badge: 'MEJOR VALOR',
      precioMes: 'US$5,83',
      totalAnual: 'Se cobra US$70/año',
      ahorro: '7 meses gratis',
      descomposicionDia: 'menos de US$0,20 al día',
      ctaLabel: CTA_LABEL,
      ctaHref: CTA_HREF,
      features: [
        'Todo lo del plan Empresa',
        'Un espacio separado por cada empresa',
        'Hasta 10 empresas en tu cuenta',
        'Historial por empresa, sin mezclar datos',
      ],
    },
    mensual: {
      nombre: 'Mensual',
      precioMes: 'US$15',
      ctaLabel: CTA_LABEL,
      ctaHref: CTA_HREF,
      features: [
        'Todo lo del plan Empresa',
        'Un espacio separado por cada empresa',
        'Hasta 10 empresas en tu cuenta',
        'Cancelas cuando quieras',
      ],
    },
  },
};

const OPCIONES: { id: Perfil; label: string; detalle: string }[] = [
  { id: 'empresa', label: 'Mi empresa', detalle: '1 empresa' },
  { id: 'consultor', label: 'Soy consultor/a', detalle: 'hasta 10 empresas' },
];

export function OfertaPorPerfil() {
  const [perfil, setPerfil] = useState<Perfil>('empresa');
  const planes = PLANES[perfil];

  const selector = (
    <div className="flex w-full max-w-md flex-col items-center gap-2">
      <p className="text-sm font-medium text-[var(--text-secondary)]">¿Para quién es tu plan?</p>
      <div
        role="tablist"
        aria-label="Tipo de plan"
        className="flex w-full gap-1 rounded-[var(--radius-button)] border border-[color-mix(in_oklab,var(--text-tertiary)_35%,transparent)] bg-[var(--surface)] p-1"
      >
        {OPCIONES.map((op) => {
          const activo = op.id === perfil;
          return (
            <button
              key={op.id}
              role="tab"
              aria-selected={activo}
              type="button"
              onClick={() => setPerfil(op.id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
                  e.preventDefault();
                  setPerfil(op.id === 'empresa' ? 'consultor' : 'empresa');
                }
              }}
              className={`flex min-h-12 flex-1 flex-col items-center justify-center rounded-[var(--radius-button)] px-3 text-sm font-semibold transition-colors duration-200 ${
                activo ? 'bg-[var(--accent)] text-[var(--bg)]' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
              }`}
            >
              {op.label}
              <span className={`text-xs font-medium ${activo ? 'opacity-80' : 'opacity-70'}`}>{op.detalle}</span>
            </button>
          );
        })}
      </div>
    </div>
  );

  return (
    <div id="planes">
      <Oferta
        key={perfil}
        tituloMarked="Empieza gratis, [acento]sin tarjeta[/acento]"
        trialDias={TRIAL_DIAS}
        selector={selector}
        anual={planes.anual}
        mensual={planes.mensual}
      />
    </div>
  );
}
