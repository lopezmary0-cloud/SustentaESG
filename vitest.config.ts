import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vitest/config';

// Mismo atajo «@/» que usa la app (tsconfig paths), para que las pruebas importen igual que el código.
export default defineConfig({
  resolve: { alias: { '@': fileURLToPath(new URL('./', import.meta.url)) } },
  test: { include: ['lib/**/*.test.ts', 'supabase/**/*.test.ts'], testTimeout: 30_000 },
});
