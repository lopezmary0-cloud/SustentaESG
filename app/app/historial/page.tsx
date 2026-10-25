import type { Metadata } from 'next';
import { Historial } from '@/components/historial/Historial';

export const metadata: Metadata = { title: 'Historial — SustentaESG', robots: { index: false } };

export default function PaginaHistorial() {
  return <Historial />;
}
