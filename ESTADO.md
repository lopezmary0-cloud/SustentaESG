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
- ⚠️ Copy de venta: se deriva de tus documentos de investigación. Se desbloquea cuando apruebes la FICHA-AVATAR.
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

## Etapa 1 — CERRADA (2026-10-21)
- Tour aprobado por el usuario. FICHA-ARTE.md escrita y aprobada; tokens en docs/diseno/tokens.css (se vuelcan a globals.css al crear el proyecto de la app).
- Dirección de arte (registro anti-repetición): «Bosque oscuro» · dispositivo: barra segmentada de madurez + rueda con gota · paleta #0F1418/#8FBF7F/#C9A66B · par Newsreader + Figtree.
- Contraste medido: todo texto del modo oscuro ≥ 4,5. Modo claro: colores de dimensión sin medir.
- Siguiente: Etapa 2 (página de ventas). BLOQUEO: el usuario debe aprobar FICHA-AVATAR.md (copy se deriva de ahí). Después: leer 19, 52, 55, kit plantillas-codigo/landing.
- Pendientes que siguen abiertos: nombre/dominio SustentaESG sin verificar · Hotmart (comisión, prueba, garantía, PSE) sin verificar · abogado para política de datos (Ley 1581) · especialista revisa METODOLOGIA-BORRADOR · fotos reales para el hero (hoy ilustración) · Playwright MCP ya conecta (se usó para capturas).

## Novedades del usuario (2026-10-21)
- Nombre: el usuario confirma que **SustentaESG está disponible** (no verificado por Claude; falta anotar dónde lo comprobó: dominio, marca SIC o ambos). Queda cerrado el pendiente del nombre; el dominio se compra cuando el usuario lo autorice (costo ~US$10–15/año).
- Parte de arriba de la página de ventas: usar **la imagen de la propia app** (pantallas bonitas de la app) en lugar de una foto. Se cierra el pendiente de "foto real". Etapa 2: el hero muestra la app (resultados con la rueda y las barras) sobre el paisaje oscuro; las capturas reales reemplazan a las maquetas cuando la app exista. Sin testimonios ni cifras de clientes.
- FICHA-AVATAR actualizada: el usuario es quien lleva la sostenibilidad de una o varias empresas, interno o externo. Presentada al usuario en simple para aprobar.
- 2026-10-21: el usuario aportó un análisis de razones de compra. Comparado con los documentos previos → docs/producto/PROPUESTA-DE-VALOR.md v2: una frase + 3 razones (tiempo, dinero, prepararse para pedidos de clientes) + dos puertas de entrada (interno/externo) + lista de lo que se puede y no se puede decir. Se descartan promesas fuertes de dos documentos previos (grado de auditoría, 5 minutos, evita perder contratos). FICHA-AVATAR actualizada (disparador de compra, ángulo, deseo 5). Verificado: VSME = Recomendación (EU) 2025/1710 del 30-jul-2025, voluntaria; solo contexto, no va en la página.
- Validación: medir uso en la prueba de 7 días (activación, diagnóstico terminado, retorno día 3/7, planes, pago).
- 2026-10-21 (corrección): el usuario aclaró que el texto pegado antes era una parte incompleta; el documento correcto es «Propuesta de valor mejorada.docx». Contenido leído completo: 3 versiones de propuesta (V1 preparación comercial = recomendada, V2 eficiencia, V3 gestión continua), tabla problema→resultado, 10 razones de compra (3 fuertes: tiempo, dinero, prepararse) y dos públicos. PROPUESTA-DE-VALOR.md actualizada: posicionamiento = V1; titular = V2; retención = V3; alcance real de lo que la página puede prometer (sin informes descargables ni subir archivos todavía: evidencias = nota o enlace en v1). FICHA-AVATAR: dolores 6 y 7 añadidos.
- Decisión abierta para el usuario (no bloquea): si quiere subir archivos como evidencia ya en la primera versión (cuesta almacenamiento privado y más seguridad) o dejarlo para después de validar (recomendado).
- 2026-10-21: FICHA-AVATAR APROBADA por el usuario → se desbloquea el copy de venta. Etapa 2 (página de ventas) iniciada.

