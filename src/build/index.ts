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
import { generateThemeFromColor } from './utils/theme-generator.js';
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

function generateThemeVariants(config: { name: string; baseColor: string }) {
  const generatedTheme = generateThemeFromColor({ baseColor: config.baseColor });

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
  writeFileSync(join(distDir, 'tokens.css'), generateTokensCSS(resolvedThemes));
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
  console.log('   Generated tailwind.css');

  const tokensJSON = {
    core: allCoreTokens,
    semantic: resolvedSemantic,
    themes: Object.fromEntries(resolvedThemes.map(theme => [theme.name, theme.tokens])),
  };
  writeFileSync(join(distDir, 'tokens.json'), JSON.stringify(tokensJSON, null, 2));
  console.log('   Generated tokens.json');

  const indexJS = `/**
 * Design Tokens - JavaScript Export
 * Generated from @coston/design-tokens
 */

export const tokens = ${JSON.stringify(tokensJSON, null, 2)};

export default tokens;
`;
  writeFileSync(join(distDir, 'index.js'), indexJS);
  console.log('   Generated index.js');

  const indexDTS = `/**
 * Design Tokens - TypeScript Definitions
 * Generated from @coston/design-tokens
 */

export interface FlatTokens {
  [key: string]: string;
}

export interface Tokens {
  core: FlatTokens;
  semantic: FlatTokens;
  themes: {
    [themeName: string]: FlatTokens;
  };
}

export declare const tokens: Tokens;
export default tokens;
`;
  writeFileSync(join(distDir, 'index.d.ts'), indexDTS);
  console.log('   Generated index.d.ts');

  console.log('\nGenerating utility exports...');

  const utilsDir = join(distDir, 'utils');
  mkdirSync(utilsDir, { recursive: true });

  const utilityFiles = ['color-utils', 'contrast-validation', 'modular-scale', 'theme-generator'];

  // Pure function to generate module content from exports
  const generateModuleContent = (file: string, exports: string[]): string =>
    `// ${file}.js - Auto-generated
${exports.map(exp => `export { ${exp} } from '../../src/build/utils/${file}.js';`).join('\n')}
`;

  // Separate side-effect layer: load modules and generate content
  const moduleResults = await Promise.all(
    utilityFiles.map(async file => {
      try {
        const modulePath = join(__dirname, 'utils', `${file}.js`);
        const module = await import(modulePath);
        const exports = Object.keys(module).filter(key => key !== 'default');
        return { file, content: generateModuleContent(file, exports), error: null };
      } catch (error) {
        return {
          file,
          content: null,
          error: error instanceof Error ? error.message : 'Unknown error',
        };
      }
    })
  );

  // Side-effect layer: write files and log results
  moduleResults.forEach(({ file, content, error }) => {
    if (content !== null) {
      writeFileSync(join(utilsDir, `${file}.js`), content);
    } else if (error) {
      console.warn(`   Could not process ${file}: ${error}`);
    }
  });

  const utilsJS = `/**
 * Utility Functions - JavaScript Export
 * Generated from @coston/design-tokens
 *
 * Import utilities like:
 * import { adjustHue, getComplementary } from '@coston/design-tokens/utils';
 */

export * from './utils/color-utils.js';
export * from './utils/contrast-validation.js';
export * from './utils/modular-scale.js';
export * from './utils/theme-generator.js';
`;

  writeFileSync(join(distDir, 'utils.js'), utilsJS);
  console.log('   Generated utils.js');

  // Generate TypeScript definitions for utils
  const utilsDTS = `/**
 * Utility Functions - TypeScript Definitions
 * Generated from @coston/design-tokens
 */

export interface OKLCH {
  l: number;
  c: number;
  h: number;
  a?: number;
}

export interface ContrastResult {
  ratio: number;
  AA: boolean;
  AALarge: boolean;
}

export interface ValidationIssue {
  pair: string;
  foreground: string;
  background: string;
  ratio: number;
  level: 'AA' | 'AALarge';
  passed: boolean;
}

export interface ScaleStep {
  name: string;
  multiplier: number;
}

export type RatioName =
  | 'minorSecond'
  | 'majorSecond'
  | 'minorThird'
  | 'majorThird'
  | 'perfectFourth'
  | 'augmentedFourth'
  | 'perfectFifth'
  | 'minorSixth'
  | 'goldenRatio'
  | 'majorSixth'
  | 'minorSeventh'
  | 'majorSeventh'
  | 'octave'
  | 'majorTenth'
  | 'majorEleventh'
  | 'majorTwelfth'
  | 'doubleOctave';

export declare const RATIOS: Record<RatioName, number>;

// Color utilities
export declare function parseOKLCH(color: string): OKLCH;
export declare function toOKLCH(color: OKLCH): string;
export declare function adjustLightness(color: string, amount: number): string;
export declare function adjustChroma(color: string, amount: number): string;
export declare function adjustHue(color: string, degrees: number): string;
export declare function setLightness(color: string, lightness: number): string;
export declare function setChroma(color: string, chroma: number): string;
export declare function setHue(color: string, hue: number): string;
export declare function getComplementary(color: string): string;
export declare function getAnalogous(color: string, angle?: number): string[];
export declare function getTriadic(color: string): string[];
export declare function getTetradic(color: string, angle?: number): string[];
export declare function getSplitComplementary(color: string, angle?: number): string[];
export declare function generateLightnessScale(baseColor: string, steps?: number): string[];
export declare function generateColorScale(baseColor: string, gamutMapping?: boolean): Record<string, string>;
export declare function mixColors(color1: string, color2: string, weight?: number): string;
export declare function desaturate(color: string, amount?: number): string;
export declare function saturate(color: string, amount?: number): string;
export declare function lighten(color: string, amount?: number): string;
export declare function darken(color: string, amount?: number): string;
export declare function isLight(color: string): boolean;
export declare function isDark(color: string): boolean;
export declare function oklchToRgb(color: string): { r: number; g: number; b: number };
export declare function rgbToHex(r: number, g: number, b: number): string;
export declare function oklchToHex(color: string): string;

// Gamut mapping utilities
export declare function isInGamut(color: string | OKLCH): boolean;
export declare function findMaxChroma(lightness: number, hue: number, precision?: number): number;
export declare function clampToGamut(color: string | OKLCH): string;
export declare function getGamutInfo(color: string | OKLCH): {
  inGamut: boolean;
  currentChroma: number;
  maxChroma: number;
  utilization: number;
};

// Contrast validation utilities
export declare function getContrastRatio(color1: string, color2: string): number;
export declare function checkContrast(foreground: string, background: string): ContrastResult;
export declare function validateTokenContrast(
  tokens: Record<string, string>,
  largeText?: boolean
): ValidationIssue[];
export declare function formatContrastRatio(ratio: number): string;
export declare function getMinimumRatio(largeText?: boolean): number;
export declare function suggestContrastFix(
  foreground: string,
  background: string,
  targetRatio?: number
): string | null;

// Modular scale utilities
export declare function generateScale(
  base: number,
  ratio: number,
  steps: number,
  unit?: 'rem' | 'px'
): string[];
export declare function generateBidirectionalScale(
  base: number,
  ratio: number,
  stepsBelow: number,
  stepsAbove: number,
  unit?: 'rem' | 'px'
): string[];
export declare function generateSpacingScale(
  base?: number,
  ratio?: number,
  unit?: 'rem' | 'px'
): Record<string, string>;
export declare function generateTypographyScale(
  base?: number,
  ratio?: number,
  unit?: 'rem' | 'px'
): Record<string, string>;
export declare function generateCustomScale(
  base: number,
  steps: ScaleStep[],
  unit?: 'rem' | 'px'
): Record<string, string>;
export declare function generateTailwindSpacing(
  base?: number,
  ratio?: number,
  unit?: 'rem' | 'px'
): Record<string, string>;
export declare function calculateRatio(smaller: number, larger: number): number;
export declare function findClosestRatio(value: number): {
  name: RatioName;
  ratio: number;
  difference: number;
};
export declare function generateScalePreview(
  base: number,
  ratio: number,
  steps: number,
  unit?: 'rem' | 'px'
): Array<{ step: number; value: string; relative: string }>;
export declare function interpolateScale(
  min: number,
  max: number,
  steps: number,
  unit?: 'rem' | 'px',
  easing?: 'linear' | 'exponential'
): string[];

// Theme generator utilities
export interface ThemeGeneratorOptions {
  baseColor: string;
  hueRange?: number;
  useComplementary?: boolean;
  chromaScale?: number;
  gamutMapping?: boolean;
}

export interface GeneratedTheme {
  light: Record<string, string>;
  dark: Record<string, string>;
}

export declare function generateThemeFromColor(options: ThemeGeneratorOptions): GeneratedTheme;
export declare function previewTheme(theme: GeneratedTheme): void;
`;
  writeFileSync(join(distDir, 'utils.d.ts'), utilsDTS);
  console.log('   Generated utils.d.ts');

  console.log('\nBuild complete!\n');
  console.log('Output:');
  console.log('   - dist/tokens.css');
  console.log('   - dist/tailwind.css');
  console.log('   - dist/tokens.json');
  console.log('   - dist/index.js');
  console.log('   - dist/index.d.ts');
  console.log('   - dist/utils.js');
  console.log('   - dist/utils.d.ts');
}

build().catch(error => {
  console.error('\nBuild failed:', error.message);
  process.exit(1);
});
