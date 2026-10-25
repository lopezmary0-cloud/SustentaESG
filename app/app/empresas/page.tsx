import type { Metadata } from 'next';
import { MisEmpresas } from '@/components/empresas/MisEmpresas';

export const metadata: Metadata = { title: 'Mis empresas — SustentaESG', robots: { index: false } };

export default function PaginaEmpresas() {
  return <MisEmpresas />;
}
