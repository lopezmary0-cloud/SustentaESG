import type { Metadata } from 'next';
import { Suspense } from 'react';
import { CuestionarioConClave } from '@/components/diagnostico/CuestionarioConClave';

export const metadata: Metadata = { title: 'Tu diagnóstico — SustentaESG', robots: { index: false } };

export default function PaginaDiagnostico() {
  return (
    <Suspense>
      <CuestionarioConClave />
    </Suspense>
  );
}
