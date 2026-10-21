'use client';

// Página de ventas de SustentaESG — las 10 secciones canónicas de 19, en orden.
// Todo el copy sale de docs/copy/landing.md (trazado a FICHA-AVATAR.md). Estilo: FICHA-ARTE.md.

import { Clock, FileSpreadsheet, RotateCcw, SearchX, TrendingUp } from 'lucide-react';
import { Hero } from './Hero';
import { EjemploResultado } from './EjemploResultado';
import { HeroVisual } from './HeroVisual';
import { Problema } from './Problema';
import { AgitacionCosto } from './AgitacionCosto';
import { Solucion } from './Solucion';
import { AppPorDentro } from './AppPorDentro';
import { OfertaPorPerfil } from './OfertaPorPerfil';
import { Garantia } from './Garantia';
import { Faq } from './Faq';
import { CtaFinal } from './CtaFinal';
import { FooterLegal } from './FooterLegal';
import { CtaButton, StickyCtaMobile } from './ui';
import { ANIO_COPYRIGHT, APP_NAME, CTA_HREF, CTA_LABEL, SOPORTE_EMAIL } from '@/lib/site';

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] pb-20 text-[var(--text-primary)] [font-family:var(--font-body)] md:pb-0">
      {/* 1. HERO */}
      <Hero
        appName={APP_NAME}
        h1Marked="Deja de [acento]reconstruir tus datos[/acento] de sostenibilidad"
        subtitleMarked="Tu [b]Rueda de Madurez[/b] muestra qué tienes, qué te falta y qué hacer primero."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        socialProof={<span>ESG: ambiental, social y de gobernanza · 7 días gratis · sin tarjeta</span>}
        visual={<HeroVisual />}
      />

      {/* 2. PROBLEMA */}
      <Problema
        titulo="¿Rehaces tu diagnóstico cada vez que te lo piden?"
        preguntas={[
          { icon: FileSpreadsheet, textoMarked: '¿Tienes todo en Excel y [b]no sabes cuál es la última versión[/b]?' },
          { icon: SearchX, textoMarked: '¿Te piden datos y [b]no sabes qué tienes ni qué te falta[/b]?' },
          { icon: TrendingUp, textoMarked: '¿Necesitas mostrar avances y [b]solo tienes documentos sueltos[/b]?' },
        ]}
      />

      {/* 3. AGITACIÓN */}
      <AgitacionCosto />

      {/* 4. SOLUCIÓN — mecanismo bautizado: la Rueda de Madurez */}
      <Solucion
        tituloMarked="Tu sostenibilidad, [acento]ordenada una sola vez[/acento]"
        mecanismo="la Rueda de Madurez"
        bigIdeaMarked="No te falta información: te falta un lugar donde [b]quede ordenada por dimensión y por empresa[/b] y se pueda actualizar."
        pasos={[
          { titulo: 'Diagnostica', detalle: 'Responde unas 40 preguntas guiadas en cuatro dimensiones, con guardado automático.' },
          { titulo: 'Prioriza', detalle: 'Ve tu puntaje por dimensión, tus brechas y un plan con responsable y fecha.' },
          { titulo: 'Demuestra avance', detalle: 'Actualiza cuando quieras y compara tus resultados entre periodos.' },
        ]}
        ejemplo={<EjemploResultado />}
        antesDespues={{
          labelAntes: 'Antes',
          antes: 'Datos en varios archivos, versiones sueltas y un informe armado a las carreras.',
          labelDespues: 'Después',
          despues: 'Un espacio por empresa con tu diagnóstico, tu plan y tu historial.',
        }}
        cta={<CtaButton href={CTA_HREF}>{CTA_LABEL}</CtaButton>}
      />

      {/* 5. LA APP POR DENTRO — vistas previas del diseño (la app se está construyendo) */}
      <div className="pb-16 md:pb-0">
      <AppPorDentro
        kicker="VISTAS PREVIAS DEL DISEÑO"
        tituloMarked="Así se verá [acento]tu diagnóstico[/acento]"
        frames={[
          { src: '/app-previews/inicio.png', alt: 'Pantalla de inicio: cuéntanos de tu empresa', label: 'Cuéntanos de tu empresa' },
          { src: '/app-previews/diagnostico.png', alt: 'Pantalla de diagnóstico con la escala de 0 a 4', label: 'Responde con calma, se guarda solo' },
          { src: '/app-previews/resultados.png', alt: 'Pantalla de resultados por dimensión', label: 'Mira dónde estás por dimensión' },
          { src: '/app-previews/plan.png', alt: 'Pantalla del plan de mejora', label: 'Convierte brechas en acciones' },
          { src: '/app-previews/planes.png', alt: 'Pantalla para elegir plan', label: 'Elige cómo seguir' },
        ]}
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
      />
      </div>

      {/* 6. OFERTA — anual primero, prueba en ambos planes */}
      <OfertaPorPerfil />

      {/* 7. GARANTÍA */}
      <Garantia
        nombre="La Garantía del Primer Diagnóstico"
        condicionMarked="Si tu primer diagnóstico no te sirve, [b]te devolvemos tu dinero[/b]. Sin preguntas."
        cajas={[
          { icon: Clock, titulo: '7 días gratis', detalle: 'Sin tarjeta y sin cobro automático.' },
          { icon: RotateCcw, titulo: '14 días para pedir tu reembolso', detalle: 'Solo si decides pagar.' },
        ]}
        pisoLegal="Un correo basta para pedirlo"
        cta={<CtaButton href={CTA_HREF}>{CTA_LABEL}</CtaButton>}
      />

      {/* 8. FAQ */}
      <Faq
        items={[
          {
            pregunta: 'Ya tengo mis plantillas. ¿Para qué otra herramienta?',
            respuestaMarked:
              'Tus plantillas guardan datos; la Rueda de Madurez además [b]te dice qué falta, propone un plan y guarda el historial[/b].',
          },
          {
            pregunta: '¿De verdad me ahorra tiempo?',
            respuestaMarked:
              'Reutilizas tus datos en cada evaluación nueva. En tus 7 días de prueba [b]lo compruebas con tu propia empresa[/b].',
          },
          {
            pregunta: '¿Cómo sé que los resultados son correctos?',
            respuestaMarked:
              'Cada hallazgo muestra las respuestas que lo originan y [b]ninguna IA inventa tus puntajes[/b]. Es una guía orientativa, no una certificación.',
          },
          {
            pregunta: '¿Qué pasa con la información confidencial?',
            respuestaMarked: 'Cada empresa vive en su propio espacio y [b]sus datos nunca se mezclan con los de otra[/b].',
          },
          {
            pregunta: '¿Me reemplaza a mí o a mi consultor?',
            respuestaMarked:
              'No. Es tu herramienta de trabajo: [b]ordena la información y tú pones el criterio[/b]. Pides ayuda externa solo cuando la necesites.',
          },
          {
            pregunta: '¿Cuánto cuesta y puedo cancelar?',
            respuestaMarked:
              'Empiezas con 7 días gratis y sin tarjeta. Después, desde [b]US$5 al mes[/b] en el plan anual. Cancelas cuando quieras.',
          },
        ]}
      />

      {/* 9. CTA FINAL */}
      <CtaFinal
        h2Marked="Imagina responder con [acento]todo en orden[/acento]"
        futurePacingMarked="La próxima vez que te pidan información, abres tu empresa, miras tu Rueda de Madurez y sabes qué tienes y qué te falta."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        recap="Garantía del Primer Diagnóstico · 7 días gratis sin tarjeta"
        psMarked="PS: Hoy entras con 7 días gratis, sin tarjeta, y con la Garantía del Primer Diagnóstico."
      />

      {/* 10. FOOTER LEGAL — todas las páginas enlazadas existen */}
      <FooterLegal
        appName={APP_NAME}
        logo={<span aria-hidden="true" className="size-6 rounded-[8px] bg-[var(--accent)]" />}
        soporteEmail={SOPORTE_EMAIL}
        anio={ANIO_COPYRIGHT}
        enlaces={[
          { label: 'Privacidad', href: '/privacidad' },
          { label: 'Términos y Condiciones', href: '/terminos' },
          { label: 'Reembolsos', href: '/reembolsos' },
          { label: 'Aviso de uso', href: '/aviso' },
        ]}
      />

      <StickyCtaMobile labelComercial={CTA_LABEL} href={CTA_HREF} />
    </div>
  );
}
