# VEREDICTO revisor-visual — landing
Fecha: 2026-10-21 23:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 34/40
Craft: 16/20
Copy (si vende): 17/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Historial: 1a 28/40, 15/20, 14/20. 2a 31/40, 15/20, 16/20. 3a 33/40, 14/20, 17/20. 4a 33/40, 15/20, 17/20. 5a 34/40, 16/20, 17/20. 6a 34/40, 16/20, 17/20.
Anterior -> nueva (6a ronda): usabilidad 34 -> 34, craft 16 -> 16, copy 17 -> 17. La escaneabilidad mejoro claramente, pero no mueve ningun criterio de la rubrica un punto completo.
Detalle: usabilidad h1:3 h2:4 h3:3 h4:4 h5:3 h6:4 h7:3 h8:3 h9:3 h10:4 · craft jerarquia:3 profundidad:3 identidad:4 movimiento:3 encaje:3 · copy idea:3 especificidad:3 emocion:3 oferta:4 accion:4
Gate: craft 16/20 PASA, copy 17/20 PASA (ningun eje <=2), usabilidad 34/40 NO PASA. El techo aceptado por el dueno es 35 y NO se alcanzo (34): por eso NO aplica "PASA CON TECHO ACEPTADO". Falta 1 punto, y es recuperable ahora solo en h8 (defectos 1 y 2).
Cuando llegue a 35 con craft y copy en su estado actual, el veredicto sera PASA CON TECHO ACEPTADO. Criterios que quedaran en 3 por depender de la Etapa 3 (flujo real): h1 (carga real con red lenta), h3 (deshacer/volver en el flujo de registro/pago), h5 (validacion de formularios reales), h7 (atajos/defaults del flujo), h9 (errores reales de registro/pago). Los otros cinco (h2, h4, h6, h8, h10) deben estar en 4: hoy h8 esta en 3.

Top defectos:
1. [Problema + Agitacion, capturas a y b] El mismo trio de dolores aparece dos veces seguidas: Problema (Excel sin ultima version / no sabes que te falta / documentos sueltos) y Agitacion (Rehaces / Buscas / Adivinas) repiten "ultima version entre Excel" y "que te falta". Son 6 tarjetas con icono para 3 ideas: cada elemento no se gana su lugar (h8) -> fusionar o quitar las 3 tarjetas de Agitacion y dejar solo titulo + calculadora, o que las tarjetas aporten un dolor nuevo (ej. consecuencia, no accion).
2. [Calculadora, captura b] El momento de mayor emocion ("24 horas = 3 jornadas") termina sin boton ni puente a la solucion; el siguiente CTA llega recien tras el mecanismo. Ademas, el resultado no se conecta con la promesa -> anadir bajo el resultado una linea puente ("La Rueda de Madurez lo ordena una vez") y un boton inline, o un CTA justo tras la caja.
3. [Barra fija + botones inline, capturas c y e] Con 7 apariciones del mismo boton, en varias capturas la barra fija queda apilada sobre un boton inline identico (captura c, parte baja) y tapa contenido (leyenda de la FAQ / fin de seccion). Es la misma accion, pero se siente repetitivo -> ocultar la barra fija cuando un boton inline esta en pantalla (IntersectionObserver) y mantener padding-bottom en la ultima seccion.
4. [Movimiento y profundidad, toda la pagina] Sin cambios: entrada solo con reveal, rueda del hero sin dibujarse, fondo de superficies planas alternadas sin grano ni tinte radial detras del hero. Sostiene movimiento 3 y profundidad 3 -> escalonar titular/subtitulo/boton del hero, dibujar la rueda, tinte radial + grano sutil.
5. [Respiro, captura d, antes del selector de plan] Hueco muerto de ~120 px entre la seccion de vistas previas y "Para quien es tu plan?" sin titulo ni separador; y en el selector "Mi empresa/Soy consultor" la jerarquia queda debajo del titulo "Empieza gratis" -> reducir el espaciado o mover el selector bajo el titulo de la oferta.

