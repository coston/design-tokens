/**
 * Color manipulation utilities for OKLCH color space
 * All functions work with OKLCH format: "oklch(L C H)" or "oklch(L C H / A)"
 *
 * Based on color theory fundamentals - see COLOR-THEORY.md for details:
 * - Perceptual uniformity (Oklab color space)
 * - Helmholtz-Kohlrausch effect (chroma/lightness relationship)
 * - Color wheel mathematics (hue relationships)
 */

import { calculateChromaMultiplier } from './color-theory-calculations.js';
import { mapRange } from './functional-utils.js';

export interface OKLCH {
  l: number; // Lightness: 0-1
  c: number; // Chroma: 0-0.4+
  h: number; // Hue: 0-360
  a?: number; // Alpha: 0-1
}

export function parseOKLCH(color: string): OKLCH {
  const match = color.match(
    /oklch\(\s*([0-9.]+)\s+([0-9.]+)\s+([0-9.]+)(?:\s*\/\s*([0-9.]+))?\s*\)/
  );

  if (!match) {
    throw new Error(`Invalid OKLCH color: ${color}`);
  }

  return {
    l: parseFloat(match[1]),
    c: parseFloat(match[2]),
    h: parseFloat(match[3]),
    a: match[4] ? parseFloat(match[4]) : undefined,
  };
}

export function toOKLCH(color: OKLCH): string {
  const { l, c, h, a } = color;
  const lStr = l.toFixed(3);
  const cStr = c.toFixed(3);
  const hStr = Math.round(h).toString();

  if (a !== undefined) {
    return `oklch(${lStr} ${cStr} ${hStr} / ${a.toFixed(2)})`;
  }

  return `oklch(${lStr} ${cStr} ${hStr})`;
}

const clamp01 = (value: number): number => Math.max(0, Math.min(1, value));
const clamp0 = (value: number): number => Math.max(0, value);
const normalizeHue = (value: number): number => (value + 360) % 360;

/**
 * Function composition utilities for color transformations
 * Enables elegant functional pipelines
 *
 * @example
 * const lightenAndDesaturate = pipe([
 *   (color: string) => adjustLightness(color, 0.1),
 *   (color: string) => desaturate(color, 0.2)
 * ]);
 * const result = lightenAndDesaturate('oklch(0.5 0.15 240)');
 */
export function pipe<T>(fns: Array<(x: T) => T>): (x: T) => T {
  return (x: T) => fns.reduce((acc, fn) => fn(acc), x);
}

/**
 * Compose functions right-to-left (mathematical composition)
 * compose(f, g)(x) === f(g(x))
 */
export function compose<T>(...fns: Array<(x: T) => T>): (x: T) => T {
  return (x: T) => fns.reduceRight((acc, fn) => fn(acc), x);
}

/**
 * Factory function to create color adjusters
 * Creates a function that parses OKLCH, applies transform to a property, returns OKLCH string
 * Uses immutable pattern with spread operator
 */
function makeAdjuster(
  property: 'l' | 'c' | 'h',
  transform: (currentValue: number, inputValue: number) => number
): (color: string, value: number) => string {
  return (color: string, value: number): string => {
    const oklch = parseOKLCH(color);
    return toOKLCH({ ...oklch, [property]: transform(oklch[property], value) });
  };
}

export const adjustLightness = makeAdjuster('l', (current, amount) => clamp01(current + amount));
export const adjustChroma = makeAdjuster('c', (current, amount) => clamp0(current + amount));
export const adjustHue = makeAdjuster('h', (current, degrees) => normalizeHue(current + degrees));
export const setLightness = makeAdjuster('l', (_, lightness) => clamp01(lightness));
export const setChroma = makeAdjuster('c', (_, chroma) => clamp0(chroma));
export const setHue = makeAdjuster('h', (_, hue) => normalizeHue(hue));

/**
 * Factory function for creating color harmonies from hue offsets
 * Takes an array of hue offsets and returns a function that generates colors
 * by applying each offset to the base color.
 *
 * Makes color wheel math explicit as data rather than buried in function bodies.
 *
 * @param offsets - Array of hue offsets in degrees
 * @returns Function that takes a color and returns harmony colors
 *
 * @example
 * const triadicHarmony = createHarmony([0, 120, 240]);
 * const colors = triadicHarmony('oklch(0.6 0.15 240)');
 * // Returns [base, +120°, +240°]
 */
