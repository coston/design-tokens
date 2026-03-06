import { describe, it, expect } from 'vitest';
import { flattenTokens, resolveReferences, mergeTokens } from '../src/build/utils/merge-tokens.js';
import { validateTokens } from '../src/build/utils/validate-tokens.js';
import { parseOKLCH } from '../src/build/utils/color-utils.js';
import { getContrastRatio } from '../src/build/utils/contrast-validation.js';

describe('Error Path Testing', () => {
  describe('Token Reference Resolution', () => {
    it('should handle JSON $ref references', () => {
      const tokens = {
        primary: '{"$ref":"colors.blue"}',
      };
      const allTokens = {
        'colors.blue': 'oklch(0.5 0.2 240)',
      };

      const resolved = resolveReferences(tokens, allTokens);
      expect(resolved.primary).toBe('oklch(0.5 0.2 240)');
    });

    it('should handle invalid JSON gracefully (catch block)', () => {
      const tokens = {
        primary: '{not valid json}',
      };
      const allTokens = {};

      const resolved = resolveReferences(tokens, allTokens);
      // Should leave as-is when JSON parse fails
      expect(resolved.primary).toBe('{not valid json}');
    });

    it('should break on unresolvable reference', () => {
      const tokens = {
        primary: 'colors.missing',
      };
      const allTokens = {
        'colors.blue': 'oklch(0.5 0.2 240)',
      };

      const resolved = resolveReferences(tokens, allTokens);
      // Should leave unresolvable reference as-is (lines 72-73: break)
      expect(resolved.primary).toBe('colors.missing');
    });

    it('should detect circular references', () => {
      const tokens = {
        a: '{"$ref":"b"}',
        b: '{"$ref":"c"}',
        c: '{"$ref":"a"}', // Circular reference
      };

      expect(() => resolveReferences(tokens, tokens)).toThrow(/circular reference/i);
    });

    it('should detect self-referencing tokens', () => {
      const tokens = {
        color: '{"$ref":"color"}', // Self reference
      };

      expect(() => resolveReferences(tokens, tokens)).toThrow(/circular reference/i);
    });

    it('should handle deeply nested circular references', () => {
      const tokens = {
        a: '{"$ref":"b"}',
        b: '{"$ref":"c"}',
        c: '{"$ref":"d"}',
        d: '{"$ref":"e"}',
        e: '{"$ref":"f"}',
        f: '{"$ref":"g"}',
        g: '{"$ref":"h"}',
        h: '{"$ref":"i"}',
        i: '{"$ref":"j"}',
        j: '{"$ref":"k"}',
        k: '{"$ref":"a"}', // Back to start (exceeds max iterations)
      };

      expect(() => resolveReferences(tokens, tokens)).toThrow(/circular reference/i);
    });

    it('should handle unresolved references gracefully', () => {
      const tokens = {
        primary: '{"$ref":"colors.blue.500"}',
      };
      const allTokens = {}; // Missing reference

      const result = resolveReferences(tokens, allTokens);
      // Unresolved reference extracts the ref path
      expect(result.primary).toBe('colors.blue.500');
    });
  });

  describe('Token Validation', () => {
    it('should detect missing required tokens', () => {
      const tokens = {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0 0 0)',
        // Missing many required tokens
      };

      const { errors } = validateTokens(tokens);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors.some(e => e.type === 'missing')).toBe(true);
    });

    it('should detect empty token values', () => {
      const tokens = {
        background: '',
        foreground: '   ',
        primary: 'oklch(0.5 0.2 200)',
      };

      const { errors } = validateTokens(tokens);
      const emptyErrors = errors.filter(e => e.type === 'empty');
      expect(emptyErrors.length).toBe(2);
    });

    it('should detect unresolved references', () => {
      const tokens = {
        background: 'oklch(1 0 0)',
        primary: '{"$ref":"colors.blue"}', // Unresolved
        secondary: '{colors.red}', // Malformed
      };

      const { errors } = validateTokens(tokens);
      const unresolvedErrors = errors.filter(e => e.type === 'unresolved');
      expect(unresolvedErrors.length).toBe(2);
    });

    it('should aggregate multiple validation errors', () => {
      const tokens = {
        background: '',
        primary: '{"$ref":"missing"}',
        // Missing many other required tokens
      };

      const { errors } = validateTokens(tokens);
      expect(errors.length).toBeGreaterThan(2);
      expect(errors.map(e => e.type)).toContain('empty');
      expect(errors.map(e => e.type)).toContain('unresolved');
      expect(errors.map(e => e.type)).toContain('missing');
    });
  });

  describe('Color Parsing Errors', () => {
    it('should throw on invalid OKLCH format', () => {
      expect(() => parseOKLCH('invalid')).toThrow();
      expect(() => parseOKLCH('rgb(255, 0, 0)')).toThrow();
      expect(() => parseOKLCH('oklch()')).toThrow();
      expect(() => parseOKLCH('oklch(1)')).toThrow();
      expect(() => parseOKLCH('oklch(1 2)')).toThrow();
    });

    it('should throw on malformed OKLCH values', () => {
      expect(() => parseOKLCH('oklch(abc def ghi)')).toThrow();
      expect(() => parseOKLCH('oklch(1 2 3 4 5)')).toThrow();
    });

    it('should handle edge case OKLCH values', () => {
      // These should parse successfully (boundary values)
      expect(parseOKLCH('oklch(0 0 0)')).toEqual({ l: 0, c: 0, h: 0 });
      expect(parseOKLCH('oklch(1 0.4 360)')).toEqual({ l: 1, c: 0.4, h: 360 });
      expect(parseOKLCH('oklch(0.5 0.2 180)')).toEqual({ l: 0.5, c: 0.2, h: 180 });
    });
  });

  describe('Contrast Validation Errors', () => {
    it('should handle invalid colors in contrast calculation', () => {
      // getContrastRatio should throw on invalid colors
      expect(() => getContrastRatio('invalid', 'oklch(0.5 0 0)')).toThrow();
      expect(() => getContrastRatio('oklch(0.5 0 0)', 'rgb(255, 0, 0)')).toThrow();
    });

    it('should handle extreme lightness values', () => {
      // Pure white and pure black
      const white = 'oklch(1 0 0)';
      const black = 'oklch(0 0 0)';
      const ratio = getContrastRatio(white, black);
      expect(ratio).toBeGreaterThan(15); // Should be maximum contrast
    });

    it('should handle identical colors', () => {
      const color = 'oklch(0.5 0.2 200)';
      const ratio = getContrastRatio(color, color);
      expect(ratio).toBe(1); // No contrast
    });
  });

  describe('Token Merging', () => {
    it('should handle empty overrides', () => {
      const base = { primary: 'oklch(0.5 0.2 200)' };
      const overrides = {};
      const result = mergeTokens(base, overrides);
      expect(result).toEqual(base);
    });

    it('should handle overriding with $ref', () => {
      const base = { primary: 'oklch(0.5 0.2 200)' };
      const overrides = { primary: { $ref: 'colors.blue' } };
      const result = mergeTokens(base, overrides);
      expect(result.primary).toContain('$ref');
    });

    it('should preserve base tokens not in overrides', () => {
      const base = {
        primary: 'oklch(0.5 0.2 200)',
        secondary: 'oklch(0.6 0.1 150)',
        background: 'oklch(1 0 0)',
      };
      const overrides = { primary: 'oklch(0.4 0.3 220)' };
      const result = mergeTokens(base, overrides);
      expect(result.secondary).toBe(base.secondary);
      expect(result.background).toBe(base.background);
      expect(result.primary).toBe(overrides.primary);
    });
  });

  describe('Token Merging Edge Cases', () => {
    it('should handle null override values gracefully', () => {
      const base = { primary: 'oklch(0.5 0.2 200)' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const overrides = { primary: null as any };

      const result = mergeTokens(base, overrides);
      // serializeValue should return null for null values (line 94)
      expect(result.primary).toBe(base.primary); // Keeps original
    });

    it('should handle undefined override values', () => {
      const base = { primary: 'oklch(0.5 0.2 200)' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const overrides = { primary: undefined as any };

      const result = mergeTokens(base, overrides);
      expect(result.primary).toBe(base.primary);
    });

    it('should handle object overrides without $ref', () => {
      const base = { primary: 'oklch(0.5 0.2 200)' };
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const overrides = { primary: { value: 'test', notRef: true } as any };

      const result = mergeTokens(base, overrides);
      // serializeValue returns null for objects without $ref (line 94-95)
      expect(result.primary).toBe(base.primary);
    });

    it('should filter out numeric values in flattening', () => {
      const tokens = {
        spacing: {
          small: 8,
          medium: 16,
          large: '2rem', // Valid string token
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = flattenTokens(tokens);
      // Non-string primitives are filtered out by line 30-31 return
      expect(result).not.toHaveProperty('spacing.small');
      expect(result).not.toHaveProperty('spacing.medium');
      // But string values should be kept
      expect(result).toHaveProperty('spacing.large');
      expect(result['spacing.large']).toBe('2rem');
    });

    it('should filter out boolean values in tokens', () => {
      const tokens = {
        features: {
          enabled: true,
          disabled: false,
          theme: 'dark', // Valid string token
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = flattenTokens(tokens);
      // Non-string primitives should be filtered out (line 30-31)
      expect(result).not.toHaveProperty('features.enabled');
      expect(result).not.toHaveProperty('features.disabled');
      // But string values should be kept
      expect(result).toHaveProperty('features.theme');
    });

    it('should filter out array values in tokens', () => {
      const tokens = {
        values: {
          list: [1, 2, 3],
          name: 'test', // Valid string token
        },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      const result = flattenTokens(tokens);
      // Arrays should be filtered out (line 30-31 return)
      expect(result).not.toHaveProperty('values.list');
      // But string values should be kept
      expect(result).toHaveProperty('values.name');
    });
  });

  describe('Token Flattening', () => {
    it('should handle deeply nested structures', () => {
      const tokens = {
        colors: {
          blue: {
            50: 'oklch(0.95 0.05 250)',
            100: 'oklch(0.90 0.10 250)',
            500: 'oklch(0.50 0.20 250)',
          },
        },
      };

      const result = flattenTokens(tokens);
      expect(result['colors.blue.50']).toBe('oklch(0.95 0.05 250)');
      expect(result['colors.blue.500']).toBe('oklch(0.50 0.20 250)');
    });

    it('should handle $ref in nested structures', () => {
      const tokens = {
        semantic: {
          primary: { $ref: 'colors.blue.500' },
        },
      };

      const result = flattenTokens(tokens);
      expect(result['semantic.primary']).toContain('$ref');
    });

    it('should handle empty objects', () => {
      const result = flattenTokens({});
      expect(result).toEqual({});
    });

    it('should handle single-level objects', () => {
      const tokens = { primary: 'oklch(0.5 0.2 200)' };
      const result = flattenTokens(tokens);
      expect(result).toEqual(tokens);
    });
  });

  describe('Edge Cases', () => {
    it('should handle tokens with special characters in keys', () => {
      const tokens = {
        'primary-foreground': 'oklch(0.5 0.2 200)',
        card_background: 'oklch(1 0 0)',
      };

      const result = flattenTokens(tokens);
      expect(result['primary-foreground']).toBeDefined();
      expect(result['card_background']).toBeDefined();
    });

    it('should handle numeric string values', () => {
      const tokens = {
        'font-size': '16',
        spacing: '8px',
      };

      const result = flattenTokens(tokens);
      expect(result['font-size']).toBe('16');
      expect(result.spacing).toBe('8px');
    });

    it('should validate tokens with whitespace', () => {
      const tokens = {
        primary: '  oklch(0.5 0.2 200)  ',
        secondary: '\t\noklch(0.6 0.1 150)\n\t',
      };

      const { errors } = validateTokens(tokens);
      // Whitespace-only values should be caught as empty
      expect(errors.filter(e => e.type === 'empty').length).toBe(0);
    });
  });

  describe('Validation Error Messages', () => {
    it('should provide clear error messages for missing tokens', () => {
      const tokens = { background: 'oklch(1 0 0)' };
      const { errors } = validateTokens(tokens);
      const missingError = errors.find(e => e.type === 'missing');

      expect(missingError).toBeDefined();
      expect(missingError?.message).toContain('Missing required token');
      expect(missingError?.token).toBeDefined();
    });

    it('should provide clear error messages for empty values', () => {
      const tokens = {
        background: '',
        foreground: 'oklch(0 0 0)',
      };
      const { errors } = validateTokens(tokens);
      const emptyError = errors.find(e => e.type === 'empty');

      expect(emptyError).toBeDefined();
      expect(emptyError?.message).toContain('empty value');
      expect(emptyError?.token).toBe('background');
    });

    it('should provide clear error messages for unresolved references', () => {
      const tokens = {
        primary: '{"$ref":"missing.color"}',
      };
      const { errors } = validateTokens(tokens);
      const unresolvedError = errors.find(e => e.type === 'unresolved');

      expect(unresolvedError).toBeDefined();
      expect(unresolvedError?.message).toContain('unresolved reference');
      expect(unresolvedError?.message).toContain('missing.color');
    });
  });

  describe('Gamut Validation Warnings', () => {
    it('should warn for chroma slightly above max (gamut clipping)', () => {
      const tokens = {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0 0 0)',
        primary: 'oklch(0.6 0.14 240)', // Slightly over max (~0.134)
        'primary-foreground': 'oklch(1 0 0)',
        secondary: 'oklch(0.9 0.02 240)',
        'secondary-foreground': 'oklch(0 0 0)',
      };

      const { warnings } = validateTokens(tokens);
      const gamutWarning = warnings.find(w => w.type === 'gamut-clipping');

      expect(gamutWarning).toBeDefined();
      expect(gamutWarning?.message).toContain('exceeds displayable maximum');
      expect(gamutWarning?.message).toContain('will be clipped');
    });

    it('should warn for very high chroma (>120% of max)', () => {
      const tokens = {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0 0 0)',
        primary: 'oklch(0.6 0.18 240)', // Much higher than max (~0.134)
        'primary-foreground': 'oklch(1 0 0)',
        secondary: 'oklch(0.9 0.02 240)',
        'secondary-foreground': 'oklch(0 0 0)',
      };

      const { warnings } = validateTokens(tokens);
      const highChromaWarning = warnings.find(w => w.type === 'high-chroma');

      expect(highChromaWarning).toBeDefined();
      expect(highChromaWarning?.message).toContain('High chroma value');
      expect(highChromaWarning?.message).toContain('will be clamped');
    });

    it('should not warn for colors within gamut', () => {
      const tokens = {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(0 0 0)',
        primary: 'oklch(0.6 0.10 240)', // Well within gamut
        'primary-foreground': 'oklch(1 0 0)',
        secondary: 'oklch(0.9 0.02 240)',
        'secondary-foreground': 'oklch(0 0 0)',
      };

      const { warnings } = validateTokens(tokens);
      const gamutWarnings = warnings.filter(
        w => w.type === 'gamut-clipping' || w.type === 'high-chroma'
      );

      expect(gamutWarnings.length).toBe(0);
    });

    it('should handle invalid OKLCH format gracefully in validation', () => {
      const tokens = {
        background: 'oklch(1 0 0)',
        foreground: 'oklch(invalid format)',
        primary: 'not-a-color',
        'primary-foreground': 'oklch(1 0 0)',
      };

      // Should not throw, invalid formats caught elsewhere
      expect(() => validateTokens(tokens)).not.toThrow();
    });
  });
});
