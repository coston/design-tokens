/**
 * Diff: compare two token states and report changes.
 */

import type { DiffResult, TokenChange } from './types.js';
import type { FlatTokens } from '../build/utils/types.js';

function isHex(v: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(v);
}

function sRGBLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

function hexLuminance(hex: string): number {
  const h = hex.replace('#', '');
  return (
    0.2126 * sRGBLinear(parseInt(h.slice(0, 2), 16)) +
    0.7152 * sRGBLinear(parseInt(h.slice(2, 4), 16)) +
    0.0722 * sRGBLinear(parseInt(h.slice(4, 6), 16))
  );
}

function hexContrast(a: string, b: string): number {
  const l1 = hexLuminance(a);
  const l2 = hexLuminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function wcagLevel(ratio: number): string {
  if (ratio >= 7) return 'AAA';
  if (ratio >= 4.5) return 'AA';
  if (ratio >= 3) return 'AA Large';
  return 'Fail';
}

export function diffTokens(before: FlatTokens, after: FlatTokens, ref: string): DiffResult {
  const changes: TokenChange[] = [];
  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);

  for (const key of allKeys) {
    const old = before[key];
    const cur = after[key];

    if (old === undefined && cur !== undefined) {
      changes.push({ token: key, type: 'added', field: 'value', after: cur });
    } else if (old !== undefined && cur === undefined) {
      changes.push({ token: key, type: 'removed', field: 'value', before: old });
    } else if (old !== cur) {
      const change: TokenChange = {
        token: key,
        type: 'modified',
        field: 'value',
        before: old,
        after: cur,
      };

      if (isHex(old!) && isHex(cur!) && key.endsWith('-foreground')) {
        const bgKey = key.replace(/-foreground$/, '');
        if (after[bgKey]) {
          const rb = Math.round(hexContrast(old!, before[bgKey] ?? old!) * 100) / 100;
          const ra = Math.round(hexContrast(cur!, after[bgKey]) * 100) / 100;
          change.wcagImpact = {
            ratioBefore: rb,
            ratioAfter: ra,
            levelBefore: wcagLevel(rb),
            levelAfter: wcagLevel(ra),
          };
        }
      }

      changes.push(change);
    }
  }

  return {
    ref,
    changes,
    summary: {
      added: changes.filter(c => c.type === 'added').length,
      removed: changes.filter(c => c.type === 'removed').length,
      modified: changes.filter(c => c.type === 'modified').length,
      wcagRegressions: changes.filter(
        c => c.wcagImpact && c.wcagImpact.ratioAfter < c.wcagImpact.ratioBefore
      ).length,
    },
  };
}
