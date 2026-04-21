import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Demo-specific: import internal utilities (not part of public API)
      '@internal/color-utils': path.resolve(__dirname, '../src/build/utils/color-utils.ts'),
      '@internal/contrast': path.resolve(__dirname, '../src/build/utils/contrast-validation.ts'),
    },
    preserveSymlinks: true,
  },
  base: process.env.GITHUB_PAGES ? '/design-tokens/' : '/',
});
