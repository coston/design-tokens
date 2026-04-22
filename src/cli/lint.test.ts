import { describe, it, expect } from 'vitest';
import { runLint } from './lint.js';
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

describe('runLint', () => {
  describe('broken-references', () => {
    it('reports unresolved references', () => {
      const tokens = makeTokens({
        semanticTokens: { 'color.primary': '{brand.missing}' },
        coreTokens: { 'brand.blue': '#0461DE' },
      });
      const result = runLint(tokens, { rules: ['broken-references'] });
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].rule).toBe('broken-references');
      expect(result.passed).toBe(false);
    });

    it('passes when all references resolve', () => {
      const tokens = makeTokens({
        semanticTokens: { 'color.primary': '{brand.blue}' },
        coreTokens: { 'brand.blue': '#0461DE' },
      });
      const result = runLint(tokens, { rules: ['broken-references'] });
      expect(result.errors).toHaveLength(0);
      expect(result.passed).toBe(true);
    });
  });

  describe('wcag-contrast', () => {
    it('flags low-contrast foreground/background pairs', () => {
      const tokens = makeTokens({
        resolved: {
          'color.primary': '#CCCCCC',
          'color.primary-foreground': '#DDDDDD',
        },
      });
      const result = runLint(tokens, { rules: ['wcag-contrast'] });
      expect(result.errors.length).toBeGreaterThan(0);
      expect(result.errors[0].rule).toBe('wcag-contrast');
    });

    it('passes for high-contrast pairs', () => {
      const tokens = makeTokens({
        resolved: {
          'color.primary': '#000000',
          'color.primary-foreground': '#FFFFFF',
        },
      });
      const result = runLint(tokens, { rules: ['wcag-contrast'] });
      expect(result.errors).toHaveLength(0);
    });

    it('respects custom contrast minimum', () => {
      const tokens = makeTokens({
        resolved: {
          'color.primary': '#666666',
          'color.primary-foreground': '#FFFFFF',
        },
      });
      // Default 4.5 should pass for this pair (~5.7:1)
      const pass = runLint(tokens, { rules: ['wcag-contrast'] });
      expect(pass.errors).toHaveLength(0);

      // Stricter 7:1 minimum should fail
      const strict = runLint(tokens, {
        rules: ['wcag-contrast'],
        config: { lint: { contrastMinimum: 7 } },
      });
      expect(strict.errors.length).toBeGreaterThan(0);
    });
  });

  describe('missing-pairs', () => {
    it('warns when background token has no foreground sibling', () => {
      const tokens = makeTokens({
        resolved: { 'color.primary': '#0461DE' },
      });
      const result = runLint(tokens, { rules: ['missing-pairs'] });
      expect(result.warnings.some(w => w.rule === 'missing-pairs')).toBe(true);
    });

    it('does not warn when foreground pair exists', () => {
      const tokens = makeTokens({
        resolved: {
          'color.primary': '#0461DE',
          'color.primary-foreground': '#FFFFFF',
        },
      });
      const result = runLint(tokens, { rules: ['missing-pairs'] });
      expect(result.warnings).toHaveLength(0);
    });

    it('skips exception tokens like border', () => {
      const tokens = makeTokens({
        resolved: { 'color.border': '#CCCCCC' },
      });
      const result = runLint(tokens, { rules: ['missing-pairs'] });
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('orphaned-tokens', () => {
    it('warns when core tokens are never referenced', () => {
      const tokens = makeTokens({
        coreTokens: { 'brand.blue': '#0461DE', 'brand.unused': '#FF0000' },
        semanticTokens: { 'color.primary': '{brand.blue}' },
      });
      const result = runLint(tokens, { rules: ['orphaned-tokens'] });
      expect(result.warnings).toHaveLength(1);
      expect(result.warnings[0].token).toBe('brand.unused');
    });

    it('respects allowlist', () => {
      const tokens = makeTokens({
        coreTokens: { 'brand.unused': '#FF0000' },
        semanticTokens: {},
      });
      const result = runLint(tokens, {
        rules: ['orphaned-tokens'],
        config: { lint: { orphanAllowlist: ['brand.unused'] } },
      });
      expect(result.warnings).toHaveLength(0);
    });

    it('skips generator prefixes like spacing.*', () => {
      const tokens = makeTokens({
        coreTokens: { 'spacing.4': '1rem' },
        semanticTokens: {},
      });
      const result = runLint(tokens, { rules: ['orphaned-tokens'] });
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('missing-metadata', () => {
    it('warns when $description is missing', () => {
      const rawFiles = new Map<string, Record<string, unknown>>([
        ['file.json', { color: { $value: '#000', $type: 'color' } }],
      ]);
      const tokens = makeTokens({ rawFiles });
      const result = runLint(tokens, { rules: ['missing-metadata'] });
      expect(result.warnings.some(w => w.message.includes('$description'))).toBe(true);
    });

    it('warns when $type is missing', () => {
      const rawFiles = new Map<string, Record<string, unknown>>([
        ['file.json', { color: { $value: '#000', $description: 'A color' } }],
      ]);
      const tokens = makeTokens({ rawFiles });
      const result = runLint(tokens, { rules: ['missing-metadata'] });
      expect(result.warnings.some(w => w.message.includes('$type'))).toBe(true);
    });

    it('passes when both are present', () => {
      const rawFiles = new Map<string, Record<string, unknown>>([
        ['file.json', { color: { $value: '#000', $type: 'color', $description: 'Black' } }],
      ]);
      const tokens = makeTokens({ rawFiles });
      const result = runLint(tokens, { rules: ['missing-metadata'] });
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('missing-semantic-roles', () => {
    it('warns when no primary/background/foreground tokens exist', () => {
      const tokens = makeTokens({ resolved: { 'color.accent': '#0461DE' } });
      const result = runLint(tokens, { rules: ['missing-semantic-roles'] });
      expect(result.warnings).toHaveLength(3);
    });

    it('passes when all roles are present', () => {
      const tokens = makeTokens({
        resolved: {
          'color.primary': '#0461DE',
          'color.background': '#FFFFFF',
          'color.foreground': '#000000',
        },
      });
      const result = runLint(tokens, { rules: ['missing-semantic-roles'] });
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('rule filtering', () => {
    it('only runs specified rules', () => {
      const tokens = makeTokens({
        coreTokens: { 'brand.orphan': '#FF0000' },
        semanticTokens: { 'color.primary': '{brand.missing}' },
        resolved: { 'color.accent': '#0461DE' },
      });
      const result = runLint(tokens, { rules: ['broken-references'] });
      expect(result.errors.every(e => e.rule === 'broken-references')).toBe(true);
      expect(result.warnings).toHaveLength(0);
    });
  });

  describe('summary', () => {
    it('correctly counts errors and warnings', () => {
      const tokens = makeTokens({
        semanticTokens: { 'color.primary': '{brand.missing}' },
        resolved: { 'color.accent': '#0461DE' },
      });
      const result = runLint(tokens);
      expect(result.summary.errors).toBe(result.errors.length);
      expect(result.summary.warnings).toBe(result.warnings.length);
    });
  });
});
