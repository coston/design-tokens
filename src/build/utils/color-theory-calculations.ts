/**
 * Color Theory Calculations
 *
 * This module contains all mathematical color theory calculations
 * documented in COLOR-THEORY.md, organized by the 7 fundamental principles:
 *
 * 1. Hue Geometry (color wheel relationships)
 * 2. Perceptual Uniformity (lightness curves)
 * 3. Helmholtz-Kohlrausch Effect (chroma adjustments)
 * 4. Contrast Mathematics (WCAG)
 * 5. Lightness Hierarchy (Munsell value theory)
 * 6. Simultaneous Contrast (dark mode adjustments)
 * 7. Color Temperature (semantic hue mapping)
 *
 * All formulas are derived from COLOR-THEORY.md with line references.
 */

import { findBrackets } from './functional-utils.js';

// ============================================================================
// 1. HUE GEOMETRY - Color Wheel Relationships
// See COLOR-THEORY.md lines 17-74
// ============================================================================

/**
 * Standard hue positions on the 360° color wheel
 * COLOR-THEORY.md lines 22-28
 */
export const HUE_POSITIONS = {
  RED: 0,
  YELLOW: 60,
  GREEN: 120,
  CYAN: 180,
  BLUE: 240,
  MAGENTA: 300,
} as const;

/**
 * Semantic hue mappings for UI roles
 * COLOR-THEORY.md lines 65-72
 *
 * Note: These are conventional associations and are culture-dependent
 */
export const SEMANTIC_HUES = {
  PRIMARY: 240, // Blue - stability and trust
  ACCENT: 280, // Purple - creative differentiation
  SUCCESS: 150, // Green - "safe" or "go"
  WARNING: 85, // Yellow - high visibility, caution
  DESTRUCTIVE: 20, // Red - strong alert signal
} as const;

/**
 * Calculate analogous hue offset
 * Analogous colors are adjacent on the wheel (typically 30-60° apart)
 * COLOR-THEORY.md lines 37-45
 *
 * @param separation - Degrees of separation (default: 30-60° range)
 * @returns Hue offset in degrees
 */
export function getAnalogousOffset(separation: number = 40): number {
  return separation;
}

/**
 * Calculate complementary hue offset
 * Complementary colors are opposite on the wheel (180° apart)
 * COLOR-THEORY.md lines 47-55
 *
 * @returns Hue offset of 180°
 */
export function getComplementaryOffset(): number {
  return 180;
}

/**
 * Calculate split-complementary hue offsets
 * 180° ± ~30° for strong contrast with reduced tension
 * COLOR-THEORY.md lines 57-59
 *
 * @param spread - Degrees from true complement (default: 30°)
 * @returns Array of two hue offsets
 */
export function getSplitComplementaryOffsets(spread: number = 30): [number, number] {
  return [180 - spread, 180 + spread];
}

/**
 * Calculate triadic hue offsets
 * Three colors evenly spaced around the wheel (120° apart)
 * COLOR-THEORY.md hue geometry principles
 *
 * @returns Array of three hue offsets (0°, 120°, 240°)
 */
export function getTriadicOffsets(): [number, number, number] {
  return [0, 120, 240];
}

/**
 * Calculate tetradic (square) hue offsets
 * Four colors evenly spaced around the wheel (90° apart)
 *
 * @returns Array of four hue offsets
 */
export function getTetradicOffsets(): [number, number, number, number] {
  return [0, 90, 180, 270];
}

/**
 * Normalize hue to 0-360° range
 *
 * @param hue - Hue angle (can be negative or > 360)
 * @returns Normalized hue in 0-360° range
 */
export function normalizeHue(hue: number): number {
  return ((hue % 360) + 360) % 360;
}

/**
 * Calculate absolute hue from base hue and offset
 *
 * @param baseHue - Starting hue (0-360°)
 * @param offset - Hue offset in degrees
 * @returns Absolute hue in 0-360° range
 */
export function calculateAbsoluteHue(baseHue: number, offset: number): number {
  return normalizeHue(baseHue + offset);
}

