# Metodología de diagnóstico — BORRADOR v0.1 (en revisión)

> Estado: borrador redactado por Claude para revisión de la persona especialista. Nada aquí está validado profesionalmente ni es un estándar oficial. Los rangos y pesos son provisionales y configurables. No es certificación ni verificación de cumplimiento legal.
> Fuente base: Especificacion_SOSTENIBLE_360_Claude_Code.md §4–§9. Lo marcado **[NUEVA]** lo redacté yo para completar el banco.

## 1. Banco inicial: 40 preguntas (35 de tu especificación + 5 nuevas)

Distribución: Ambiental 10 · Social 10 · Gobernanza 10 · Económica 6 · Cadena de valor 4 (transversal, no entra al promedio general).
Todas usan la escala de madurez 0–4 + "No aplica" + "No tengo información suficiente" (salvo que se indique).

Las 35 originales (AMB01–AMB09, SOC01–SOC08, GOB01–GOB09, ECO01–ECO06, CAD01–CAD03) se cargan tal cual están en la especificación §7. Las 5 nuevas cubren temas que tu §4 lista y el banco no tenía:

| ID | Pregunta [NUEVA] | Tema cubierto | Nota |
|---|---|---|---|
| AMB10 | ¿La empresa identifica si sus operaciones se relacionan con ecosistemas o biodiversidad y gestiona esa relación? | Biodiversidad "cuando sea pertinente" | "No aplica" permitido si la actividad es solo de oficina/servicios sin entorno natural relevante (regla N/A-1) |
| SOC09 | ¿La empresa verifica que se cumplan las condiciones laborales básicas de sus trabajadores (contratos, pagos, jornadas)? | Condiciones laborales | Evitar convertirla en declaración de cumplimiento legal |
| SOC10 | ¿Hace seguimiento a indicadores sociales (por ejemplo rotación, capacitación, accidentalidad) y los usa para decidir? | Indicadores y seguimiento social | |
| GOB10 | ¿Tiene medidas para prevenir y gestionar conflictos de interés y posibles actos de corrupción? | Conflictos de interés y anticorrupción | |
| CAD04 | ¿Identifica a sus principales grupos de interés y sabe qué esperan de la empresa? | Grupos de interés | |

## 2. Reglas de aplicabilidad y "No aplica" (provisionales)

- N/A-1: una pregunta marcada "No aplica" solo cuenta como tal si el perfil de la empresa la habilita (por ejemplo: AMB10 sin operaciones en entorno natural; SOC07 "comunidades" sin impacto local; AMB07 sin procesos que contaminen). Si el perfil no la habilita, el sistema pide justificación breve y la marca "pendiente de revisar" en vez de excluirla en silencio.
- N/A-2: toda exclusión queda registrada (qué pregunta, quién, por qué, regla aplicada) y es visible en el resultado.
- "No tengo información suficiente": no suma puntos, no cuenta en el denominador y SÍ cuenta para la cobertura. Genera el tema "requiere información adicional" y puede activar una pregunta aclaratoria.

## 3. Cálculo (determinista)

- Puntaje de pregunta = respuesta 0–4. Peso igual por pregunta dentro de la dimensión (válido por ahora porque todas son de madurez y comparables).
- Puntaje de dimensión = Σ puntos obtenidos / Σ (4 × preguntas con respuesta válida y aplicable) × 100.
- Cobertura de dimensión = preguntas con respuesta válida / preguntas aplicables. Umbral provisional: ≥ 70% → resultado "completo"; entre 40% y 70% → "provisional"; < 40% → "insuficiente" (no se muestra cifra). Umbrales configurables.
- Índice general = promedio simple de las 4 dimensiones con cobertura ≥ 70%. Si falta alguna, se muestra "resultado provisional" con las dimensiones que lo componen. La cadena de valor se muestra aparte.
- Niveles (provisionales y configurables): 0–20 Inicial · 21–40 Básico · 41–60 En desarrollo · 61–80 Gestionado · 81–100 Avanzado. Se muestran junto al aviso de que no son un estándar.
- Riesgo ≠ madurez: en el MVP NO se calcula "exposición a riesgos". Un puntaje bajo genera "área de atención / requiere evaluación", nunca "alto riesgo". La exposición real requerirá preguntas propias (decisión pendiente, versión posterior).
- Cada evaluación guarda: versión de metodología, versión de reglas, fecha, respuestas, exclusiones.

## 4. Preguntas condicionales (borrador: 30 de ~30 posibles)

Patrón (de tu ejemplo AMB04): respuesta baja (0–1) → qué existe y qué dificulta; parcial (2) → alcance y soportes; alta (3–4) → medición y uso de resultados. Las condicionales NO puntúan salvo que se indique; sirven para contexto, recomendaciones y calidad de información.

