/**
 * Theme Generation Configuration
 * Single source of truth - themes are auto-generated at build time
 *
 * Base color selection follows COLOR-THEORY.md semantic hue strategy (lines 65-72):
 * - Hue angle determines semantic associations (culture-dependent conventions)
 * - Lightness at mid-tone (~0.6) allows maximum chroma within sRGB gamut
 * - Chroma values chosen to maximize vibrancy while remaining within sRGB
 */

export interface ThemeConfig {
  name: string;
  baseColor: string;
}

export const themes: ThemeConfig[] = [
  {
    name: 'light',
    // 240° Blue - Primary semantic hue (COLOR-THEORY.md line 67)
    // Convention: Associated with stability and trust in digital interfaces
    // Chroma 0.134: Near maximum for blue at L=0.6 in sRGB (~0.14-0.16)
    baseColor: 'oklch(0.6 0.134 240)',
  },
  {
    name: 'forest',
    // 150° Green - Success semantic hue (COLOR-THEORY.md line 69)
    // Convention: Widely associated with "safe" or "go" in UI systems
    // Chroma 0.150: Near maximum for green at L=0.6 in sRGB (~0.18-0.20)
    // Note: Slightly lower than theoretical max to ensure consistent appearance
    baseColor: 'oklch(0.6 0.150 150)',
  },
  {
    name: 'purple',
    // 300° Magenta - Between blue (240°) and red (0°/360°)
    // Convention: Creative differentiation, often used for accent/brand colors
    // Analogous harmony with primary blue (~60° separation)
    // Chroma 0.15: Near maximum for magenta at L=0.6 in sRGB (~0.22-0.24)
    baseColor: 'oklch(0.6 0.15 300)',
  },
];
