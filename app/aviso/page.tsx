import type { Metadata } from 'next';
import { LegalPage } from '@/components/LegalPage';

export const metadata: Metadata = { title: 'Aviso de uso — SustentaESG' };

export default function Aviso() {
  return (
    <LegalPage
      titulo="Aviso de uso"
      actualizado="21 de octubre de 2026"
      secciones={[
        {
          titulo: 'Los resultados son orientativos',
          contenido: (
            <p>
              El puntaje, el nivel de madurez y las recomendaciones salen de las respuestas que tú registras y de
              reglas de cálculo. Sirven para ordenar tu información y priorizar mejoras. No son una certificación, una
              auditoría, una verificación independiente ni asesoría legal.
            </p>
          ),
        },
        {
          titulo: 'Los niveles son provisionales',
          contenido: (
            <p>
              Los rangos de madurez (Inicial, Básico, En desarrollo, Gestionado y Avanzado) son una propuesta de
              trabajo y pueden cambiar. No son un estándar oficial. Cuando falta información, el resultado se muestra
              como provisional.
            </p>
          ),
        },
        {
          titulo: 'Cumplimiento',
          contenido: (
            <p>
              Un puntaje alto no significa que tu empresa cumpla una ley, norma o estándar. Para eso necesitas una
              revisión especializada.
            </p>
          ),
        },
      ]}
    />
  );
}
