import type { Metadata } from 'next';
import { Planes } from '@/components/planes/Planes';

export const metadata: Metadata = { title: 'Tus 7 días gratis — SustentaESG' };

export default function PaginaPlanes() {
  return <Planes />;
}
