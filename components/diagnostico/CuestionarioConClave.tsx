'use client';

import { useSearchParams } from 'next/navigation';
import { Cuestionario } from './Cuestionario';

/** La pregunta pedida (?p=AMB05) es la «llave» del cuestionario: si cambia, se vuelve a montar en esa pregunta. */
export function CuestionarioConClave() {
  const pedida = useSearchParams().get('p');
  return <Cuestionario key={pedida ?? 'continuar'} pedida={pedida} />;
}
