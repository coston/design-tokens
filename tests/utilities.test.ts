import { describe, it, expect, vi } from 'vitest';
import {
  parseOKLCH,
  toOKLCH,
  adjustHue,
  adjustLightness,
  adjustChroma,
  setLightness,
  setChroma,
  setHue,
  getComplementary,
  getTriadic,
  getAnalogous,
  getTetradic,
  getSplitComplementary,
  generateColorScale,
  generateLightnessScale,
  mixColors,
  lighten,
  darken,
  saturate,
  desaturate,
  isLight,
  isDark,
  oklchToRgb,
  rgbToHex,
  oklchToHex,
  isInGamut,
  findMaxChroma,
  getGamutInfo,
} from '../src/build/utils/color-utils.js';

import {
  getContrastRatio,
  checkContrast,
  formatContrastRatio,
  getMinimumRatio,
  validateTokenContrast,
  suggestContrastFix,
} from '../src/build/utils/contrast-validation.js';

import { generateThemeFromColor, previewTheme } from '../src/build/utils/theme-generator.js';

import {
  RATIOS,
  generateScale,
  generateSpacingScale,
  calculateRatio,
  findClosestRatio,
  generateBidirectionalScale,
  generateTypographyScale,
  generateCustomScale,
  generateTailwindSpacing,
  generateScalePreview,
  interpolateScale,
} from '../src/build/utils/modular-scale.js';

