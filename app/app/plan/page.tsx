import type { Metadata } from 'next';
import { PlanDeMejora } from '@/components/plan/PlanDeMejora';

export const metadata: Metadata = { title: 'Tu plan de mejora — SustentaESG', robots: { index: false } };

export default function PaginaPlan() {
  return <PlanDeMejora />;
}
