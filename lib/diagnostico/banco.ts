// Banco de preguntas del diagnóstico, versión de metodología 0.1 (BORRADOR en revisión de la especialista).
// Fuente: docs/producto/METODOLOGIA-BORRADOR.md. Las 35 preguntas originales vienen de la especificación del
// dueño (§7) sin cambios; las 5 marcadas `nueva` las redactó Claude y están pendientes de validar.
// Nada de esto es un estándar oficial ni certifica cumplimiento legal.

export const VERSION_METODOLOGIA = '0.1-borrador';

export type Dimension = 'ambiental' | 'social' | 'gobernanza' | 'economica' | 'cadena';

export interface Pregunta {
  id: string;
  dimension: Dimension;
  texto: string;
  /** Pregunta redactada por Claude, pendiente de validar por la especialista. */
  nueva?: boolean;
  /** «No aplica» es esperable según el perfil (no pide justificación). Ver regla N/A-1. */
  naHabilitable?: boolean;
}

export const DIMENSIONES: { id: Dimension; nombre: string; entraAlIndice: boolean }[] = [
  { id: 'ambiental', nombre: 'Ambiental', entraAlIndice: true },
  { id: 'social', nombre: 'Social', entraAlIndice: true },
  { id: 'gobernanza', nombre: 'Gobernanza', entraAlIndice: true },
  { id: 'economica', nombre: 'Económica', entraAlIndice: true },
  { id: 'cadena', nombre: 'Cadena de valor', entraAlIndice: false },
];

/** Escala de madurez 0–4 (especificación §6.3). */
export const ESCALA = [
  { valor: 0, titulo: 'No se realiza', detalle: 'La práctica no existe o no se ha implementado.' },
  { valor: 1, titulo: 'Informal', detalle: 'Hay acciones aisladas, sin un método definido.' },
  { valor: 2, titulo: 'Parcial', detalle: 'Hay prácticas definidas, pero incompletas o irregulares.' },
  { valor: 3, titulo: 'Implementada', detalle: 'Se aplica de forma sistemática y tiene responsables.' },
  { valor: 4, titulo: 'Medida y mejorada', detalle: 'Se miden los resultados y se usan para mejorar.' },
] as const;

