/**
 * Generic token file discovery and loading for CLI commands.
 */

import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { execSync } from 'node:child_process';
import { flattenW3CTokens, resolveW3CReferences } from '../build/utils/w3c-parser.js';
import type { FlatTokens } from '../build/utils/types.js';
import type { LoadedTokens, Config } from './types.js';

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

function discoverTokenFiles(dir: string, config?: Config): string[] {
  if (config?.tokenPaths?.length) {
    const files: string[] = [];
    for (const pattern of config.tokenPaths) {
      if (pattern.includes('*')) {
        const baseDir = join(dir, pattern.split('*')[0]);
        if (existsSync(baseDir)) files.push(...findJsonFiles(baseDir));
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

export function loadTokensFromDisk(dir: string, config?: Config): LoadedTokens {
  const files = discoverTokenFiles(dir, config);
  const rawFiles = new Map<string, Record<string, unknown>>();
  const coreTokens: FlatTokens = {};
  const semanticTokens: FlatTokens = {};

  for (const file of files) {
    try {
      const content = JSON.parse(readFileSync(file, 'utf-8')) as Record<string, unknown>;
      if (!isDTCGFile(content)) continue;
      rawFiles.set(file, content);
      const flat = flattenW3CTokens(content as Parameters<typeof flattenW3CTokens>[0]);
      if (hasReferences(flat)) Object.assign(semanticTokens, flat);
      else Object.assign(coreTokens, flat);
    } catch {
      // skip
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
  const repoRoot = execSync('git rev-parse --show-toplevel', {
    cwd: dir,
    encoding: 'utf-8',
  }).trim();

  let filePaths: string[];
  try {
    // Try tokens/ then src/tokens/
    let output = '';
    try {
      output = execSync(`git ls-tree -r --name-only ${ref} -- tokens/`, {
        cwd: repoRoot,
        encoding: 'utf-8',
      });
    } catch {
      output = execSync(`git ls-tree -r --name-only ${ref} -- src/tokens/`, {
        cwd: repoRoot,
        encoding: 'utf-8',
      });
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
      const content = execSync(`git show ${ref}:${filePath}`, { cwd: repoRoot, encoding: 'utf-8' });
      const parsed = JSON.parse(content) as Record<string, unknown>;
      rawFiles.set(join(repoRoot, filePath), parsed);
      const flat = flattenW3CTokens(parsed as Parameters<typeof flattenW3CTokens>[0]);
      if (hasReferences(flat)) Object.assign(semanticTokens, flat);
      else Object.assign(coreTokens, flat);
    } catch {
      // skip
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
