import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    root: 'src',
    include: ['**/*.spec.ts'],
    coverage: {
      include: ['**/*.ts'],
      exclude: ['**/*.spec.ts'],
      reportsDirectory: '../coverage',
    },
  },
});
