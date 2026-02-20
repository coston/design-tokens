import type { TokenCollection, FlatTokens, TokenValue } from './types.js';

/**
 * Type guard to check if a value is a reference object
 */
const hasRef = (value: unknown): value is { $ref: string } =>
  value !== null && typeof value === 'object' && '$ref' in value;

/**
 * Type guard to check if a value is a nested token collection
 */
const isTokenCollection = (value: unknown): value is TokenCollection =>
  value !== null && typeof value === 'object' && !hasRef(value);

/**
 * Flatten nested token objects into dot-notation keys
 * Pure function using type guards for clarity
 */
export function flattenTokens(obj: TokenCollection, prefix = ''): FlatTokens {
  return Object.entries(obj).reduce<FlatTokens>((result, [key, value]) => {
    const newKey = prefix ? `${prefix}.${key}` : key;

    if (typeof value === 'string') {
      return { ...result, [newKey]: value };
    } else if (isTokenCollection(value)) {
      return { ...result, ...flattenTokens(value, newKey) };
    } else if (hasRef(value)) {
      return { ...result, [newKey]: JSON.stringify(value) };
    }

    return result;
  }, {});
}

function resolveReference(
  value: string,
  allTokens: FlatTokens,
  depth: number,
  maxDepth: number,
  originalKey: string
): string {
  if (depth > maxDepth) {
    throw new Error(`Circular reference detected for token: ${originalKey}`);
  }

  let parsed: { $ref?: string } | null = null;
  try {
    parsed = JSON.parse(value);
  } catch {
    // Not JSON
  }

  if (parsed && parsed.$ref) {
    const refValue = allTokens[parsed.$ref];
    if (refValue !== undefined) {
      return resolveReference(refValue, allTokens, depth + 1, maxDepth, originalKey);
    }
    return parsed.$ref;
  }

  const refValue = allTokens[value];
  if (refValue !== undefined) {
    return resolveReference(refValue, allTokens, depth + 1, maxDepth, originalKey);
  }

  return value;
}

export function resolveReferences(
  tokens: Record<string, string>,
  allTokens: FlatTokens
): FlatTokens {
  const maxDepth = 10;

  return Object.fromEntries(
    Object.entries(tokens).map(([key, value]) => [
      key,
      resolveReference(value, allTokens, 0, maxDepth, key),
    ])
  );
}

/**
 * Serialize a token value to a string format
 * Handles both string values and reference objects
 */
function serializeValue(value: string | TokenValue): string | null {
  if (typeof value === 'string') {
    return value;
  }
  if (value && typeof value === 'object' && value.$ref) {
    return JSON.stringify(value);
  }
  return null;
}

export function mergeTokens(
  baseTokens: FlatTokens,
  overrides: Record<string, string | TokenValue>
): FlatTokens {
  return Object.entries(overrides).reduce((acc, [key, value]) => {
    const serialized = serializeValue(value);
    return serialized !== null ? { ...acc, [key]: serialized } : acc;
  }, baseTokens);
}