## AUDITORIA DE ESCANEABILIDAD (375 px, sobre capturas a, b, c, d, oferta, garantia, e)

| Seccion | Resultado | Motivo |
|---|---|---|
| Hero | ✅ | Titular de 4 lineas cortas con 2 palabras en acento; subtitulo 2 lineas; boton + microcopy 2 lineas; rueda como imagen. Ningun bloque pasa 4 lineas. |
| Problema | ✅ | Titulo que se entiende solo; 3 preguntas, cada una con icono y 2-3 lineas. Reservas: repite lo que dice Agitacion (defecto 1). |
| Agitacion | ❌ | Escaneable (titulo + 3 tarjetas con icono + calculadora con +/-, 48 px), sin bloques largos. Falla por redundancia con Problema y por terminar sin CTA ni puente (defectos 1 y 2). |
| Solucion | ✅ | 3 pasos numerados 01/02/03 con 2-3 lineas; ejemplo de resultado con barras y 4 filas; antes/despues en 2 cajas cortas; boton repetido al final. Reserva: la leyenda de barras (3 lineas pequenas, texto ~12 px) es densa. |
| La app por dentro | ✅ | Un solo telefono con titulo, pie y 5 puntos de paginacion; el siguiente se asoma como pista. Reserva: carrusel manual, el usuario puede no descubrir las otras 4 vistas. Boton repetido debajo. |
| Oferta | ✅ | Precio en cajas (Anual destacada con "Mejor valor", Mensual debajo), precio grande, 4 bullets con check de 1-2 lineas, boton en cada caja. Reserva: hueco muerto sobre el selector (defecto 5). |
| Garantia | ✅ | Caja con escudo, titulo y condicion en 2 lineas, dos cajas con icono (7 dias / 14 dias), 2-3 lineas cada una; boton inmediatamente despues. |
| FAQ | ✅ | Acordeon de 6 preguntas, 1 abierta con respuesta de 3 lineas, resto cerrado; chevron visible. Reserva: la barra fija tapa parte de la ultima fila en captura. |
| Cierre | ✅ | Titulo 2 lineas, texto 3 lineas, boton, microcopy y PS de 2 lineas. |
| Pie | ✅ | Logo, 4 enlaces legales, copyright y correo; sobrio y legible. |

Preguntas globales:
- Bloque que supere 4 lineas seguidas a 375 px: NINGUNO. El mas largo son 3 lineas.
- Dolores, pasos y beneficios con icono o numero: SI. Dolores con icono (Problema y Agitacion), pasos 01-03, beneficios con check, garantia con icono.
- Prueba de solo-titulares: PASA CON RESERVA. Leyendo "Deja de reconstruir tus datos / Rehaces tu diagnostico cada vez que te lo piden? / Cada pedido te cuesta volver a empezar / Tu sostenibilidad, ordenada una sola vez / Asi se vera tu diagnostico / Empieza gratis, sin tarjeta / La Garantia del Primer Diagnostico / Lo que quiza te estas preguntando / Imagina responder con todo en orden" se entiende el problema, el costo, la promesa, el precio y la garantia. Reserva: "Lo lque quiza te estas preguntando" es un titulo vacio y "Tu sostenibilidad, ordenada una sola vez" no nombra el mecanismo hasta la etiqueta pequena.
- Respiro visual entre bloques: SI, con una excepcion (hueco desproporcionado antes del selector de plan). Alternancia de fondo base/elevado clara.
- FAQ en acordeon: SI.
- Precio y garantia en cajas: SI, las dos.

Verificado en codigo (AgitacionCosto.tsx): botones +/- de 48 px con aria-label, input numerico con limites (max 200/500, minimo 0, vacio -> 0), resultado en aria-live="polite", reveal escalonado con useReveal, valores de ejemplo rotulados, sin cifras inventadas. La calculadora no valida entradas decimales/negativas escritas a mano mas alla del recorte (aceptable). Verificacion de reduced-motion de la ronda previa sin cambios; las capturas del selector consultor y de escritorio son previas a esta ronda y no se re-puntuaron.
