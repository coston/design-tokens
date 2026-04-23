#!/usr/bin/env node
/* eslint-disable no-console */

/**
 * design-tokens CLI
 * Init, lint, diff, and fix W3C DTCG token files.
 */

import { loadTokensFromDisk, loadTokensFromGitRef, loadConfig } from './token-loader.js';
import { runLint } from './lint.js';
import { diffTokens } from './diff.js';
import { runFix } from './fix.js';
import { formatLintResult, formatDiffResult, formatFixResult } from './formatters.js';
import { generateThemeFromColor } from '../build/utils/theme-generator.js';
import { hexToOKLCH } from '../build/utils/color-utils.js';
import { writeFileSync, mkdirSync, existsSync, readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

interface Flags {
  json: boolean;
  check: boolean;
  help: boolean;
  version: boolean;
  noDark: boolean;
  rules?: string[];
  outDir?: string;
  dir?: string;
  hueRange?: number;
  chromaScale?: number;
}

function parseArgs(argv: string[]): { command: string; positionals: string[]; flags: Flags } {
  const args = argv.slice(2);
  const command = args[0] ?? '';
  const positionals: string[] = [];
  const flags: Flags = { json: false, check: false, help: false, version: false, noDark: false };

  for (let i = 1; i < args.length; i++) {
    const arg = args[i];
    if (arg === '--json') flags.json = true;
    else if (arg === '--check') flags.check = true;
    else if (arg === '--help' || arg === '-h') flags.help = true;
    else if (arg === '--version' || arg === '-v') flags.version = true;
    else if (arg === '--no-dark') flags.noDark = true;
    else if (arg === '--dir' && i + 1 < args.length) flags.dir = args[++i];
    else if (arg === '--rule' && i + 1 < args.length) {
      flags.rules = flags.rules ?? [];
      flags.rules.push(args[++i]);
    } else if (arg === '--out' && i + 1 < args.length) flags.outDir = args[++i];
    else if (arg === '--hue-range' && i + 1 < args.length) flags.hueRange = parseFloat(args[++i]);
    else if (arg === '--chroma-scale' && i + 1 < args.length)
      flags.chromaScale = parseFloat(args[++i]);
    else if (!arg.startsWith('-')) positionals.push(arg);
  }

  return { command, positionals, flags };
}

function getVersion(): string {
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const pkgPath = join(__dirname, '..', '..', 'package.json');
  try {
    const pkg = JSON.parse(readFileSync(pkgPath, 'utf-8')) as { version: string };
    return pkg.version;
  } catch {
    return 'unknown';
  }
}

function printHelp(): void {
  console.log(
    `
design-tokens - Init, lint, diff, and fix W3C DTCG token files

Usage:
  design-tokens init <color>            Generate tokens from a base color
  design-tokens lint [dir]              Validate token files
  design-tokens diff [ref] [--dir dir]  Compare tokens against a git ref
  design-tokens fix [dir]               Auto-generate derivable metadata

Init flags:
  <color>            Base color as hex ("#0461DE") or OKLCH ("oklch(0.6 0.175 240)")
  --out <dir>        Output directory (default: ./tokens)
  --no-dark          Skip dark theme generation
  --hue-range <n>    Hue variation in degrees (default: 20)
  --chroma-scale <n> Chroma multiplier 0-1 (default: 1)

Lint flags:
  --rule <name>      Run only specific rule(s) (can repeat)

Diff flags:
  --dir <dir>        Token directory to compare (default: .)

Fix flags:
  --check            Dry run, exit 1 if anything is stale

Global flags:
  --json             Output as JSON
  --version, -v      Show version
  --help, -h         Show this help
`.trim()
  );
}

function main(): void {
  const { command, positionals, flags } = parseArgs(process.argv);

  if (flags.version || command === '--version' || command === '-v') {
    console.log(getVersion());
    process.exit(0);
  }

  if (flags.help || !command || command === '--help' || command === '-h') {
    printHelp();
    process.exit(0);
  }

  let exitCode: number;

  switch (command) {
    case 'init': {
      const baseColor = positionals[0];
      if (!baseColor) {
        console.error('Error: base color required. Example: design-tokens init "#0461DE"');
        process.exit(1);
      }
      try {
        // Convert hex to OKLCH if needed (generateThemeFromColor expects OKLCH)
        const oklchColor = baseColor.startsWith('#') ? hexToOKLCH(baseColor) : baseColor;
        const theme = generateThemeFromColor({
          baseColor: oklchColor,
          hueRange: flags.hueRange,
          chromaScale: flags.chromaScale,
        });
        const outDir = flags.outDir ?? './tokens';
        if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

        const files: string[] = [];
        const lightFile = join(outDir, 'colors.json');
        writeFileSync(
          lightFile,
          JSON.stringify(
            {
              $schema: 'https://design-tokens.org/schema/0.1.0',
              $description: `Generated light theme from ${baseColor}`,
              color: Object.fromEntries(
                Object.entries(theme.light).map(([k, v]) => [k, { $value: v, $type: 'color' }])
              ),
            },
            null,
            2
          ) + '\n'
        );
        files.push(lightFile);

        if (!flags.noDark) {
          const darkFile = join(outDir, 'colors-dark.json');
          writeFileSync(
            darkFile,
            JSON.stringify(
              {
                $schema: 'https://design-tokens.org/schema/0.1.0',
                $description: `Generated dark theme from ${baseColor}`,
                color: Object.fromEntries(
                  Object.entries(theme.dark).map(([k, v]) => [k, { $value: v, $type: 'color' }])
                ),
              },
              null,
              2
            ) + '\n'
          );
          files.push(darkFile);
        }

        const count =
          Object.keys(theme.light).length + (flags.noDark ? 0 : Object.keys(theme.dark).length);
        if (flags.json) {
          console.log(JSON.stringify({ files, tokenCount: count }, null, 2));
        } else {
          console.log(`Generated ${count} tokens:`);
          for (const f of files) console.log(`  ${f}`);
        }
        exitCode = 0;
      } catch (err) {
        console.error(`Error: ${err instanceof Error ? err.message : String(err)}`);
        exitCode = 1;
      }
      break;
    }
    case 'lint': {
      const dir = positionals[0] ?? '.';
      const config = loadConfig(dir);
      const tokens = loadTokensFromDisk(dir, config);
      const result = runLint(tokens, { rules: flags.rules, config });
      console.log(formatLintResult(result, flags.json));
      exitCode = result.errors.length > 0 ? 1 : result.warnings.length > 0 ? 2 : 0;
      break;
    }
    case 'diff': {
      const ref = positionals[0] ?? 'HEAD~1';
      const dir = flags.dir ?? positionals[1] ?? '.';
      const config = loadConfig(dir);
      const current = loadTokensFromDisk(dir, config);
      const baseline = loadTokensFromGitRef(dir, ref, config);
      const result = diffTokens(baseline.resolved, current.resolved, ref);
      console.log(formatDiffResult(result, flags.json));
      exitCode = result.summary.wcagRegressions > 0 ? 1 : 0;
      break;
    }
    case 'fix': {
      const dir = positionals[0] ?? '.';
      const config = loadConfig(dir);
      const tokens = loadTokensFromDisk(dir, config);
      const result = runFix(tokens, { check: flags.check });
      console.log(formatFixResult(result, flags.json));
      exitCode = flags.check && result.stale ? 1 : 0;
      break;
    }
    default:
      console.error(`Unknown command: ${command}`);
      printHelp();
      exitCode = 1;
  }

  process.exit(exitCode);
}

main();
