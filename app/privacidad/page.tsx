import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Política de privacidad — SustentaESG' };

export default function Privacidad() {
  return (
    <LegalPage
      titulo="Política de privacidad"
      actualizado="21 de octubre de 2026"
      secciones={[
        {
          titulo: 'Quién es responsable de tus datos',
          contenido: (
            <p>
              SustentaESG es una aplicación web para diagnosticar y hacer seguimiento a la sostenibilidad de una o
              varias empresas. El titular responsable del tratamiento publicará su razón social, NIT y dirección en
              esta página antes del lanzamiento público.
            </p>
          ),
        },
        {
          titulo: 'Qué datos recogemos',
          contenido: (
            <ul className="list-disc pl-5">
              <li>Tu nombre y tu correo, para crear tu cuenta.</li>
              <li>Los datos de las empresas que registras y las respuestas de tus diagnósticos.</li>
              <li>Las acciones de tu plan de mejora (responsables, fechas, estados y notas).</li>
              <li>Datos técnicos de uso, para que la aplicación funcione y mejore.</li>
            </ul>
          ),
        },
        {
          titulo: 'Para qué los usamos',
          contenido: (
            <p>
              Para prestarte el servicio, guardar tu avance, calcular tus resultados, darte soporte y mejorar la
              aplicación. No vendemos tus datos ni los usamos para publicidad de terceros.
            </p>
          ),
        },
        {
          titulo: 'Cada empresa, en su propio espacio',
          contenido: (
            <p>
              La información de cada empresa se guarda separada de la de las demás. Si usas el plan de consultor,
              solo tú accedes a las empresas que tú registras.
            </p>
          ),
        },
        {
          titulo: 'Con quién los compartimos',
          contenido: (
            <p>
              Con proveedores que hacen posible el servicio: alojamiento y base de datos, correo transaccional y
              procesamiento de pagos (Hotmart). Algunos pueden operar fuera de Colombia, por lo que tus datos pueden
              transferirse internacionalmente con las medidas de seguridad correspondientes.
            </p>
          ),
        },
        {
          titulo: 'Tus derechos',
          contenido: (
            <p>
              Conforme a la Ley 1581 de 2012 y las normas que la reglamentan, puedes conocer, actualizar y rectificar
              tus datos, solicitar su supresión, revocar tu autorización y presentar quejas ante la Superintendencia
              de Industria y Comercio. Para ejercerlos, escríbenos al correo de contacto de esta página.
            </p>
          ),
        },
        {
          titulo: 'Cuánto tiempo los conservamos',
          contenido: (
            <p>
              Mientras tu cuenta esté activa. Si tu prueba termina sin suscripción, limitamos el acceso pero no
              borramos tus datos sin avisarte antes; podrás recuperarlos o pedir su eliminación.
            </p>
          ),
        },
      ]}
    />
  );
}
