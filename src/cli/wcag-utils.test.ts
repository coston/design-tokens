import { describe, it, expect } from 'vitest';
import {
  isHex,
  hexLuminance,
  hexContrast,
  wcagLevel,
  roundedContrast,
  resolveAnnotationPair,
} from './wcag-utils.js';

describe('isHex', () => {
  it('accepts valid 6-digit hex', () => {
    expect(isHex('#000000')).toBe(true);
    expect(isHex('#FFFFFF')).toBe(true);
    expect(isHex('#0461DE')).toBe(true);
    expect(isHex('#aabbcc')).toBe(true);
  });

  it('rejects invalid values', () => {
    expect(isHex('#FFF')).toBe(false);
    expect(isHex('#00000000')).toBe(false);
    expect(isHex('000000')).toBe(false);
    expect(isHex('oklch(0.5 0.1 240)')).toBe(false);
    expect(isHex('')).toBe(false);
  });
});

describe('hexLuminance', () => {
  it('returns 0 for black', () => {
    expect(hexLuminance('#000000')).toBe(0);
  });

  it('returns 1 for white', () => {
    expect(hexLuminance('#FFFFFF')).toBeCloseTo(1, 4);
  });

  it('computes mid-range luminance', () => {
    const lum = hexLuminance('#808080');
    expect(lum).toBeGreaterThan(0.2);
    expect(lum).toBeLessThan(0.3);
  });
});

describe('hexContrast', () => {
  it('returns 21:1 for black on white', () => {
    expect(hexContrast('#000000', '#FFFFFF')).toBeCloseTo(21, 0);
  });

  it('returns 1:1 for same color', () => {
    expect(hexContrast('#0461DE', '#0461DE')).toBeCloseTo(1, 4);
  });

  it('is symmetric', () => {
    const ab = hexContrast('#0461DE', '#FFFFFF');
    const ba = hexContrast('#FFFFFF', '#0461DE');
    expect(ab).toBeCloseTo(ba, 10);
  });
});

describe('wcagLevel', () => {
  it('returns AAA for ratio >= 7', () => {
    expect(wcagLevel(7)).toBe('AAA');
    expect(wcagLevel(21)).toBe('AAA');
  });

  it('returns AA for ratio >= 4.5', () => {
    expect(wcagLevel(4.5)).toBe('AA');
    expect(wcagLevel(6.9)).toBe('AA');
  });

  it('returns AA Large for ratio >= 3', () => {
    expect(wcagLevel(3)).toBe('AA Large');
    expect(wcagLevel(4.49)).toBe('AA Large');
  });

  it('returns Fail for ratio < 3', () => {
    expect(wcagLevel(2.99)).toBe('Fail');
    expect(wcagLevel(1)).toBe('Fail');
  });
});

describe('roundedContrast', () => {
  it('returns a value rounded to 2 decimal places', () => {
    const r = roundedContrast('#000000', '#FFFFFF');
    expect(r).toBe(21);
  });

  it('rounds mid-range values', () => {
    const r = roundedContrast('#0461DE', '#FFFFFF');
    expect(Number.isInteger(r * 100)).toBe(true);
  });
});

describe('resolveAnnotationPair', () => {
  const resolved = {
    'color.primary': '#0461DE',
    'color.primary-foreground': '#FFFFFF',
    'color.background': '#FAFAFA',
    'sidebar.accent': '#334455',
  };

  it('resolves onWhite', () => {
    expect(resolveAnnotationPair('onWhite', 'color.primary', resolved)).toEqual([
      '#0461DE',
      '#FFFFFF',
    ]);
  });

  it('resolves whiteOn', () => {
    expect(resolveAnnotationPair('whiteOn', 'color.primary', resolved)).toEqual([
      '#FFFFFF',
      '#0461DE',
    ]);
  });

  it('resolves on<Name> pattern', () => {
    expect(resolveAnnotationPair('onBackground', 'color.primary', resolved)).toEqual([
      '#0461DE',
      '#FAFAFA',
    ]);
  });

  it('returns null for unknown token path', () => {
    expect(resolveAnnotationPair('onWhite', 'nonexistent', resolved)).toBeNull();
  });

  it('returns null for non-hex token value', () => {
    const withOklch = { 'color.primary': 'oklch(0.6 0.175 240)' };
    expect(resolveAnnotationPair('onWhite', 'color.primary', withOklch)).toBeNull();
  });
});
