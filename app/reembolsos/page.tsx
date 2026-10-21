import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Política de reembolsos — SustentaESG' };

export default function Reembolsos() {
  return (
    <LegalPage
      titulo="Política de reembolsos"
      actualizado="21 de octubre de 2026"
      secciones={[
        {
          titulo: 'La Garantía del Primer Diagnóstico',
          contenido: (
            <p>
              Si pagas y tu primer diagnóstico no te sirve, escríbenos dentro de los primeros 7 días desde tu compra
              y te devolvemos tu dinero, sin preguntas.
            </p>
          ),
        },
        {
          titulo: 'Cómo pedirlo',
          contenido: (
            <p>
              Envía un correo al contacto de esta página desde el correo con el que compraste. El reembolso se
              procesa por el mismo medio de pago, a través de Hotmart, que es quien gestiona la compra.
            </p>
          ),
        },
        {
          titulo: 'Antes de pagar',
          contenido: (
            <p>
              La prueba gratuita de 7 días no tiene costo ni cobro automático, por lo que no hay nada que reembolsar
              durante ella.
            </p>
          ),
        },
      ]}
    />
  );
}
