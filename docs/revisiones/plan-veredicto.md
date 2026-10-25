# VEREDICTO revisor-visual — plan-de-mejora (ronda 2)
Fecha: 2026-10-23 12:00
Screenshot: docs/revisiones/plan-mi-plan-375.png
Usabilidad: 30/40
Craft: 12/20
Copy (si vende): N-A
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Top defectos: (1) desborde horizontal en Mi plan: pestañas, botón y chips llegan a ~5 px del borde derecho contra 20 px a la izquierda; (2) movimiento incompleto: sin conteo, sin cruce entre pestañas, sin animación de altura, sin celebración; (3) identidad débil: ningún dispositivo de la ficha (rueda, gota) en la pantalla; (4) filtros de estado sobre 3 acciones; (5) leyenda de la barra a 12 px y punto de dimensión apagado en Mi plan.

## Detalle
Usabilidad: h1:3 h2:3 h3:3 h4:3 h5:3 h6:3 h7:3 h8:3 h9:3 h10:3
Craft: jerarquía:3 profundidad:3 identidad:2 movimiento:2 encaje:2

Gate de carga cognitiva: 0 fallas bloqueantes. Listas paginadas de 6 en 6, 4 opciones de filtro, 1 acción primaria por tarjeta. Observación: la acción «Añadir a mi plan» se repite en 29 tarjetas, aceptable porque la lista está paginada.
CTA vivo: «Añadir a mi plan» pasó a contorno. Contraste del texto verde sobre superficie ≥ 4,5 (ficha). Alto 48 px, ancho completo, active:scale-95, nunca disabled. Cumple los 4 puntos. «Guardar cambios» (relleno, 56 px) cumple también.
Ficha: paleta, Newsreader en el título, Figtree en el cuerpo y radios coinciden. Sin desvíos. No coincide con ningún clon vetado (ni papel cálido + Petrona/Karla ni pizarra #0E0F13 + latón + Archivo).

## TOP DEFECTOS con severidad
1. [Alta] Mi plan, ancho completo: el contenido desborda el contenedor. La pestaña «Mi plan», el botón «Añadir una acción propia» y la cuarta columna de filtros («Hechas») terminan a ~355 px, con margen derecho ~5 px y margen izquierdo 20 px. Causa probable: la grilla de 4 columnas con «Pendientes» fuerza el ancho mínimo. Fix: usar grid-cols-[repeat(4,minmax(0,1fr))] con min-w-0 en los botones y comprobar que scrollWidth no supere clientWidth.
2. [Alta] Movimiento: de las 7 baseline solo hay entrada escalonada, barra que se dibuja y tap con escala. Faltan conteo del porcentaje, transición entre pestañas, animación al expandir (details/abierta saltan en seco) y celebración al llegar a 100 %. Además, en el código no hay feedback tras «Añadir» salvo el cambio de botón. Fix: contar el 33 %, usar AnimatePresence en las pestañas, animar la altura, mostrar el momento N2 de la ficha (barra que se completa) cuando todo esté hecho.
3. [Media] Identidad: la pantalla es serif + tarjetas oscuras + puntos de color. No aparece ninguna pieza ownable de la ficha (rueda con gota, barra de madurez como protagonista). Fix: usar la barra segmentada de dimensiones o una miniatura de la rueda en la cabecera de Sugeridas, como resumen de dónde cae cada acción.
4. [Media] Mi plan: 4 filtros de estado para 3 acciones, más el bloque de progreso, que repite los mismos conteos (hechas, en curso, pendientes). Duplicación. Fix: mostrar los filtros solo desde 6 acciones o convertir la leyenda de la barra en el filtro.
5. [Baja] Detalles: leyenda de la barra a 12 px y tertiary; el punto de dimensión se ve apagado en Mi plan frente al brillante en Sugeridas (color inconsistente); los atajos de fecha («En 1 semana», «En 1 mes») son más pequeños que los demás controles y están alineados a la izquierda; «Quitar del plan» es un enlace subrayado sin jerarquía clara (hay Deshacer después, bien). Fix: subir la leyenda a 13 px, igualar el color del punto, dar a los atajos el mismo alto y fijar el estilo de la acción destructiva.

## Resumen ronda 1
Ronda 1: 27/40 · 11/20. Ronda 2: 30/40 · 12/20. Mejora real en errores de guardado, progreso segmentado y CTA, pero ninguno de los dos umbrales (36/40 y 16/20) se cumple.
