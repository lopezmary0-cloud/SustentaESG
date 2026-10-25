'use client';

import { useEffect, useState } from 'react';
import { animate, useReducedMotion } from 'motion/react';

/** Número que cuenta de 0 al objetivo al aparecer (sin movimiento si la persona lo pidió así). */
export function useCuenta(objetivo: number, duracion = 0.9): number {
  const reduce = useReducedMotion();
  const [valor, setValor] = useState(0);

  useEffect(() => {
    if (reduce) return;
    const control = animate(0, objetivo, {
      duration: duracion,
      ease: [0.32, 0.72, 0, 1],
      onUpdate: (v) => setValor(Math.round(v)),
    });
    return () => control.stop();
  }, [objetivo, duracion, reduce]);

  return reduce ? objetivo : valor;
}