export const BANCO: Pregunta[] = [
  { id: 'AMB01', dimension: 'ambiental', texto: '¿La empresa ha identificado sus principales impactos ambientales?' },
  { id: 'AMB02', dimension: 'ambiental', texto: '¿Registra o hace seguimiento al consumo de energía?' },
  { id: 'AMB03', dimension: 'ambiental', texto: '¿Registra o hace seguimiento al consumo de agua?' },
  { id: 'AMB04', dimension: 'ambiental', texto: '¿Cuenta con prácticas para separar y gestionar los residuos que genera?' },
  { id: 'AMB05', dimension: 'ambiental', texto: '¿Identifica oportunidades para reducir el consumo de materiales y recursos?' },
  { id: 'AMB06', dimension: 'ambiental', texto: '¿Ha identificado riesgos relacionados con el cambio climático que puedan afectar sus operaciones?' },
  { id: 'AMB07', dimension: 'ambiental', texto: '¿Cuenta con prácticas para prevenir o controlar la contaminación?', naHabilitable: true },
  { id: 'AMB08', dimension: 'ambiental', texto: '¿Tiene objetivos o metas ambientales definidos?' },
  { id: 'AMB09', dimension: 'ambiental', texto: '¿Hace seguimiento a los resultados de sus acciones ambientales?' },
  {
    id: 'AMB10',
    dimension: 'ambiental',
    texto: '¿La empresa identifica si sus operaciones se relacionan con ecosistemas o biodiversidad y gestiona esa relación?',
    nueva: true,
    naHabilitable: true,
  },

  { id: 'SOC01', dimension: 'social', texto: '¿La empresa tiene prácticas definidas para promover el bienestar de sus trabajadores?' },
  { id: 'SOC02', dimension: 'social', texto: '¿Identifica necesidades de capacitación de sus colaboradores?' },
  { id: 'SOC03', dimension: 'social', texto: '¿Gestiona los riesgos de seguridad y salud en el trabajo?' },
  { id: 'SOC04', dimension: 'social', texto: '¿Cuenta con prácticas para prevenir la discriminación y promover la igualdad de oportunidades?' },
  { id: 'SOC05', dimension: 'social', texto: '¿Identifica posibles riesgos relacionados con los derechos humanos?' },
  { id: 'SOC06', dimension: 'social', texto: '¿Tiene mecanismos para recibir y gestionar las quejas de sus clientes?' },
  { id: 'SOC07', dimension: 'social', texto: '¿Identifica los efectos de sus operaciones sobre las comunidades, cuando corresponde?', naHabilitable: true },
  { id: 'SOC08', dimension: 'social', texto: '¿Considera aspectos sociales al evaluar a sus proveedores?' },
  {
    id: 'SOC09',
    dimension: 'social',
    texto: '¿La empresa verifica que se cumplan las condiciones laborales básicas de sus trabajadores (contratos, pagos, jornadas)?',
    nueva: true,
  },
  {
    id: 'SOC10',
    dimension: 'social',
    texto: '¿Hace seguimiento a indicadores sociales (por ejemplo rotación, capacitación, accidentalidad) y los usa para decidir?',
    nueva: true,
  },

  { id: 'GOB01', dimension: 'gobernanza', texto: '¿La dirección considera los asuntos de sostenibilidad al tomar decisiones?' },
  { id: 'GOB02', dimension: 'gobernanza', texto: '¿Están definidas las responsabilidades para gestionar los asuntos prioritarios?' },
  { id: 'GOB03', dimension: 'gobernanza', texto: '¿La empresa cuenta con lineamientos de conducta ética?' },
  { id: 'GOB04', dimension: 'gobernanza', texto: '¿Identifica y gestiona los principales riesgos de su operación?' },
  { id: 'GOB05', dimension: 'gobernanza', texto: '¿Identifica los requisitos legales y otros compromisos que le resultan aplicables?' },
  { id: 'GOB06', dimension: 'gobernanza', texto: '¿Cuenta con políticas o procedimientos para gestionar sus asuntos prioritarios?' },
  { id: 'GOB07', dimension: 'gobernanza', texto: '¿Conserva evidencias de las actividades y procedimientos que implementa?' },
  { id: 'GOB08', dimension: 'gobernanza', texto: '¿Utiliza indicadores para hacer seguimiento a sus objetivos?' },
  { id: 'GOB09', dimension: 'gobernanza', texto: '¿Revisa los resultados y define acciones de mejora?' },
  {
    id: 'GOB10',
    dimension: 'gobernanza',
    texto: '¿Tiene medidas para prevenir y gestionar conflictos de interés y posibles actos de corrupción?',
    nueva: true,
  },

  { id: 'ECO01', dimension: 'economica', texto: '¿Identifica oportunidades para reducir desperdicios y costos operativos?' },
  { id: 'ECO02', dimension: 'economica', texto: '¿Revisa sus procesos para identificar ineficiencias?' },
  { id: 'ECO03', dimension: 'economica', texto: '¿Identifica riesgos que podrían afectar la continuidad del negocio?' },
  { id: 'ECO04', dimension: 'economica', texto: '¿Considera criterios ambientales, sociales o de calidad al seleccionar proveedores?' },
  { id: 'ECO05', dimension: 'economica', texto: '¿Identifica oportunidades para mejorar sus productos, servicios o procesos?' },
  { id: 'ECO06', dimension: 'economica', texto: '¿Evalúa los beneficios económicos de las mejoras que implementa?' },

  { id: 'CAD01', dimension: 'cadena', texto: '¿Tiene identificados sus proveedores críticos?' },
  { id: 'CAD02', dimension: 'cadena', texto: '¿Conoce los principales requisitos de sostenibilidad que le solicitan sus clientes?' },
  {
    id: 'CAD03',
    dimension: 'cadena',
    texto: '¿Identifica riesgos y oportunidades relevantes relacionados con sus proveedores, operaciones y clientes?',
  },
  { id: 'CAD04', dimension: 'cadena', texto: '¿Identifica a sus principales grupos de interés y sabe qué esperan de la empresa?', nueva: true },
];

export const NOMBRE_DIMENSION: Record<Dimension, string> = Object.fromEntries(
  DIMENSIONES.map((d) => [d.id, d.nombre])
) as Record<Dimension, string>;
