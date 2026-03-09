import { describe, it, expect } from 'vitest';
import { flattenW3CTokens, resolveW3CReferences } from './w3c-parser.js';
import type { FlatTokens } from './types.js';

describe('flattenW3CTokens', () => {
  it('extracts $value from W3C tokens', () => {
    const result = flattenW3CTokens({
      brand: { blue: { $value: '#0461DE', $type: 'color' } },
    });
    expect(result).toEqual({ 'brand.blue': '#0461DE' });
  });

  it('flattens nested token structures', () => {
    const result = flattenW3CTokens({
      brand: {
        colors: {
          primary: { $value: '#0461DE', $type: 'color' },
          secondary: { $value: '#104D82', $type: 'color' },
        },
      },
    });
    expect(result).toEqual({
      'brand.colors.primary': '#0461DE',
      'brand.colors.secondary': '#104D82',
    });
  });

  it('skips $schema and $description metadata', () => {
    const result = flattenW3CTokens({
      $schema: 'https://design-tokens.org/schema/0.1.0',
      $description: 'Test tokens',
      brand: { blue: { $value: '#0461DE', $type: 'color' } },
    });
    expect(result).toEqual({ 'brand.blue': '#0461DE' });
    expect(result).not.toHaveProperty('$schema');
    expect(result).not.toHaveProperty('$description');
  });

  it('handles plain string values as fallback', () => {
    const result = flattenW3CTokens({ simple: 'value', nested: { key: 'another-value' } });
    expect(result).toEqual({ simple: 'value', 'nested.key': 'another-value' });
  });

  it('handles mixed W3C and plain values', () => {
    const result = flattenW3CTokens({
      brand: { blue: { $value: '#0461DE', $type: 'color' } },
      legacy: { color: 'red' },
    });
    expect(result).toEqual({ 'brand.blue': '#0461DE', 'legacy.color': 'red' });
  });
});

describe('resolveW3CReferences', () => {
  it('resolves {token.path} syntax', () => {
    const result = resolveW3CReferences(
      { 'color.primary': '{brand.blue}' },
      { 'brand.blue': '#0461DE' }
    );
    expect(result).toEqual({ 'color.primary': '#0461DE' });
  });

  it('resolves chained references', () => {
    const result = resolveW3CReferences(
      { 'theme.main': '{semantic.primary}' },
      { 'brand.blue': '#0461DE', 'semantic.primary': '{brand.blue}' }
    );
    expect(result).toEqual({ 'theme.main': '#0461DE' });
  });

  it('resolves references within same token set', () => {
    const result = resolveW3CReferences(
      { 'brand.blue': '#0461DE', 'color.primary': '{brand.blue}' },
      {}
    );
    expect(result).toEqual({ 'brand.blue': '#0461DE', 'color.primary': '#0461DE' });
  });

  it('leaves non-reference values unchanged', () => {
    const result = resolveW3CReferences({ 'color.primary': '#0461DE', 'spacing.base': '1rem' }, {});
    expect(result).toEqual({ 'color.primary': '#0461DE', 'spacing.base': '1rem' });
  });

  it('throws on circular references', () => {
    expect(() => resolveW3CReferences({ a: '{b}', b: '{c}', c: '{a}' }, {})).toThrow(
      /Circular reference/
    );
  });

  it('throws on missing references', () => {
    expect(() => resolveW3CReferences({ 'color.primary': '{brand.notfound}' }, {})).toThrow(
      /Reference not found.*brand\.notfound/
    );
  });

  it('handles multiple references', () => {
    const result = resolveW3CReferences(
      { 'color.primary': '{brand.blue}', 'color.background': '{brand.white}' },
      { 'brand.blue': '#0461DE', 'brand.white': '#FFFFFF' }
    );
    expect(result).toEqual({ 'color.primary': '#0461DE', 'color.background': '#FFFFFF' });
  });

  it('respects maxDepth', () => {
    const tokens: FlatTokens = { a: '{b}', b: '{c}', c: '{d}', d: '#000' };
    expect(resolveW3CReferences(tokens, {}, 10)['a']).toBe('#000');
    expect(() => resolveW3CReferences(tokens, {}, 2)).toThrow(/Circular reference/);
  });
});

describe('integration', () => {
  it('flattens then resolves a complete W3C token structure', () => {
    const coreFlat = flattenW3CTokens({
      $schema: 'https://design-tokens.org/schema/0.1.0',
      brand: {
        navy: { $value: '#104D82', $type: 'color' },
        blue: { $value: '#0461DE', $type: 'color' },
      },
    });
    const semanticFlat = flattenW3CTokens({
      color: {
        primary: { $value: '{brand.blue}', $type: 'color' },
        secondary: { $value: '{brand.navy}', $type: 'color' },
      },
    });
    expect(resolveW3CReferences(semanticFlat, coreFlat)).toEqual({
      'color.primary': '#0461DE',
      'color.secondary': '#104D82',
    });
  });
});
