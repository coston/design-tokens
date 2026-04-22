/**
 * Lint: validate W3C DTCG token files.
 */

import type { LintIssue, LintResult, LoadedTokens, Config } from './types.js';
import type { FlatTokens } from '../build/utils/types.js';
import {
  isHex,
  hexContrast,
  wcagLevel,
  roundedContrast,
  resolveAnnotationPair,
} from './wcag-utils.js';
import { walkTokenNodes } from './walk.js';

// ---------------------------------------------------------------------------
// Rules
// ---------------------------------------------------------------------------

function brokenReferences(semantic: FlatTokens, core: FlatTokens): LintIssue[] {
  const all = { ...core, ...semantic };
  const issues: LintIssue[] = [];
  for (const [key, value] of Object.entries(semantic)) {
    const m = value.match(/^\{(.+)\}$/);
    if (m && !(m[1] in all)) {
      issues.push({
        rule: 'broken-references',
        severity: 'error',
        token: key,
        message: `Unresolved reference {${m[1]}}`,
      });
    }
  }
  return issues;
}

const PAIR_EXCEPTIONS = new Set(['border', 'input', 'ring', 'background', 'foreground']);

function missingPairs(resolved: FlatTokens): LintIssue[] {
  const issues: LintIssue[] = [];
  const keys = new Set(Object.keys(resolved));
  for (const key of keys) {
    if (key.endsWith('-foreground')) continue;
    const last = key.split('.').pop() ?? '';
    if (PAIR_EXCEPTIONS.has(last)) continue;
    if (!key.startsWith('color.') && !key.startsWith('sidebar.')) continue;
    if (!keys.has(`${key}-foreground`)) {
      issues.push({
        rule: 'missing-pairs',
        severity: 'warning',
        token: key,
        message: `Missing foreground pair: expected ${key}-foreground`,
      });
    }
  }
  return issues;
}

function wcagContrast(resolved: FlatTokens, minimum = 4.5): LintIssue[] {
  const issues: LintIssue[] = [];
  for (const key of Object.keys(resolved)) {
    if (!key.endsWith('-foreground')) continue;
    const bgKey = key.replace(/-foreground$/, '');
    const fg = resolved[key];
    const bg = resolved[bgKey];
    if (!fg || !bg || !isHex(fg) || !isHex(bg)) continue;
    const ratio = Math.round(hexContrast(fg, bg) * 100) / 100;
    if (ratio < minimum) {
      issues.push({
        rule: 'wcag-contrast',
        severity: 'error',
        token: `${key} / ${bgKey}`,
        message: `Contrast ratio ${ratio.toFixed(2)}:1 fails WCAG AA (minimum ${minimum}:1)`,
        details: { foreground: fg, background: bg, ratio, level: wcagLevel(ratio) },
      });
    }
  }
  return issues;
}

function staleAnnotations(
  resolved: FlatTokens,
  rawFiles: Map<string, Record<string, unknown>>
): LintIssue[] {
  const issues: LintIssue[] = [];
  for (const [, content] of rawFiles) {
    walkTokenNodes(content, '', (node, path) => {
      const ext = node.$extensions as Record<string, unknown> | undefined;
      if (!ext) return;
      for (const vd of Object.values(ext)) {
        if (typeof vd !== 'object' || vd === null) continue;
        const wcag = (vd as Record<string, unknown>).wcag as Record<string, unknown> | undefined;
        if (!wcag) continue;
        for (const [key, entry] of Object.entries(wcag)) {
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
            issues.push({
              rule: 'stale-annotations',
              severity: 'warning',
              token: path,
              message: `Stale WCAG annotation [${key}]: source says ${e.ratio}:1 (${e.level}), computed ${computed}:1 (${level})`,
            });
          }
        }
      }
    });
  }
  return issues;
}

const GENERATOR_PREFIXES = [
  'spacing.',
  'radii.',
  'radius.',
  'fontFamily.',
  'fontSize.',
  'fontWeight.',
  'lineHeight.',
  'tracking.',
  'trackingScale.',
  'gradient.',
  'shadow.',
  'shadowScale.',
];

function orphanedTokens(
  core: FlatTokens,
  semantic: FlatTokens,
  allowlist: string[] = []
): LintIssue[] {
  const allow = new Set(allowlist);
  const referenced = new Set<string>();
  for (const v of Object.values(semantic)) {
    const m = v.match(/^\{(.+)\}$/);
    if (m) referenced.add(m[1]);
  }
  const issues: LintIssue[] = [];
  for (const key of Object.keys(core)) {
    if (allow.has(key) || referenced.has(key)) continue;
    if (GENERATOR_PREFIXES.some(p => key.startsWith(p))) continue;
    issues.push({
      rule: 'orphaned-tokens',
      severity: 'warning',
      token: key,
      message: 'Token is defined but never referenced by any semantic token',
    });
  }
  return issues;
}

function missingMetadata(rawFiles: Map<string, Record<string, unknown>>): LintIssue[] {
  const issues: LintIssue[] = [];
  for (const [, content] of rawFiles) {
    walkTokenNodes(content, '', (node, path) => {
      if (!node.$description)
        issues.push({
          rule: 'missing-metadata',
          severity: 'warning',
          token: path,
          message: 'Token is missing $description',
        });
      if (!node.$type)
        issues.push({
          rule: 'missing-metadata',
          severity: 'warning',
          token: path,
          message: 'Token is missing $type',
        });
    });
  }
  return issues;
}

const EXPECTED_ROLES = [
  { pattern: /\bprimary\b/, name: 'primary' },
  { pattern: /\bbackground\b/, name: 'background' },
  { pattern: /\bforeground\b/, name: 'foreground' },
];

function missingSemanticRoles(resolved: FlatTokens): LintIssue[] {
  const keys = Object.keys(resolved);
  return EXPECTED_ROLES.filter(r => !keys.some(k => r.pattern.test(k))).map(r => ({
    rule: 'missing-semantic-roles',
    severity: 'warning' as const,
    token: r.name,
    message: `No token matching "${r.name}" found`,
  }));
}

// ---------------------------------------------------------------------------
// Runner
// ---------------------------------------------------------------------------

export function runLint(
  tokens: LoadedTokens,
  options?: { rules?: string[]; config?: Config }
): LintResult {
  const active = options?.rules?.length ? new Set(options.rules) : null;
  const cfg = options?.config;
  const all: LintIssue[] = [];

  const run = (name: string, fn: () => LintIssue[]) => {
    if (!active || active.has(name)) all.push(...fn());
  };

  run('broken-references', () => brokenReferences(tokens.semanticTokens, tokens.coreTokens));
  run('missing-pairs', () => missingPairs(tokens.resolved));
  run('wcag-contrast', () => wcagContrast(tokens.resolved, cfg?.lint?.contrastMinimum));
  run('stale-annotations', () => staleAnnotations(tokens.resolved, tokens.rawFiles));
  run('orphaned-tokens', () =>
    orphanedTokens(tokens.coreTokens, tokens.semanticTokens, cfg?.lint?.orphanAllowlist)
  );
  run('missing-metadata', () => missingMetadata(tokens.rawFiles));
  run('missing-semantic-roles', () => missingSemanticRoles(tokens.resolved));

  const errors = all.filter(i => i.severity === 'error');
  const warnings = all.filter(i => i.severity === 'warning');
  return {
    passed: errors.length === 0,
    errors,
    warnings,
    summary: { errors: errors.length, warnings: warnings.length },
  };
}