/**
 * Calculate offset needed to reach target hue from base hue
 * Used for semantic colors like destructive (must be absolute 20° red)
 *
 * @param baseHue - Starting hue (0-360°)
 * @param targetHue - Desired absolute hue (0-360°)
 * @returns Offset in degrees
 */
export function calculateHueOffset(baseHue: number, targetHue: number): number {
  return targetHue - baseHue;
}

// ============================================================================
// 2. PERCEPTUAL UNIFORMITY - Lightness Curves
// See COLOR-THEORY.md lines 77-114
// ============================================================================

/**
 * Generate perceptually uniform lightness value using power curve
 * COLOR-THEORY.md lines 103-113
 *
 * Formula: L = (1-t)^2.2 * 0.985 + t^(1/2.2) * 0.137
 *
 * This is not a formal sRGB transfer function, but a perceptual easing
 * strategy inspired by gamma-style nonlinear behavior.
 *
 * @param t - Normalized position in scale (0-1)
 * @returns Perceptual lightness (0-1)
 */
export function calculatePerceptualLightness(t: number): number {
  // Power curve with gamma-like behavior
  // Dark end: (1-t)^2.2 * 0.985 dominates
  // Light end: t^(1/2.2) * 0.137 dominates
  return Math.pow(1 - t, 2.2) * 0.985 + Math.pow(t, 1 / 2.2) * 0.137;
}

/**
 * Generate array of perceptually uniform lightness values
 * Used for creating color scales with even visual steps
 *
 * @param steps - Number of lightness steps to generate
 * @returns Array of lightness values (0-1)
 */
export function generateLightnessScale(steps: number): number[] {
  const scale: number[] = [];
  for (let i = 0; i < steps; i++) {
    const t = i / (steps - 1);
    scale.push(calculatePerceptualLightness(t));
  }
  return scale;
}

/**
 * Standard lightness hierarchy for UI themes
 * COLOR-THEORY.md lines 175-192
 *
 * These are implementation decisions, not universal constants.
 * Values ensure proper figure-ground perception and hierarchy.
 */
export const LIGHTNESS_HIERARCHY = {
  LIGHT_THEME: {
    BACKGROUND: 0.98, // Recedes
    FOREGROUND: 0.36, // Advances
    PRIMARY: 0.6, // Emphasis
    MUTED: 0.89, // Low emphasis
    MUTED_FOREGROUND: 0.45, // Medium emphasis
  },
  DARK_THEME: {
    BACKGROUND: 0.15, // Recedes (inverted)
    FOREGROUND: 0.9, // Advances (inverted)
    PRIMARY: 0.82, // Adjusted for visibility
    MUTED: 0.18, // Low emphasis (inverted)
    MUTED_FOREGROUND: 0.7, // Medium emphasis
  },
} as const;

// ============================================================================
// 3. HELMHOLTZ-KOHLRAUSCH EFFECT - Chroma Adjustments
// See COLOR-THEORY.md lines 117-147
// ============================================================================

/**
 * Chroma adjustment multipliers for different lightness levels
 * COLOR-THEORY.md lines 134-146
 *
 * Reasoning:
 * - High-chroma near-white colors appear neon
 * - High-chroma near-black colors appear muddy
 * - Mid-lightness regions tolerate stronger chroma
 *
 * These multipliers are applied to base chroma to create natural-looking scales.
 */
export const CHROMA_CURVE_MULTIPLIERS = {
  STEP_50: 0.2, // Very light (near white)
  STEP_100: 0.35, // Light
  STEP_200: 0.25, // Light-medium
  STEP_300: 0.7, // Medium-light
  STEP_400: 0.9, // Medium
  STEP_500: 1.0, // Base (mid-tone)
  STEP_600: 1.05, // Emphasis (peak vibrancy)
  STEP_700: 0.9, // Medium-dark
  STEP_800: 0.8, // Dark
  STEP_900: 0.5, // Very dark
  STEP_950: 0.4, // Near black
} as const;

/**
 * Chroma multiplier curve points based on Helmholtz-Kohlrausch effect
 * Data-driven approach allows easy adjustment of the curve
 * Points calculated to match original implementation behavior
 *
 * Note: There's an intentional discontinuity at L=0.9 matching the original implementation
 * This creates a sharper transition from light to very-light colors
 */
