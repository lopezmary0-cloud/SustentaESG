import type { Metadata } from 'next';
import { Acceso } from '@/components/acceso/Acceso';

export const metadata: Metadata = { title: 'Entrar — SustentaESG' };

export default function Entrar() {
  return <Acceso modo="entrada" />;
}
