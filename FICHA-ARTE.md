# FICHA DE DIRECCIÓN DE ARTE — SustentaESG

## Referencia del usuario (CONTRATO — ver 16)
- Referencias: 4 imágenes del usuario, archivadas en docs/revisiones/: referencia-1-lista.png y referencia-2-tarjetas.png (Evaluación de Impacto B, DESCARTADAS como estilo final: "se ve muy igual"), referencia-3-rueda.png (rueda de segmentos con gota central → ADOPTADA para el hero de la página de ventas) y referencia-4-bosque.png (colores + paisaje de datos con árbol → ADOPTADA).
- Extracción vigente (mirada con la herramienta de imágenes y medición de píxeles):
  - Modo: OSCURO · Fondo #0F1418 · Superficie #161C22 · Elevada #1B2126 · Línea #2A3138
  - Texto 1º/2º: #E8EDE6 / #98A39A · Acento #8FBF7F (verde claro, en CTA, enlaces, opción activa y dato clave)
  - Paleta de apoyo (de la imagen 4): musgo #5F8A4F · arena #C9A66B · cobre #B87B4E · verde azulado #7FB3A6
  - Display: serifa fina (Newsreader) · Body: sans humanista (Figtree) · Radio 14 px tarjetas / 10 px botones
  - Sombras: suaves y oscuras, tarjetas con borde de 1 px al 6% · Layout: bento + lista + rueda semicircular
  - Detalle firma: rueda de 5 segmentos con gota central + paisaje de datos (árbol y barras)
- Prohibiciones anti-IA que la referencia LEVANTA: «sin fondo oscuro por defecto» (el oscuro viene pedido por el usuario y lo confirma su referencia). Se mantienen: sin neón, sin #000 puro, sin glow regado.

## Personalidad compilada (11)
- Adjetivos: sobria (dominante), serena, cálida
- spring bounce 0–0.05 / stiffness ~250 · duración base 250 ms · exclamaciones: máx 0
- Celebración N1: número que cuenta · N2: anillo/barra que se completa, sin confetti · N3 (diagnóstico terminado): línea de reconocimiento + puntaje que cuenta. Radio tendencial 10–14 px · color emocional: acento verde solo en la acción y el dato clave
- Arquetipo de voz: experto sobrio con calidez. Tuteo profesional de Colombia. Nunca «alto riesgo» ni culpa

## Brand kit final (tokens en docs/diseno/tokens.css)
- Fondo #0F1418 · Superficie #161C22 · Elevada #1B2126 · Texto 1º/2º #E8EDE6 / #98A39A
- Acento #8FBF7F (SOLO en: botón principal, enlace, opción elegida, dato clave) · 2ª nota: arena #C9A66B (porqué: la imagen 4 la usa en barras y hojas; marca nivel 2 y la dimensión Social)
- Semánticos: éxito #8FBF7F · aviso #C9A66B · error #E0A07A (cobre claro; evita el rojo puro sobre oscuro)
- Dimensiones: Ambiental #8FBF7F · Social #C9A66B · Gobernanza #D08A5A · Económica #7FB3A6 · Cadena de valor #7A9A52
- Niveles de madurez (barra segmentada): 0–1 cobre #B87B4E · 2 arena #C9A66B · 3 musgo #5F8A4F · 4 verde claro #A9D08E
- Display Newsreader (300/400/500) · Body Figtree (400–700) · Escala: display 52–25 px / título 17–21 px / cuerpo 13–15 px / etiqueta 11–12 px (mínimo 11 px en la app real)
- Profundidad: 3 niveles (fondo / superficie / elevada) + borde fino · Espaciado: 4·8·12·16·24·32·48·64
- Dispositivo ownable: barra segmentada de madurez (muestra cómo se reparten las respuestas por nivel) + rueda con gota
- Motion signature: cubic-bezier(0.32, 0.72, 0, 1) · stagger 60 ms · las barras se llenan de izquierda a derecha y los números cuentan hasta su valor; nada rebota
- Modo claro: tokens definidos en docs/diseno/tokens.css (acento #3F6B3D, fondo #F1F4EC) para el futuro selector. Informes PDF/impresos: siempre claros

## Medición de contraste (WCAG, calculada el 2026-10-21)
- Texto 1 / fondo 15,6 · Texto 2 / fondo 7,1 · Texto 2 / superficie 6,6 · Acento / fondo 8,8 · Texto del botón / acento 8,8
- Chips de dimensión (la más baja: Gobernanza) 4,6 · Etiquetas de prioridad 6,0–6,5 · Héroe 8,4–13,2
- Íconos de la rueda (gráficos, mínimo 3) desde 4,1 hasta 8,4 · Modo claro: texto 2 / fondo 4,9; botón 6,2
- Resultado: todo ≥ 4,5 en texto en modo oscuro; no hizo falta corregir ningún color
- ⚠️ Modo claro: solo medí texto 1/2, acento y botón. Los colores de dimensión del modo claro NO están medidos; se miden al activar el selector, antes de usarlos

## Trazabilidad y vetos
- Ruta de diseño: réplica de referencia (descartada) → propuesta propia A/B/C → combinación A + C + referencias 3 y 4
- A/B/C: elegidas A y C, combinadas · descartada B (Bosque de datos, gráfico de araña; su paleta verde se recuperó desde la imagen 4) · página comparativa: direcciones-abc.html · captura: docs/revisiones/direcciones-abc-escritorio.png
- Réplica fiel (descartada por el usuario): replica-fiel.html · capturas: docs/revisiones/replica-fiel-*.png · test de fidelidad: pasó, pero el usuario pidió otro estilo
- Combinaciones: combinacion-ac.html (azul) y combinacion-bosque.html (oscuro/claro, aprobada)
- Tour de la app: vista-previa-app.html · 5 vistas (inicio, diagnóstico, resultados, plan de mejora, planes) · aprobado por el usuario el 2026-10-21 («Me encanta el tour»)
- Líderes mirados con navegador: Coolset (serifa fina + marino + barras segmentadas), Sweep (grotesca + azul eléctrico + degradés pastel), Greenly (grotesca + verde bosque). TrackZero no accesible
- Paleta derivada de: referencia del usuario (imagen 4) · Combinación tipográfica: serifa de display + sans humanista (patrón de Coolset y editorial, validado con líderes) · Dispositivo: barra segmentada + rueda
- Registro anti-repetición: paleta «bosque oscuro» (#0F1418 / #8FBF7F / #C9A66B) y par Newsreader + Figtree vetados para el próximo proyecto del SO
- Modo DERIVADO por: pedido del usuario y su referencia (imagen 4); ver ESTADO.md

## Idioma UI: español (Colombia) · Cierre de la ficha: 2026-10-21 · Aprobada por el usuario: SÍ
