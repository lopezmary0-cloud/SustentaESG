# VEREDICTO revisor-visual — landing
Fecha: 2026-10-21 18:00
Screenshot: docs/revisiones/landing-375.png
Usabilidad: 33/40
Craft: 14/20
Copy (si vende): 17/20
Fidelidad (si hubo referencia): N-A
Veredicto: NO LISTA
Historial: 1a ronda 28/40, 15/20, 14/20. 2a ronda 31/40, 15/20, 16/20. 3a ronda 33/40, 14/20, 17/20.
Detalle: usabilidad h1:2 h2:4 h3:3 h4:4 h5:3 h6:4 h7:3 h8:3 h9:3 h10:4 · craft jerarquia:3 profundidad:3 identidad:3 movimiento:3 encaje:2 · copy idea:3 especificidad:3 emocion:3 oferta:4 accion:4
Top defectos: 1) [Oferta, tarjeta Anual, boton] la frase unica "Iniciar mi diagnostico gratis" se parte en 2 lineas con texto alineado a la izquierda y descentrado dentro del boton (el mismo texto cabe en una linea en la tarjeta Mensual): corregir con text-center, whitespace-nowrap y padding/tamano igual al resto (encaje y CTA vivo). 2) [Oferta, titulo de garantia] el encabezado arranca en minuscula "la Garantia del..." (visible en landing-375-d): capitalizar y revisar que nombre y plazo (14 dias) esten juntos junto al CTA de compra. 3) [Solucion, Ejemplo de resultado] las barras de puntaje y los numeros no animan (sin conteo ni dibujado, 0 uso de motion en EjemploResultado.tsx): barras que crecen y cuentas 0 a valor al entrar en vista, con reduced-motion. 4) [Todo CTA] el boton no tiene estado de carga/error aun; aceptado por ahora porque /onboarding es estatico, pero NO se puede declarar el flujo verificado: en Etapa 3 agregar spinner inline, bloqueo de doble tap y error con solucion (h1 queda en 2, h9 en 3). 5) [Hero/Solucion] "Rueda de Madurez" se presenta bien, pero el Ejemplo de resultado queda cerca del final de la seccion, bajo la barra fija que lo tapa parcialmente en la captura b; mover el ejemplo antes del pasos o dar padding inferior para que la barra no corte la tarjeta.
