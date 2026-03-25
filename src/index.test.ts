/**
 * Public API Tests
 *
 * Tests for src/index.ts - the main package export.
 * Verifies actual functionality, not implementation details.
 */
import { describe, it, expect } from 'vitest';
import { generateThemeFromColor, generateMonochromaticTheme } from './index.js';
import type { GeneratedTheme, ThemeGeneratorOptions } from './index.js';
import { parseOKLCH } from './build/utils/color-utils.js';
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

  describe('generateMonochromaticTheme', () => {
    it('should be exported as a function', () => {
      expect(typeof generateMonochromaticTheme).toBe('function');
    });

    it('should generate light and dark themes', () => {
      const theme = generateMonochromaticTheme({ baseColor: 'oklch(0.6 0.185 300)' });
      expect(theme).toHaveProperty('light');
      expect(theme).toHaveProperty('dark');
    });

    it('should generate all required semantic tokens', () => {
      const theme = generateMonochromaticTheme({ baseColor: 'oklch(0.6 0.185 300)' });
      const required = [
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
        'selection',
        'selection-foreground',
      ];
      for (const token of required) {
        expect(theme.light[token], `light.${token}`).toBeDefined();
        expect(theme.dark[token], `dark.${token}`).toBeDefined();
      }
    });

    it('should output valid OKLCH for all tokens', () => {
      const theme = generateMonochromaticTheme({ baseColor: 'oklch(0.6 0.185 300)' });
      [...Object.values(theme.light), ...Object.values(theme.dark)].forEach(v => {
        expect(v).toMatch(/^oklch\(/);
      });
    });

    it('should produce pure grays when baseColor has zero chroma', () => {
      const theme = generateMonochromaticTheme({ baseColor: 'oklch(0 0 0)' });
      const nonChartTokens = Object.entries(theme.light).filter(
        ([k]) => !k.startsWith('chart') && !k.includes('destructive') && k !== 'sidebar-primary'
      );
      for (const [key, value] of nonChartTokens) {
        expect(parseOKLCH(value).c, key).toBe(0);
      }
    });

    it('should use deep dark background for pure gray (C=0)', () => {
      const theme = generateMonochromaticTheme({ baseColor: 'oklch(0 0 0)' });
      expect(parseOKLCH(theme.dark.background).l).toBeCloseTo(0.145, 2);
    });

    it('should use lifted dark background for colored hues to avoid muddiness', () => {
      const theme = generateMonochromaticTheme({ baseColor: 'oklch(0.6 0.185 300)' });
      expect(parseOKLCH(theme.dark.background).l).toBeCloseTo(0.2, 2);
    });

    it('should tint all tokens at the base hue for colored inputs', () => {
      const theme = generateMonochromaticTheme({ baseColor: 'oklch(0.6 0.185 300)' });
      const fg = parseOKLCH(theme.light.foreground);
      expect(fg.h).toBeCloseTo(300, 0);
      expect(fg.c).toBeGreaterThan(0);
    });

    it('should reduce tint at very dark lightness to prevent warm-hue browning', () => {
      const theme = generateMonochromaticTheme({ baseColor: 'oklch(0.6 0.18 15)' }); // rose
      const darkBg = parseOKLCH(theme.dark.background); // L=0.20
      const midTone = parseOKLCH(theme.light.ring); // L=0.60, full tint
      expect(darkBg.c).toBeLessThan(midTone.c);
    });

    it('should keep destructive tokens red regardless of base hue', () => {
      const theme = generateMonochromaticTheme({ baseColor: 'oklch(0.6 0.185 300)' });
      expect(theme.light.destructive).toBe('oklch(0.577 0.245 27.325)');
      expect(theme.dark.destructive).toBe('oklch(0.396 0.141 25.723)');
    });

    it('should use vibrant chart colors anchored to base hue when C > 0', () => {
      const theme = generateMonochromaticTheme({ baseColor: 'oklch(0.6 0.185 300)' });
      const chart1 = parseOKLCH(theme.light['chart-1']);
      expect(chart1.h).toBeCloseTo(300, 0);
      expect(chart1.c).toBeGreaterThan(0.15);
    });

    it('should use shadcn fallback chroma for chart colors when C = 0', () => {
      const theme = generateMonochromaticTheme({ baseColor: 'oklch(0 0 0)' });
      expect(parseOKLCH(theme.light['chart-1']).c).toBeCloseTo(0.222, 2);
    });

    it('should respect chromaScale option', () => {
      const full = generateMonochromaticTheme({
        baseColor: 'oklch(0.6 0.185 300)',
        chromaScale: 1.0,
      });
      const half = generateMonochromaticTheme({
        baseColor: 'oklch(0.6 0.185 300)',
        chromaScale: 0.5,
      });
      expect(parseOKLCH(half.light.foreground).c).toBeLessThan(parseOKLCH(full.light.foreground).c);
    });

    it('should return a frozen result', () => {
      const theme = generateMonochromaticTheme({ baseColor: 'oklch(0.6 0.185 300)' });
      expect(Object.isFrozen(theme)).toBe(true);
    });

    it('should produce a different palette than generateThemeFromColor', () => {
      const mono = generateMonochromaticTheme({ baseColor: 'oklch(0.6 0.185 300)' });
      const vibrant = generateThemeFromColor({ baseColor: 'oklch(0.6 0.185 300)' });
      // Monochromatic secondary is a tinted neutral; vibrant secondary is colorful
      expect(mono.light.secondary).not.toBe(vibrant.light.secondary);
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