const CHROMA_CURVE_POINTS: Array<{ l: number; mult: number }> = [
  { l: 0.0, mult: 0.4 }, // Very dark: 0.4 + 0*0.4 = 0.4
  { l: 0.25, mult: 0.5 }, // Dark: 0.4 + 0.25*0.4 = 0.5
  { l: 0.5, mult: 1.05 }, // Mid-tones start: peak at 1.05 (flat region begins)
  { l: 0.65, mult: 1.05 }, // Mid-tones peak: flat at 1.05 (flat region ends)
  { l: 0.9, mult: 0.7 }, // Light: 0.7 + (0.9-0.9)*1.4 = 0.7
  { l: 0.900001, mult: 0.4 }, // Discontinuity: smoothed transition from 0.7 to 0.2
  { l: 1.0, mult: 0.2 }, // Very light: 0.2 + (1-1)*1.5 = 0.2
];

/**
 * Calculate chroma multiplier for a given lightness value
 * Uses smooth curve based on Helmholtz-Kohlrausch effect
 * Interpolates between defined curve points for smooth transitions
 *
 * @param lightness - OKLCH lightness (0-1)
 * @returns Chroma multiplier (0-1.05)
 */
export function calculateChromaMultiplier(lightness: number): number {
  const clampedL = Math.max(0, Math.min(1, lightness));

  // Find surrounding curve points for interpolation
  const [lower, upper] = findBrackets(CHROMA_CURVE_POINTS, clampedL, p => p.l);

  // Handle edge case where lower and upper are the same
  if (lower.l === upper.l) {
    return lower.mult;
  }

  // Linear interpolation between points
  const t = (clampedL - lower.l) / (upper.l - lower.l);
  return lower.mult + (upper.mult - lower.mult) * t;
}

/**
 * Adjust chroma based on lightness using HK effect principles
 *
 * @param baseChroma - Base chroma value
 * @param lightness - Target lightness (0-1)
 * @returns Adjusted chroma value
 */
export function adjustChromaForLightness(baseChroma: number, lightness: number): number {
  const multiplier = calculateChromaMultiplier(lightness);
  return baseChroma * multiplier;
}

// ============================================================================
// 4. CONTRAST MATHEMATICS - WCAG
// See COLOR-THEORY.md lines 150-172
// ============================================================================

/**
 * WCAG AA contrast ratio thresholds
 * COLOR-THEORY.md lines 160-167
 */
export const CONTRAST_RATIOS = {
  AA_NORMAL: 4.5, // WCAG AA for normal text
  AA_LARGE: 3.0, // WCAG AA for large text (18pt+ or 14pt+ bold)
  MAX_THEORETICAL: 21.0, // Maximum possible (black on white)
  GRAPHICAL_MIN: 3.0, // Minimum for graphical objects (charts, icons)
} as const;

/**
 * Get minimum contrast ratio for WCAG AA compliance
 *
 * @param largeText - Whether text is large format
 * @returns Minimum contrast ratio
 */
export function getMinimumContrastRatio(largeText: boolean = false): number {
  return largeText ? CONTRAST_RATIOS.AA_LARGE : CONTRAST_RATIOS.AA_NORMAL;
}

/**
 * Calculate relative luminance from linear RGB
 * COLOR-THEORY.md lines 152-158
 *
 * Formula: (L1 + 0.05) / (L2 + 0.05) where L1 ≥ L2
 *
 * Note: Input must be linear-light RGB, not sRGB
 *
 * @param r - Linear red (0-1)
 * @param g - Linear green (0-1)
 * @param b - Linear blue (0-1)
 * @returns Relative luminance (0-1)
 */
export function calculateRelativeLuminance(r: number, g: number, b: number): number {
  // WCAG luminance coefficients
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate WCAG contrast ratio between two luminance values
 * COLOR-THEORY.md lines 152-158
 *
 * @param lum1 - First luminance (0-1)
 * @param lum2 - Second luminance (0-1)
 * @returns Contrast ratio (1-21)
 */
export function calculateContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return (lighter + 0.05) / (darker + 0.05);
}

