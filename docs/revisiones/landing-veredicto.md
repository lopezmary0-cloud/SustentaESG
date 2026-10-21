# VEREDICTO revisor-visual — landing
Fecha: 2026-10-21 23:30
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 35/40
Craft: 16/20
Copy (si vende): 17/20
Fidelidad (si hubo referencia): N-A
Veredicto: LISTA
Etiqueta: PASA CON TECHO ACEPTADO (regla del dueno: 35/40 es el techo de usabilidad antes de la Etapa 3; el gate estandar de 36 NO se alcanza y se acepta solo por esa regla)
Historial: 1a 28/40, 15/20, 14/20. 2a 31/40, 15/20, 16/20. 3a 33/40, 14/20, 17/20. 4a 33/40, 15/20, 17/20. 5a 34/40, 16/20, 17/20. 6a 34/40, 16/20, 17/20. 7a 35/40, 16/20, 17/20.
Anterior -> nueva (7a ronda): usabilidad 34 -> 35 (h8 3 -> 4), craft 16 -> 16, copy 17 -> 17.
Detalle: usabilidad h1:3 h2:4 h3:3 h4:4 h5:3 h6:4 h7:3 h8:4 h9:3 h10:4 · craft jerarquia:3 profundidad:3 identidad:4 movimiento:3 encaje:3 · copy idea:3 especificidad:3 emocion:3 oferta:4 accion:4
Gate: usabilidad 35 = techo aceptado (cumple), craft 16 PASA, copy 17 PASA sin ejes <=2. Pendientes de Etapa 3 (quedan en 3): h1 carga real, h3 deshacer/volver del flujo, h5 validacion de formularios, h7 atajos del flujo, h9 errores reales de registro/pago.

Top defectos:
1. [Hero, capturas a] Entrada sin escalonar (titular, subtitulo, boton y rueda aparecen juntos) y la rueda no se dibuja: sostiene movimiento 3 -> stagger 60 ms en hero y dibujar los segmentos de la rueda (con reduced-motion apagado).
2. [Fondo de toda la pagina] Superficies planas alternadas, sin grano ni tinte radial detras del hero: sostiene profundidad 3 -> tinte radial del acento al 8-10% detras de la rueda + grano sutil.
3. [Boton, repetido 7 veces] Misma frase y destino, coherente, pero en Oferta hay dos botones + barra fija en pantalla cercana: en la Oferta basta un boton primario (Anual) y el Mensual como secundario de texto -> reducir peso del boton Mensual (ya es outline; quitarle el borde o acortar).
4. [LandingPage.tsx lineas 24 y 70] Doble padding inferior en movil (pb-20 en raiz + pb-16 en contenedor = ~144 px) deja un hueco al final del pie -> dejar solo uno, y verificar a 375 px que el pie no queda con vacio muerto.
5. [Solucion, ejemplo de resultado, captura c] Leyenda de barras de ~12 px en 3 lineas, texto denso -> subir a 13 px y acortar a una linea ("0 = no se hace · 4 = se mide y se mejora").

## AUDITORIA DE ESCANEABILIDAD (375 px, capturas a, b, c, oferta; d, garantia y e de la ronda anterior sin cambios)

| Seccion | Resultado | Motivo |
|---|---|---|
| Hero | ✅ | Titular 4 lineas cortas con acento, subtitulo 2 lineas, boton + microcopy, rueda. Ningun bloque > 4 lineas. |
| Problema | ✅ | Titulo-pregunta, 3 tarjetas con icono de 2-3 lineas. |
| Agitacion | ✅ | Ahora aporta consecuencias nuevas (Pierdes horas / Respondes a las carreras / Entregas con dudas), 1-2 lineas con icono, ya no repite Problema; calculadora con +/- de 48 px, resultado 24 horas = 3 jornadas, linea puente y boton justo debajo. |
| Solucion | ✅ | 3 pasos 01-03, ejemplo con 4 barras, antes/despues en 2 cajas, boton. Reserva: leyenda pequena (defecto 5). |
| La app por dentro | ✅ | Un telefono, pie y paginacion; boton debajo. (Sin cambios.) |
| Oferta | ✅ | Titulo, selector ahora BAJO el titulo, sin hueco muerto; cajas Anual (Mejor valor) y Mensual con precio grande, 4 bullets con check, boton por caja. |
| Garantia | ✅ | Cajas con icono y condicion corta, boton despues. (Sin cambios.) |
| FAQ | ✅ | Acordeon de 6, 1 abierta. Reserva: antes la barra fija tapaba la ultima fila; ahora se oculta con botones a la vista (verificado en codigo, no en captura). |
| Cierre | ✅ | Titulo 2 lineas, texto 3, boton, PS. |
| Pie | ✅ | Logo, 4 enlaces legales, correo. |

Preguntas globales: bloque mas largo = 3 lineas; dolores/pasos/beneficios con icono o numero: si; prueba de solo-titulares: pasa; respiro entre bloques: si (hueco previo al selector resuelto); FAQ acordeon, precio y garantia en cajas: si.

Verificado en codigo: ui.tsx tiene data-cta-inline en los botones inline (linea 198) y un IntersectionObserver (lineas 244-275) que oculta la barra fija mientras hay un boton visible; useReducedMotion en ui, Faq, EjemploResultado y AppPorDentro; calculadora con limites y aria-live (ronda previa). No verificado en captura: el comportamiento real de la barra al hacer scroll (las capturas son de pagina completa por tramos). Defectos 4 y 5 de la ronda anterior (movimiento y profundidad) siguen abiertos y son los que impiden subir craft a 17+.