| # | Padre | Dispara con | Pregunta de seguimiento |
|---|---|---|---|
| 1 | AMB01 | 0–2 | ¿Qué actividades de la empresa podrían tener mayor efecto ambiental? (selección múltiple) |
| 2 | AMB02 | 2–4 | ¿Cada cuánto revisa los consumos de energía? (mensual/trimestral/anual) |
| 3 | AMB02 | 0–1 | ¿Tiene acceso a las facturas de energía de los últimos 12 meses? (sí/parcial/no) |
| 4 | AMB03 | 2–4 | ¿Cada cuánto revisa el consumo de agua? |
| 5 | AMB04 | 0–1 | ¿Qué tipos de residuos genera? (selección múltiple) |
| 6 | AMB04 | 2 | ¿Conserva soportes de cantidades o entrega a gestores? |
| 7 | AMB04 | 3–4 | ¿Registra cantidades y aprovechamiento? |
| 8 | AMB06 | 0–2 | ¿Qué eventos climáticos han afectado o podrían afectar sus operaciones? |
| 9 | AMB08 | 3–4 | ¿Las metas ambientales tienen responsable y fecha? |
| 10 | AMB09 | 0–2 | ¿Qué le impide hacer seguimiento hoy? (tiempo/datos/conocimiento/otro) |
| 11 | SOC01 | 2–4 | ¿Hay un presupuesto o responsable para bienestar? |
| 12 | SOC02 | 3–4 | ¿Evalúa el resultado de las capacitaciones? |
| 13 | SOC03 | 0–2 | ¿Cuenta con un responsable de seguridad y salud en el trabajo? |
| 14 | SOC03 | 3–4 | ¿Registra incidentes y accidentes y sus causas? |
| 15 | SOC04 | 0–2 | ¿Existe algún canal para reportar situaciones de discriminación? |
| 16 | SOC06 | 0–2 | ¿Dónde recibe hoy las quejas de clientes? (correo/teléfono/redes/ninguno) |
| 17 | SOC06 | 3–4 | ¿Mide tiempos de respuesta o satisfacción? |
| 18 | SOC08 | 0–2 | ¿Qué criterios sociales podría pedir a proveedores críticos? |
| 19 | GOB02 | 0–2 | ¿Quién decide hoy sobre estos temas? |
| 20 | GOB03 | 0–2 | ¿Existe un documento (código, política) aunque sea informal? |
| 21 | GOB04 | 0–2 | ¿Qué riesgos le preocupan más? (selección múltiple) |
| 22 | GOB05 | 0–2 | ¿Quién revisa cambios normativos que afectan a la empresa? |
| 23 | GOB07 | 0–2 | ¿Dónde guarda hoy los soportes? (carpeta/nube/papel/no los guarda) |
| 24 | GOB08 | 3–4 | ¿Con qué periodicidad revisa los indicadores? |
| 25 | GOB09 | 0–2 | ¿Hay reuniones o revisiones periódicas con la dirección? |
| 26 | ECO01 | 3–4 | ¿Ha cuantificado el ahorro obtenido? |
| 27 | ECO03 | 0–2 | ¿Qué situaciones podrían interrumpir su operación? (selección múltiple) |
| 28 | ECO04 | 3–4 | ¿Qué criterios usa para seleccionar proveedores? |
| 29 | CAD01 | 0–2 | ¿Qué proveedores serían más difíciles de reemplazar? |
| 30 | CAD02 | 0–2 | ¿Algún cliente le ha pedido información de sostenibilidad en el último año? (sí/no/cuál) |

Pendiente de la especialista: confirmar que estas preguntas son útiles, eliminar redundantes y añadir sector-específicas si hacen falta (agro, manufactura, servicios).

## 5. Recomendaciones basadas en reglas — formato y ejemplos

Formato de una regla (cada una trazable a respuestas):
`REC-ID · dimensión · tema · condición (preguntas y valores) · acción sugerida · prioridad y motivo · indicador sugerido · evidencia esperada`

Prioridad = f(puntaje bajo del tema, brecha frente al promedio de su dimensión, si el tema fue marcado "requiere info", exposición declarada por el perfil). Criterios visibles. Nunca "alto riesgo".

Ejemplos (borrador, a validar):
| REC | Condición | Acción | Indicador |
|---|---|---|---|
| REC-AMB-001 | AMB02 ≤ 1 | Reunir 12 meses de facturas de energía y construir una línea base mensual | kWh/mes |
| REC-AMB-002 | AMB04 ≤ 2 | Hacer inventario de residuos por tipo y definir puntos de separación | kg/mes por tipo |
| REC-SOC-001 | SOC03 ≤ 2 | Confirmar responsable de seguridad y salud en el trabajo y la matriz de peligros vigente | % de acciones del plan ejecutadas |
| REC-GOB-001 | GOB05 ≤ 1 | Elaborar una matriz sencilla de requisitos aplicables con responsable de revisión | n.º de requisitos con responsable |
| REC-GOB-002 | GOB07 ≤ 2 | Definir una carpeta única de evidencias con nombres estandarizados | % de acciones con evidencia |
| REC-ECO-001 | ECO03 ≤ 1 | Listar 5 situaciones que detendrían la operación y quién actúa en cada una | n.º de riesgos con plan |
| REC-CAD-001 | CAD01 ≤ 1 | Identificar los 5 proveedores más críticos y sus datos de contacto | n.º de proveedores críticos identificados |

El catálogo completo (~2 recomendaciones por pregunta, ~80) se redacta en la Etapa 4 junto con la especialista. Cada recomendación mostrará "Por qué se te sugiere esto" con las preguntas y respuestas que la originaron.

## 6. Decisiones abiertas para la especialista

1. ¿Los pesos iguales por pregunta son aceptables, o alguna pregunta debe pesar más?
2. ¿Los umbrales de cobertura (70% / 40%) y los niveles 0–20…81–100 tienen sentido?
3. ¿Las 5 preguntas nuevas y los 30 seguimientos son adecuados? ¿Qué falta por sector?
4. ¿Se debe agregar un bloque de exposición a riesgos con escala propia en una versión posterior?
5. ¿Qué referencias (GRI, ISO, etc.) pueden citarse en las recomendaciones? Hasta que ella lo decida, no se cita ninguna.
