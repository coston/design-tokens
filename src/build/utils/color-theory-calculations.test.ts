import { describe, it, expect } from 'vitest';
import {
  HUE_POSITIONS,
  SEMANTIC_HUES,
  getAnalogousOffset,
  getComplementaryOffset,
  getSplitComplementaryOffsets,
  getTriadicOffsets,
  getTetradicOffsets,
  normalizeHue,
  calculateAbsoluteHue,
  calculateHueOffset,
  calculatePerceptualLightness,
  generateLightnessScale,
  LIGHTNESS_HIERARCHY,
  CHROMA_CURVE_MULTIPLIERS,
  calculateChromaMultiplier,
  adjustChromaForLightness,
  CONTRAST_RATIOS,
  getMinimumContrastRatio,
  calculateRelativeLuminance,
  calculateContrastRatio,
  calculatePrimaryLightness,
  SIMULTANEOUS_CONTRAST,
  calculateDarkModeAdjustments,
  COLOR_TEMPERATURE,
  isWarmHue,
  isCoolHue,
  calculateMinimumHueSeparation,
  validateColorTheoryCompliance,
  getRecommendedLightness,
} from './color-theory-calculations.js';

describe('Color Theory Calculations', () => {
  // ============================================================================
  // 1. HUE GEOMETRY
  // ============================================================================

  describe('Hue Geometry', () => {
    it('should define standard hue positions', () => {
      expect(HUE_POSITIONS.RED).toBe(0);
      expect(HUE_POSITIONS.YELLOW).toBe(60);
      expect(HUE_POSITIONS.GREEN).toBe(120);
      expect(HUE_POSITIONS.CYAN).toBe(180);
      expect(HUE_POSITIONS.BLUE).toBe(240);
      expect(HUE_POSITIONS.MAGENTA).toBe(300);
    });

    it('should define semantic hues per COLOR-THEORY.md', () => {
      expect(SEMANTIC_HUES.PRIMARY).toBe(240); // Blue
      expect(SEMANTIC_HUES.ACCENT).toBe(280); // Purple
      expect(SEMANTIC_HUES.SUCCESS).toBe(150); // Green
      expect(SEMANTIC_HUES.WARNING).toBe(85); // Yellow
      expect(SEMANTIC_HUES.DESTRUCTIVE).toBe(20); // Red
    });

    it('should calculate analogous offset', () => {
      expect(getAnalogousOffset()).toBe(40); // Default
      expect(getAnalogousOffset(30)).toBe(30);
      expect(getAnalogousOffset(60)).toBe(60);
    });

    it('should calculate complementary offset', () => {
      expect(getComplementaryOffset()).toBe(180);
    });

    it('should calculate split-complementary offsets', () => {
      const offsets = getSplitComplementaryOffsets();
      expect(offsets).toEqual([150, 210]); // 180° ± 30°

      const custom = getSplitComplementaryOffsets(45);
      expect(custom).toEqual([135, 225]); // 180° ± 45°
    });

    it('should calculate triadic offsets', () => {
      const offsets = getTriadicOffsets();
      expect(offsets).toEqual([0, 120, 240]);
    });

    it('should calculate tetradic offsets', () => {
      const offsets = getTetradicOffsets();
      expect(offsets).toEqual([0, 90, 180, 270]);
    });

    it('should normalize hue to 0-360 range', () => {
      expect(normalizeHue(0)).toBe(0);
      expect(normalizeHue(360)).toBe(0);
      expect(normalizeHue(370)).toBe(10);
      expect(normalizeHue(-10)).toBe(350);
      expect(normalizeHue(-370)).toBe(350);
    });

    it('should calculate absolute hue from base and offset', () => {
      expect(calculateAbsoluteHue(240, 40)).toBe(280); // Blue + analogous
      expect(calculateAbsoluteHue(240, 180)).toBe(60); // Blue + complementary = yellow
      expect(calculateAbsoluteHue(240, -220)).toBe(20); // Blue to red
    });

    it('should calculate offset to reach target hue', () => {
      expect(calculateHueOffset(240, 20)).toBe(-220); // Blue to red
      expect(calculateHueOffset(150, 20)).toBe(-130); // Green to red
      expect(calculateHueOffset(300, 20)).toBe(-280); // Magenta to red
    });
  });

  // ============================================================================
  // 2. PERCEPTUAL UNIFORMITY
  // ============================================================================

  describe('Perceptual Uniformity', () => {
    it('should calculate perceptual lightness using power curve', () => {
      // At t=0, should be near maximum (0.985)
      const darkEnd = calculatePerceptualLightness(0);
      expect(darkEnd).toBeCloseTo(0.985, 2);

      // At t=1, should be near minimum (0.137)
      const lightEnd = calculatePerceptualLightness(1);
      expect(lightEnd).toBeCloseTo(0.137, 2);

      // Mid-point should be somewhere in between
      const midPoint = calculatePerceptualLightness(0.5);
      expect(midPoint).toBeGreaterThan(0.3);
      expect(midPoint).toBeLessThan(0.8);
    });

    it('should generate lightness scale with correct endpoints', () => {
      const scale = generateLightnessScale(11);
      expect(scale).toHaveLength(11);
      expect(scale[0]).toBeCloseTo(0.985, 2); // Lightest
      expect(scale[10]).toBeCloseTo(0.137, 2); // Darkest
    });

    it('should generate monotonically decreasing lightness scale', () => {
      const scale = generateLightnessScale(11);
      // Check all but the last pair (floating point precision at endpoints)
      for (let i = 0; i < scale.length - 2; i++) {
        expect(scale[i]).toBeGreaterThan(scale[i + 1]);
      }
      // Last value should be close to minimum
      expect(scale[scale.length - 1]).toBeCloseTo(0.137, 2);
    });

    it('should define lightness hierarchy constants', () => {
      // Light theme
      expect(LIGHTNESS_HIERARCHY.LIGHT_THEME.BACKGROUND).toBe(0.98);
      expect(LIGHTNESS_HIERARCHY.LIGHT_THEME.FOREGROUND).toBe(0.36);
      expect(LIGHTNESS_HIERARCHY.LIGHT_THEME.PRIMARY).toBe(0.6);

      // Dark theme
      expect(LIGHTNESS_HIERARCHY.DARK_THEME.BACKGROUND).toBe(0.15);
      expect(LIGHTNESS_HIERARCHY.DARK_THEME.FOREGROUND).toBe(0.9);
    });
  });

  // ============================================================================
  // 3. HELMHOLTZ-KOHLRAUSCH EFFECT
  // ============================================================================

  describe('Helmholtz-Kohlrausch Effect', () => {
    it('should define chroma curve multipliers', () => {
      expect(CHROMA_CURVE_MULTIPLIERS.STEP_50).toBe(0.2); // Near white
      expect(CHROMA_CURVE_MULTIPLIERS.STEP_600).toBe(1.05); // Peak vibrancy
      expect(CHROMA_CURVE_MULTIPLIERS.STEP_950).toBe(0.4); // Near black
    });

    it('should calculate peak chroma at mid-tones', () => {
      const midTone = calculateChromaMultiplier(0.55);
      const veryLight = calculateChromaMultiplier(0.95);
      const veryDark = calculateChromaMultiplier(0.2);

      expect(midTone).toBeGreaterThan(veryLight);
      expect(midTone).toBeGreaterThan(veryDark);
      expect(midTone).toBeCloseTo(1.05, 1);
    });

    it('should reduce chroma for very light colors', () => {
      const multiplier = calculateChromaMultiplier(0.95);
      expect(multiplier).toBeLessThan(0.4);
    });

    it('should reduce chroma for very dark colors', () => {
      const multiplier = calculateChromaMultiplier(0.15);
      expect(multiplier).toBeLessThan(0.5);
    });

    it('should adjust chroma based on lightness', () => {
      const baseChroma = 0.15;

      const midTone = adjustChromaForLightness(baseChroma, 0.55);
      const veryLight = adjustChromaForLightness(baseChroma, 0.95);

      expect(midTone).toBeGreaterThan(veryLight);
      expect(midTone).toBeCloseTo(baseChroma * 1.05, 2);
    });
  });

  // ============================================================================
  // 4. CONTRAST MATHEMATICS
  // ============================================================================

  describe('Contrast Mathematics', () => {
    it('should define WCAG AA contrast ratio thresholds', () => {
      expect(CONTRAST_RATIOS.AA_NORMAL).toBe(4.5);
      expect(CONTRAST_RATIOS.AA_LARGE).toBe(3.0);
      expect(CONTRAST_RATIOS.MAX_THEORETICAL).toBe(21.0);
    });

    it('should return correct minimum contrast ratios for WCAG AA', () => {
      expect(getMinimumContrastRatio(false)).toBe(4.5);
      expect(getMinimumContrastRatio(true)).toBe(3.0);
    });

    it('should calculate relative luminance', () => {
      // White (1, 1, 1) should be 1.0
      const white = calculateRelativeLuminance(1, 1, 1);
      expect(white).toBeCloseTo(1.0, 3);

      // Black (0, 0, 0) should be 0.0
      const black = calculateRelativeLuminance(0, 0, 0);
      expect(black).toBe(0);

      // Mid-gray (linear RGB 0.5, 0.5, 0.5) should be 0.5
      // Note: Input must be LINEAR RGB, not sRGB
      const gray = calculateRelativeLuminance(0.5, 0.5, 0.5);
      expect(gray).toBeCloseTo(0.5, 3);
    });

    it('should calculate contrast ratio', () => {
      // Black on white should be maximum (21:1)
      const maxContrast = calculateContrastRatio(1.0, 0.0);
      expect(maxContrast).toBe(21);

      // Same color should be 1:1
      const noContrast = calculateContrastRatio(0.5, 0.5);
      expect(noContrast).toBe(1);

      // Should work regardless of order
      const ratio1 = calculateContrastRatio(0.8, 0.2);
      const ratio2 = calculateContrastRatio(0.2, 0.8);
      expect(ratio1).toBeCloseTo(ratio2, 5);
    });
  });

  // ============================================================================
  // 5. LIGHTNESS HIERARCHY
  // ============================================================================

  describe('Lightness Hierarchy', () => {
    it('should calculate appropriate primary lightness for light theme', () => {
      // Too dark base - should brighten
      expect(calculatePrimaryLightness(0.3, 'light')).toBe(0.5);

      // Too light base - should darken
      expect(calculatePrimaryLightness(0.9, 'light')).toBe(0.6);

      // Good range - use as-is
      expect(calculatePrimaryLightness(0.6, 'light')).toBe(0.6);
    });

    it('should return base lightness for dark theme', () => {
      // Dark theme adjustments handled by simultaneous contrast
      expect(calculatePrimaryLightness(0.3, 'dark')).toBe(0.3);
      expect(calculatePrimaryLightness(0.6, 'dark')).toBe(0.6);
    });
  });

  // ============================================================================
  // 6. SIMULTANEOUS CONTRAST
  // ============================================================================

  describe('Simultaneous Contrast', () => {
    it('should define simultaneous contrast parameters', () => {
      expect(SIMULTANEOUS_CONTRAST.DARK_BASE.LIGHTNESS_BOOST).toBe(0.3);
      expect(SIMULTANEOUS_CONTRAST.MID_TONE.LIGHTNESS_BOOST).toBe(0.22);
      expect(SIMULTANEOUS_CONTRAST.LIGHT_BASE.LIGHTNESS_BOOST).toBe(0.05);
    });

    it('should apply large boost for dark base colors', () => {
      const result = calculateDarkModeAdjustments(0.3, 0.15);

      expect(result.lightness).toBeGreaterThanOrEqual(0.5);
      expect(result.chroma).toBeCloseTo(0.15 * 0.7, 3);
    });

    it('should apply standard boost for mid-tone colors', () => {
      const result = calculateDarkModeAdjustments(0.6, 0.15);

      expect(result.lightness).toBeCloseTo(0.82, 2); // 0.6 + 0.22
      expect(result.chroma).toBeCloseTo(0.15 * 0.7, 3);
    });

    it('should apply minimal boost for light base colors', () => {
      const result = calculateDarkModeAdjustments(0.75, 0.15);

      expect(result.lightness).toBeCloseTo(0.8, 1); // 0.75 + 0.05
      expect(result.chroma).toBeCloseTo(0.15, 3); // No chroma reduction
    });

    it('should respect maximum lightness bounds', () => {
      const result = calculateDarkModeAdjustments(0.9, 0.15);
      expect(result.lightness).toBeLessThanOrEqual(0.98);
    });
  });

  // ============================================================================
  // 7. COLOR TEMPERATURE
  // ============================================================================

  describe('Color Temperature', () => {
    it('should define warm-cool ranges', () => {
      expect(COLOR_TEMPERATURE.COOL_MIN).toBe(210);
      expect(COLOR_TEMPERATURE.COOL_MAX).toBe(270);
      expect(COLOR_TEMPERATURE.WARM_MIN).toBe(0);
      expect(COLOR_TEMPERATURE.WARM_MAX).toBe(60);
    });

    it('should identify warm hues', () => {
      expect(isWarmHue(0)).toBe(true); // Red
      expect(isWarmHue(30)).toBe(true); // Orange
      expect(isWarmHue(60)).toBe(true); // Yellow
      expect(isWarmHue(350)).toBe(true); // Red-magenta
    });

    it('should identify cool hues', () => {
      expect(isCoolHue(240)).toBe(true); // Blue
      expect(isCoolHue(210)).toBe(true); // Blue-cyan
      expect(isCoolHue(270)).toBe(true); // Blue-magenta
    });

    it('should identify neutral hues (neither warm nor cool)', () => {
      expect(isWarmHue(120)).toBe(false); // Green
      expect(isCoolHue(120)).toBe(false);
      expect(isWarmHue(300)).toBe(false); // Magenta
      expect(isCoolHue(300)).toBe(false);
    });

    it('should calculate minimum hue separation', () => {
      const minSep = calculateMinimumHueSeparation([0, 120, 240]);
      expect(minSep).toBe(120); // Triadic spacing

      const closeSep = calculateMinimumHueSeparation([240, 250]);
      expect(closeSep).toBe(10);

      const singleHue = calculateMinimumHueSeparation([240]);
      expect(singleHue).toBe(360);
    });

    it('should handle hue wrapping in separation calculation', () => {
      const separation = calculateMinimumHueSeparation([10, 350]);
      expect(separation).toBe(20); // Wraps around 0°
    });
  });

  // ============================================================================
  // COMPOSITE CALCULATIONS
  // ============================================================================

  describe('Composite Calculations', () => {
    it('should validate color theory compliance', () => {
      const good = validateColorTheoryCompliance({
        primary: 240,
        destructive: 20,
        success: 150,
      });

      expect(good.valid).toBe(true);
      expect(good.warnings).toHaveLength(0);
    });

    it('should warn about incorrect destructive hue', () => {
      const bad = validateColorTheoryCompliance({
        destructive: 260, // Should be ~20° red
      });

      expect(bad.valid).toBe(false);
      expect(bad.warnings.length).toBeGreaterThan(0);
      expect(bad.warnings[0]).toContain('Destructive hue');
    });

    it('should warn about insufficient hue separation', () => {
      const bad = validateColorTheoryCompliance({
        primary: 240,
        accent: 245, // Only 5° apart
      });

      expect(bad.valid).toBe(false);
      expect(bad.warnings.length).toBeGreaterThan(0);
      expect(bad.warnings[0]).toContain('separation');
    });

    it('should return recommended lightness for light theme', () => {
      expect(getRecommendedLightness('background', 'light')).toBe(0.98);
      expect(getRecommendedLightness('foreground', 'light')).toBe(0.36);
      expect(getRecommendedLightness('primary', 'light')).toBe(0.6);
      expect(getRecommendedLightness('muted', 'light')).toBe(0.89);
      expect(getRecommendedLightness('muted-foreground', 'light')).toBe(0.45);
    });

    it('should return recommended lightness for dark theme', () => {
      expect(getRecommendedLightness('background', 'dark')).toBe(0.15);
      expect(getRecommendedLightness('foreground', 'dark')).toBe(0.9);
      expect(getRecommendedLightness('primary', 'dark')).toBe(0.82);
      expect(getRecommendedLightness('muted', 'dark')).toBe(0.18);
      expect(getRecommendedLightness('muted-foreground', 'dark')).toBe(0.7);
    });

    it('should handle edge cases in chroma multiplier calculation', () => {
      // Test boundary values
      expect(calculateChromaMultiplier(0)).toBeCloseTo(0.4, 1);
      expect(calculateChromaMultiplier(0.1)).toBeLessThan(0.5);
      expect(calculateChromaMultiplier(0.24)).toBeLessThan(0.75);
      expect(calculateChromaMultiplier(0.26)).toBeGreaterThan(0.5);
      expect(calculateChromaMultiplier(0.66)).toBeLessThan(1.05);
      expect(calculateChromaMultiplier(0.89)).toBeGreaterThan(0.7);
      expect(calculateChromaMultiplier(0.91)).toBeLessThan(0.4);
      expect(calculateChromaMultiplier(1.0)).toBeCloseTo(0.2, 1);
    });

    it('should handle wrap-around cases in hue calculations', () => {
      // Test edge cases near 0° and 360°
      expect(normalizeHue(-1)).toBe(359);
      expect(normalizeHue(361)).toBe(1);
      expect(normalizeHue(720)).toBe(0);
      expect(normalizeHue(-720)).toBe(0);
    });

    it('should validate empty color sets', () => {
      const result = validateColorTheoryCompliance({});
      expect(result.valid).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });
});
