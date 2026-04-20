#!/usr/bin/env node
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type {
  CoreTokens,
  SemanticTokens,
  ThemeOverrides,
  ResolvedTheme,
  FlatTokens,
  TokenCollection,
} from './utils/types.js';
import { flattenTokens, resolveReferences, mergeTokens } from './utils/merge-tokens.js';
import { oklchToHex, warmGamutCache } from './utils/color-utils.js';
import { generateThemeFromColor, generateMonochromaticTheme } from './utils/theme-generator.js';
import { themes as themeConfigs } from '../themes/themes.config.js';
import {
  validateTokens,
  type ValidationError,
  type ValidationWarning,
} from './utils/validate-tokens.js';
import {
  validateTokenContrast,
  formatContrastRatio,
  getMinimumRatio,
} from './utils/contrast-validation.js';
import { generateTokensCSS } from './generators/css-variables.js';
import { generateTailwindTheme } from './generators/tailwind-theme.js';
import { generateBaseLayer } from './generators/base-layer.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const rootDir = join(__dirname, '../..');
const distDir = join(rootDir, 'dist');

function loadJSON<T>(path: string): T {
  return JSON.parse(readFileSync(path, 'utf-8'));
}

function removePrefixFromKeys(obj: FlatTokens, prefix: string): FlatTokens {
  return Object.fromEntries(
    Object.entries(obj).map(([key, value]) => [key.replace(new RegExp(`^${prefix}`), ''), value])
  );
}

// Pure transformation functions
const isOKLCHValue = ([, value]: [string, string]): boolean =>
  typeof value === 'string' && value.startsWith('oklch(');

const convertToHex = ([key, value]: [string, string]): [string, string] => [key, oklchToHex(value)];

function generateFallbacks(tokens: FlatTokens): FlatTokens {
  return Object.fromEntries(Object.entries(tokens).filter(isOKLCHValue).map(convertToHex));
}

// Pure functions for theme generation
const createThemeVariant = (
  name: string,
  selector: string,
  overrides: Record<string, string>
): ThemeOverrides => ({
  theme: { name, selector, overrides },
});

function generateThemeVariants(config: {
  name: string;
  baseColor: string;
  variant?: 'default' | 'monochromatic';
  tokens?: { light: Record<string, string>; dark: Record<string, string> };
}) {
  const generatedTheme =
    config.tokens ??
    (config.variant === 'monochromatic'
      ? generateMonochromaticTheme({ baseColor: config.baseColor })
      : generateThemeFromColor({ baseColor: config.baseColor }));

  const lightSelector = config.name === 'light' ? ':root' : `[data-theme="${config.name}"]`;
  const darkName = config.name === 'light' ? 'dark' : `${config.name}-dark`;
  const darkSelector =
    config.name === 'light' ? ':root.dark' : `[data-theme="${config.name}"].dark`;

  return [
    createThemeVariant(config.name, lightSelector, generatedTheme.light),
    createThemeVariant(darkName, darkSelector, generatedTheme.dark),
  ];
}

// Helper to collect validation results across themes
interface ThemeValidationResult {
  theme: string;
  errors?: ValidationError[];
  warnings?: ValidationWarning[];
}

/**
 * Type guard to check if array has issues
 */
const hasIssues = <T>(arr: T[]): boolean => arr.length > 0;

/**
 * Collect validation results across themes
 * Uses filter + map pattern instead of conditional spread operators
 */
const collectValidationResults = (
  themes: Array<
    ResolvedTheme & { validation: { errors: ValidationError[]; warnings: ValidationWarning[] } }
  >
): { errors: ThemeValidationResult[]; warnings: ThemeValidationResult[] } => {
  return {
    errors: themes
      .filter(t => hasIssues(t.validation.errors))
      .map(t => ({ theme: t.name, errors: t.validation.errors })),
    warnings: themes
      .filter(t => hasIssues(t.validation.warnings))
      .map(t => ({ theme: t.name, warnings: t.validation.warnings })),
  };
};

