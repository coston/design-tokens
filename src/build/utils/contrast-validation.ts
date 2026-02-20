/**
 * WCAG contrast ratio validation for OKLCH colors
 * Based on WCAG 2.1 guidelines and Weber-Fechner law
 *
 * Theory: Perceived contrast is logarithmic, not linear
 * - Weber's Law: Just-noticeable difference is proportional to stimulus
 * - WCAG formula: (L1 + 0.05) / (L2 + 0.05) accounts for ambient light
 * - Ratios: 4.5:1 (AA), 7:1 (AAA) based on vision research
 *
 * See COLOR-THEORY.md #4 "Contrast Ratios" for details
 */

import { parseOKLCH, oklchToLinearRgb, type OKLCH } from './color-utils.js';

export interface ContrastResult {
  ratio: number;
  AA: boolean; // WCAG AA compliance (4.5:1 for normal text)
  AALarge: boolean; // WCAG AA for large text (3:1)
}

/**
 * Convert OKLCH to sRGB (using shared color-utils conversion)
 */
function oklchToRGB(oklch: OKLCH): [number, number, number] {
  const linearRgb = oklchToLinearRgb(oklch);

  // Clamp to [0, 1]
  const r = Math.max(0, Math.min(1, linearRgb.r));
  const g = Math.max(0, Math.min(1, linearRgb.g));
  const b = Math.max(0, Math.min(1, linearRgb.b));

  return [r, g, b];
}

/**
 * Convert sRGB component to linear
 */
function sRGBToLinear(channel: number): number {
  if (channel <= 0.04045) {
    return channel / 12.92;
  }
  return Math.pow((channel + 0.055) / 1.055, 2.4);
}

/**
 * Calculate relative luminance from RGB
 */
