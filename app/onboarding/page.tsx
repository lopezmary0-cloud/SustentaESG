import type { Metadata } from 'next';
import { Recorrido } from '@/components/onboarding/Recorrido';

export const metadata: Metadata = { title: 'Tu diagnóstico — SustentaESG' };

export default function Onboarding() {
  return <Recorrido />;
}
