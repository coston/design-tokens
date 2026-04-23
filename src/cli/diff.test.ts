import { describe, it, expect } from 'vitest';
import { diffTokens } from './diff.js';

describe('diffTokens', () => {
  it('detects added tokens', () => {
    const result = diffTokens({}, { 'color.primary': '#0461DE' }, 'HEAD~1');
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0]).toMatchObject({
      token: 'color.primary',
      type: 'added',
      after: '#0461DE',
    });
    expect(result.summary.added).toBe(1);
  });

  it('detects removed tokens', () => {
    const result = diffTokens({ 'color.primary': '#0461DE' }, {}, 'HEAD~1');
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0]).toMatchObject({
      token: 'color.primary',
      type: 'removed',
      before: '#0461DE',
    });
    expect(result.summary.removed).toBe(1);
  });

  it('detects modified tokens', () => {
    const result = diffTokens(
      { 'color.primary': '#0461DE' },
      { 'color.primary': '#FF0000' },
      'v1.0'
    );
    expect(result.changes).toHaveLength(1);
    expect(result.changes[0]).toMatchObject({
      type: 'modified',
      before: '#0461DE',
      after: '#FF0000',
    });
    expect(result.summary.modified).toBe(1);
  });

  it('reports no changes for identical tokens', () => {
    const tokens = { 'color.primary': '#0461DE', 'color.secondary': '#AABBCC' };
    const result = diffTokens(tokens, { ...tokens }, 'HEAD');
    expect(result.changes).toHaveLength(0);
    expect(result.summary).toEqual({ added: 0, removed: 0, modified: 0, wcagRegressions: 0 });
  });

  it('includes WCAG impact for foreground changes', () => {
    const before = {
      'color.primary': '#000000',
      'color.primary-foreground': '#FFFFFF',
    };
    const after = {
      'color.primary': '#000000',
      'color.primary-foreground': '#333333',
    };
    const result = diffTokens(before, after, 'HEAD~1');
    const change = result.changes.find(c => c.token === 'color.primary-foreground');
    expect(change?.wcagImpact).toBeDefined();
    expect(change!.wcagImpact!.ratioBefore).toBeGreaterThan(change!.wcagImpact!.ratioAfter);
    expect(result.summary.wcagRegressions).toBe(1);
  });

  it('does not attach WCAG impact to non-foreground tokens', () => {
    const result = diffTokens(
      { 'color.primary': '#000000' },
      { 'color.primary': '#111111' },
      'HEAD~1'
    );
    expect(result.changes[0].wcagImpact).toBeUndefined();
  });

  it('stores ref in result', () => {
    const result = diffTokens({}, {}, 'v2.0.0');
    expect(result.ref).toBe('v2.0.0');
  });

  it('handles mixed adds, removes, and modifications', () => {
    const before = { a: '#000000', b: '#111111' };
    const after = { b: '#222222', c: '#333333' };
    const result = diffTokens(before, after, 'HEAD');
    expect(result.summary.added).toBe(1);
    expect(result.summary.removed).toBe(1);
    expect(result.summary.modified).toBe(1);
  });
});
