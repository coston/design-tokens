/**
 * Fix: auto-generate or update derivable metadata in token source files.
 */

import { writeFileSync } from 'node:fs';
import type { FixResult, FixChange, LoadedTokens } from './types.js';
import type { FlatTokens } from '../build/utils/types.js';
import { isHex, roundedContrast, wcagLevel, resolveAnnotationPair } from './wcag-utils.js';

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
        const computed = roundedContrast(fg, bg);
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

export function inferType(value: string): string | null {
  if (/^#[0-9a-fA-F]{6,8}$/.test(value)) return 'color';
  if (/^oklch\(/.test(value)) return 'color';
  if (/^-?\d+(\.\d+)?(px|rem|em)$/.test(value)) return 'dimension';
  if (/^\d+$/.test(value)) return 'number';
  return null;
}
