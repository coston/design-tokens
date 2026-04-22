/**
 * Shared hex-based WCAG contrast utilities for CLI commands.
 * These operate on resolved hex values, independent of the OKLCH pipeline.
 */

import type { FlatTokens } from '../build/utils/types.js';

export function isHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

function sRGBLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function hexLuminance(hex: string): number {
  const h = hex.replace('#', '');
  return (
    0.2126 * sRGBLinear(parseInt(h.slice(0, 2), 16)) +
    0.7152 * sRGBLinear(parseInt(h.slice(2, 4), 16)) +
    0.0722 * sRGBLinear(parseInt(h.slice(4, 6), 16))
  );
}

export function hexContrast(a: string, b: string): number {
  const l1 = hexLuminance(a);
  const l2 = hexLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

export function wcagLevel(ratio: number): string {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

export function roundedContrast(fg: string, bg: string): number {
  return Math.round(hexContrast(fg, bg) * 100) / 100;
}

/**
 * Resolve a WCAG annotation key (e.g. "onWhite", "onBackground") to a
 * [foreground, background] hex pair using known naming conventions.
 */
export function resolveAnnotationPair(
  key: string,
  tokenPath: string,
  resolved: FlatTokens
): [string, string] | null {
  const hex = resolved[tokenPath];
  if (!hex || !isHex(hex)) return null;
  if (key === 'onWhite') return [hex, '#FFFFFF'];
  if (key === 'whiteOn') return ['#FFFFFF', hex];
  if (key.startsWith('on')) {
    const name = key.slice(2);
    for (const pfx of ['color.', 'sidebar.', '']) {
      const bg = resolved[pfx + name.charAt(0).toLowerCase() + name.slice(1)];
      if (bg && isHex(bg)) return [hex, bg];
    }
  }
  if (key.endsWith('ForegroundOn')) {
    const base = key.slice(0, -'ForegroundOn'.length);
    for (const pfx of ['color.', 'sidebar.', '']) {
      const fg = resolved[pfx + base + '-foreground'];
      if (fg && isHex(fg)) return [fg, hex];
    }
  }
  return null;
}
