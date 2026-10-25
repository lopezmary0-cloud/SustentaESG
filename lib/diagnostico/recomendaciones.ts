// Recomendaciones por reglas (sin IA): cada una se dispara por la respuesta a UNA pregunta y se puede
// rastrear («por qué se te sugiere esto»). BORRADOR v0.1: el texto de las acciones lo redactó Claude y
// lo debe validar la especialista (docs/producto/METODOLOGIA-BORRADOR.md §5). No cita estándares.
// Prioridad visible: base por respuesta, +1 nivel si la dimensión está por debajo del promedio general.

import { BANCO, DIMENSIONES, NOMBRE_DIMENSION, type Dimension, type Pregunta } from './banco';
import { ESCALA } from './banco';
import type { ResultadoDiagnostico, Respuestas } from './motor';

export type Prioridad = 'alta' | 'media' | 'baja';

interface Regla {
  pregunta: string;
  accion: string;
  indicador: string;
  evidencia: string;
}

/** Una regla por pregunta del banco. Se dispara con respuesta 0, 1 o 2. */
export const REGLAS: Regla[] = [
  { pregunta: 'AMB01', accion: 'Listar las actividades de la empresa y marcar cuáles generan impacto ambiental (energía, agua, residuos, emisiones).', indicador: 'N.º de impactos identificados', evidencia: 'Lista de impactos con responsable' },
  { pregunta: 'AMB02', accion: 'Reunir 12 meses de facturas de energía y construir una línea base mensual.', indicador: 'kWh por mes', evidencia: 'Facturas archivadas y tabla mensual' },
  { pregunta: 'AMB03', accion: 'Reunir 12 meses de facturas de agua y registrar el consumo mensual.', indicador: 'm³ por mes', evidencia: 'Facturas archivadas y tabla mensual' },
  { pregunta: 'AMB04', accion: 'Hacer un inventario de residuos por tipo y definir puntos de separación.', indicador: 'kg por mes y por tipo de residuo', evidencia: 'Inventario y soportes de entrega a gestores' },
  { pregunta: 'AMB05', accion: 'Identificar los 3 materiales o recursos de mayor uso y una forma de reducir cada uno.', indicador: '% de reducción por material', evidencia: 'Lista de materiales con la acción elegida' },
  { pregunta: 'AMB06', accion: 'Listar los eventos climáticos que podrían afectar la operación y qué haría la empresa en cada caso.', indicador: 'N.º de eventos con respuesta definida', evidencia: 'Matriz sencilla de eventos y respuestas' },
  { pregunta: 'AMB07', accion: 'Revisar dónde podría haber vertimientos, emisiones o derrames y definir un control básico para cada caso.', indicador: 'N.º de controles activos', evidencia: 'Procedimiento breve y registro de revisiones' },
  { pregunta: 'AMB08', accion: 'Definir de 1 a 3 metas ambientales con responsable y fecha.', indicador: '% de metas cumplidas en la fecha', evidencia: 'Documento de metas' },
  { pregunta: 'AMB09', accion: 'Revisar cada trimestre los resultados de las acciones ambientales y anotar qué se ajusta.', indicador: 'N.º de revisiones al año', evidencia: 'Acta o registro de cada revisión' },
  { pregunta: 'AMB10', accion: 'Identificar si hay ecosistemas o áreas naturales cerca de la operación y qué relación tiene con ellos.', indicador: 'N.º de relaciones identificadas', evidencia: 'Nota con la relación y las medidas' },

  { pregunta: 'SOC01', accion: 'Definir 2 o 3 prácticas de bienestar para los trabajadores y quién las lidera.', indicador: '% de trabajadores alcanzados', evidencia: 'Lista de prácticas con responsable' },
  { pregunta: 'SOC02', accion: 'Preguntar a cada área qué capacitación necesita y armar un plan anual sencillo.', indicador: 'Horas de capacitación por persona', evidencia: 'Plan anual y listas de asistencia' },
  { pregunta: 'SOC03', accion: 'Confirmar quién es responsable de seguridad y salud en el trabajo y que la matriz de peligros esté vigente.', indicador: '% de acciones del plan ejecutadas', evidencia: 'Matriz de peligros y plan firmado' },
  { pregunta: 'SOC04', accion: 'Escribir una regla breve contra la discriminación y definir cómo se reporta una situación.', indicador: 'N.º de reportes atendidos', evidencia: 'Regla publicada y canal de reporte' },
  { pregunta: 'SOC05', accion: 'Revisar dónde podría haber riesgos de derechos humanos (trabajo infantil, jornadas, proveedores) y anotar cuáles aplican.', indicador: 'N.º de riesgos identificados con acción', evidencia: 'Lista de riesgos revisada' },
  { pregunta: 'SOC06', accion: 'Definir un canal único para recibir quejas de clientes y quién las responde.', indicador: 'Tiempo medio de respuesta', evidencia: 'Canal habilitado y registro de quejas' },
  { pregunta: 'SOC07', accion: 'Identificar qué efectos tiene la operación en los vecinos y la comunidad y cómo se hablan.', indicador: 'N.º de efectos con acción definida', evidencia: 'Nota de efectos y contactos de la comunidad' },
  { pregunta: 'SOC08', accion: 'Elegir 2 criterios sociales que se pedirán a los proveedores críticos.', indicador: '% de proveedores críticos evaluados', evidencia: 'Formato de evaluación con los criterios' },
  { pregunta: 'SOC09', accion: 'Revisar que cada trabajador tenga contrato, pago y jornada en regla y dejar el soporte archivado.', indicador: '% de trabajadores con soportes completos', evidencia: 'Carpeta de soportes laborales' },
  { pregunta: 'SOC10', accion: 'Escoger 3 indicadores sociales (por ejemplo rotación, capacitación, accidentalidad) y medirlos cada trimestre.', indicador: 'N.º de indicadores medidos', evidencia: 'Tabla de indicadores' },

  { pregunta: 'GOB01', accion: 'Incluir un punto de sostenibilidad en la agenda de las reuniones de dirección.', indicador: 'N.º de reuniones con el punto tratado', evidencia: 'Actas de reunión' },
  { pregunta: 'GOB02', accion: 'Definir quién responde por cada asunto prioritario y dejarlo por escrito.', indicador: '% de asuntos con responsable', evidencia: 'Cuadro de responsables' },
  { pregunta: 'GOB03', accion: 'Redactar un código de conducta corto (una página) y compartirlo con el equipo.', indicador: '% del equipo que lo conoce', evidencia: 'Código firmado o publicado' },
  { pregunta: 'GOB04', accion: 'Listar los 5 riesgos que más preocupan a la operación y quién actúa en cada uno.', indicador: 'N.º de riesgos con responsable y plan', evidencia: 'Matriz sencilla de riesgos' },
  { pregunta: 'GOB05', accion: 'Elaborar una lista de requisitos legales y compromisos aplicables, con un responsable de revisarla.', indicador: 'N.º de requisitos con responsable', evidencia: 'Matriz de requisitos' },
  { pregunta: 'GOB06', accion: 'Escribir un procedimiento simple para cada asunto prioritario (qué se hace, quién, cuándo).', indicador: 'N.º de procedimientos vigentes', evidencia: 'Procedimientos aprobados' },
  { pregunta: 'GOB07', accion: 'Definir una carpeta única de evidencias con nombres estandarizados.', indicador: '% de acciones con evidencia', evidencia: 'Carpeta organizada' },
  { pregunta: 'GOB08', accion: 'Elegir un indicador por cada objetivo y definir cada cuánto se mide.', indicador: 'N.º de objetivos con indicador', evidencia: 'Tabla de indicadores' },
  { pregunta: 'GOB09', accion: 'Agendar una revisión periódica de resultados con la dirección y registrar las acciones de mejora.', indicador: 'N.º de revisiones al año', evidencia: 'Actas con acciones' },
  { pregunta: 'GOB10', accion: 'Definir cómo se declaran los conflictos de interés y por dónde se reporta una sospecha de corrupción.', indicador: 'N.º de declaraciones y reportes gestionados', evidencia: 'Procedimiento y canal de reporte' },

  { pregunta: 'ECO01', accion: 'Identificar 3 fuentes de desperdicio o costo evitable y estimar cuánto cuestan.', indicador: 'Costo mensual estimado del desperdicio', evidencia: 'Lista con costo estimado' },
  { pregunta: 'ECO02', accion: 'Revisar con el equipo un proceso clave y anotar dónde se pierde tiempo o material.', indicador: 'N.º de ineficiencias identificadas', evidencia: 'Mapa breve del proceso' },
  { pregunta: 'ECO03', accion: 'Listar 5 situaciones que detendrían la operación y quién actúa en cada una.', indicador: 'N.º de riesgos con plan', evidencia: 'Plan de continuidad en una hoja' },
  { pregunta: 'ECO04', accion: 'Añadir 2 criterios (ambientales, sociales o de calidad) a la forma de elegir proveedores.', indicador: '% de compras evaluadas con los criterios', evidencia: 'Formato de selección actualizado' },
  { pregunta: 'ECO05', accion: 'Reservar un espacio periódico para recoger ideas de mejora de productos, servicios o procesos.', indicador: 'N.º de ideas evaluadas', evidencia: 'Lista de ideas y decisiones' },
  { pregunta: 'ECO06', accion: 'Calcular el costo y el beneficio de la próxima mejora antes de implementarla.', indicador: 'Ahorro o ingreso estimado frente al costo', evidencia: 'Hoja de cálculo simple' },

  { pregunta: 'CAD01', accion: 'Identificar los 5 proveedores más críticos y guardar sus datos de contacto.', indicador: 'N.º de proveedores críticos identificados', evidencia: 'Lista de proveedores críticos' },
  { pregunta: 'CAD02', accion: 'Preguntar a los clientes principales qué requisitos de sostenibilidad les piden y registrarlos.', indicador: 'N.º de clientes con requisitos conocidos', evidencia: 'Cuadro de requisitos por cliente' },
  { pregunta: 'CAD03', accion: 'Anotar riesgos y oportunidades relevantes con proveedores, operación y clientes.', indicador: 'N.º de riesgos y oportunidades con acción', evidencia: 'Cuadro de riesgos y oportunidades' },
  { pregunta: 'CAD04', accion: 'Hacer una lista de los grupos de interés (clientes, trabajadores, vecinos, bancos) y qué espera cada uno.', indicador: 'N.º de grupos de interés con expectativas conocidas', evidencia: 'Mapa de grupos de interés' },
];