function createHarmony(offsets: number[]): (color: string) => string[] {
  return (color: string): string[] => {
    return offsets.map(offset => adjustHue(color, offset));
  };
}

export function getComplementary(color: string): string {
  return adjustHue(color, 180);
}

export function getAnalogous(color: string, angle: number = 30): string[] {
  return createHarmony([-angle, 0, angle])(color);
}

export function getTriadic(color: string): string[] {
  return createHarmony([0, 120, 240])(color);
}

export function getTetradic(color: string, angle: number = 60): string[] {
  return createHarmony([0, angle, 180, 180 + angle])(color);
}

export function getSplitComplementary(color: string, angle: number = 30): string[] {
  return createHarmony([0, 180 - angle, 180 + angle])(color);
}

/**
 * Generate a perceptually uniform lightness scale
 * Uses power curve (gamma correction) for perceptual uniformity
 *
 * Theory: Human perception of lightness is non-linear (logarithmic)
 * - Gamma 2.2 matches typical display gamma
 * - Creates equal VISUAL steps, not equal mathematical steps
 * - Based on Oklab color space (perceptually uniform)
 *
 * See COLOR-THEORY.md #2 "Perceptual Uniformity" for details
 */
export function generateLightnessScale(baseColor: string, steps: number = 11): string[] {
  const oklch = parseOKLCH(baseColor);

  // Pure function to calculate lightness for a given step
  const calculateLightness = (i: number): number => {
    const t = i / (steps - 1); // 0 to 1
    // Use power curve (gamma = 2.2) for perceptual uniformity
    return Math.pow(1 - t, 2.2) * 0.985 + Math.pow(t, 1 / 2.2) * 0.137;
  };

  // Pure function to create color at given lightness
  const createColorAtLightness = (l: number): string => toOKLCH({ l, c: oklch.c, h: oklch.h });

  // Generate perceptually uniform lightness values
  // Using power curve for better perceptual uniformity
  return mapRange(steps, i => createColorAtLightness(calculateLightness(i))).reverse();
}

/**
 * Maps a step value (50-950) to a normalized position (0-1)
 * See COLOR-THEORY.md #2 "Perceptual Uniformity"
 */
function stepToNormalized(step: number): number {
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];
  const index = steps.indexOf(step);

  if (index === -1) {
    throw new Error(`Invalid step: ${step}. Must be one of: ${steps.join(', ')}`);
  }

  return index / (steps.length - 1);
}

/**
 * Calculates perceptually uniform lightness using power curve
 * COLOR-THEORY.md line 104
 *
 * Formula: L = (1-t)^2.2 × 0.985 + t^(1/2.2) × 0.137
 * - t = normalized position (0-1)
 * - 2.2 = gamma correction matching typical display gamma
 * - Dual power blend for perceptual uniformity
 *
 * See COLOR-THEORY.md #2 "Lightness Curve Generation" lines 103-113
 */
function calculateLightnessForStep(step: number): number {
  const t = stepToNormalized(step);

  // COLOR-THEORY.md line 104: Canonical perceptual lightness formula
  // Dark end: (1-t)^2.2 * 0.985 dominates
  // Light end: t^(1/2.2) * 0.137 dominates
  return Math.pow(1 - t, 2.2) * 0.985 + Math.pow(t, 1 / 2.2) * 0.137;
}

/**
 * Generate a complete color scale (50-950) from a base color
 * Adjusts chroma to maintain vibrancy at different lightness levels
 *
 * Theory: Helmholtz-Kohlrausch effect - saturated colors appear brighter
 * - High chroma at light/dark extremes looks unnatural
 * - Peak vibrancy occurs at mid-tones (L≈0.5-0.6)
 * - Chroma multipliers are empirically tuned for visual balance
 *
 * See COLOR-THEORY.md #3 "Helmholtz-Kohlrausch Effect" for details
 *
 * @param baseColor - Base OKLCH color
 */
export function generateColorScale(baseColor: string): Record<string, string> {
  const oklch = parseOKLCH(baseColor);
  const steps = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950];

  // Pure function to create a single color scale entry
  const createScaleEntry = (step: number): [string, string] => {
    const l = calculateLightnessForStep(step);
    // Apply chroma adjustment using Helmholtz-Kohlrausch effect curve
    const c = oklch.c * calculateChromaMultiplier(l);

    return [step.toString(), toOKLCH({ l, c, h: oklch.h })];
  };

  return Object.fromEntries(steps.map(createScaleEntry));
}