// ============================================================================
// 5. LIGHTNESS HIERARCHY - Munsell Value Theory
// See COLOR-THEORY.md lines 175-203
// ============================================================================

/**
 * Calculate appropriate primary lightness for theme context
 * Ensures primary is visible against background
 *
 * @param baseLightness - Base color lightness (0-1)
 * @param theme - Theme type ('light' or 'dark')
 * @returns Adjusted lightness for primary color
 */
export function calculatePrimaryLightness(baseLightness: number, theme: 'light' | 'dark'): number {
  if (theme === 'light') {
    // Light theme: needs visible primary (mid-tone if base is too dark/light)
    if (baseLightness < 0.35) return 0.5; // Too dark - brighten to mid-tone
    if (baseLightness > 0.85) return 0.6; // Too light - darken to mid-tone
    return baseLightness; // Use as-is if in good range
  } else {
    // Dark theme: handled by simultaneous contrast (see section 6)
    return baseLightness;
  }
}

// ============================================================================
// 6. SIMULTANEOUS CONTRAST - Dark Mode Adjustments
// See COLOR-THEORY.md lines 206-232
// ============================================================================

/**
 * Simultaneous contrast adjustment parameters
 * COLOR-THEORY.md lines 217-232
 *
 * Theory: Dark backgrounds make colors appear darker and more saturated.
 * Solution: Increase lightness, decrease chroma to compensate.
 */
export const SIMULTANEOUS_CONTRAST = {
  // Case 1: Dark base colors (L < 0.35)
  DARK_BASE: {
    MIN_LIGHTNESS: 0.35,
    LIGHTNESS_BOOST: 0.3, // Large boost needed for visibility
    CHROMA_FACTOR: 0.7, // Moderate reduction
  },
  // Case 2: Mid-tone colors (0.35 ≤ L ≤ 0.7) - most common
  MID_TONE: {
    MIN_LIGHTNESS: 0.35,
    MAX_LIGHTNESS: 0.7,
    LIGHTNESS_BOOST: 0.22, // Standard adjustment per COLOR-THEORY.md
    CHROMA_FACTOR: 0.7, // Standard reduction
  },
  // Case 3: Light base colors (L > 0.7)
  LIGHT_BASE: {
    MAX_LIGHTNESS: 0.7,
    LIGHTNESS_BOOST: 0.05, // Minimal adjustment
    CHROMA_FACTOR: 1.0, // No chroma reduction needed
  },
} as const;

/**
 * Calculate dark mode adjustments using simultaneous contrast principles
 * COLOR-THEORY.md lines 177-202
 *
 * @param lightness - Light theme lightness (0-1)
 * @param chroma - Light theme chroma
 * @returns Object with adjusted lightness and chroma for dark mode
 */
export function calculateDarkModeAdjustments(
  lightness: number,
  chroma: number
): { lightness: number; chroma: number } {
  const { DARK_BASE, MID_TONE, LIGHT_BASE } = SIMULTANEOUS_CONTRAST;

  // Case 1: Dark base colors
  if (lightness < DARK_BASE.MIN_LIGHTNESS) {
    return {
      lightness: Math.max(0.5, lightness + DARK_BASE.LIGHTNESS_BOOST),
      chroma: chroma * DARK_BASE.CHROMA_FACTOR,
    };
  }

  // Case 2: Mid-tone colors (most common)
  if (lightness <= MID_TONE.MAX_LIGHTNESS) {
    return {
      lightness: Math.min(0.95, lightness + MID_TONE.LIGHTNESS_BOOST),
      chroma: chroma * MID_TONE.CHROMA_FACTOR,
    };
  }

  // Case 3: Light base colors
  return {
    lightness: Math.min(0.98, lightness + LIGHT_BASE.LIGHTNESS_BOOST),
    chroma: chroma * LIGHT_BASE.CHROMA_FACTOR,
  };
}

// ============================================================================
// 7. COLOR TEMPERATURE - Semantic Mapping
// See COLOR-THEORY.md lines 236-254
// ============================================================================

