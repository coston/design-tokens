/**
 * Modular scale generation for spacing and typography
 * Based on mathematical ratios for harmonious design systems
 */

import { formatValue, mapRange } from './functional-utils.js';

/**
 * Common modular scale ratios
 */
export const RATIOS = {
  // Musical ratios
  minorSecond: 1.067, // 15:16
  majorSecond: 1.125, // 8:9
  minorThird: 1.2, // 5:6
  majorThird: 1.25, // 4:5
  perfectFourth: 1.333, // 3:4
  augmentedFourth: 1.414, // 1:√2 (ISO paper sizes)
  perfectFifth: 1.5, // 2:3
  minorSixth: 1.6, // 5:8
  goldenRatio: 1.618, // 1:1.618 (phi)
  majorSixth: 1.667, // 3:5
  minorSeventh: 1.778, // 9:16
  majorSeventh: 1.875, // 8:15
  octave: 2, // 1:2
  majorTenth: 2.5, // 2:5
  majorEleventh: 2.667, // 3:8
  majorTwelfth: 3, // 1:3
  doubleOctave: 4, // 1:4
} as const;

export type RatioName = keyof typeof RATIOS;

/**
 * Memoization cache for scale generation
 * Significantly improves performance when same scales are generated multiple times
 */
const scaleCache = new Map<string, string[]>();

/**
 * Create a cache key for memoization
 */
function createCacheKey(
  fn: string,
  base: number,
  ratio: number,
  ...args: (number | string)[]
): string {
  return `${fn}:${base}|${ratio}|${args.join('|')}`;
}

/**
 * Generate a modular scale with memoization
 */
export function generateScale(
  base: number,
  ratio: number,
  steps: number,
  unit: 'rem' | 'px' = 'rem'
): string[] {
  const cacheKey = createCacheKey('scale', base, ratio, steps, unit);

  if (scaleCache.has(cacheKey)) {
    return scaleCache.get(cacheKey)!;
  }

  const format = formatValue(unit);
  const scale = mapRange(steps, i => format(base * Math.pow(ratio, i)));

  scaleCache.set(cacheKey, scale);
  return scale;
}

/**
 * Generate a bidirectional modular scale (below and above base) with memoization
 */
export function generateBidirectionalScale(
  base: number,
  ratio: number,
  stepsBelow: number,
  stepsAbove: number,
  unit: 'rem' | 'px' = 'rem'
): string[] {
  const cacheKey = createCacheKey('bidir', base, ratio, stepsBelow, stepsAbove, unit);

  if (scaleCache.has(cacheKey)) {
    return scaleCache.get(cacheKey)!;
  }

  const format = formatValue(unit);

  // Generate steps below base (in reverse order)
  const below = mapRange(stepsBelow, i => format(base / Math.pow(ratio, stepsBelow - i)));

  // Generate base and steps above
  const above = mapRange(stepsAbove + 1, i => format(base * Math.pow(ratio, i)));

  const scale = [...below, ...above];

  scaleCache.set(cacheKey, scale);
  return scale;
}

/**
 * Generate a spacing scale with common naming convention
 */
export function generateSpacingScale(
  base: number = 1,
  ratio: number = RATIOS.perfectFourth,
  unit: 'rem' | 'px' = 'rem'
): Record<string, string> {
  // Generate values from very small to very large
  const scaleValues = generateBidirectionalScale(base, ratio, 3, 8, unit);

  // Map to common naming convention
  const names = [
    '0.5', // -3
    '1', // -2
    '1.5', // -1
    '2', // base (0)
    '3', // +1
    '4', // +2
    '6', // +3
    '8', // +4
    '12', // +5
    '16', // +6
    '24', // +7
    '32', // +8
  ];

  return {
    '0': '0px', // Always include zero
    ...Object.fromEntries(names.map((name, i) => [name, scaleValues[i]])),
  };
}

/**
 * Generate a typography scale with common naming convention
 */
export function generateTypographyScale(
  base: number = 1,
  ratio: number = RATIOS.perfectFourth,
  unit: 'rem' | 'px' = 'rem'
): Record<string, string> {
  // Generate values from small to large
  const scaleValues = generateBidirectionalScale(base, ratio, 2, 7, unit);

  // Map to common naming convention
  const names = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl', '4xl', '5xl', '6xl'];

  return Object.fromEntries(names.map((name, i) => [name, scaleValues[i]]));
}

/**
 * Generate a custom scale with specified steps
 */
export interface ScaleStep {
  name: string;
  multiplier: number; // Multiplier relative to base (e.g., 0.5, 1, 2, 4)
}

export function generateCustomScale(
  base: number,
  steps: ScaleStep[],
  unit: 'rem' | 'px' = 'rem'
): Record<string, string> {
  const format = formatValue(unit);

  return Object.fromEntries(steps.map(step => [step.name, format(base * step.multiplier)]));
}

/**
 * Generate a Tailwind-compatible spacing scale
 */
export function generateTailwindSpacing(
  base: number = 0.25, // 0.25rem = 4px
  ratio: number = 1, // Linear by default for Tailwind
  unit: 'rem' | 'px' = 'rem'
): Record<string, string> {
  const format = formatValue(unit);

  // Tailwind standard scale (0-96)
  const steps = [
    0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5, 6, 7, 8, 9, 10, 11, 12, 14, 16, 20, 24, 28, 32, 36, 40, 44,
    48, 52, 56, 60, 64, 72, 80, 96,
  ];

  return {
    '0': '0px',
    ...Object.fromEntries(steps.map(step => [step.toString(), format(base * step * ratio)])),
  };
}

/**
 * Calculate the ratio between two values
 */
export function calculateRatio(smaller: number, larger: number): number {
  return larger / smaller;
}

/**
 * Find the closest named ratio to a given value
 */
export function findClosestRatio(value: number): {
  name: RatioName;
  ratio: number;
  difference: number;
} {
  const { name, difference } = Object.entries(RATIOS).reduce<{
    name: RatioName;
    difference: number;
  }>(
    (closest, [name, ratio]) => {
      const diff = Math.abs(ratio - value);
      return diff < closest.difference ? { name: name as RatioName, difference: diff } : closest;
    },
    { name: 'perfectFourth', difference: Infinity }
  );

  return {
    name,
    ratio: RATIOS[name],
    difference,
  };
}

/**
 * Generate a scale preview (for documentation/testing)
 */
export function generateScalePreview(
  base: number,
  ratio: number,
  steps: number,
  unit: 'rem' | 'px' = 'rem'
): Array<{ step: number; value: string; relative: string }> {
  const scale = generateScale(base, ratio, steps, unit);

  return scale.map((value, i) => ({
    step: i,
    value,
    relative: `${ratio.toFixed(3)}^${i} = ${(Math.pow(ratio, i) * base).toFixed(3)}`,
  }));
}

/**
 * Interpolate between two values on a scale
 */
export function interpolateScale(
  min: number,
  max: number,
  steps: number,
  unit: 'rem' | 'px' = 'rem',
  easing: 'linear' | 'exponential' = 'linear'
): string[] {
  const format = formatValue(unit);

  const interpolate = (t: number): number =>
    easing === 'exponential'
      ? min * Math.pow(max / min, t) // Power curve for exponential growth
      : min + (max - min) * t; // Linear interpolation

  return mapRange(steps, i => format(interpolate(i / (steps - 1))));
}
