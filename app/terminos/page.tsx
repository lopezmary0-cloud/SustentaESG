import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Términos y condiciones — SustentaESG' };

export default function Terminos() {
  return (
    <LegalPage
      titulo="Términos y condiciones"
      actualizado="21 de octubre de 2026"
      secciones={[
        {
          titulo: 'Qué es SustentaESG',
          contenido: (
            <p>
              Una herramienta para organizar tu información de sostenibilidad, ver tus brechas por dimensión y
              llevar un plan con historial. Los resultados son orientativos: no son una certificación, una auditoría
              ni asesoría legal.
            </p>
          ),
        },
        {
          titulo: 'Tu cuenta y tus empresas',
          contenido: (
            <p>
              Eres responsable de la información que registras y de quién accede a tu cuenta. Cada plan define
              cuántas empresas puedes gestionar: el plan Empresa, una; el plan Consultor, hasta diez.
            </p>
          ),
        },
        {
          titulo: 'Prueba gratuita',
          contenido: (
            <p>
              Tienes 7 días de prueba desde que la activas. No pedimos tarjeta y no hacemos cobros automáticos. Al
              terminar, te avisamos y puedes elegir un plan; no borramos tus datos sin avisarte.
            </p>
          ),
        },
        {
          titulo: 'Planes, pagos y cancelación',
          contenido: (
            <p>
              Los planes se ofrecen en versión mensual y anual. Los precios y las condiciones de renovación se
              muestran antes de pagar. Puedes cancelar cuando quieras y conservar el acceso hasta el final del
              periodo pagado.
            </p>
          ),
        },
        {
          titulo: 'Tus datos son tuyos',
          contenido: (
            <p>
              La información que registras sigue siendo tuya. Nos autorizas a tratarla solo para prestarte el
              servicio, conforme a la política de privacidad.
            </p>
          ),
        },
        {
          titulo: 'Uso aceptable y límites',
          contenido: (
            <p>
              No uses la aplicación para fines ilegales ni intentes acceder a datos de otras personas. No garantizamos
              que los resultados sean aptos para un propósito particular ni que cumplan una norma específica; tú
              decides cómo usarlos.
            </p>
          ),
        },
        {
          titulo: 'Cambios y ley aplicable',
          contenido: (
            <p>
              Podemos actualizar estos términos y te avisaremos de los cambios importantes. Se rigen por las leyes de
              la República de Colombia.
            </p>
          ),
        },
      ]}
    />
  );
}