export interface Recomendacion {
  id: string;
  tipo: 'practica' | 'informacion';
  pregunta: string;
  dimension: Dimension;
  accion: string;
  indicador: string;
  evidencia: string;
  prioridad: Prioridad;
  /** Frase visible: la respuesta que la originó y por qué tiene esa prioridad. */
  porQue: string;
}

const ORDEN: Prioridad[] = ['baja', 'media', 'alta'];
const subir = (p: Prioridad): Prioridad => ORDEN[Math.min(ORDEN.length - 1, ORDEN.indexOf(p) + 1)];
const PESO: Record<Prioridad, number> = { alta: 0, media: 1, baja: 2 };

function prioridadBase(valor: number): Prioridad {
  return valor === 0 ? 'alta' : valor === 1 ? 'media' : 'baja';
}

export function generarRecomendaciones(
  respuestas: Respuestas,
  resultado: ResultadoDiagnostico,
  banco: Pregunta[] = BANCO,
  reglas: Regla[] = REGLAS
): Recomendacion[] {
  const general = resultado.general.puntaje;
  const orden = new Map(DIMENSIONES.map((d, i) => [d.id, i]));
  const lista: Recomendacion[] = [];

  for (const regla of reglas) {
    const p = banco.find((x) => x.id === regla.pregunta);
    const r = respuestas[regla.pregunta];
    if (!p || !r) continue;

    if (r.tipo === 'sin_info') {
      lista.push({
        id: `REC-INFO-${p.id}`,
        tipo: 'informacion',
        pregunta: p.id,
        dimension: p.dimension,
        accion: `Reunir la información para poder responder: ${p.texto}`,
        indicador: 'Pregunta respondida',
        evidencia: 'Respuesta registrada en el diagnóstico',
        prioridad: 'media',
        porQue: 'Marcaste que no tienes esta información. Sin ella no se puede calcular bien esta dimensión.',
      });
      continue;
    }

    if (r.tipo !== 'valor' || r.valor > 2) continue;

    const dim = resultado.dimensiones[p.dimension];
    const debajo = general !== null && dim.puntaje !== null && dim.puntaje < general;
    const base = prioridadBase(r.valor);
    const prioridad = debajo ? subir(base) : base;
    const nombreRespuesta = ESCALA[r.valor].titulo;
    lista.push({
      id: `REC-${p.id}`,
      tipo: 'practica',
      pregunta: p.id,
      dimension: p.dimension,
      accion: regla.accion,
      indicador: regla.indicador,
      evidencia: regla.evidencia,
      prioridad,
      porQue: `Respondiste «${nombreRespuesta}» a: ${p.texto} Prioridad ${prioridad}: ${
        r.valor === 0 ? 'la práctica no existe' : r.valor === 1 ? 'hay solo acciones aisladas' : 'está definida pero incompleta'
      }${debajo ? ` y ${NOMBRE_DIMENSION[p.dimension]} está por debajo del resultado general` : ''}.`,
    });
  }

  return lista.sort(
    (a, b) =>
      PESO[a.prioridad] - PESO[b.prioridad] ||
      (orden.get(a.dimension) ?? 0) - (orden.get(b.dimension) ?? 0) ||
      a.pregunta.localeCompare(b.pregunta)
  );
}