/**
 * Warm-cool hue ranges
 * COLOR-THEORY.md lines 238-242
 *
 * These are perceptual conventions, culturally influenced
 */
export const COLOR_TEMPERATURE = {
  COOL_MIN: 210, // Cool range starts (blue-cyan region)
  COOL_MAX: 270, // Cool range ends
  WARM_MIN: 0, // Warm range starts (red region)
  WARM_MAX: 60, // Warm range ends (orange-yellow region)
} as const;

/**
 * Determine if a hue is perceived as warm
 *
 * @param hue - Hue angle (0-360°)
 * @returns True if hue is in warm range
 */
export function isWarmHue(hue: number): boolean {
  const normalized = normalizeHue(hue);
  return normalized <= COLOR_TEMPERATURE.WARM_MAX || normalized >= 330;
}

/**
 * Determine if a hue is perceived as cool
 *
 * @param hue - Hue angle (0-360°)
 * @returns True if hue is in cool range
 */
export function isCoolHue(hue: number): boolean {
  const normalized = normalizeHue(hue);
  return normalized >= COLOR_TEMPERATURE.COOL_MIN && normalized <= COLOR_TEMPERATURE.COOL_MAX;
}

/**
 * Calculate semantic hue separation for categorical distinction
 * Large hue separation + adequate luminance contrast = better distinguishability
 * COLOR-THEORY.md lines 251-252
 *
 * @param hues - Array of hues to check separation
 * @returns Minimum separation in degrees
 */
export function calculateMinimumHueSeparation(hues: number[]): number {
  if (hues.length < 2) return 360;

  let minSeparation = 360;
  for (let i = 0; i < hues.length; i++) {
    for (let j = i + 1; j < hues.length; j++) {
      const diff = Math.abs(hues[i] - hues[j]);
      const separation = Math.min(diff, 360 - diff);
      minSeparation = Math.min(minSeparation, separation);
    }
  }

  return minSeparation;
}

// ============================================================================
// COMPOSITE CALCULATIONS
// ============================================================================

/**
 * Validate that a color system follows COLOR-THEORY.md principles
 *
 * @param colors - Object with semantic color hues
 * @returns Validation result with warnings
 */
export function validateColorTheoryCompliance(colors: {
  primary?: number;
  accent?: number;
  success?: number;
  warning?: number;
  destructive?: number;
}): { valid: boolean; warnings: string[] } {
  const warnings: string[] = [];

  // Check semantic hue mappings
  if (
    colors.destructive !== undefined &&
    Math.abs(colors.destructive - SEMANTIC_HUES.DESTRUCTIVE) > 20
  ) {
    warnings.push(
      `Destructive hue (${colors.destructive}°) deviates from recommended 20° red (COLOR-THEORY.md lines 65-72)`
    );
  }

  // Check hue separation for distinguishability
  const allHues = Object.values(colors).filter(h => h !== undefined) as number[];
  if (allHues.length >= 2) {
    const minSep = calculateMinimumHueSeparation(allHues);
    if (minSep < 30) {
      warnings.push(
        `Minimum hue separation (${minSep.toFixed(1)}°) is below 30° - colors may not be distinguishable`
      );
    }
  }

  return {
    valid: warnings.length === 0,
    warnings,
  };
}

/**
 * Calculate recommended lightness value for a semantic role
 *
 * @param role - Semantic role
 * @param theme - Theme type ('light' or 'dark')
 * @returns Recommended lightness (0-1)
 */
export function getRecommendedLightness(
  role: 'background' | 'foreground' | 'primary' | 'muted' | 'muted-foreground',
  theme: 'light' | 'dark'
): number {
  const hierarchy =
    theme === 'light' ? LIGHTNESS_HIERARCHY.LIGHT_THEME : LIGHTNESS_HIERARCHY.DARK_THEME;

  switch (role) {
    case 'background':
      return hierarchy.BACKGROUND;
    case 'foreground':
      return hierarchy.FOREGROUND;
    case 'primary':
      return hierarchy.PRIMARY;
    case 'muted':
      return hierarchy.MUTED;
    case 'muted-foreground':
      return hierarchy.MUTED_FOREGROUND;
    default:
      return 0.5;
  }
}
