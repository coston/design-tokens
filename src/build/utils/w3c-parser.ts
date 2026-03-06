/**
 * W3C Design Tokens Format Parser
 * Supports W3C Community Group format with $value and $type
 * Reference: https://design-tokens.org/
 */

import { readFileSync } from 'fs';
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
 * Parse W3C format design tokens from a JSON file
 *
 * @param filePath - Absolute or relative path to W3C tokens JSON file
 * @returns Parsed token collection
 */
export function parseW3CTokens(filePath: string): W3CTokenCollection {
  const content = readFileSync(filePath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Flatten nested W3C token structure into dot-notation
 * Extracts $value from W3C tokens and creates flat key-value pairs
 *
 * @param obj - W3C token collection
 * @param prefix - Current key prefix (used for recursion)
 * @returns Flattened tokens with dot-notation keys
 *
 * @example
 * Input: { brand: { blue: { $value: "#0461DE", $type: "color" } } }
 * Output: { "brand.blue": "#0461DE" }
 */
export function flattenW3CTokens(obj: W3CTokenCollection, prefix = ''): FlatTokens {
  return Object.entries(obj).reduce<FlatTokens>((result, [key, value]) => {
    // Skip metadata keys
    if (key.startsWith('$')) {
      return result;
    }

    const newKey = prefix ? `${prefix}.${key}` : key;

    // Extract $value from W3C token
    if (isW3CToken(value)) {
      return { ...result, [newKey]: value.$value };
    }

    // Recursively flatten nested collections
    if (isNestedCollection(value)) {
      return { ...result, ...flattenW3CTokens(value, newKey) };
    }

    // Handle plain string values (fallback)
    if (typeof value === 'string') {
      return { ...result, [newKey]: value };
    }

    return result;
  }, {});
}

/**
 * Resolve W3C reference syntax {token.path} in token values
 *
 * @param tokens - Tokens with potential references
 * @param coreTokens - All available tokens for reference lookup
 * @param maxDepth - Maximum recursion depth to prevent circular refs
 * @returns Tokens with all references resolved to concrete values
 *
 * @example
 * Input: { "color.primary": "{brand.blue}" }, coreTokens: { "brand.blue": "#0461DE" }
 * Output: { "color.primary": "#0461DE" }
 */
export function resolveW3CReferences(
  tokens: FlatTokens,
  coreTokens: FlatTokens,
  maxDepth = 10
): FlatTokens {
  // Merge tokens for lookup
  const allTokens = { ...coreTokens, ...tokens };

  // Recursively resolve a single token value
  const resolveValue = (value: string, depth: number, originalKey: string): string => {
    if (depth > maxDepth) {
      throw new Error(`Circular reference detected for token: ${originalKey}`);
    }

    // Match W3C reference syntax: {token.path}
    const refMatch = value.match(/^\{(.+)\}$/);
    if (!refMatch) {
      return value; // Not a reference
    }

    const refKey = refMatch[1];
    const refValue = allTokens[refKey];

    if (refValue === undefined) {
      throw new Error(`Reference not found: {${refKey}} in token ${originalKey}`);
    }

    // Recursively resolve in case the referenced token is also a reference
    return resolveValue(refValue, depth + 1, originalKey);
  };

  // Resolve all token values
  return Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => [key, resolveValue(value, 0, key)])
  );
}

/**
 * Parse and resolve a W3C token file with references
 * Convenience function combining parse, flatten, and resolve
 *
 * @param filePath - Path to W3C tokens JSON file
 * @param coreTokens - Core tokens for reference resolution
 * @returns Fully resolved flat tokens
 */
export function loadW3CTokens(filePath: string, coreTokens: FlatTokens = {}): FlatTokens {
  const parsed = parseW3CTokens(filePath);
  const flattened = flattenW3CTokens(parsed);
  return resolveW3CReferences(flattened, coreTokens);
}