export function mixColors(color1: string, color2: string, weight: number = 0.5): string {
  const c1 = parseOKLCH(color1);
  const c2 = parseOKLCH(color2);

  let h1 = c1.h;
  let h2 = c2.h;
  const diff = h2 - h1;

  if (Math.abs(diff) > 180) {
    if (diff > 0) {
      h1 += 360;
    } else {
      h2 += 360;
    }
  }

  return toOKLCH({
    l: c1.l * (1 - weight) + c2.l * weight,
    c: c1.c * (1 - weight) + c2.c * weight,
    h: (h1 * (1 - weight) + h2 * weight + 360) % 360,
    a: c1.a !== undefined && c2.a !== undefined ? c1.a * (1 - weight) + c2.a * weight : undefined,
  });
}

export function desaturate(color: string, amount: number = 0.1): string {
  const oklch = parseOKLCH(color);
  return toOKLCH({ ...oklch, c: Math.max(0, oklch.c * (1 - amount)) });
}

export function saturate(color: string, amount: number = 0.1): string {
  const oklch = parseOKLCH(color);
  return toOKLCH({ ...oklch, c: oklch.c * (1 + amount) });
}

export function lighten(color: string, amount: number = 0.1): string {
  return adjustLightness(color, amount);
}

export function darken(color: string, amount: number = 0.1): string {
  return adjustLightness(color, -amount);
}

export function isLight(color: string): boolean {
  const oklch = parseOKLCH(color);
  return oklch.l > 0.5;
}

export function isDark(color: string): boolean {
  return !isLight(color);
}

/**
 * Convert OKLCH to Oklab
 * Exported for reuse in contrast calculations
 */
export function oklchToOklab(oklch: OKLCH): { l: number; a: number; b: number } {
  const { l, c, h } = oklch;
  const hRadians = (h * Math.PI) / 180;

  return {
    l,
    a: c * Math.cos(hRadians),
    b: c * Math.sin(hRadians),
  };
}

/**
 * Convert Oklab to Linear RGB
 * Based on Oklab specification: https://bottosson.github.io/posts/oklab/
 * Exported for reuse in contrast calculations
 */
export function oklabToLinearRgb(oklab: { l: number; a: number; b: number }): {
  r: number;
  g: number;
  b: number;
} {
  const { l, a, b } = oklab;

  // Oklab to LMS
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.291485548 * b;

  // LMS to linear RGB
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;

  return {
    r: +4.0767416621 * l3 - 3.3077115913 * m3 + 0.2309699292 * s3,
    g: -1.2684380046 * l3 + 2.6097574011 * m3 - 0.3413193965 * s3,
    b: -0.0041960863 * l3 - 0.7034186147 * m3 + 1.707614701 * s3,
  };
}

/**
 * Convert OKLCH to Linear RGB (combined conversion)
 * Exported for reuse in contrast calculations
 */
export function oklchToLinearRgb(oklch: OKLCH): { r: number; g: number; b: number } {
  return oklabToLinearRgb(oklchToOklab(oklch));
}

export function linearToSrgb(value: number): number {
  if (value <= 0.0031308) {
    return value * 12.92;
  }
  return 1.055 * Math.pow(value, 1 / 2.4) - 0.055;
}

export function oklchToRgb(color: string): { r: number; g: number; b: number } {
  const oklch = parseOKLCH(color);
  const oklab = oklchToOklab(oklch);
  const linear = oklabToLinearRgb(oklab);

  return {
    r: Math.max(0, Math.min(255, Math.round(linearToSrgb(linear.r) * 255))),
    g: Math.max(0, Math.min(255, Math.round(linearToSrgb(linear.g) * 255))),
    b: Math.max(0, Math.min(255, Math.round(linearToSrgb(linear.b) * 255))),
  };
}