const countTotal = (
  results: ThemeValidationResult[],
  getCount: (r: ThemeValidationResult) => number
): number => results.reduce((sum, r) => sum + getCount(r), 0);

function resolveTheme(
  theme: ThemeOverrides,
  resolvedSemantic: FlatTokens,
  allCoreTokens: FlatTokens
): ResolvedTheme & { validation: { errors: ValidationError[]; warnings: ValidationWarning[] } } {
  const mergedTokens = mergeTokens(resolvedSemantic, theme.theme.overrides);
  const resolved = resolveReferences(mergedTokens, { ...allCoreTokens, ...resolvedSemantic });
  const validation = validateTokens(resolved);
  const fallbacks = generateFallbacks(resolved);

  return {
    name: theme.theme.name,
    selector: theme.theme.selector,
    tokens: resolved,
    fallbacks,
    validation,
  };
}

// Load and merge all core token files
function loadCoreTokens(): FlatTokens {
  const coreFiles = ['colors', 'spacing', 'typography', 'radii'];

  return coreFiles
    .map(file => loadJSON<CoreTokens>(join(rootDir, `src/tokens/core/${file}.json`)))
    .map(token => flattenTokens(token as TokenCollection))
    .reduce((acc, tokens) => ({ ...acc, ...tokens }), {});
}

// Load and process semantic tokens
function loadSemanticTokens(): FlatTokens {
  const semanticData = loadJSON<SemanticTokens>(join(rootDir, 'src/tokens/semantic/tokens.json'));
  const semanticFlat = flattenTokens({ semantic: semanticData.semantic });
  return removePrefixFromKeys(semanticFlat, 'semantic.');
}

