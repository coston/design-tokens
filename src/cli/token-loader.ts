/**
 * Generic token file discovery and loading for CLI commands.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { spawnSync } from 'node:child_process';
import { flattenW3CTokens, resolveW3CReferences } from '../build/utils/w3c-parser.js';
import type { FlatTokens } from '../build/utils/types.js';
import type { LoadedTokens, Config } from './types.js';

const SAFE_GIT_REF = /^[\w.\-/~^@{}:]+$/;

function gitExec(args: string[], cwd: string): string {
  const result = spawnSync('git', args, { cwd, encoding: 'utf-8', maxBuffer: 10 * 1024 * 1024 });
  if (result.status !== 0) {
    throw new Error(result.stderr?.trim() || `git ${args[0]} failed`);
  }
  return result.stdout;
}

function isDTCGFile(obj: Record<string, unknown>): boolean {
  if (typeof obj.$schema === 'string' && obj.$schema.includes('design-tokens')) return true;
  for (const value of Object.values(obj)) {
    if (value && typeof value === 'object' && '$value' in value) return true;
    if (value && typeof value === 'object' && !('$value' in value)) {
      for (const nested of Object.values(value as Record<string, unknown>)) {
        if (nested && typeof nested === 'object' && '$value' in nested) return true;
      }
    }
  }
  return false;
}

function findJsonFiles(dir: string): string[] {
  const results: string[] = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules' && entry.name !== 'dist') {
      results.push(...findJsonFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith('.json')) {
      results.push(fullPath);
    }
  }
  return results;
}

/**
 * Convert a glob pattern to a RegExp. Supports:
 * - `**` matches any number of path segments (including zero)
 * - `*`  matches anything except path separators
 * - `?`  matches a single non-separator character
 * - Literal characters are escaped for safe regex use
 */
function globToRegExp(pattern: string): RegExp {
  let re = '';
  let i = 0;
  while (i < pattern.length) {
    if (pattern[i] === '*' && pattern[i + 1] === '*') {
      // ** matches zero or more path segments
      re += '.*';
      i += 2;
      // skip trailing slash after **
      if (pattern[i] === '/') i++;
    } else if (pattern[i] === '*') {
      re += '[^/]*';
      i++;
    } else if (pattern[i] === '?') {
      re += '[^/]';
      i++;
    } else {
      re += pattern[i].replace(/[.+^${}()|[\]\\]/g, '\\$&');
      i++;
    }
  }
  return new RegExp(`^${re}$`);
}

export function matchesGlob(filePath: string, baseDir: string, pattern: string): boolean {
  const rel = relative(baseDir, filePath);
  return globToRegExp(pattern).test(rel);
}

function discoverTokenFiles(dir: string, config?: Config): string[] {
  if (config?.tokenPaths?.length) {
    const files: string[] = [];
    for (const pattern of config.tokenPaths) {
      if (pattern.includes('*')) {
        const baseDir = join(dir, pattern.split('*')[0]);
        if (existsSync(baseDir)) {
          const found = findJsonFiles(baseDir);
          files.push(...found.filter(f => matchesGlob(f, dir, pattern)));
        }
      } else {
        const fullPath = join(dir, pattern);
        if (existsSync(fullPath) && statSync(fullPath).isFile()) files.push(fullPath);
      }
    }
    return files;
  }

  const tokensDir = join(dir, 'tokens');
  if (existsSync(tokensDir) && statSync(tokensDir).isDirectory()) {
    return findJsonFiles(tokensDir);
  }
  // Also check src/tokens/ (this repo's layout)
  const srcTokensDir = join(dir, 'src', 'tokens');
  if (existsSync(srcTokensDir) && statSync(srcTokensDir).isDirectory()) {
    return findJsonFiles(srcTokensDir);
  }

  // Fallback: scan all JSON files in the directory
  return findJsonFiles(dir);
}

function isReference(value: string): boolean {
  return /^\{.+\}$/.test(value);
}

function hasReferences(flat: FlatTokens): boolean {
  return Object.values(flat).some(v => isReference(v));
}

