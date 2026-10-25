import type { Metadata } from 'next';
import { Panel } from '@/components/panel/Panel';

export const metadata: Metadata = { title: 'Tu panel — SustentaESG', robots: { index: false } };

export default function PaginaPanel() {
  return <Panel />;
}
