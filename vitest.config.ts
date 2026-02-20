import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/build/utils/*.ts'],
      exclude: [
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/**',
        '**/node_modules/**',
        '**/demo/**',
        '**/examples/**',
        '**/generators/**', // Tested via integration/contract tests
        'src/build/index.ts', // Build orchestrator - tested via integration
        'src/build/utils-export.ts', // Just exports, no logic to test
      ],
      thresholds: {
        statements: 95,
        branches: 93, // Slightly lower due to error handling paths
        functions: 95,
        lines: 95,
      },
    },
  },
});
