# VEREDICTO revisor-visual — landing
Fecha: 2026-10-21 20:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 33/40
Craft: 15/20
Copy (si vende): 17/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Historial: 1a ronda 28/40, 15/20, 14/20. 2a ronda 31/40, 15/20, 16/20. 3a ronda 33/40, 14/20, 17/20. 4a ronda 33/40, 15/20, 17/20.
Detalle: usabilidad h1:3 h2:4 h3:3 h4:3 h5:3 h6:4 h7:3 h8:3 h9:3 h10:4 · craft jerarquia:3 profundidad:3 identidad:3 movimiento:3 encaje:3 · copy idea:3 especificidad:3 emocion:3 oferta:4 accion:4
Top defectos: 1) [Barra fija inferior, StickyCtaMobile en ui.tsx] no usa CtaButton: sin estado "Abriendo...", sin bloqueo de doble toque ni aviso de fallo, alto 48px vs 52px del resto; es el CTA mas visible en movil y queda inconsistente con los demas (h1 y h4): reutilizar CtaButton o replicar su logica. 2) [CtaButton, estado fallo] el mensaje de error queda fijo hasta el siguiente toque y el boton tras 8 s vuelve a decir el texto original sin indicar reintento; ademas "Abriendo..." nunca se limpia si el usuario vuelve atras (bfcache): resetear a reposo en pageshow y al ocultar el aviso tras unos segundos. 3) [Hero/Solucion/Oferta, movimiento] solo el Ejemplo de resultado tiene conteo/dibujado; verificar y dejar documentado en codigo el resto de baseline (stagger, transicion de secciones) y que el hero tenga entrada propia: sin eso movimiento no pasa de 3. 4) [Ejemplo de resultado en captura d] barra fija tapa la parte baja de la tarjeta del mockup de telefono (defecto previo #5, no corregido): es comportamiento normal, pero anadir padding inferior o ocultar la barra sobre vistas previas elimina el recorte. 5) [Toda la pagina, craft] la pagina es solida pero no sube de 3 en identidad/profundidad: un detalle firma adicional (textura/grano en fondo base o rueda como motivo recurrente en separadores) llevaria identidad a 4.
Criterios que NO pueden llegar a 4 sin Etapa 3 (flujo real): h1 (carga real, tope 3 hasta verificar con red lenta), h5 (validacion de formularios), h9 (errores reales de registro/pago), y h3/h7 (deshacer, atajos) solo verificables con flujo. Con ellos en 3, el maximo alcanzable en la landing sola es 36/40 y exige 4 en h2, h4, h6, h8, h10: el gate de 36 es alcanzable ahora pero sin margen. Craft 15/20 es el bloqueante real (falta 1 punto: movimiento o identidad), no depende de Etapa 3.
