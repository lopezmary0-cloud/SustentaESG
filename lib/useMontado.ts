'use client';

import { useSyncExternalStore } from 'react';

const sinSuscripcion = () => () => {};

/** false al renderizar en el servidor, true en el navegador. Sirve para pantallas que leen localStorage. */
export function useMontado(): boolean {
  return useSyncExternalStore(
    sinSuscripcion,
    () => true,
    () => false
  );
}
