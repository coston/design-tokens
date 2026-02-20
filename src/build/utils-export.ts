/**
 * Utility functions export for @coston/design-tokens
 * These utilities can be imported and used in your application
 */

// Export all color utilities
export {
  parseOKLCH,
  toOKLCH,
  adjustLightness,
  adjustChroma,
  adjustHue,
  setLightness,
  setChroma,
  setHue,
  getComplementary,
  getAnalogous,
  getTriadic,
  getTetradic,
  getSplitComplementary,
  generateLightnessScale,
  generateColorScale,
  mixColors,
  desaturate,
  saturate,
  lighten,
  darken,
  isLight,
  isDark,
  oklchToRgb,
  rgbToHex,
  oklchToHex,
  // Gamut diagnostic utilities (for analysis only - no automatic clamping)
  isInGamut,
  findMaxChroma,
  getGamutInfo,
  type OKLCH,
} from './utils/color-utils.js';

// Export contrast validation utilities
export {
  getContrastRatio,
  checkContrast,
  validateTokenContrast,
  formatContrastRatio,
  getMinimumRatio,
  suggestContrastFix,
  type ContrastResult,
  type ValidationIssue,
} from './utils/contrast-validation.js';

// Export modular scale utilities
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
  type RatioName,
  type ScaleStep,
} from './utils/modular-scale.js';

// Export theme generator utilities
export {
  generateThemeFromColor,
  previewTheme,
  type ThemeGeneratorOptions,
  type GeneratedTheme,
} from './utils/theme-generator.js';
