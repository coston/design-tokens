/**
 * @coston/design-tokens
 *
 * Design token system for modern web applications.
 *
 * ## Primary Usage (CSS Variables)
 * ```css
 * @import '@coston/design-tokens/tokens.css';
 * ```
 *
 * ## Token Data
 * ```typescript
 * import tokens from '@coston/design-tokens/tokens.json';
 * ```
 *
 * ## Custom Theme Generation (Optional)
 * ```typescript
 * import { generateThemeFromColor } from '@coston/design-tokens';
 * ```
 */

// Theme generation - the only utility most users need
export {
  generateThemeFromColor,
  type GeneratedTheme,
  type ThemeGeneratorOptions,
} from './build/utils/theme-generator.js';

// W3C Design Tokens Format support
export {
  parseW3CTokens,
  flattenW3CTokens,
  resolveW3CReferences,
  loadW3CTokens,
} from './build/utils/w3c-parser.js';

// Color utilities for custom build systems
export { hexToOKLCH, oklchToHex, warmGamutCache } from './build/utils/color-utils.js';

// Token merging and resolution
export { flattenTokens, resolveReferences, mergeTokens } from './build/utils/merge-tokens.js';

// Contrast validation (WCAG AA/AAA)
export {
  getContrastRatio,
  checkContrast,
  validateTokenContrast,
  formatContrastRatio,
  getMinimumRatio,
  suggestContrastFix,
  type ContrastResult,
  type ValidationIssue,
} from './build/utils/contrast-validation.js';

// Type definitions
export type { FlatTokens, TokenCollection } from './build/utils/types.js';
