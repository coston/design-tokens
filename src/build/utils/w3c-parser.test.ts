import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  flattenW3CTokens,
  resolveW3CReferences,
  parseW3CTokens,
  loadW3CTokens,
} from './w3c-parser.js';
import type { FlatTokens } from './types.js';
import { writeFileSync, mkdirSync, rmSync } from 'fs';
import { join } from 'path';

describe('W3C Parser', () => {
  const testDir = join(process.cwd(), 'test-temp-w3c');

  beforeEach(() => {
    // Create test directory
    try {
      mkdirSync(testDir, { recursive: true });
    } catch (_e) {
      // Directory might already exist
    }
  });

  afterEach(() => {
    // Clean up test directory
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch (_e) {
      // Ignore cleanup errors
    }
  });

  describe('parseW3CTokens', () => {
    it('should parse valid W3C token JSON file', () => {
      const testFile = join(testDir, 'test-tokens.json');
      const tokenData = {
        brand: {
          blue: {
            $value: '#0461DE',
            $type: 'color',
          },
        },
      };

      writeFileSync(testFile, JSON.stringify(tokenData, null, 2));

      const result = parseW3CTokens(testFile);
      expect(result).toEqual(tokenData);
    });

    it('should handle nested token structures', () => {
      const testFile = join(testDir, 'nested-tokens.json');
      const tokenData = {
        $schema: 'https://design-tokens.org/schema',
        colors: {
          brand: {
            primary: {
              $value: '#0461DE',
              $type: 'color',
            },
          },
        },
      };

      writeFileSync(testFile, JSON.stringify(tokenData, null, 2));

      const result = parseW3CTokens(testFile);
      expect(result).toEqual(tokenData);
      expect(result.$schema).toBeDefined();
    });

    it('should throw error for invalid JSON', () => {
      const testFile = join(testDir, 'invalid.json');
      writeFileSync(testFile, 'invalid json content');

      expect(() => parseW3CTokens(testFile)).toThrow();
    });

    it('should throw error for non-existent file', () => {
      const testFile = join(testDir, 'non-existent.json');
      expect(() => parseW3CTokens(testFile)).toThrow();
    });
  });

  describe('loadW3CTokens', () => {
    it('should load and resolve W3C tokens in one call', () => {
      const testFile = join(testDir, 'semantic-tokens.json');
      const tokenData = {
        color: {
          primary: {
            $value: '{brand.blue}',
            $type: 'color',
          },
        },
      };

      const coreTokens: FlatTokens = {
        'brand.blue': '#0461DE',
      };

      writeFileSync(testFile, JSON.stringify(tokenData, null, 2));

      const result = loadW3CTokens(testFile, coreTokens);
      expect(result).toEqual({
        'color.primary': '#0461DE',
      });
    });

    it('should work without core tokens', () => {
      const testFile = join(testDir, 'simple-tokens.json');
      const tokenData = {
        spacing: {
          base: {
            $value: '1rem',
            $type: 'dimension',
          },
        },
      };

      writeFileSync(testFile, JSON.stringify(tokenData, null, 2));

      const result = loadW3CTokens(testFile);
      expect(result).toEqual({
        'spacing.base': '1rem',
      });
    });

    it('should handle complex token hierarchies', () => {
      const testFile = join(testDir, 'complex-tokens.json');
      const tokenData = {
        $schema: 'https://design-tokens.org/schema',
        semantic: {
          colors: {
            ui: {
              primary: {
                $value: '{brand.colors.blue}',
                $type: 'color',
              },
              secondary: {
                $value: '{brand.colors.navy}',
                $type: 'color',
              },
            },
          },
        },
      };

      const coreTokens: FlatTokens = {
        'brand.colors.blue': '#0461DE',
        'brand.colors.navy': '#104D82',
      };

      writeFileSync(testFile, JSON.stringify(tokenData, null, 2));

      const result = loadW3CTokens(testFile, coreTokens);
      expect(result).toEqual({
        'semantic.colors.ui.primary': '#0461DE',
        'semantic.colors.ui.secondary': '#104D82',
      });
    });

    it('should propagate errors from parseW3CTokens', () => {
      const testFile = join(testDir, 'missing.json');
      // Don't create the file

      expect(() => loadW3CTokens(testFile)).toThrow();
    });

    it('should propagate errors from resolveW3CReferences', () => {
      const testFile = join(testDir, 'invalid-ref.json');
      const tokenData = {
        color: {
          primary: {
            $value: '{nonexistent.token}',
            $type: 'color',
          },
        },
      };

      writeFileSync(testFile, JSON.stringify(tokenData, null, 2));

      expect(() => loadW3CTokens(testFile)).toThrow(/Reference not found/);
    });
  });

  describe('flattenW3CTokens', () => {
    it('should extract $value from W3C tokens', () => {
      const w3cTokens = {
        brand: {
          blue: {
            $value: '#0461DE',
            $type: 'color',
          },
        },
      };

      const result = flattenW3CTokens(w3cTokens);
      expect(result).toEqual({
        'brand.blue': '#0461DE',
      });
    });

    it('should flatten nested token structures', () => {
      const w3cTokens = {
        brand: {
          colors: {
            primary: {
              $value: '#0461DE',
              $type: 'color',
            },
            secondary: {
              $value: '#104D82',
              $type: 'color',
            },
          },
        },
      };

      const result = flattenW3CTokens(w3cTokens);
      expect(result).toEqual({
        'brand.colors.primary': '#0461DE',
        'brand.colors.secondary': '#104D82',
      });
    });

    it('should skip $schema and $description metadata', () => {
      const w3cTokens = {
        $schema: 'https://design-tokens.org/schema/0.1.0',
        $description: 'Test tokens',
        brand: {
          blue: {
            $value: '#0461DE',
            $type: 'color',
          },
        },
      };

      const result = flattenW3CTokens(w3cTokens);
      expect(result).toEqual({
        'brand.blue': '#0461DE',
      });
      expect(result).not.toHaveProperty('$schema');
      expect(result).not.toHaveProperty('$description');
    });

    it('should handle plain string values as fallback', () => {
      const tokens = {
        simple: 'value',
        nested: {
          key: 'another-value',
        },
      };

      const result = flattenW3CTokens(tokens);
      expect(result).toEqual({
        simple: 'value',
        'nested.key': 'another-value',
      });
    });

    it('should handle mixed W3C and plain values', () => {
      const tokens = {
        brand: {
          blue: {
            $value: '#0461DE',
            $type: 'color',
          },
        },
        legacy: {
          color: 'red',
        },
      };

      const result = flattenW3CTokens(tokens);
      expect(result).toEqual({
        'brand.blue': '#0461DE',
        'legacy.color': 'red',
      });
    });
  });

  describe('resolveW3CReferences', () => {
    it('should resolve {token.path} syntax', () => {
      const coreTokens: FlatTokens = {
        'brand.blue': '#0461DE',
      };

      const semanticTokens: FlatTokens = {
        'color.primary': '{brand.blue}',
      };

      const result = resolveW3CReferences(semanticTokens, coreTokens);
      expect(result).toEqual({
        'color.primary': '#0461DE',
      });
    });

    it('should resolve chained references', () => {
      const coreTokens: FlatTokens = {
        'brand.blue': '#0461DE',
        'semantic.primary': '{brand.blue}',
      };

      const tokens: FlatTokens = {
        'theme.main': '{semantic.primary}',
      };

      const result = resolveW3CReferences(tokens, coreTokens);
      expect(result).toEqual({
        'theme.main': '#0461DE',
      });
    });

    it('should resolve references within same token set', () => {
      const tokens: FlatTokens = {
        'brand.blue': '#0461DE',
        'color.primary': '{brand.blue}',
      };

      const result = resolveW3CReferences(tokens, {});
      expect(result).toEqual({
        'brand.blue': '#0461DE',
        'color.primary': '#0461DE',
      });
    });

    it('should handle non-reference values unchanged', () => {
      const tokens: FlatTokens = {
        'color.primary': '#0461DE',
        'spacing.base': '1rem',
      };

      const result = resolveW3CReferences(tokens, {});
      expect(result).toEqual({
        'color.primary': '#0461DE',
        'spacing.base': '1rem',
      });
    });

    it('should throw error for circular references', () => {
      const tokens: FlatTokens = {
        a: '{b}',
        b: '{c}',
        c: '{a}',
      };

      expect(() => resolveW3CReferences(tokens, {})).toThrow(/Circular reference/);
    });

    it('should throw error for missing references', () => {
      const tokens: FlatTokens = {
        'color.primary': '{brand.notfound}',
      };

      expect(() => resolveW3CReferences(tokens, {})).toThrow(
        /Reference not found.*brand\.notfound/
      );
    });

    it('should handle multiple references in same token set', () => {
      const coreTokens: FlatTokens = {
        'brand.blue': '#0461DE',
        'brand.white': '#FFFFFF',
        'brand.red': '#C5281F',
      };

      const semanticTokens: FlatTokens = {
        'color.primary': '{brand.blue}',
        'color.background': '{brand.white}',
        'color.error': '{brand.red}',
      };

      const result = resolveW3CReferences(semanticTokens, coreTokens);
      expect(result).toEqual({
        'color.primary': '#0461DE',
        'color.background': '#FFFFFF',
        'color.error': '#C5281F',
      });
    });

    it('should respect maxDepth parameter', () => {
      const tokens: FlatTokens = {
        a: '{b}',
        b: '{c}',
        c: '{d}',
        d: '#000',
      };

      // Should succeed with sufficient depth
      const result = resolveW3CReferences(tokens, {}, 10);
      expect(result['a']).toBe('#000');

      // Should fail with insufficient depth
      expect(() => resolveW3CReferences(tokens, {}, 2)).toThrow(/Circular reference/);
    });
  });

  describe('Integration tests', () => {
    it('should parse, flatten, and resolve complete token structure', () => {
      // Simulate W3C token file structure
      const w3cTokens = {
        $schema: 'https://design-tokens.org/schema/0.1.0',
        brand: {
          navy: { $value: '#104D82', $type: 'color' },
          blue: { $value: '#0461DE', $type: 'color' },
        },
      };

      const semanticW3C = {
        color: {
          primary: { $value: '{brand.blue}', $type: 'color' },
          secondary: { $value: '{brand.navy}', $type: 'color' },
        },
      };

      // Flatten both
      const coreFlat = flattenW3CTokens(w3cTokens);
      const semanticFlat = flattenW3CTokens(semanticW3C);

      // Resolve references
      const resolved = resolveW3CReferences(semanticFlat, coreFlat);

      expect(resolved).toEqual({
        'color.primary': '#0461DE',
        'color.secondary': '#104D82',
      });
    });

    it('should preserve $type information in flattening', () => {
      // Even though we only extract $value, we should handle tokens with $type
      const tokens = {
        spacing: {
          base: {
            $value: '1rem',
            $type: 'dimension',
          },
        },
        colors: {
          primary: {
            $value: '#0461DE',
            $type: 'color',
          },
        },
      };

      const result = flattenW3CTokens(tokens);
      expect(result).toEqual({
        'spacing.base': '1rem',
        'colors.primary': '#0461DE',
      });
    });
  });
});
