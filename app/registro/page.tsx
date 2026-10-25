import type { Metadata } from 'next';
import { Acceso } from '@/components/acceso/Acceso';

export const metadata: Metadata = { title: 'Crea tu cuenta — SustentaESG' };

export default function Registro() {
  return <Acceso modo="registro" />;
}
