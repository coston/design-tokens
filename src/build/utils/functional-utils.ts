/**
 * Functional programming utilities for composition and reusable patterns
 */

/**
 * Round number to specified decimal places
 */
export const roundTo =
  (decimals: number) =>
  (n: number): number => {
    const multiplier = Math.pow(10, decimals);
    return Math.round(n * multiplier) / multiplier;
  };

/**
 * Round to 3 decimal places (common precision for tokens)
 */
export const round3Decimals = roundTo(3);

/**
 * Format a numeric value with a unit suffix
 */
export const formatValue =
  (unit: string) =>
  (n: number): string =>
    `${round3Decimals(n)}${unit}`;

/**
 * Create a range of numbers from 0 to n-1
 */
export const range = (n: number): number[] => Array.from({ length: n }, (_, i) => i);

/**
 * Create a range with a mapping function
 */
export const mapRange = <T>(n: number, fn: (i: number) => T): T[] => range(n).map(fn);

/**
 * Partition an array into two arrays based on a predicate
 */
export const partition = <T>(arr: T[], predicate: (item: T) => boolean): [T[], T[]] => {
  const pass: T[] = [];
  const fail: T[] = [];

  arr.forEach(item => {
    (predicate(item) ? pass : fail).push(item);
  });

  return [pass, fail];
};

/**
 * Find two adjacent elements in a sorted array that bracket a value
 * Returns [lower, upper] where selector(lower) <= value <= selector(upper)
 *
 * @param arr - Sorted array to search
 * @param value - Value to bracket
 * @param selector - Function to extract the comparison value from array elements
 * @returns Tuple of [lower, upper] bracketing elements
 *
 * @example
 * const points = [{ x: 0, y: 0 }, { x: 0.5, y: 0.5 }, { x: 1, y: 1 }];
 * const [lower, upper] = findBrackets(points, 0.7, p => p.x);
 * // Returns [{ x: 0.5, y: 0.5 }, { x: 1, y: 1 }]
 */
export function findBrackets<T>(arr: T[], value: number, selector: (item: T) => number): [T, T] {
  for (let i = 0; i < arr.length - 1; i++) {
    if (selector(arr[i]) <= value && value <= selector(arr[i + 1])) {
      return [arr[i], arr[i + 1]];
    }
  }
  // If not found in middle, return first and last
  return [arr[0], arr[arr.length - 1]];
}
