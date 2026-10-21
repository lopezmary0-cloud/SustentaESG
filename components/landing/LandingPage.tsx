'use client';

// Página de ventas de SustentaESG — las 10 secciones canónicas de 19, en orden.
// Todo el copy sale de docs/copy/landing.md (trazado a FICHA-AVATAR.md). Estilo: FICHA-ARTE.md.

import { FileSpreadsheet, Repeat, SearchX } from 'lucide-react';
import { Hero } from './Hero';
import { HeroVisual } from './HeroVisual';
import { Problema } from './Problema';
import { Agitacion } from './Agitacion';
import { Solucion } from './Solucion';
import { AppPorDentro } from './AppPorDentro';
import { OfertaPorPerfil } from './OfertaPorPerfil';
import { Garantia } from './Garantia';
import { Faq } from './Faq';
import { CtaFinal } from './CtaFinal';
import { FooterLegal } from './FooterLegal';
import { StickyCtaMobile } from './ui';
import { ANIO_COPYRIGHT, APP_NAME, CTA_HREF, CTA_LABEL, SOPORTE_EMAIL } from '@/lib/site';

export function LandingPage() {
  return (
    <div className="min-h-dvh bg-[var(--bg)] text-[var(--text-primary)] [font-family:var(--font-body)]">
      {/* 1. HERO */}
      <Hero
        appName={APP_NAME}
        h1Marked="Deja de [acento]reconstruir tus datos[/acento] de sostenibilidad"
        subtitleMarked="Tu [b]Rueda de Madurez[/b] muestra qué tienes, qué te falta y qué hacer primero."
        ctaLabel={CTA_LABEL}
        ctaHref={CTA_HREF}
        socialProof={<span>7 días de prueba · sin tarjeta · un espacio por empresa</span>}
        visual={<HeroVisual />}
      />

      {/* 2. PROBLEMA */}
      <Problema
        titulo="¿Te suena?"
        preguntas={[
          { icon: Repeat, textoMarked: '¿Rehaces el mismo diagnóstico [b]cada vez[/b] que te piden información?' },
          { icon: FileSpreadsheet, textoMarked: '¿Tienes todo en Excel y [b]no sabes cuál es la última versión[/b]?' },
          { icon: SearchX, textoMarked: '¿Te piden datos y [b]no sabes qué tienes ni qué te falta[/b]?' },
        ]}
      />

      {/* 3. AGITACIÓN */}
      <Agitacion
        frases={[
          'Cada pedido de información te obliga a [b]volver a juntar los mismos datos[/b].',
          'Mientras buscas la última versión, [acento]se va el tiempo[/acento] que podrías dedicar a mejorar.',
          'Las plantillas guardan datos, pero [b]no te dicen qué falta ni qué hacer primero[/b].',
        ]}
      />

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
        antesDespues={{
          labelAntes: 'Antes',
          antes: 'Datos en varios archivos, versiones sueltas y un informe armado a las carreras.',
          labelDespues: 'Después',
          despues: 'Un espacio por empresa con tu diagnóstico, tu plan y tu historial.',
        }}
      />

      {/* 5. LA APP POR DENTRO — vistas previas del diseño (la app se está construyendo) */}
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

      {/* 6. OFERTA — anual primero, prueba en ambos planes */}
      <OfertaPorPerfil />

      {/* 7. GARANTÍA */}
      <Garantia
        nombre="la Garantía del Primer Diagnóstico"
        condicionMarked="Pruebas 7 días gratis y, solo si decides pagar, tienes 7 días más para pedir tu reembolso. [b]Si tu primer diagnóstico no te sirve, te devolvemos tu dinero[/b]. Sin preguntas."
        pisoLegal="Un correo basta para pedirlo"
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
        psMarked="PS: SustentaESG ordena tu diagnóstico, tu plan y tu historial con la Rueda de Madurez, un espacio por empresa. Hoy empiezas con 7 días gratis, sin tarjeta, y la Garantía del Primer Diagnóstico."
      />

      {/* 10. FOOTER LEGAL — todas las páginas enlazadas existen */}
      <FooterLegal
        appName={APP_NAME}
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
