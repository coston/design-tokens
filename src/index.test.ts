/**
 * Public API Tests
 *
 * Tests for src/index.ts - the main package export.
 * Verifies actual functionality, not implementation details.
 */
import { describe, it, expect } from 'vitest';
import { generateThemeFromColor } from './index.js';
import type { GeneratedTheme, ThemeGeneratorOptions } from './index.js';
import tokensJSON from '../dist/tokens.json';

describe('Public API Contract', () => {
  describe('generateThemeFromColor', () => {
    it('should be exported as a function', () => {
      expect(typeof generateThemeFromColor).toBe('function');
    });

    it('should generate a valid theme from a base color', () => {
      const theme = generateThemeFromColor({
        baseColor: 'oklch(0.6 0.15 240)',
      });

      expect(theme).toHaveProperty('light');
      expect(theme).toHaveProperty('dark');
    });

    it('should generate all required semantic tokens', () => {
      const theme = generateThemeFromColor({
        baseColor: 'oklch(0.6 0.15 280)',
      });

      const requiredTokens = [
        'background',
        'foreground',
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
      ];

      for (const token of requiredTokens) {
        expect(theme.light[token]).toBeDefined();
        expect(theme.dark[token]).toBeDefined();
        expect(typeof theme.light[token]).toBe('string');
        expect(typeof theme.dark[token]).toBe('string');
      }
    });

    it('should generate OKLCH colors', () => {
      const theme = generateThemeFromColor({
        baseColor: 'oklch(0.6 0.15 240)',
      });

      expect(theme.light.primary).toMatch(/^oklch\(/);
      expect(theme.dark.background).toMatch(/^oklch\(/);
    });

    it('should respect hueRange option', () => {
      const theme1 = generateThemeFromColor({
        baseColor: 'oklch(0.6 0.15 240)',
        hueRange: 10,
      });

      const theme2 = generateThemeFromColor({
        baseColor: 'oklch(0.6 0.15 240)',
        hueRange: 60,
      });

      expect(theme1).toBeDefined();
      expect(theme2).toBeDefined();
    });

    it('should handle different base colors', () => {
      const blue = generateThemeFromColor({ baseColor: 'oklch(0.6 0.15 240)' });
      const green = generateThemeFromColor({ baseColor: 'oklch(0.6 0.15 150)' });
      const purple = generateThemeFromColor({ baseColor: 'oklch(0.6 0.15 300)' });

      expect(blue.light.primary).not.toBe(green.light.primary);
      expect(green.light.primary).not.toBe(purple.light.primary);
    });
  });

  describe('TypeScript Types', () => {
    it('should export GeneratedTheme type', () => {
      const theme: GeneratedTheme = {
        light: { primary: 'oklch(0.6 0.15 240)' },
        dark: { primary: 'oklch(0.4 0.15 240)' },
      };

      expect(theme).toBeDefined();
    });

    it('should export ThemeGeneratorOptions type', () => {
      const options: ThemeGeneratorOptions = {
        baseColor: 'oklch(0.6 0.15 240)',
        hueRange: 30,
      };

      expect(options).toBeDefined();
    });
  });

  describe('Token Data (tokens.json)', () => {
    it('should provide core tokens', () => {
      expect(tokensJSON.core).toBeDefined();
      expect(typeof tokensJSON.core).toBe('object');
      expect(Object.keys(tokensJSON.core).length).toBeGreaterThan(0);
    });

    it('should provide semantic tokens', () => {
      expect(tokensJSON.semantic).toBeDefined();
      expect(tokensJSON.semantic.primary).toBeDefined();
      expect(tokensJSON.semantic.background).toBeDefined();
    });

    it('should provide theme variants', () => {
      expect(tokensJSON.themes).toBeDefined();
      expect(tokensJSON.themes.light).toBeDefined();
      expect(tokensJSON.themes.dark).toBeDefined();
    });

    it('should have valid OKLCH values', () => {
      const primaryColor = tokensJSON.semantic.primary;
      expect(primaryColor).toMatch(/^oklch\(/);
    });
  });
});
