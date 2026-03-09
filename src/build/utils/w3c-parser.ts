/**
 * W3C Design Tokens Format Parser
 * Supports W3C Community Group format with $value and $type
 * Reference: https://design-tokens.org/
 */

import type { FlatTokens } from './types.js';

/**
 * W3C token structure with $value and $type
 */
interface W3CToken {
  $value: string;
  $type?: string;
  $description?: string;
}

/**
 * W3C token collection (nested structure)
 */
interface W3CTokenCollection {
  [key: string]: W3CToken | W3CTokenCollection | string;
}

/**
 * Type guard to check if a value is a W3C token
 */
const isW3CToken = (value: unknown): value is W3CToken =>
  value !== null && typeof value === 'object' && '$value' in value;

/**
 * Type guard to check if a value is a nested collection
 */
const isNestedCollection = (value: unknown): value is W3CTokenCollection =>
  value !== null &&
  typeof value === 'object' &&
  !('$value' in value) &&
  !('$schema' in value) &&
  !('$description' in value);

/**
 * Flatten nested W3C token structure into dot-notation key-value pairs.
 * Extracts $value from each token and skips metadata keys ($schema etc).
 *
 * @example
 * flattenW3CTokens({ brand: { blue: { $value: "#0461DE", $type: "color" } } })
 * // => { "brand.blue": "#0461DE" }
 */
export function flattenW3CTokens(obj: W3CTokenCollection, prefix = ''): FlatTokens {
  return Object.entries(obj).reduce<FlatTokens>((result, [key, value]) => {
    if (key.startsWith('$')) return result;

    const newKey = prefix ? `${prefix}.${key}` : key;

    if (isW3CToken(value)) return { ...result, [newKey]: value.$value };
    if (isNestedCollection(value)) return { ...result, ...flattenW3CTokens(value, newKey) };
    if (typeof value === 'string') return { ...result, [newKey]: value };

    return result;
  }, {});
}

/**
 * Resolve W3C reference syntax {token.path} in token values.
 *
 * @example
 * resolveW3CReferences({ "color.primary": "{brand.blue}" }, { "brand.blue": "#0461DE" })
 * // => { "color.primary": "#0461DE" }
 */
export function resolveW3CReferences(
  tokens: FlatTokens,
  coreTokens: FlatTokens,
  maxDepth = 10
): FlatTokens {
  const allTokens = { ...coreTokens, ...tokens };

  const resolveValue = (value: string, depth: number, originalKey: string): string => {
    if (depth > maxDepth) {
      throw new Error(`Circular reference detected for token: ${originalKey}`);
    }

    const refMatch = value.match(/^\{(.+)\}$/);
    if (!refMatch) return value;

    const refKey = refMatch[1];
    const refValue = allTokens[refKey];

    if (refValue === undefined) {
      throw new Error(`Reference not found: {${refKey}} in token ${originalKey}`);
    }

    return resolveValue(refValue, depth + 1, originalKey);
  };

  return Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => [key, resolveValue(value, 0, key)])
  );
}
