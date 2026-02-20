import { describe, it, expect, beforeAll } from 'vitest';
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';

const REQUIRED_TOKENS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar-background',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
  'radius',
];

describe('Token Contract', () => {
  let tokensCSS: string;
  let tailwindCSS: string;

  beforeAll(() => {
    const distDir = join(__dirname, '../dist');

    // Check if dist files exist
    if (!existsSync(join(distDir, 'tokens.css'))) {
      throw new Error('tokens.css not found. Run "npm run build" before testing.');
    }

    tokensCSS = readFileSync(join(distDir, 'tokens.css'), 'utf-8');
    tailwindCSS = readFileSync(join(distDir, 'tailwind.css'), 'utf-8');
  });

  describe('tokens.css', () => {
    it('should exist', () => {
      expect(tokensCSS).toBeTruthy();
      expect(tokensCSS.length).toBeGreaterThan(0);
    });

    it('should include all required CSS variables in :root', () => {
      for (const token of REQUIRED_TOKENS) {
        expect(tokensCSS, `Missing token: --${token} in :root`).toContain(`--${token}:`);
      }
    });

    it('should include .dark theme', () => {
      expect(tokensCSS).toContain('.dark');
      expect(tokensCSS).toMatch(/\.dark\s*{[\s\S]*--background:/);
    });

    it('should include all required CSS variables in .dark', () => {
      const darkSection = tokensCSS.substring(tokensCSS.indexOf('.dark'));

      // Check for key dark theme tokens
      const darkTokens = ['background', 'foreground', 'primary', 'border'];

      for (const token of darkTokens) {
        expect(darkSection, `Missing token: --${token} in .dark`).toContain(`--${token}:`);
      }
    });

    it('should include alternative theme [data-theme="forest"]', () => {
      expect(tokensCSS).toContain('[data-theme="forest"]');
    });

    it('should include alternative theme [data-theme="purple"]', () => {
      expect(tokensCSS).toContain('[data-theme="purple"]');
    });

    it('should use OKLCH color format', () => {
      expect(tokensCSS).toMatch(/oklch\([^)]+\)/);
    });
  });

  describe('tailwind.css', () => {
    it('should exist', () => {
      expect(tailwindCSS).toBeTruthy();
      expect(tailwindCSS.length).toBeGreaterThan(0);
    });

    it('should include inlined CSS variables', () => {
      // Check that CSS variables are inlined in @layer base
      expect(tailwindCSS).toContain('@layer base');
      expect(tailwindCSS).toContain(':root {');
      expect(tailwindCSS).toContain('--primary:');
      expect(tailwindCSS).toContain('.dark {');
    });

    it('should include @theme inline block', () => {
      expect(tailwindCSS).toContain('@theme inline');
    });

    it('should map all required tokens to Tailwind colors', () => {
      const colorMappings = [
        '--color-background',
        '--color-foreground',
        '--color-primary',
        '--color-secondary',
        '--color-muted',
        '--color-accent',
        '--color-destructive',
        '--color-border',
        '--color-input',
        '--color-ring',
      ];

      for (const mapping of colorMappings) {
        expect(tailwindCSS, `Missing Tailwind mapping: ${mapping}`).toContain(mapping);
      }
    });

    it('should include @layer base', () => {
      expect(tailwindCSS).toContain('@layer base');
    });

    it('should include base styles for body', () => {
      expect(tailwindCSS).toMatch(/@layer base[\s\S]*body[\s\S]*@apply/);
    });
  });

  describe('tokens.json', () => {
    it('should exist and be valid JSON', () => {
      const tokensJSON = JSON.parse(readFileSync(join(__dirname, '../dist/tokens.json'), 'utf-8'));

      expect(tokensJSON).toBeTruthy();
      expect(tokensJSON.core).toBeDefined();
      expect(tokensJSON.semantic).toBeDefined();
      expect(tokensJSON.themes).toBeDefined();
    });

    it('should include all themes', () => {
      const tokensJSON = JSON.parse(readFileSync(join(__dirname, '../dist/tokens.json'), 'utf-8'));

      expect(tokensJSON.themes.light).toBeDefined();
      expect(tokensJSON.themes.dark).toBeDefined();
      expect(tokensJSON.themes.forest).toBeDefined();
      expect(tokensJSON.themes['forest-dark']).toBeDefined();
      expect(tokensJSON.themes.purple).toBeDefined();
      expect(tokensJSON.themes['purple-dark']).toBeDefined();
    });

    it('should have all required tokens in semantic', () => {
      const tokensJSON = JSON.parse(readFileSync(join(__dirname, '../dist/tokens.json'), 'utf-8'));

      for (const token of REQUIRED_TOKENS) {
        expect(tokensJSON.semantic[token], `Missing semantic token: ${token}`).toBeDefined();
      }
    });
  });

  describe('JavaScript exports', () => {
    it('should generate index.js', () => {
      const indexJS = readFileSync(join(__dirname, '../dist/index.js'), 'utf-8');

      expect(indexJS).toContain('export const tokens');
      expect(indexJS).toContain('export default tokens');
    });

    it('should generate index.d.ts', () => {
      const indexDTS = readFileSync(join(__dirname, '../dist/index.d.ts'), 'utf-8');

      expect(indexDTS).toContain('export interface');
      expect(indexDTS).toContain('export declare const tokens');
    });
  });
});