export function rgbToHex(r: number, g: number, b: number): string {
  const toHex = (n: number) => {
    const hex = Math.max(0, Math.min(255, Math.round(n))).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function oklchToHex(color: string): string {
  const rgb = oklchToRgb(color);
  return rgbToHex(rgb.r, rgb.g, rgb.b);
}

/**
 * Factory function to create gamut checkers
 * Creates a function that checks if RGB values are within specified range
 */
function createGamutChecker(minValue: number = 0, maxValue: number = 1) {
  return (rgb: { r: number; g: number; b: number }): boolean => {
    return (
      rgb.r >= minValue &&
      rgb.r <= maxValue &&
      rgb.g >= minValue &&
      rgb.g <= maxValue &&
      rgb.b >= minValue &&
      rgb.b <= maxValue
    );
  };
}

const isLinearRgbInGamut = createGamutChecker();

/**
 * Check if a color is within the sRGB gamut
 * See COLOR-THEORY.md #8 "Gamut Mapping"
 */
export function isInGamut(color: string | OKLCH): boolean {
  const oklch = typeof color === 'string' ? parseOKLCH(color) : color;

  if (oklch.c < 0.001) {
    return true;
  }

  const oklab = oklchToOklab(oklch);
  const linearRgb = oklabToLinearRgb(oklab);

  return isLinearRgbInGamut(linearRgb);
}

/**
 * Binary search to find maximum value where predicate is true
 * Returns the supremum (least upper bound) within specified precision
 */
function binarySearchMaxValue(
  low: number,
  high: number,
  predicate: (value: number) => boolean,
  precision: number = 0.001
): number {
  while (high - low > precision) {
    const mid = (low + high) / 2;
    if (predicate(mid)) {
      low = mid;
    } else {
      high = mid;
    }
  }
  return low;
}

/**
 * Factory function to create a cached binary search for maximum chroma
 */
function makeCachedBinarySearch(
  cache: Map<string, number>,
  isInGamutCheck: (l: number, c: number, h: number) => boolean,
  initialHigh: number,
  adjustHighForExtremes: (high: number, lightness: number) => number,
  precision: number
): (lightness: number, hue: number, precisionOverride?: number) => number {
  return (lightness: number, hue: number, precisionOverride: number = precision): number => {
    const cacheKey = `${lightness.toFixed(3)}_${Math.round(hue)}`;
    const cached = cache.get(cacheKey);
    if (cached !== undefined) {
      return cached;
    }

    const high = adjustHighForExtremes(initialHigh, lightness);

    if (isInGamutCheck(lightness, high, hue)) {
      cache.set(cacheKey, high);
      return high;
    }

    const maxChroma = binarySearchMaxValue(
      0,
      high,
      chroma => isInGamutCheck(lightness, chroma, hue),
      precisionOverride
    );

    cache.set(cacheKey, maxChroma);
    return maxChroma;
  };
}

const maxChromaCache = new Map<string, number>();

/**
 * Pre-warm the gamut mapping cache with common values
 * Eliminates first-call latency during build by pre-calculating frequently used combinations
 * Uses declarative cartesian product instead of nested loops
 *
 * @param samples - Number of lightness samples (default: 20)
 */
export function warmGamutCache(samples: number = 20): void {
  // Sample lightness at regular intervals
  const lightnessSteps = Array.from({ length: samples }, (_, i) => i / (samples - 1));

  // Key hue angles that cover the color wheel
  const hueSteps = [0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330];

  // Declarative cartesian product of lightness × hue combinations
  const combinations = lightnessSteps.flatMap(l => hueSteps.map(h => [l, h] as const));

  // Populate cache by calling findMaxChroma for each combination
  combinations.forEach(([l, h]) => findMaxChroma(l, h));
}

/**
 * Find the maximum chroma for a given lightness and hue within sRGB gamut
 * Uses binary search to find the highest chroma value that doesn't clip
 */
export const findMaxChroma = makeCachedBinarySearch(
  maxChromaCache,
  (l, c, h) => isInGamut({ l, c, h }),
  0.5,
  (high, _lightness) => high, // No cap - find true maximum at all lightness levels
  0.001
);

export function getGamutInfo(color: string | OKLCH): {
  inGamut: boolean;
  currentChroma: number;
  maxChroma: number;
  utilization: number;
} {
  const oklch = typeof color === 'string' ? parseOKLCH(color) : color;
  const inGamut = isInGamut(oklch);
  const maxChroma = findMaxChroma(oklch.l, oklch.h);
  const utilization = maxChroma > 0 ? (oklch.c / maxChroma) * 100 : 0;

  return {
    inGamut,
    currentChroma: oklch.c,
    maxChroma,
    utilization,
  };
}
