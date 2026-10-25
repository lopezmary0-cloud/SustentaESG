'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { sesionActual } from '@/lib/auth';
import type { Cuenta } from '@/lib/demo/store';
import { useMontado } from '@/lib/useMontado';

/** Cuenta con sesión abierta; si no hay, lleva a /entrar. `listo` es false mientras se decide. */
export function useSesionRequerida(): { cuenta: Cuenta | null; listo: boolean } {
  const montado = useMontado();
  const router = useRouter();
  const [cuenta] = useState<Cuenta | null>(() => (typeof window === 'undefined' ? null : sesionActual()));

  useEffect(() => {
    if (montado && !cuenta) router.replace('/entrar');
  }, [montado, cuenta, router]);

  return { cuenta, listo: montado && cuenta !== null };
}
