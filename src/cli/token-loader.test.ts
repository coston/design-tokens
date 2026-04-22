import { describe, it, expect } from 'vitest';
import { loadTokensFromDisk, loadTokensFromGitRef } from './token-loader.js';
import { writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { join } from 'node:path';
import { tmpdir } from 'node:os';

const REPO_ROOT = join(import.meta.dirname, '../..');

function makeTmpTokenDir(): string {
  const dir = join(tmpdir(), `dt-test-${Date.now()}`);
  const tokensDir = join(dir, 'tokens');
  mkdirSync(tokensDir, { recursive: true });

  writeFileSync(
    join(tokensDir, 'core.json'),
    JSON.stringify({
      $schema: 'https://design-tokens.org/schema/0.1.0',
      brand: {
        blue: { $value: '#0461DE', $type: 'color' },
        red: { $value: '#DE0404', $type: 'color' },
      },
    })
  );

  writeFileSync(
    join(tokensDir, 'semantic.json'),
    JSON.stringify({
      $schema: 'https://design-tokens.org/schema/0.1.0',
      color: {
        primary: { $value: '{brand.blue}', $type: 'color' },
        destructive: { $value: '{brand.red}', $type: 'color' },
      },
    })
  );

  return dir;
}

describe('loadTokensFromDisk', () => {
  it('discovers and loads DTCG token files', () => {
    const dir = makeTmpTokenDir();
    try {
      const tokens = loadTokensFromDisk(dir);
      expect(Object.keys(tokens.resolved).length).toBeGreaterThan(0);
      expect(tokens.rawFiles.size).toBe(2);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('resolves references in semantic tokens', () => {
    const dir = makeTmpTokenDir();
    try {
      const tokens = loadTokensFromDisk(dir);
      // Resolved values should not contain {references}
      for (const value of Object.values(tokens.resolved)) {
        expect(value).not.toMatch(/^\{.+\}$/);
      }
      expect(tokens.resolved['color.primary']).toBe('#0461DE');
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('separates core and semantic tokens', () => {
    const dir = makeTmpTokenDir();
    try {
      const tokens = loadTokensFromDisk(dir);
      // Core tokens should have no references
      for (const value of Object.values(tokens.coreTokens)) {
        expect(value).not.toMatch(/^\{.+\}$/);
      }
      // Semantic tokens should have references (unresolved)
      const hasRef = Object.values(tokens.semanticTokens).some(v => /^\{.+\}$/.test(v));
      expect(hasRef).toBe(true);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });

  it('returns empty tokens for directory with no DTCG files', () => {
    const dir = join(tmpdir(), `dt-empty-${Date.now()}`);
    mkdirSync(join(dir, 'tokens'), { recursive: true });
    writeFileSync(join(dir, 'tokens', 'not-dtcg.json'), JSON.stringify({ foo: 'bar' }));
    try {
      const tokens = loadTokensFromDisk(dir);
      expect(Object.keys(tokens.resolved)).toHaveLength(0);
    } finally {
      rmSync(dir, { recursive: true, force: true });
    }
  });
});

describe('loadTokensFromGitRef', () => {
  it('rejects unsafe git refs', () => {
    expect(() => loadTokensFromGitRef(REPO_ROOT, '"; rm -rf /')).toThrow('Invalid git ref');
    expect(() => loadTokensFromGitRef(REPO_ROOT, '$(evil)')).toThrow('Invalid git ref');
    expect(() => loadTokensFromGitRef(REPO_ROOT, 'ref with spaces')).toThrow('Invalid git ref');
  });

  it('accepts valid git ref patterns', () => {
    // Should not throw on ref validation
    expect(() => {
      try {
        loadTokensFromGitRef(REPO_ROOT, 'HEAD~1');
      } catch (e) {
        if ((e as Error).message.includes('Invalid git ref')) throw e;
      }
    }).not.toThrow();
  });
});
