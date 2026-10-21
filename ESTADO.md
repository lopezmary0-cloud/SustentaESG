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
- **Modelo de cuentas (decidido 2026-10-20):** la información es por EMPRESA y acumulativa. Una suscripción (persona) puede tener varias empresas; cada empresa es un espacio separado con su propio diagnóstico, historial, plan y evidencias. Nunca se mezclan datos entre empresas. Plan Empresa = 1 empresa; plan Consultor = hasta 10 empresas. Aplica igual a consultores internos y externos. Invitar a más personas a una empresa y traspasar una empresa a otra cuenta → versión posterior.
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

## Etapa 1 — Identidad visual (en curso, 2026-10-21)
- Ruta de diseño: **réplica de referencia** (el usuario envió 2 capturas de la Evaluación de Impacto B de B Lab).
- Entregado: `replica-fiel.html` (móvil + escritorio, captura al lado). Capturas: docs/revisiones/replica-fiel-375.png y replica-fiel-escritorio.png. Referencias archivadas: docs/revisiones/referencia-1-lista.png y referencia-2-tarjetas.png.
- Extracción (muestreo de píxeles de la captura 1): modo claro; fondo #FFFFFF; separadores #E0E0E0; pista de barra #DDDDDD; naranja #ED6C24; morado #7D60A9; verde #58B15F; verde azulado #287F6E; azul acero del botón ~#3F7FA6 (estimado, captura 2 oscurecida); texto #333/#555/#777; sans tipo Open Sans; radios 2 px; barras píldora; sombras suaves; ilustraciones planas de paisaje por área.
- Color por dimensión (decisión mía): Ambiental verde · Social morado · Gobernanza naranja · Económica azul · Cadena de valor verde azulado.
- Pendiente: aprobación del usuario → tour de la app (vista-previa-app.html) → FICHA-ARTE.md y tokens.
- ⚠️ El mockup está a escala (310 px): las letras pequeñas se ven de 7–8 px solo en la maqueta; en la app real las etiquetas serán ≥11 px (regla del SO).
- 2026-10-21: el usuario descartó la réplica ("se ve muy igual") → ruta propuesta por Claude (A/B/C). Líderes mirados con navegador: Coolset (serif fina Reckless + navy #060851, barras segmentadas por estado), Sweep (grotesca Maison Neue, azul #283FFF, 8 px, degradés pastel), Greenly (grotesca Pangea, verde bosque #031F18). TrackZero: sitio no accesible. Gigantes (Linear/Stripe/Notion): solo conocimiento, sin consulta.
- Opciones entregadas en `direcciones-abc.html`: A Informe editorial (Newsreader+Hanken, claro, barras segmentadas) · B Bosque de datos (Geologica+Wix Madefor, oscuro derivado, gráfico de araña) · C Tablero luminoso (Schibsted Grotesk+Figtree, azul eléctrico, bento). Capturas: docs/revisiones/direcciones-abc-escritorio.png. Fuentes verificadas cargadas (6/6), sin desbordes.
- Pendiente: elección del usuario → tour de la app → FICHA-ARTE.md + tokens.
- 2026-10-21: el usuario eligió combinar **A + C** y aportó una imagen de referencia para la parte de arriba de la página de ventas (rueda de segmentos con gota central, archivada en docs/revisiones/referencia-3-rueda.png; es una imagen de otra empresa: se toma el estilo, no sus assets).
- Combinación entregada en `combinacion-ac.html`: Newsreader (titulares y números) + Figtree (texto), tinta #0B0E4F, fondo #F4F6FD, acento #283FFF, tarjetas 14 px, barras segmentadas de A, tarjeta héroe azul de C, rueda de 5 segmentos (Ambiental, Social, Cadena de valor en la base, Gobernanza, Económica). Fondo del hero = dibujo abstracto, pendiente foto real si la quiere. Captura: docs/revisiones/combinacion-ac-escritorio.png. Fuentes cargadas, sin desbordes.
- Pendiente: aprobación → tour de la app → FICHA-ARTE.md + tokens.
- 2026-10-21 (v2): el usuario aportó una 4ª imagen (paneles oscuros con árboles y gráficos) como referencia de COLORES y de la ilustración abstracta del hero (archivada en docs/revisiones/referencia-4-bosque.png). Resultado: `combinacion-bosque.html` = A + C + rueda con paleta de bosque. Oscuro principal: fondo #0F1418, superficie #161C22, texto #E8EDE6, acento verde claro #8FBF7F, musgo #5F8A4F, arena #C9A66B, cobre #B87B4E, verde azulado #7FB3A6; hero con paisaje de datos (árbol + barras, SVG propio). Variante clara incluida (acento #3F6B3D, fondo #F1F4EC). Capturas: docs/revisiones/combinacion-bosque-escritorio.png y combinacion-bosque-hero-escritorio.png. Letras Newsreader + Figtree verificadas.
- Pendiente: elegir oscuro o claro (o versión azul anterior) → tour de la app → FICHA-ARTE.md + tokens + cálculo de contraste de cada color de texto.
- 2026-10-21: el usuario prefiere modo oscuro y delegó la decisión. **Decisión de Claude:** modo oscuro como identidad de la app y la página de ventas; informes PDF/impresos siempre en claro; selector claro/oscuro en versión posterior (tokens claros ya definidos en combinacion-bosque.html). Razón: coincide con su referencia y con la sensación de herramienta de análisis; riesgo: formularios largos en oscuro → superficies elevadas y contraste alto (por medir).
- Tour entregado: `vista-previa-app.html` (5 pantallas: recorrido de inicio, diagnóstico, resultados, plan de mejora, planes). Captura: docs/revisiones/tour-app-escritorio.png. Letras verificadas; sin desbordes. Precios mostrados = hipótesis del usuario (US$9/60 y 15/70 → en la maqueta solo anual 60/70).
- Pendiente: aprobación del tour → FICHA-ARTE.md + tokens + medición de contraste → Etapa 2 (página de ventas) previa aprobación de FICHA-AVATAR.