function shouldIgnore(filePath: string, dir: string, config?: Config): boolean {
  if (!config?.lint?.ignorePaths?.length) return false;
  const rel = relative(dir, filePath);
  return config.lint.ignorePaths.some(pattern => {
    if (pattern.includes('**')) {
      const prefix = pattern.split('**')[0];
      return rel.startsWith(prefix);
    }
    return rel.startsWith(pattern);
  });
}

export function loadTokensFromDisk(dir: string, config?: Config): LoadedTokens {
  const files = discoverTokenFiles(dir, config);
  const rawFiles = new Map<string, Record<string, unknown>>();
  const coreTokens: FlatTokens = {};
  const semanticTokens: FlatTokens = {};

  for (const file of files) {
    if (shouldIgnore(file, dir, config)) continue;
    try {
      const content = JSON.parse(readFileSync(file, 'utf-8')) as Record<string, unknown>;
      if (!isDTCGFile(content)) continue;
      rawFiles.set(file, content);
      const flat = flattenW3CTokens(content as Parameters<typeof flattenW3CTokens>[0]);
      if (hasReferences(flat)) Object.assign(semanticTokens, flat);
      else Object.assign(coreTokens, flat);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      process.stderr.write(`warning: skipping ${file}: ${msg}\n`);
    }
  }

  let resolved: FlatTokens;
  try {
    const resolvedSemantic = resolveW3CReferences(semanticTokens, coreTokens);
    resolved = { ...coreTokens, ...resolvedSemantic };
  } catch {
    resolved = { ...coreTokens, ...semanticTokens };
  }

  return {
    flat: { ...coreTokens, ...semanticTokens },
    resolved,
    rawFiles,
    coreTokens,
    semanticTokens,
  };
}

export function loadTokensFromGitRef(dir: string, ref: string, _config?: Config): LoadedTokens {
  if (!SAFE_GIT_REF.test(ref)) {
    throw new Error(`Invalid git ref: ${ref}`);
  }

  const repoRoot = gitExec(['rev-parse', '--show-toplevel'], dir).trim();

  let filePaths: string[];
  try {
    let output = '';
    try {
      output = gitExec(['ls-tree', '-r', '--name-only', ref, '--', 'tokens/'], repoRoot);
    } catch {
      output = gitExec(['ls-tree', '-r', '--name-only', ref, '--', 'src/tokens/'], repoRoot);
    }
    filePaths = output
      .trim()
      .split('\n')
      .filter((f: string) => f.endsWith('.json'));
  } catch {
    filePaths = [];
  }

  const rawFiles = new Map<string, Record<string, unknown>>();
  const coreTokens: FlatTokens = {};
  const semanticTokens: FlatTokens = {};

  for (const filePath of filePaths) {
    try {
      const content = gitExec(['show', `${ref}:${filePath}`], repoRoot);
      const parsed = JSON.parse(content) as Record<string, unknown>;
      rawFiles.set(join(repoRoot, filePath), parsed);
      const flat = flattenW3CTokens(parsed as Parameters<typeof flattenW3CTokens>[0]);
      if (hasReferences(flat)) Object.assign(semanticTokens, flat);
      else Object.assign(coreTokens, flat);
    } catch {
      // git show may fail for deleted files in older refs
    }
  }

  let resolved: FlatTokens;
  try {
    const resolvedSemantic = resolveW3CReferences(semanticTokens, coreTokens);
    resolved = { ...coreTokens, ...resolvedSemantic };
  } catch {
    resolved = { ...coreTokens, ...semanticTokens };
  }

  return {
    flat: { ...coreTokens, ...semanticTokens },
    resolved,
    rawFiles,
    coreTokens,
    semanticTokens,
  };
}

export function loadConfig(dir: string): Config | undefined {
  for (const name of ['design-tokens.config.json', 'dtcg.config.json']) {
    const configPath = join(dir, name);
    if (existsSync(configPath)) {
      try {
        return JSON.parse(readFileSync(configPath, 'utf-8')) as Config;
      } catch {
        return undefined;
      }
    }
  }
  return undefined;
}
