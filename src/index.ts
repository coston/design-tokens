/**
 * Design Tokens - Utility Library
 * @coston/design-tokens
 *
 * This package exports color utilities and theme generation functions.
 * For token data, import from '@coston/design-tokens/tokens.json'
 * For CSS variables, import '@coston/design-tokens/tokens.css'
 */

// Color manipulation utilities
export {
  parseOKLCH,
  toOKLCH,
  adjustLightness,
  adjustChroma,
  adjustHue,
  setLightness,
  setChroma,
  setHue,
  lighten,
  darken,
  saturate,
  desaturate,
  mixColors,
  oklchToHex,
  oklchToRgb,
  rgbToHex,
  isLight,
  isDark,
  getComplementary,
  getAnalogous,
  getTriadic,
  getTetradic,
  getSplitComplementary,
  generateLightnessScale,
  generateColorScale,
  isInGamut,
  findMaxChroma,
  getGamutInfo,
  warmGamutCache,
} from './build/utils/color-utils.js';

// Contrast validation
export {
  getContrastRatio,
  checkContrast,
  validateTokenContrast,
  formatContrastRatio,
  getMinimumRatio,
  suggestContrastFix,
} from './build/utils/contrast-validation.js';

// Modular scale utilities
export {
  RATIOS,
  generateScale,
  generateBidirectionalScale,
  generateSpacingScale,
  generateTypographyScale,
  generateCustomScale,
  generateTailwindSpacing,
  calculateRatio,
  findClosestRatio,
  generateScalePreview,
  interpolateScale,
} from './build/utils/modular-scale.js';

// Theme generation
export { generateThemeFromColor, previewTheme } from './build/utils/theme-generator.js';

// Re-export types
export type * from './build/utils/types.js';