## Etapa 2 — Página de ventas (en curso, 2026-10-21)
- Proyecto de la app creado en la raíz: Next.js 16.4.2 + React 19.3 + Tailwind 4 + motion + lucide-react (instalados por scaffold; `npm outdated` pendiente). tsc, lint y build limpios (queda 1 aviso del kit: <img> del carrusel; las vistas previas son PNG locales).
- Página: components/landing/LandingPage.tsx (10 secciones canónicas, orden del 19) con el kit copiado a components/landing/. Tokens: app/tokens.css (FICHA-ARTE). Copy: docs/copy/landing.md (v1.1). Big Idea: «No te falta información: te falta un lugar donde quede ordenada por dimensión y por empresa». Mecanismo bautizado: la Rueda de Madurez. CTA único: «Iniciar mi diagnóstico gratis» → /onboarding.
- Desviaciones del kit (justificadas): (1) CtaFinal usa --cta-fondo/--cta-texto en vez de invertir a crema (el acento claro no se leía sobre fondo claro; el kit asumía tema claro). (2) Oferta envuelta en OfertaPorPerfil: selector «Mi empresa / Soy consultor/a» porque hay dos planes por audiencia (cada uno con anual+mensual y prueba). (3) Hero con visual propio (HeroVisual: rueda + paisaje de datos). (4) Hero/LegalPage/onboarding usan next/link.
- Páginas creadas: /onboarding (pantalla honesta «estamos terminando»; el recorrido real es Etapa 3), /privacidad, /terminos, /reembolsos, /aviso (borradores con banner «versión preliminar, en revisión legal»).
- Revisión independiente (revisor-visual): 1.ª ronda NO LISTA (28/40 · 15/20 · copy 14/20) → corregido: Problema 3 preguntas, Agitación 2 frases sin caja duplicada, datos reales del producto en la solución (≈40 preguntas), ambos botones de la oferta iguales, garantía con secuencia clara sin nombrar la pasarela, flechas de teclado en el selector. 2.ª ronda en curso. Veredicto: docs/revisiones/landing-veredicto.md.
- Pendientes (anotados, no bloquean esta etapa): ⚠️ imágenes del carrusel = vistas previas del diseño (reemplazar por capturas reales al terminar la app, paso obligatorio) · ⚠️ correo de soporte soporte@sustentaesg.com es provisional (depende de comprar el dominio) · ⚠️ garantía de 7 días y comisión: configurar y verificar en Hotmart antes de publicar · ⚠️ páginas legales en borrador: revisión de abogado (Ley 1581) · ⚠️ precios US$9/60 y 15/70 son hipótesis.
- npm outdated (2026-10-21): majors NO adoptadas a propósito: eslint 10, typescript 7, @types/node 26 (se mantienen las del scaffold hasta tener la app construida). react 19.3.1 es parche. npm audit (producción): 0 vulnerabilidades.


## Problemas conocidos
- garantía: la página promete la Garantía del Primer Diagnóstico (14 días desde la compra; prueba de 7 días en la app). Plazos anotados en FICHA-MERCADO.md (Prueba elegida: 7 · Garantía elegida: 14) pero SIN verificar en Hotmart: se verifica y configura antes de publicar; si Hotmart no lo permite, se quita la garantía del copy. Bloquea PUBLICAR, no la construcción.
- FICHA-MERCADO: plazos de garantía de Hotmart, comisión y comportamiento de PSE sin verificar (requiere cuenta de Hotmart).
- direcciones-abc / vista-previa / veredicto: la revisión independiente de la landing sigue en NO LISTA (3.ª ronda pendiente) — ver docs/revisiones/landing-veredicto.md.
- landing / veredicto del revisor (5.ª ronda, 2026-10-21): usabilidad 34/40 (techo sin flujo real = 35; hacen falta 36), craft 16/20 ✓, copy 17/20 ✓. NO LISTA solo por usabilidad: faltan criterios que dependen del flujo real de la Etapa 3 (carga con red lenta, deshacer/volver, validación de formularios, atajos del flujo, errores reales de registro y pago). Se cerró el único punto recuperable (barra fija sin tapar contenido, h8) → se espera 35. DECISIÓN DEL USUARIO PENDIENTE: aceptar 35 como techo previo a la Etapa 3 y volver a pasar el revisor al terminar el flujo real. Pendientes menores del revisor (no bloquean): entrada escalonada y rueda animada en el hero (movimiento 3→4), grano/gradiente en el fondo (profundidad 3→4), un dato verificable del método (especificidad 3→4).
