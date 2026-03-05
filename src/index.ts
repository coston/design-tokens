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
