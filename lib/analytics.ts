// Eventos del camino de venta (docs/sistema/36 y 60). Por ahora se anotan en el navegador, con una
// sesión anónima, para poder probarlos en QA; en la fase de servicios se envían a la analítica real.
// Nunca llevan correos, nombres ni textos escritos por la persona: solo el nombre del evento y
// datos de categoría.

export type EventoCamino =
  | 'onboarding_iniciado'
  | 'onboarding_paso'
  | 'resultado_visto'
  | 'planes_visto'
  | 'planes_salida'
  | 'prueba_elegida'
  | 'registro_iniciado'
  | 'cuenta_creada'
  | 'entrada_exitosa';

const CLAVE = 'sustentaesg.eventos.v1';

export function track(evento: EventoCamino, datos: Record<string, string | number | boolean> = {}) {
  if (typeof window === 'undefined') return;
  try {
    const anteriores = JSON.parse(window.sessionStorage.getItem(CLAVE) ?? '[]') as unknown[];
    anteriores.push({ evento, datos, t: Date.now() });
    window.sessionStorage.setItem(CLAVE, JSON.stringify(anteriores.slice(-100)));
  } catch {
    // sin almacenamiento: el evento se pierde, la pantalla no se afecta
  }
}
