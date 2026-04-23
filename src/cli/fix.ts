/**
 * Fix: auto-generate or update derivable metadata in token source files.
 */

import { writeFileSync } from 'node:fs';
import type { FixResult, FixChange, LoadedTokens } from './types.js';
import type { FlatTokens } from '../build/utils/types.js';
import { isHex, roundedContrast, wcagLevel, resolveAnnotationPair } from './wcag-utils.js';
import { walkTokenNodes } from './walk.js';

function deepClone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function runFix(tokens: LoadedTokens, options?: { check?: boolean }): FixResult {
  const check = options?.check ?? false;
  const changes: FixChange[] = [];

  // Deep-clone rawFiles when in check mode so we never mutate the caller's data
  const files = check
    ? new Map([...tokens.rawFiles].map(([k, v]) => [k, deepClone(v)]))
    : tokens.rawFiles;

  for (const [filePath, content] of files) {
    const fc: FixChange[] = [];
    fixWcagAnnotations(content, tokens.resolved, filePath, fc);
    scaffoldExtensions(content, filePath, fc);
    inferMissingTypes(content, filePath, fc);
    if (fc.length > 0 && !check) writeFileSync(filePath, JSON.stringify(content, null, 2) + '\n');
    changes.push(...fc);
  }

  return { stale: changes.length > 0, changes };
}

function fixWcagAnnotations(
  content: Record<string, unknown>,
  resolved: FlatTokens,
  file: string,
  changes: FixChange[]
): void {
  walkTokenNodes(content, '', (node, path) => {
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
  });
}

function scaffoldExtensions(
  content: Record<string, unknown>,
  file: string,
  changes: FixChange[]
): void {
  walkTokenNodes(content, '', (node, path) => {
    if (!node.$extensions) {
      changes.push({ file, token: path, field: '$extensions', before: undefined, after: {} });
      node.$extensions = {};
    }
  });
}

function inferMissingTypes(
  content: Record<string, unknown>,
  file: string,
  changes: FixChange[]
): void {
  walkTokenNodes(content, '', (node, path) => {
    if (node.$type) return;
    const value = node.$value as string;
    // Skip reference values — their type comes from the referenced token
    if (/^\{.+\}$/.test(value)) return;
    const inferred = inferType(value);
    if (inferred) {
      changes.push({ file, token: path, field: '$type', before: undefined, after: inferred });
      node.$type = inferred;
    }
  });
}

export function inferType(value: string): string | null {
  // Matches 6-digit and 8-digit (with alpha) hex colors
  if (/^#[0-9a-fA-F]{6,8}$/.test(value)) return 'color';
  if (/^oklch\(/.test(value)) return 'color';
  if (/^-?\d+(\.\d+)?(px|rem|em)$/.test(value)) return 'dimension';
  if (/^\d+$/.test(value)) return 'number';
  return null;
}
