import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      // Resolve utility imports directly from source files for development
      '@coston/design-tokens/utils': path.resolve(__dirname, '../src/build/utils-export.ts'),
    },
  },
  base: process.env.GITHUB_PAGES ? '/design-tokens/' : '/',
});
