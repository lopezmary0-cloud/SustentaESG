# ESTADO — SustentaESG

**Fase:** Etapa 0 (Fundamentos) redactada, pendiente de tu OK. Cero código de la app.
**Actualizado:** 2026-10-20

## Idea
- Nombre: **SustentaESG** (antes "SOSTENIBLE 360°"). Disponibilidad de marca/dominio NO verificada.
- Web app por suscripción: diagnóstico de madurez en sostenibilidad (Ambiental, Social, Gobernanza, Económica + cadena de valor transversal), resultados por reglas, plan de mejora, historial.
- Fuentes del usuario: Especificacion_SOSTENIBLE_360_Claude_Code.md (manda para el MVP), Contexto.docx, PROPUESTA DE VALOR.docx, INVESTIGACION...docx, Perfil Cliente...docx (Downloads\RENTAS INTELIGENTES\Claude\App 1).

## Decisiones aprobadas por el usuario (2026-10-20)
1. Se vende primero a **consultores** independientes; empresas después con la misma app.
2. Primera versión = camino de venta completo + diagnóstico, resultados, plan de mejora, historial, varias empresas por usuario. Indicadores continuos, matrices e informes PDF/Excel → Etapa 6.
3. Revisión de contenido: la especialista de sostenibilidad (confirmar quién; ver METODOLOGIA-BORRADOR §6).
4. Claude redacta preguntas faltantes y condicionales como borrador → hecho en docs/producto/METODOLOGIA-BORRADOR.md.

## Decisiones tomadas por Claude en Etapa 0 (informadas, ajustables)
- Modelo de negocio (matriz 02C, nichos E/F, diagnóstico = primera victoria): **registro gratis → recorrido de inicio → diagnóstico → prueba 7 días dentro de la app (sin tarjeta, sin cobro automático) → pantalla de planes**. Variante "registro primero" porque el progreso debe guardarse. La compra por Hotmart debe SUBIR la cuenta existente, no crear otra (18). Pagos reales: fuera hasta autorización.
- Duración de prueba: 7 días (como pide Contexto.docx), configurable. ⚠️ Riesgo: puede ser corto; probar 14 en beta.
- Precio de lanzamiento (tus hipótesis, sin cambio): Empresa US$9/mes · US$60/año. Consultor US$15/mes · US$70/año.
- Límites propuestos: Empresa = 1 organización; Consultor = hasta 10 clientes (revisable). Sin IA en el MVP → costo marginal por usuario ≈ 0.
- Costos fijos estimados al vender (terceros, a verificar): Vercel Pro ~US$20/mes, Supabase Pro ~US$25/mes, dominio ~US$1/mes ≈ US$46/mes. Hotmart: ~9,9% + US$0,50 por venta según un tercero (no confirmado). Punto de equilibrio aproximado: ~4 consultores mensuales.
- Suelo de canal (publicidad): no evaluado; con US$15/mes la publicidad pagada probablemente no se paga. Se revisa antes de invertir en anuncios.

## Estado de las fichas (memoria del proyecto)
- FICHA-MERCADO.md: completa con huecos marcados NO ENCONTRADO. Vence 2027-04-20.
- FICHA-AVATAR.md: **BORRADOR**. Sin frases reales de clientes → PROHIBIDO escribir copy de venta todavía.
- FICHA-MODELO.md: **BORRADOR**. Sin revenue verificado de una app modelo.
- FICHA-ARTE.md: pendiente (Etapa 1).

## Hallazgos de mercado (fuentes en FICHA-MERCADO.md)
- Reporte de sostenibilidad en Colombia: voluntario, sin sanción (Supersociedades, 2025-11-21).
- Competidores internacionales a ≥£995/año (TrackZero) y desde €6.000/año (Coolset); no hallé precios de software ESG para pymes en Colombia.
- ⚠️ Competidores gratis: B Impact Assessment (B Lab) y el Diagnóstico de Sostenibilidad de Supersociedades. La propuesta debe ser el seguimiento, el plan y el multicliente, no solo "un diagnóstico".
- ⚠️ Cifras de tus documentos (38%, 54%, €10–50k) NO verificadas. Sí verificado: 23% reporta (Supersociedades 2024, empresas en general).

## Decisiones técnicas
- Next.js (App Router) + TypeScript + Tailwind v4 + shadcn/ui; Supabase (Postgres, Auth, RLS, Storage); Vercel.
- Motor de cálculo = módulo TypeScript puro con pruebas (Vitest); preguntas/reglas versionadas; modelo multiorganización por membresía desde el día 1.
- Sin IA generativa ni pagos reales en el MVP. Evidencia v1 = nota/enlace (archivos en v1.1).
- Orden: ventas → recorrido de inicio → planes → login → app → servicios reales (Supabase real, Vercel, Resend, dominio). Capa de datos local con la misma forma que las tablas finales.

## Pendientes y riesgos abiertos
- ⚠️ Copy de venta: se deriva de tus documentos de investigación; NO habrá entrevistas (no aplican a esta app). Se desbloquea cuando apruebes la FICHA-AVATAR.
- ⚠️ Verificar en Hotmart: comisión Colombia, si la prueba pide tarjeta, plazos de garantía, comportamiento de PSE.
- ⚠️ Nombre/dominio/marca SustentaESG sin verificar (SIC).
- ⚠️ Ley 1581: política de privacidad y rol Responsable/Encargado → revisión de abogado antes de vender.
- ⚠️ MCP Playwright (capturas a 375px) no conectó; arreglar antes de cerrar pantallas.
- ⚠️ La especialista debe revisar la metodología (pesos, umbrales, preguntas) antes de lanzar.

## Próximo paso
Tu OK a la Etapa 0 → Etapa 1 (identidad visual): pregunta de referencia + 3 estilos.