function getRelativeLuminance(rgb: [number, number, number]): number {
  const [r, g, b] = rgb.map(sRGBToLinear);
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate relative luminance from OKLCH
 */
function getLuminanceFromOKLCH(color: string): number {
  const oklch = parseOKLCH(color);
  const rgb = oklchToRGB(oklch);
  return getRelativeLuminance(rgb);
}

/**
 * Calculate contrast ratio between two colors
 * Returns a value between 1 and 21
 */
export function getContrastRatio(color1: string, color2: string): number {
  const [lum1, lum2] = [color1, color2].map(getLuminanceFromOKLCH);
  const [lighter, darker] = [lum1, lum2].sort((a, b) => b - a);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast ratio meets WCAG AA standards
 */
export function checkContrast(foreground: string, background: string): ContrastResult {
  const ratio = getContrastRatio(foreground, background);

  return {
    ratio,
    AA: ratio >= 4.5, // Normal text
    AALarge: ratio >= 3, // Large text (18pt+ or 14pt+ bold)
  };
}

/**
 * Validate all color pairs in a token set
 */
export interface ValidationIssue {
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  level: 'AA' | 'AALarge';
  passed: boolean;
}

/**
 * Define foreground/background pairs to check
 * Moved outside function for reusability and testability
 */
const CONTRAST_PAIRS = [
  { fgKey: 'foreground', bgKey: 'background' },
  { fgKey: 'primary-foreground', bgKey: 'primary' },
  { fgKey: 'secondary-foreground', bgKey: 'secondary' },
  { fgKey: 'muted-foreground', bgKey: 'muted' },
  { fgKey: 'accent-foreground', bgKey: 'accent' },
  { fgKey: 'destructive-foreground', bgKey: 'destructive' },
  { fgKey: 'card-foreground', bgKey: 'card' },
  { fgKey: 'popover-foreground', bgKey: 'popover' },
  { fgKey: 'sidebar-foreground', bgKey: 'sidebar-background' },
  { fgKey: 'sidebar-primary-foreground', bgKey: 'sidebar-primary' },
  { fgKey: 'sidebar-accent-foreground', bgKey: 'sidebar-accent' },
] as const;

/**
 * Validate contrast for semantic token pairs (WCAG AA only)
 * Pure function using map/filter pattern instead of mutable accumulation
 */
export function validateTokenContrast(
  tokens: Record<string, string>,
  largeText: boolean = false
): ValidationIssue[] {
  return CONTRAST_PAIRS.map(({ fgKey, bgKey }): ValidationIssue | null => {
    const fg = tokens[fgKey];
    const bg = tokens[bgKey];

    if (!fg || !bg) {
      return null; // Skip if tokens don't exist
    }

    try {
      const result = checkContrast(fg, bg);
      const checkLevel = largeText ? 'AALarge' : 'AA';
      const passed = result[checkLevel];

      return passed
        ? null
        : {
            pair: `${fgKey} / ${bgKey}`,
            foreground: fg,
            background: bg,
            ratio: result.ratio,
            level: checkLevel,
            passed,
          };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      console.warn(
        `Skipping contrast validation for ${fgKey}/${bgKey}: Invalid color format (${message})`
      );
      return null;
    }
  }).filter((issue): issue is ValidationIssue => issue !== null);
}

/**
 * Format contrast ratio for display
 */
export function formatContrastRatio(ratio: number): string {
  return `${ratio.toFixed(2)}:1`;
}

/**
 * Get minimum required contrast ratio for WCAG AA
 */
export function getMinimumRatio(largeText: boolean = false): number {
  return largeText ? 3 : 4.5;
}

/**
 * Binary search bounds
 */
type SearchBound = { readonly low: number; readonly high: number; readonly best: number };

/**
 * Update search bounds for contrast fix
 * Pure function - no mutations
 */
function updateContrastBound(
  bound: SearchBound,
  mid: number,
  testRatio: number,
  targetRatio: number,
  shouldLighten: boolean
): SearchBound {
  // If we're close enough to target, update best and return early
  if (Math.abs(testRatio - targetRatio) < 0.1) {
    return { ...bound, best: mid, low: mid, high: mid };
  }

  // Update bounds based on whether test ratio is below target
  const isBelowTarget = testRatio < targetRatio;
  const newBest = isBelowTarget ? bound.best : mid;

  return isBelowTarget
    ? shouldLighten
      ? { ...bound, low: mid, best: newBest }
      : { ...bound, high: mid, best: newBest }
    : shouldLighten
      ? { ...bound, high: mid, best: newBest }
      : { ...bound, low: mid, best: newBest };
}

/**
 * Suggest a color adjustment to meet contrast requirements
 * Uses immutable bounds update pattern
 */
export function suggestContrastFix(
  foreground: string,
  background: string,
  targetRatio: number = 4.5
): string | null {
  try {
    const currentRatio = getContrastRatio(foreground, background);

    if (currentRatio >= targetRatio) {
      return null; // Already meets requirements
    }

    const fgOklch = parseOKLCH(foreground);
    const bgOklch = parseOKLCH(background);

    // Determine if we should lighten or darken the foreground
    const shouldLighten = fgOklch.l < bgOklch.l;

    const initialBound: SearchBound = {
      low: shouldLighten ? fgOklch.l : 0,
      high: shouldLighten ? 1 : fgOklch.l,
      best: fgOklch.l,
    };

    const testLightness = (l: number): number => {
      const testColor = `oklch(${l.toFixed(3)} ${fgOklch.c.toFixed(3)} ${Math.round(fgOklch.h)})`;
      return getContrastRatio(testColor, background);
    };

    const finalBound = Array.from({ length: 20 }).reduce<SearchBound>(bound => {
      // Early exit if we've converged
      if (bound.low === bound.high) return bound;

      const mid = (bound.low + bound.high) / 2;
      const testRatio = testLightness(mid);

      return updateContrastBound(bound, mid, testRatio, targetRatio, shouldLighten);
    }, initialBound);

    return `oklch(${finalBound.best.toFixed(3)} ${fgOklch.c.toFixed(3)} ${Math.round(fgOklch.h)})`;
  } catch (_error) {
    return null;
  }
}
