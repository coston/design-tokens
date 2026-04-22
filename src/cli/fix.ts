/**
 * Fix: auto-generate or update derivable metadata in token source files.
 */

import { writeFileSync } from 'node:fs';
import type { FixResult, FixChange, LoadedTokens } from './types.js';
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

function resolveAnnotationPair(
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

export function runFix(tokens: LoadedTokens, options?: { check?: boolean }): FixResult {
  const check = options?.check ?? false;
  const changes: FixChange[] = [];

  for (const [filePath, content] of tokens.rawFiles) {
    const fc: FixChange[] = [];
    walkFix(content, '', tokens.resolved, filePath, fc);
    walkScaffold(content, '', filePath, fc);
    walkInferType(content, '', filePath, fc);
    if (fc.length > 0 && !check) writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    changes.push(...fc);
  }

  return { stale: changes.length > 0, changes };
}

function walkFix(
  node: Record<string, unknown>,
  path: string,
  resolved: FlatTokens,
  file: string,
  changes: FixChange[]
): void {
  if ('$value' in node) {
    const ext = node.$extensions as Record<string, unknown> | undefined;
    if (!ext) return;
    for (const vd of Object.values(ext)) {
      if (typeof vd !== 'object' || vd === null) continue;
      const wcag = (vd as Record<string, unknown>).wcag as Record<string, unknown> | undefined;
      if (!wcag) continue;
      for (const [key, entry] of Object.entries(wcag)) {
        if (key === 'note' || key === 'rule' || key === 'forbidden') continue;
        if (typeof entry !== 'object' || entry === null) continue;
        const e = entry as Record<string, unknown>;
        if (typeof e.ratio !== 'number') continue;
        const pair = resolveAnnotationPair(key, path, resolved);
        if (!pair) continue;
        const [fg, bg] = pair;
        if (!isHex(fg) || !isHex(bg)) continue;
        try {
          const computed = Math.round(hexContrast(fg, bg) * 100) / 100;
          const level = wcagLevel(computed);
          if (e.ratio !== computed || e.level !== level) {
            changes.push({
              file,
              token: path,
              field: `wcag.${key}`,
              before: { ratio: e.ratio, level: e.level },
              after: { ratio: computed, level },
            });
            e.ratio = computed;
            e.level = level;
          }
        } catch {
          /* skip */
        }
      }
    }
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$') || typeof v !== 'object' || v === null) continue;
    walkFix(v as Record<string, unknown>, path ? `${path}.${k}` : k, resolved, file, changes);
  }
}

function walkScaffold(
  node: Record<string, unknown>,
  path: string,
  file: string,
  changes: FixChange[]
): void {
  if ('$value' in node) {
    if (!node.$extensions) {
      changes.push({ file, token: path, field: '$extensions', before: undefined, after: {} });
      node.$extensions = {};
    }
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$') || typeof v !== 'object' || v === null) continue;
    walkScaffold(v as Record<string, unknown>, path ? `${path}.${k}` : k, file, changes);
  }
}

function walkInferType(
  node: Record<string, unknown>,
  path: string,
  file: string,
  changes: FixChange[]
): void {
  if ('$value' in node) {
    if (!node.$type) {
      const inferred = inferType(node.$value as string);
      if (inferred) {
        changes.push({ file, token: path, field: '$type', before: undefined, after: inferred });
        node.$type = inferred;
      }
    }
    return;
  }
  for (const [k, v] of Object.entries(node)) {
    if (k.startsWith('$') || typeof v !== 'object' || v === null) continue;
    walkInferType(v as Record<string, unknown>, path ? `${path}.${k}` : k, file, changes);
  }
}

function inferType(value: string): string | null {
  if (/^#[0-9a-fA-F]{6,8}$/.test(value)) return 'color';
  if (/^oklch\(/.test(value)) return 'color';
  if (/^-?\d+(\.\d+)?(px|rem|em)$/.test(value)) return 'dimension';
  if (/^\d+$/.test(value)) return 'number';
  return null;
}