async function build() {
  console.log('Building design tokens...\n');

  // Pre-warm gamut mapping cache for better performance
  console.log('Pre-warming gamut cache...');
  warmGamutCache();

  console.log('Loading core tokens...');
  const allCoreTokens = loadCoreTokens();
  console.log(`   Loaded ${Object.keys(allCoreTokens).length} core tokens`);

  console.log('Loading semantic tokens...');
  const semanticTokens = loadSemanticTokens();
  console.log(`   Loaded ${Object.keys(semanticTokens).length} semantic tokens`);

  const resolvedSemantic = resolveReferences(semanticTokens, allCoreTokens);
  const semanticValidation = validateTokens(resolvedSemantic);

  if (semanticValidation.errors.length > 0) {
    console.error('\nSemantic token validation failed:');
    semanticValidation.errors.forEach(error => console.error(`   - ${error.message}`));
    throw new Error(
      `Found ${semanticValidation.errors.length} validation error(s) in semantic tokens`
    );
  }

  if (semanticValidation.warnings.length > 0) {
    console.warn('\nSemantic token warnings:');
    semanticValidation.warnings.forEach(warning => console.warn(`   - ${warning.message}`));
  }

  console.log('   Validated semantic tokens');

  console.log('Generating themes from config...');
  const themes = themeConfigs.flatMap(generateThemeVariants);
  console.log(`   Generated ${themes.length} themes from ${themeConfigs.length} configurations`);

  console.log('Resolving theme references...');
  const resolvedThemesWithValidation = themes.map(theme =>
    resolveTheme(theme, resolvedSemantic, allCoreTokens)
  );

  resolvedThemesWithValidation.forEach(theme => console.log(`   Resolved theme: ${theme.name}`));

  const { errors: allValidationErrors, warnings: allValidationWarnings } = collectValidationResults(
    resolvedThemesWithValidation
  );

  if (allValidationErrors.length > 0) {
    console.error('\nTheme validation failed:\n');
    allValidationErrors.forEach(({ theme, errors }) => {
      console.error(`   ${theme}:`);
      errors?.forEach(error => console.error(`      - ${error.message}`));
    });
    const totalErrors = countTotal(allValidationErrors, r => r.errors?.length ?? 0);
    throw new Error(
      `Found ${totalErrors} validation error(s) across ${allValidationErrors.length} theme(s)`
    );
  }

  if (allValidationWarnings.length > 0) {
    console.warn('\nTheme validation warnings:\n');
    allValidationWarnings.forEach(({ theme, warnings }) => {
      console.warn(`   ${theme}:`);
      warnings?.forEach(warning => console.warn(`      - ${warning.message}`));
    });
  }

  const resolvedThemes: ResolvedTheme[] = resolvedThemesWithValidation.map(
    ({ name, selector, tokens, fallbacks }) => ({ name, selector, tokens, fallbacks })
  );

  console.log('\nValidating contrast ratios (WCAG AA)...');
  const contrastByTheme = new Map(
    resolvedThemes.map(theme => [theme.name, validateTokenContrast(theme.tokens)])
  );

  resolvedThemes.forEach(theme => {
    const issues = contrastByTheme.get(theme.name)!;
    console.log(
      issues.length > 0
        ? `   ${theme.name}: ${issues.length} contrast issue(s)`
        : `   ${theme.name} passes WCAG AA`
    );
  });

  const themesWithIssues = Array.from(contrastByTheme.entries()).filter(
    ([, issues]) => issues.length > 0
  );

  if (themesWithIssues.length > 0) {
    console.error('\nContrast validation failed:\n');
    themesWithIssues.forEach(([theme, issues]) => {
      console.error(`   ${theme}:`);
      issues.forEach(issue => {
        const isLargeText = issue.level === 'AALarge';
        const minRatio = getMinimumRatio(isLargeText);
        console.error(
          `      - ${issue.pair}: ${formatContrastRatio(issue.ratio)} (needs ${minRatio}:1)`
        );
      });
    });
    const totalIssues = themesWithIssues.reduce((sum, [, issues]) => sum + issues.length, 0);
    throw new Error(
      `Found ${totalIssues} WCAG AA contrast violation(s) across ${themesWithIssues.length} theme(s)\n` +
        `Adjust lightness values to meet contrast requirements.`
    );
  }

  console.log('   All themes pass WCAG AA contrast requirements');

  mkdirSync(distDir, { recursive: true });

  console.log('\nGenerating CSS files...');
  const tokensCSSContent = generateTokensCSS(resolvedThemes);
  writeFileSync(join(distDir, 'tokens.css'), tokensCSSContent);
  writeFileSync(join(rootDir, 'tokens.css'), tokensCSSContent);
  console.log('   Generated tokens.css');

  const tailwindTheme = generateTailwindTheme(resolvedSemantic);
  const baseLayer = generateBaseLayer();
  const tailwindCSS = `/**
 * Tailwind Integration - Design Tokens
 * Generated from @coston/design-tokens
 *
 * Import this file AFTER @import "tailwindcss" in your application:
 *
 * @import "tailwindcss";
 * @import "@coston/design-tokens/tailwind.css";
 */

${tailwindTheme}

@layer base {
${generateTokensCSS(resolvedThemes)}
${baseLayer}
}
`;
  writeFileSync(join(distDir, 'tailwind.css'), tailwindCSS);
  writeFileSync(join(rootDir, 'tailwind.css'), tailwindCSS);
  console.log('   Generated tailwind.css');

  const tokensJSON = {
    core: allCoreTokens,
    semantic: resolvedSemantic,
    themes: Object.fromEntries(resolvedThemes.map(theme => [theme.name, theme.tokens])),
  };
  writeFileSync(join(distDir, 'tokens.json'), JSON.stringify(tokensJSON, null, 2));
  console.log('   Generated tokens.json');

  console.log('\nBuild complete!\n');
  console.log('Generated artifacts:');
  console.log('   - tokens.css (CSS variables, package root)');
  console.log('   - tailwind.css (Tailwind utilities, package root)');
  console.log('   - dist/tokens.css (CSS variables)');
  console.log('   - dist/tailwind.css (Tailwind utilities)');
  console.log('   - dist/tokens.json (token data)');
  console.log('\nNext: Run TypeScript compiler to build utilities (tsc)');
}

build().catch(error => {
  console.error('\nBuild failed:', error.message);
  process.exit(1);
});
