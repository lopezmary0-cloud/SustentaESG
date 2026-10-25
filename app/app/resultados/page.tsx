import type { Metadata } from 'next';
import { Resultados } from '@/components/diagnostico/Resultados';

export const metadata: Metadata = { title: 'Tus resultados — SustentaESG', robots: { index: false } };

export default function PaginaResultados() {
  return <Resultados />;
}
