import { describe, it, expect } from 'vitest';
import { runFix, inferType } from './fix.js';
import type { LoadedTokens } from './types.js';

function makeTokens(overrides: Partial<LoadedTokens> = {}): LoadedTokens {
  return {
    flat: {},
    resolved: {},
    rawFiles: new Map(),
    coreTokens: {},
    semanticTokens: {},
    ...overrides,
  };
}

describe('inferType', () => {
  it('infers color from hex', () => {
    expect(inferType('#0461DE')).toBe('color');
    expect(inferType('#00000000')).toBe('color');
  });

  it('infers color from oklch', () => {
    expect(inferType('oklch(0.6 0.175 240)')).toBe('color');
  });

  it('infers dimension from px/rem/em', () => {
    expect(inferType('16px')).toBe('dimension');
    expect(inferType('1.5rem')).toBe('dimension');
    expect(inferType('0.875em')).toBe('dimension');
    expect(inferType('-4px')).toBe('dimension');
  });

  it('infers number from integers', () => {
    expect(inferType('400')).toBe('number');
    expect(inferType('0')).toBe('number');
  });

  it('returns null for unrecognized values', () => {
    expect(inferType('sans-serif')).toBeNull();
    expect(inferType('bold')).toBeNull();
    expect(inferType('{brand.blue}')).toBeNull();
  });
});

describe('runFix', () => {
  describe('$extensions scaffolding', () => {
    it('adds missing $extensions in check mode', () => {
      const raw = { color: { $value: '#000' } };
      const rawFiles = new Map<string, Record<string, unknown>>([['file.json', raw]]);
      const tokens = makeTokens({ rawFiles, resolved: { color: '#000000' } });
      const result = runFix(tokens, { check: true });
      expect(result.stale).toBe(true);
      expect(result.changes.some(c => c.field === '$extensions')).toBe(true);
    });

    it('skips tokens that already have $extensions', () => {
      const raw = { color: { $value: '#000', $extensions: { vendor: {} } } };
      const rawFiles = new Map<string, Record<string, unknown>>([['file.json', raw]]);
      const tokens = makeTokens({ rawFiles, resolved: { color: '#000000' } });
      const result = runFix(tokens, { check: true });
      expect(result.changes.filter(c => c.field === '$extensions')).toHaveLength(0);
    });
  });

  describe('$type inference', () => {
    it('infers $type for tokens missing it', () => {
      const raw = { color: { $value: '#0461DE' } };
      const rawFiles = new Map<string, Record<string, unknown>>([['file.json', raw]]);
      const tokens = makeTokens({ rawFiles, resolved: { color: '#0461DE' } });
      const result = runFix(tokens, { check: true });
      expect(result.changes.some(c => c.field === '$type' && c.after === 'color')).toBe(true);
    });

    it('does not overwrite existing $type', () => {
      const raw = { color: { $value: '#0461DE', $type: 'color' } };
      const rawFiles = new Map<string, Record<string, unknown>>([['file.json', raw]]);
      const tokens = makeTokens({ rawFiles, resolved: { color: '#0461DE' } });
      const result = runFix(tokens, { check: true });
      expect(result.changes.filter(c => c.field === '$type')).toHaveLength(0);
    });
  });

  describe('WCAG annotation updates', () => {
    it('detects stale WCAG ratios', () => {
      const raw = {
        primary: {
          $value: '#0461DE',
          $extensions: {
            vendor: {
              wcag: {
                onWhite: { ratio: 99, level: 'AAA' },
              },
            },
          },
        },
      };
      const rawFiles = new Map<string, Record<string, unknown>>([['file.json', raw]]);
      const tokens = makeTokens({ rawFiles, resolved: { primary: '#0461DE' } });
      const result = runFix(tokens, { check: true });
      expect(result.stale).toBe(true);
      expect(result.changes.some(c => c.field === 'wcag.onWhite')).toBe(true);
    });
  });

  describe('check mode', () => {
    it('does not mutate raw files in check mode', () => {
      const raw = { color: { $value: '#000' } } as Record<string, unknown>;
      const rawFiles = new Map<string, Record<string, unknown>>([['file.json', raw]]);
      const tokens = makeTokens({ rawFiles, resolved: { color: '#000000' } });
      const result = runFix(tokens, { check: true });
      expect(result.stale).toBe(true);
      // Original object must not be mutated
      expect((raw.color as Record<string, unknown>).$extensions).toBeUndefined();
      expect((raw.color as Record<string, unknown>).$type).toBeUndefined();
    });

    it('returns stale=false when nothing to fix', () => {
      const raw = {
        color: { $value: '#000', $type: 'color', $extensions: {} },
      };
      const rawFiles = new Map<string, Record<string, unknown>>([['file.json', raw]]);
      const tokens = makeTokens({ rawFiles, resolved: { color: '#000000' } });
      const result = runFix(tokens, { check: true });
      expect(result.stale).toBe(false);
    });
  });
});
