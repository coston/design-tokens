import type { FlatTokens } from './types.js';
import { REQUIRED_TOKENS } from './types.js';
import { parseOKLCH, findMaxChroma } from './color-utils.js';

export interface ValidationError {
  type: 'missing' | 'empty' | 'unresolved' | 'invalid-color';
  token: string;
  message: string;
}

export interface ValidationWarning {
  type: 'high-chroma' | 'gamut-clipping';
  token: string;
  message: string;
}

export interface ValidationResult {
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

/**
 * Validator function type - returns error/warning or null if valid
 */
type Validator = (token: string, value: string) => ValidationError | ValidationWarning | null;

/**
 * Composable validators for token validation
 * Each validator is independently testable and can be easily added/removed
 */
const TOKEN_VALIDATORS: Validator[] = [
  // Check for empty values
  (token, value) =>
    !value || value.trim() === ''
      ? { type: 'empty', token, message: `Token "${token}" has an empty value` }
      : null,

  // Check for unresolved references
  (token, value) =>
    value.startsWith('{') || value.includes('$ref')
      ? {
          type: 'unresolved',
          token,
          message: `Token "${token}" has an unresolved reference: ${value}`,
        }
      : null,

  // Check OKLCH format and gamut
  (token, value) => {
    if (typeof value !== 'string' || !value.startsWith('oklch(')) {
      return null;
    }

    try {
      const oklch = parseOKLCH(value);
      const maxChroma = findMaxChroma(oklch.l, oklch.h);

      // Warn if chroma exceeds 120% of maximum displayable chroma
      if (oklch.c > maxChroma * 1.2) {
        return {
          type: 'high-chroma',
          token,
          message: `High chroma value ${oklch.c.toFixed(3)} at L=${oklch.l.toFixed(2)} H=${oklch.h.toFixed(0)}° will be clamped to ~${maxChroma.toFixed(3)} (${((oklch.c / maxChroma) * 100).toFixed(0)}% of max)`,
        };
      } else if (oklch.c > maxChroma) {
        return {
          type: 'gamut-clipping',
          token,
          message: `Chroma ${oklch.c.toFixed(3)} exceeds displayable maximum ${maxChroma.toFixed(3)} and will be clipped`,
        };
      }
    } catch {
      return {
        type: 'invalid-color',
        token,
        message: `Invalid OKLCH format: ${value}`,
      };
    }

    return null;
  },
];

/**
 * Check for missing required tokens
 */
function validateRequired(tokens: FlatTokens): ValidationError[] {
  return REQUIRED_TOKENS.filter(token => !(token in tokens)).map(token => ({
    type: 'missing' as const,
    token,
    message: `Missing required token "${token}"`,
  }));
}

/**
 * Run validators on a single token, returning first issue found
 */
function validateToken(token: string, value: string): ValidationError | ValidationWarning | null {
  return TOKEN_VALIDATORS.reduce<ValidationError | ValidationWarning | null>(
    (result, validator) => result ?? validator(token, value),
    null
  );
}

/**
 * Partition validation results into errors and warnings
 */
function partitionResults(results: Array<ValidationError | ValidationWarning | null>): {
  errors: ValidationError[];
  warnings: ValidationWarning[];
} {
  return results.reduce<{ errors: ValidationError[]; warnings: ValidationWarning[] }>(
    (acc, result) => {
      if (!result) return acc;

      const isWarning = result.type === 'high-chroma' || result.type === 'gamut-clipping';
      return isWarning
        ? { ...acc, warnings: [...acc.warnings, result as ValidationWarning] }
        : { ...acc, errors: [...acc.errors, result as ValidationError] };
    },
    { errors: [], warnings: [] }
  );
}

/**
 * Validate tokens and return all errors and warnings
 * Uses composable validator chain for extensibility
 */
export function validateTokens(tokens: FlatTokens): ValidationResult {
  const missingErrors = validateRequired(tokens);
  const validationResults = Object.entries(tokens).map(([token, value]) =>
    validateToken(token, value)
  );
  const { errors, warnings } = partitionResults(validationResults);

  return { errors: [...missingErrors, ...errors], warnings };
}