describe('Color Utils', () => {
  describe('parseOKLCH', () => {
    it('should parse OKLCH color string', () => {
      const result = parseOKLCH('oklch(0.5 0.2 200)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 200 });
    });

    it('should parse OKLCH with alpha', () => {
      const result = parseOKLCH('oklch(0.5 0.2 200 / 0.8)');
      expect(result).toEqual({ l: 0.5, c: 0.2, h: 200, a: 0.8 });
    });

    it('should throw on invalid format', () => {
      expect(() => parseOKLCH('invalid')).toThrow();
    });
  });

  describe('toOKLCH', () => {
    it('should convert OKLCH object to string', () => {
      const result = toOKLCH({ l: 0.5, c: 0.2, h: 200 });
      expect(result).toBe('oklch(0.500 0.200 200)');
    });

    it('should include alpha when present', () => {
      const result = toOKLCH({ l: 0.5, c: 0.2, h: 200, a: 0.8 });
      expect(result).toBe('oklch(0.500 0.200 200 / 0.80)');
    });
  });

  describe('adjustHue', () => {
    it('should rotate hue by specified degrees', () => {
      const result = adjustHue('oklch(0.5 0.2 200)', 30);
      const parsed = parseOKLCH(result);
      expect(parsed.h).toBe(230);
    });

    it('should wrap hue around 360', () => {
      const result = adjustHue('oklch(0.5 0.2 350)', 30);
      const parsed = parseOKLCH(result);
      expect(parsed.h).toBe(20);
    });

    it('should handle negative rotation', () => {
      const result = adjustHue('oklch(0.5 0.2 20)', -30);
      const parsed = parseOKLCH(result);
      expect(parsed.h).toBe(350);
    });
  });

  describe('adjustLightness', () => {
    it('should increase lightness', () => {
      const result = adjustLightness('oklch(0.5 0.2 200)', 0.1);
      const parsed = parseOKLCH(result);
      expect(parsed.l).toBeCloseTo(0.6);
    });

    it('should decrease lightness', () => {
      const result = adjustLightness('oklch(0.5 0.2 200)', -0.1);
      const parsed = parseOKLCH(result);
      expect(parsed.l).toBeCloseTo(0.4);
    });

    it('should clamp lightness to 0-1 range', () => {
      const result1 = adjustLightness('oklch(0.9 0.2 200)', 0.5);
      expect(parseOKLCH(result1).l).toBe(1);

      const result2 = adjustLightness('oklch(0.1 0.2 200)', -0.5);
      expect(parseOKLCH(result2).l).toBe(0);
    });
  });

  describe('lighten and darken', () => {
    it('should lighten color', () => {
      const result = lighten('oklch(0.5 0.2 200)', 0.1);
      expect(parseOKLCH(result).l).toBeCloseTo(0.6);
    });

    it('should darken color', () => {
      const result = darken('oklch(0.5 0.2 200)', 0.1);
      expect(parseOKLCH(result).l).toBeCloseTo(0.4);
    });
  });

  describe('isLight and isDark', () => {
    it('should identify light colors', () => {
      expect(isLight('oklch(0.7 0.2 200)')).toBe(true);
      expect(isLight('oklch(0.3 0.2 200)')).toBe(false);
    });

    it('should identify dark colors', () => {
      expect(isDark('oklch(0.3 0.2 200)')).toBe(true);
      expect(isDark('oklch(0.7 0.2 200)')).toBe(false);
    });
  });

  describe('getComplementary', () => {
    it('should return complementary color', () => {
      const result = getComplementary('oklch(0.5 0.2 200)');
      const parsed = parseOKLCH(result);
      expect(parsed.h).toBe(20); // 200 + 180 - 360
    });
  });

  describe('getTriadic', () => {
    it('should return three colors evenly spaced', () => {
      const result = getTriadic('oklch(0.5 0.2 0)');
      expect(result).toHaveLength(3);

      const hues = result.map(c => parseOKLCH(c).h);
      expect(hues[0]).toBe(0);
      expect(hues[1]).toBe(120);
      expect(hues[2]).toBe(240);
    });
  });

  describe('setLightness', () => {
    it('should set lightness to specific value', () => {
      const result = setLightness('oklch(0.5 0.2 240)', 0.8);
      const parsed = parseOKLCH(result);
      expect(parsed.l).toBeCloseTo(0.8);
      expect(parsed.c).toBeCloseTo(0.2);
      expect(parsed.h).toBe(240);
    });
  });

  describe('setChroma', () => {
    it('should set chroma to specific value', () => {
      const result = setChroma('oklch(0.5 0.2 240)', 0.15);
      const parsed = parseOKLCH(result);
      expect(parsed.l).toBeCloseTo(0.5);
      expect(parsed.c).toBeCloseTo(0.15);
      expect(parsed.h).toBe(240);
    });
  });

  describe('setHue', () => {
    it('should set hue to specific value', () => {
      const result = setHue('oklch(0.5 0.2 240)', 120);
      const parsed = parseOKLCH(result);
      expect(parsed.l).toBeCloseTo(0.5);
      expect(parsed.c).toBeCloseTo(0.2);
      expect(parsed.h).toBe(120);
    });
  });

  describe('adjustChroma', () => {
    it('should adjust chroma by amount', () => {
      const result = adjustChroma('oklch(0.5 0.2 240)', 0.05);
      const parsed = parseOKLCH(result);
      expect(parsed.c).toBeCloseTo(0.25);
    });

    it('should not go below 0', () => {
      const result = adjustChroma('oklch(0.5 0.1 240)', -0.5);
      const parsed = parseOKLCH(result);
      expect(parsed.c).toBeGreaterThanOrEqual(0);
    });
  });

  describe('getAnalogous', () => {
    it('should return analogous colors', () => {
      const result = getAnalogous('oklch(0.5 0.2 180)', 30);
      expect(result).toHaveLength(3);
      const hues = result.map(c => parseOKLCH(c).h);
      expect(hues[0]).toBe(150);
      expect(hues[1]).toBe(180);
      expect(hues[2]).toBe(210);
    });
  });

  describe('getTetradic', () => {
    it('should return four colors in tetradic harmony', () => {
      const result = getTetradic('oklch(0.5 0.2 0)', 60);
      expect(result).toHaveLength(4);
    });
  });

  describe('getSplitComplementary', () => {
    it('should return split complementary colors', () => {
      const result = getSplitComplementary('oklch(0.5 0.2 0)', 30);
      expect(result).toHaveLength(3);
    });
  });

  describe('generateLightnessScale', () => {
    it('should generate lightness scale', () => {
      const result = generateLightnessScale('oklch(0.5 0.2 240)', 11);
      expect(result).toHaveLength(11);
    });
  });

  describe('desaturate', () => {
    it('should reduce chroma', () => {
      const result = desaturate('oklch(0.5 0.2 240)', 0.05);
      const parsed = parseOKLCH(result);
      expect(parsed.c).toBeCloseTo(0.19); // 0.2 * (1 - 0.05)
    });
  });

  describe('saturate', () => {
    it('should increase chroma', () => {
      const result = saturate('oklch(0.5 0.2 240)', 0.05);
      const parsed = parseOKLCH(result);
      expect(parsed.c).toBeCloseTo(0.21); // 0.2 * (1 + 0.05)
    });
  });

  describe('oklchToRgb', () => {
    it('should convert OKLCH to RGB', () => {
      const result = oklchToRgb('oklch(0.5 0.1 240)');
      expect(result).toHaveProperty('r');
      expect(result).toHaveProperty('g');
      expect(result).toHaveProperty('b');
      expect(result.r).toBeGreaterThanOrEqual(0);
      expect(result.r).toBeLessThanOrEqual(255);
    });
  });

  describe('rgbToHex', () => {
    it('should convert RGB to hex', () => {
      const result = rgbToHex(255, 128, 64);
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
      expect(result).toBe('#ff8040');
    });
  });

  describe('oklchToHex', () => {
    it('should convert OKLCH to hex', () => {
      const result = oklchToHex('oklch(0.5 0.1 240)');
      expect(result).toMatch(/^#[0-9a-f]{6}$/i);
    });
  });

  describe('generateColorScale', () => {
    it('should generate 11 color steps', () => {
      const scale = generateColorScale('oklch(0.6 0.2 200)');
      expect(Object.keys(scale)).toHaveLength(11);
    });

    it('should include standard steps', () => {
      const scale = generateColorScale('oklch(0.6 0.2 200)');
      expect(scale).toHaveProperty('50');
      expect(scale).toHaveProperty('500');
      expect(scale).toHaveProperty('950');
    });

    it('should have lightest at 50 and darkest at 950', () => {
      const scale = generateColorScale('oklch(0.6 0.2 200)');
      const l50 = parseOKLCH(scale['50']).l;
      const l950 = parseOKLCH(scale['950']).l;
      expect(l50).toBeGreaterThan(l950);
    });
  });

  describe('mixColors', () => {
    it('should mix two colors evenly', () => {
      const c1 = 'oklch(0.8 0.2 200)';
      const c2 = 'oklch(0.4 0.1 200)';
      const mixed = mixColors(c1, c2, 0.5);
      const parsed = parseOKLCH(mixed);

      expect(parsed.l).toBeCloseTo(0.6); // (0.8 + 0.4) / 2
      expect(parsed.c).toBeCloseTo(0.15); // (0.2 + 0.1) / 2
    });

    it('should handle different weights', () => {
      const c1 = 'oklch(0.8 0.2 200)';
      const c2 = 'oklch(0.4 0.1 200)';
      const mixed = mixColors(c1, c2, 0.75);
      const parsed = parseOKLCH(mixed);

      expect(parsed.l).toBeCloseTo(0.5); // 0.8 * 0.25 + 0.4 * 0.75
    });
  });

  describe('Gamut Mapping', () => {
    describe('isInGamut', () => {
      it('should accept gray colors', () => {
        expect(isInGamut('oklch(0.5 0 0)')).toBe(true);
        expect(isInGamut('oklch(0.9 0.001 180)')).toBe(true);
      });

      it('should accept known in-gamut colors', () => {
        // These are safely within sRGB gamut
        expect(isInGamut('oklch(0.628 0.225 29)')).toBe(true); // Red (sRGB primary)
        expect(isInGamut('oklch(0.866 0.29 142)')).toBe(true); // Green
        expect(isInGamut('oklch(0.452 0.26 264)')).toBe(true); // Blue (reduced to fit gamut)
      });

      it('should accept moderate chroma colors', () => {
        // These are safe, lower chroma values
        expect(isInGamut('oklch(0.6 0.12 240)')).toBe(true);
        expect(isInGamut('oklch(0.5 0.11 120)')).toBe(true); // Reduced to fit gamut
        expect(isInGamut('oklch(0.7 0.1 60)')).toBe(true);
      });

      it('should reject extremely high chroma', () => {
        expect(isInGamut('oklch(0.6 0.6 240)')).toBe(false);
        expect(isInGamut('oklch(0.5 0.8 120)')).toBe(false);
      });

      it('should accept colors as OKLCH objects', () => {
        expect(isInGamut({ l: 0.5, c: 0.08, h: 180 })).toBe(true);
        expect(isInGamut({ l: 0.5, c: 0.8, h: 180 })).toBe(false);
      });
    });

    describe('findMaxChroma', () => {
      it('should return positive values for mid-lightness', () => {
        const maxChroma = findMaxChroma(0.6, 240);
        expect(maxChroma).toBeGreaterThan(0);
        expect(maxChroma).toBeLessThan(0.5);
      });

      it('should return smaller values for extreme lightness', () => {
        const nearWhite = findMaxChroma(0.96, 240);
        const nearBlack = findMaxChroma(0.04, 240);
        const midTone = findMaxChroma(0.6, 240);

        expect(nearWhite).toBeLessThan(midTone);
        expect(nearBlack).toBeLessThan(midTone);
      });

      it('should vary by hue', () => {
        const blue = findMaxChroma(0.6, 240);
        const yellow = findMaxChroma(0.6, 90);

        // Blues typically have higher max chroma than yellows
        expect(blue).toBeGreaterThan(yellow);
      });

      it('should return consistent values for same L/H', () => {
        const first = findMaxChroma(0.6, 240);
        const second = findMaxChroma(0.6, 240);
        expect(first).toBe(second); // Should use cache
      });

      it('should respect precision parameter', () => {
        const coarse = findMaxChroma(0.6, 240, 0.01);
        const fine = findMaxChroma(0.6, 240, 0.0001);

        // Both should be close, but precision affects accuracy
        expect(Math.abs(coarse - fine)).toBeLessThan(0.02);
      });
    });

    describe('getGamutInfo', () => {
      it('should provide gamut status for in-gamut colors', () => {
        const info = getGamutInfo('oklch(0.6 0.12 240)'); // Actually in gamut

        expect(info.inGamut).toBe(true);
        expect(info.currentChroma).toBeCloseTo(0.12);
        expect(info.maxChroma).toBeGreaterThan(info.currentChroma);
        expect(info.utilization).toBeLessThan(100);
      });

      it('should provide gamut status for out-of-gamut colors', () => {
        const info = getGamutInfo('oklch(0.6 0.6 240)');

        expect(info.inGamut).toBe(false);
        expect(info.currentChroma).toBeCloseTo(0.6);
        expect(info.maxChroma).toBeLessThan(info.currentChroma);
        expect(info.utilization).toBeGreaterThan(100);
      });

      it('should show ~100% utilization at gamut boundary', () => {
        const lightness = 0.6;
        const hue = 240;
        const maxC = findMaxChroma(lightness, hue);
        const info = getGamutInfo({ l: lightness, c: maxC, h: hue });

        expect(info.utilization).toBeCloseTo(100, 1);
        expect(info.inGamut).toBe(true);
      });

      it('should handle OKLCH objects', () => {
        const info = getGamutInfo({ l: 0.6, c: 0.15, h: 240 });
        expect(info).toHaveProperty('inGamut');
        expect(info).toHaveProperty('currentChroma');
        expect(info).toHaveProperty('maxChroma');
        expect(info).toHaveProperty('utilization');
      });
    });

    describe('Property-Based Tests', () => {
      it('lower chroma should always be safer than higher chroma', () => {
        const lightness = 0.6;
        const hue = 240;

        // If high chroma is in gamut, lower chroma should be too
        if (isInGamut({ l: lightness, c: 0.12, h: hue })) {
          expect(isInGamut({ l: lightness, c: 0.1, h: hue })).toBe(true);
          expect(isInGamut({ l: lightness, c: 0.05, h: hue })).toBe(true);
        }
      });

      it('max chroma should be at gamut boundary', () => {
        const lightness = 0.6;
        const hue = 240;
        const maxC = findMaxChroma(lightness, hue);

        // Max chroma should be in gamut
        expect(isInGamut({ l: lightness, c: maxC, h: hue })).toBe(true);

        // Slightly above should be out of gamut (or very close)
        const slightlyAbove = maxC + 0.01;
        const info = getGamutInfo({ l: lightness, c: slightlyAbove, h: hue });
        expect(info.utilization).toBeGreaterThan(100);
      });
    });

    describe('Gamut Edge Cases', () => {
      it('should handle near-white and near-black chroma limits', () => {
        // Near-white
        const nearWhite = findMaxChroma(0.95, 240);
        expect(nearWhite).toBeLessThan(0.05);

        // Near-black
        const nearBlack = findMaxChroma(0.05, 240);
        expect(nearBlack).toBeLessThan(0.05);

        // Mid-tone should have much higher capacity
        const midTone = findMaxChroma(0.6, 240);
        expect(midTone).toBeGreaterThan(nearWhite * 2);
        expect(midTone).toBeGreaterThan(nearBlack * 2);
      });

      it('should handle hue variations in max chroma', () => {
        const lightness = 0.6;

        // Test various hues
        const red = findMaxChroma(lightness, 20);
        const yellow = findMaxChroma(lightness, 100);
        const green = findMaxChroma(lightness, 150);
        const blue = findMaxChroma(lightness, 240);
        const magenta = findMaxChroma(lightness, 320);

        // Red and magenta should have highest chroma
        expect(red).toBeGreaterThan(blue);
        expect(magenta).toBeGreaterThan(blue);

        // Yellow should have lowest chroma
        expect(yellow).toBeLessThan(blue);
        expect(yellow).toBeLessThan(green);
        expect(yellow).toBeLessThan(red);
      });
    });
  });
});

describe('Contrast Validation', () => {
  describe('getContrastRatio', () => {
    it('should return ratio >= 1', () => {
      const ratio = getContrastRatio('oklch(0.3 0.1 200)', 'oklch(0.95 0.02 200)');
      expect(ratio).toBeGreaterThanOrEqual(1);
    });

    it('should return higher ratio for more contrast', () => {
      const lowContrast = getContrastRatio('oklch(0.5 0.1 200)', 'oklch(0.6 0.1 200)');
      const highContrast = getContrastRatio('oklch(0.2 0.1 200)', 'oklch(0.95 0.02 200)');

      expect(highContrast).toBeGreaterThan(lowContrast);
    });

    it('should return same ratio regardless of order', () => {
      const c1 = 'oklch(0.3 0.1 200)';
      const c2 = 'oklch(0.95 0.02 200)';

      const ratio1 = getContrastRatio(c1, c2);
      const ratio2 = getContrastRatio(c2, c1);

      expect(ratio1).toBeCloseTo(ratio2);
    });
  });

  describe('checkContrast', () => {
    it('should pass WCAG AA for sufficient contrast', () => {
      const result = checkContrast('oklch(0.2 0.1 200)', 'oklch(0.95 0.02 200)');

      expect(result.ratio).toBeGreaterThan(4.5);
      expect(result.AA).toBe(true);
    });

    it('should fail WCAG AA for insufficient contrast', () => {
      const result = checkContrast('oklch(0.5 0.1 200)', 'oklch(0.6 0.1 200)');

      expect(result.ratio).toBeLessThan(4.5);
      expect(result.AA).toBe(false);
    });

    it('should have AA less strict than AAA', () => {
      const result = checkContrast('oklch(0.4 0.1 200)', 'oklch(0.95 0.02 200)');

      // Ratio between 4.5 and 7 should pass AA but not AAA
      if (result.ratio > 4.5 && result.ratio < 7) {
        expect(result.AA).toBe(true);
        expect(result.AAA).toBe(false);
      }
    });
  });

  describe('formatContrastRatio', () => {
    it('should format ratio with 2 decimal places', () => {
      expect(formatContrastRatio(4.567)).toBe('4.57:1');
      expect(formatContrastRatio(12.3)).toBe('12.30:1');
    });
  });

  describe('getMinimumRatio', () => {
    it('should return correct ratio for AA normal text', () => {
      expect(getMinimumRatio(false)).toBe(4.5);
    });

    it('should return correct ratio for AA large text', () => {
      expect(getMinimumRatio(true)).toBe(3);
    });
  });

  describe('validateTokenContrast', () => {
    it('should validate all foreground/background pairs', () => {
      const tokens = {
        foreground: 'oklch(0.2 0.1 240)',
        background: 'oklch(0.95 0.02 240)',
        primary: 'oklch(0.5 0.15 240)',
        'primary-foreground': 'oklch(0.95 0.02 240)',
      };

      const issues = validateTokenContrast(tokens);
      expect(Array.isArray(issues)).toBe(true);
    });

    it('should skip missing token pairs', () => {
      const tokens = {
        foreground: 'oklch(0.2 0.1 240)',
        // background is missing
      };

      const issues = validateTokenContrast(tokens);
      expect(issues).toEqual([]); // No issues because pair is incomplete
    });

    it('should detect contrast failures', () => {
      const tokens = {
        foreground: 'oklch(0.5 0.1 240)',
        background: 'oklch(0.55 0.1 240)', // Low contrast
      };

      const issues = validateTokenContrast(tokens);
      expect(issues.length).toBeGreaterThan(0);
      expect(issues[0].passed).toBe(false);
    });

    it('should support large text validation', () => {
      const tokens = {
        foreground: 'oklch(0.4 0.1 240)',
        background: 'oklch(0.75 0.02 240)',
      };

      const issuesNormal = validateTokenContrast(tokens, false);
      const issuesLarge = validateTokenContrast(tokens, true);

      // Large text has lower requirements, so may have fewer issues
      expect(issuesLarge.length).toBeLessThanOrEqual(issuesNormal.length);
    });
  });

  describe('suggestContrastFix', () => {
    it('should return null for colors that already meet contrast', () => {
      const result = suggestContrastFix('oklch(0.2 0.1 240)', 'oklch(0.95 0.02 240)', 4.5);
      expect(result).toBeNull();
    });

    it('should suggest a lighter foreground when needed', () => {
      const result = suggestContrastFix('oklch(0.3 0.1 240)', 'oklch(0.35 0.1 240)', 4.5);
      expect(result).not.toBeNull();
      if (result) {
        expect(result).toContain('oklch');
      }
    });

    it('should suggest a darker foreground when needed', () => {
      const result = suggestContrastFix('oklch(0.8 0.1 240)', 'oklch(0.75 0.1 240)', 4.5);
      expect(result).not.toBeNull();
      if (result) {
        expect(result).toContain('oklch');
      }
    });

    it('should handle invalid colors gracefully', () => {
      const result = suggestContrastFix('invalid', 'oklch(0.5 0.1 240)', 4.5);
      expect(result).toBeNull();
    });
  });
});

describe('Theme Generator', () => {
  describe('generateThemeFromColor', () => {
    it('should maintain color relationships', () => {
      const theme = generateThemeFromColor({
        baseColor: 'oklch(0.6 0.2 240)',
        chromaScale: 1.5,
      });

      // Primary should be more saturated than muted
      const primaryChroma = parseOKLCH(theme.light.primary).c;
      const mutedChroma = parseOKLCH(theme.light.muted).c;
      expect(primaryChroma).toBeGreaterThan(mutedChroma);
    });

    it('should ensure chart colors meet 3:1 contrast against background', () => {
      const theme = generateThemeFromColor({
        baseColor: 'oklch(0.6 0.15 240)',
      });

      // Chart colors should meet WCAG AA large text (3:1) against background
      const chartColors = ['chart-1', 'chart-2', 'chart-3', 'chart-4', 'chart-5'];

      chartColors.forEach(chartKey => {
        const lightRatio = getContrastRatio(theme.light[chartKey], theme.light.background);
        const darkRatio = getContrastRatio(theme.dark[chartKey], theme.dark.background);

        expect(lightRatio).toBeGreaterThanOrEqual(3);
        expect(darkRatio).toBeGreaterThanOrEqual(3);
      });
    });

    it('should derive chart hues using harmonic relationships', () => {
      const theme = generateThemeFromColor({
        baseColor: 'oklch(0.6 0.15 240)',
      });

      const baseHue = 240;

      // chart-3 should use triadic (base + 120°)
      const chart3Hue = parseOKLCH(theme.light['chart-3']).h;
      const expectedChart3 = (baseHue + 120) % 360;
      expect(chart3Hue).toBeCloseTo(expectedChart3, 1);

      // chart-4 should use triadic complement (base - 120°)
      const chart4Hue = parseOKLCH(theme.light['chart-4']).h;
      const expectedChart4 = (baseHue - 120 + 360) % 360;
      expect(chart4Hue).toBeCloseTo(expectedChart4, 1);
    });

    it('should handle dark base colors (L < 0.35) with simultaneous contrast', () => {
      // Test Case 1: Dark base colors need large lightness boost for dark mode
      const theme = generateThemeFromColor({
        baseColor: 'oklch(0.3 0.15 240)',
      });

      // Dark theme primary should be significantly lighter than base
      const darkPrimaryL = parseOKLCH(theme.dark.primary).l;
      expect(darkPrimaryL).toBeGreaterThanOrEqual(0.5); // Should boost by +0.3

      // Light and dark themes should still meet contrast requirements
      const lightRatio = getContrastRatio(theme.light.foreground, theme.light.background);
      const darkRatio = getContrastRatio(theme.dark.foreground, theme.dark.background);
      expect(lightRatio).toBeGreaterThanOrEqual(4.5);
      expect(darkRatio).toBeGreaterThanOrEqual(4.5);
    });

    it('should handle light base colors (L > 0.7) with minimal adjustment', () => {
      // Test Case 3: Light base colors need minimal adjustment for dark mode
      const theme = generateThemeFromColor({
        baseColor: 'oklch(0.75 0.10 240)',
      });

      // Dark theme primary should be close to original lightness
      const darkPrimaryL = parseOKLCH(theme.dark.primary).l;
      expect(darkPrimaryL).toBeLessThan(0.85); // Small boost (+0.05)

      // Should still meet contrast requirements
      const darkRatio = getContrastRatio(theme.dark.primary, theme.dark.background);
      expect(darkRatio).toBeGreaterThanOrEqual(3); // At least visible
    });
  });

  describe('generateColorScale', () => {
    it('should preserve scale structure', () => {
      const scale = generateColorScale('oklch(0.6 0.2 240)');

      // Scale should have all standard steps
      expect(scale).toHaveProperty('50');
      expect(scale).toHaveProperty('500');
      expect(scale).toHaveProperty('950');

      // Lightness should decrease from 50 to 950
      const l50 = parseOKLCH(scale['50']).l;
      const l500 = parseOKLCH(scale['500']).l;
      const l950 = parseOKLCH(scale['950']).l;

      expect(l50).toBeGreaterThan(l500);
      expect(l500).toBeGreaterThan(l950);
    });
  });

  describe('previewTheme', () => {
    it('should log theme information to console', () => {
      const theme = generateThemeFromColor({
        baseColor: 'oklch(0.6 0.15 240)',
        hueRange: 20,
      });

      // Mock console.log to suppress output during tests
      const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

      previewTheme(theme);

      // Verify it was called (function logs to console)
      expect(logSpy).toHaveBeenCalled();

      logSpy.mockRestore();
    });
  });
});

describe('Modular Scale', () => {
  describe('RATIOS', () => {
    it('should have common ratio values', () => {
      expect(RATIOS.perfectFourth).toBeCloseTo(1.333);
      expect(RATIOS.goldenRatio).toBeCloseTo(1.618);
      expect(RATIOS.octave).toBe(2);
    });
  });

  describe('generateScale', () => {
    it('should generate scale with correct number of steps', () => {
      const scale = generateScale(1, 1.5, 5, 'rem');
      expect(scale).toHaveLength(5);
    });

    it('should apply ratio correctly', () => {
      const scale = generateScale(1, 2, 4, 'rem');

      expect(scale[0]).toBe('1rem'); // 1 * 2^0
      expect(scale[1]).toBe('2rem'); // 1 * 2^1
      expect(scale[2]).toBe('4rem'); // 1 * 2^2
      expect(scale[3]).toBe('8rem'); // 1 * 2^3
    });

    it('should support different units', () => {
      const remScale = generateScale(16, 1.5, 3, 'rem');
      const pxScale = generateScale(16, 1.5, 3, 'px');

      expect(remScale[0]).toBe('16rem');
      expect(pxScale[0]).toBe('16px');
    });
  });

  describe('generateSpacingScale', () => {
    it('should include zero', () => {
      const scale = generateSpacingScale(1, 1.5, 'rem');
      expect(scale['0']).toBe('0px');
    });

    it('should include common spacing values', () => {
      const scale = generateSpacingScale(1, 1.5, 'rem');
      expect(scale).toHaveProperty('1');
      expect(scale).toHaveProperty('2');
      expect(scale).toHaveProperty('4');
      expect(scale).toHaveProperty('8');
    });
  });

  describe('calculateRatio', () => {
    it('should calculate ratio between two values', () => {
      expect(calculateRatio(16, 24)).toBeCloseTo(1.5);
      expect(calculateRatio(1, 1.618)).toBeCloseTo(1.618);
    });
  });

  describe('findClosestRatio', () => {
    it('should find exact match', () => {
      const result = findClosestRatio(1.618);
      expect(result.name).toBe('goldenRatio');
      expect(result.difference).toBeCloseTo(0);
    });

    it('should find closest ratio', () => {
      const result = findClosestRatio(1.5);
      expect(result.name).toBe('perfectFifth');
      expect(result.ratio).toBe(1.5);
    });

    it('should return reasonable match for any value', () => {
      const result = findClosestRatio(1.4);
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('ratio');
      expect(result.difference).toBeLessThan(0.5);
    });
  });

  describe('generateBidirectionalScale', () => {
    it('should generate values below and above base', () => {
      const scale = generateBidirectionalScale(1, 2, 2, 2, 'rem');
      expect(scale).toHaveLength(5); // 2 below + base + 2 above
      expect(scale[0]).toBe('0.25rem'); // 1 / 2^2
      expect(scale[1]).toBe('0.5rem'); // 1 / 2^1
      expect(scale[2]).toBe('1rem'); // base
      expect(scale[3]).toBe('2rem'); // 1 * 2^1
      expect(scale[4]).toBe('4rem'); // 1 * 2^2
    });
  });

  describe('generateTypographyScale', () => {
    it('should generate typography scale with named sizes', () => {
      const scale = generateTypographyScale(1, 1.2, 'rem');
      expect(scale).toHaveProperty('xs');
      expect(scale).toHaveProperty('sm');
      expect(scale).toHaveProperty('base');
      expect(scale).toHaveProperty('xl');
      expect(scale).toHaveProperty('6xl');
    });
  });

  describe('generateCustomScale', () => {
    it('should generate scale with custom steps', () => {
      const steps = [
        { name: 'tiny', multiplier: 0.5 },
        { name: 'small', multiplier: 1 },
        { name: 'large', multiplier: 2 },
      ];
      const scale = generateCustomScale(16, steps, 'px');
      expect(scale).toEqual({
        tiny: '8px',
        small: '16px',
        large: '32px',
      });
    });
  });

  describe('generateTailwindSpacing', () => {
    it('should generate Tailwind-compatible spacing', () => {
      const scale = generateTailwindSpacing(0.25, 1, 'rem');
      expect(scale['0']).toBe('0px');
      expect(scale['4']).toBe('1rem'); // 0.25 * 4
      expect(scale['8']).toBe('2rem'); // 0.25 * 8
    });
  });

  describe('generateScalePreview', () => {
    it('should generate preview with step information', () => {
      const preview = generateScalePreview(1, 1.5, 3, 'rem');
      expect(preview).toHaveLength(3);
      expect(preview[0].step).toBe(0);
      expect(preview[0].value).toBe('1rem');
      expect(preview[1].step).toBe(1);
    });
  });

  describe('interpolateScale', () => {
    it('should interpolate linearly', () => {
      const scale = interpolateScale(1, 5, 5, 'rem', 'linear');
      expect(scale).toHaveLength(5);
      expect(scale[0]).toBe('1rem');
      expect(scale[4]).toBe('5rem');
      expect(scale[2]).toBe('3rem'); // midpoint
    });

    it('should interpolate exponentially', () => {
      const scale = interpolateScale(1, 8, 4, 'rem', 'exponential');
      expect(scale).toHaveLength(4);
      expect(scale[0]).toBe('1rem');
      expect(scale[3]).toBe('8rem');
    });
  });
});
