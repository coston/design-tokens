import type { ResolvedTheme } from '../utils/types.js';

/**
 * Format CSS variables with indent
 */
function formatCSSVariable(entries: [string, string][], indent: string): string {
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, value]) => `${indent}--${key}: ${value};`)
    .join('\n');
}

/**
 * Generate CSS custom properties for a theme
 * Progressive enhancement: hex fallbacks with OKLCH override
 */
export function generateCSSVariables(theme: ResolvedTheme): string {
  const fallbackVars = formatCSSVariable(Object.entries(theme.fallbacks), '  ');
  const oklchVars = formatCSSVariable(Object.entries(theme.tokens), '    ');

  return `${theme.selector} {
  /* Hex fallback values */
${fallbackVars}
}

@supports (color: oklch(0 0 0)) {
  ${theme.selector} {
    /* OKLCH color space */
${oklchVars}
  }
}`;
}

/**
 * Generate complete CSS file with all themes
 */
export function generateTokensCSS(themes: ResolvedTheme[]): string {
  const themeSections = themes.map(theme => generateCSSVariables(theme)).join('\n\n');

  return `/**
 * Design Tokens - CSS Variables
 * Generated from @coston/design-tokens
 */

${themeSections}
`;
}
