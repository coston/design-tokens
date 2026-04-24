/**
 * Mathematical theme generator
 * Generates complete theme from a base color using color theory
 *
 * Applies all 7 color theory fundamentals:
 * 1. Color wheel (hue relationships - analogous, complementary)
 * 2. Perceptual uniformity (Oklab lightness)
 * 3. Helmholtz-Kohlrausch (chroma adjustment)
 * 4. Contrast ratios (WCAG validation)
 * 5. Lightness hierarchy (Munsell value theory)
 * 6. Simultaneous contrast (dark mode adjustments)
 * 7. Color temperature (warm/cool semantics)
 *
 * See COLOR-THEORY.md for complete explanation
 */

import { parseOKLCH, toOKLCH } from './color-utils.js';
import { getContrastRatio } from './contrast-validation.js';
import { calculateDarkModeAdjustments } from './color-theory-calculations.js';

export interface ThemeGeneratorOptions {
  /** Base color for the theme (primary color) */
  baseColor: string;

  /** Hue variation range in degrees (default: 20) */
  hueRange?: number;

  /** Whether to use complementary colors for accents (default: false) */
  useComplementary?: boolean;

  /** Chroma multiplier for the theme (0-1, default: 1) */
  chromaScale?: number;
}

/**
 * Binary search bounds
 */
type SearchBound = { readonly low: number; readonly high: number };

/**
 * Update search bounds based on predicate result
 * Pure function - no mutations
 */
function updateSearchBound(
  bound: SearchBound,
  mid: number,
  predicatePassed: boolean,
  shouldLighten: boolean
): SearchBound {
  return predicatePassed
    ? shouldLighten
      ? { ...bound, high: mid }
      : { ...bound, low: mid }
    : shouldLighten
      ? { ...bound, low: mid }
      : { ...bound, high: mid };
}

/**
 * Binary search to find a lightness value that meets minimum contrast ratio
 * Uses immutable bounds update pattern
 */
function findContrastingLightness(
  fg: { l: number; c: number; h: number },
  background: string,
  shouldLighten: boolean,
  chromaMult: number,
  minRatio: number,
  precision: number = 0.001
): number | null {
  const initialBound: SearchBound = {
    low: shouldLighten ? fg.l : 0.01,
    high: shouldLighten ? 0.99 : fg.l,
  };

  const testLightness = (l: number): boolean => {
    const testColor = toOKLCH({ l, c: fg.c * chromaMult, h: fg.h });
    return getContrastRatio(testColor, background) >= minRatio;
  };

  const finalBound = Array.from({ length: 30 }).reduce<SearchBound>(bound => {
    if (bound.high - bound.low <= precision) return bound;
    const mid = (bound.low + bound.high) / 2;
    return updateSearchBound(bound, mid, testLightness(mid), shouldLighten);
  }, initialBound);

  const resultL = (finalBound.low + finalBound.high) / 2;
  const finalColor = toOKLCH({ l: resultL, c: fg.c * chromaMult, h: fg.h });
  const finalRatio = getContrastRatio(finalColor, background);

  return finalRatio >= minRatio ? resultL : null;
}

/**
 * Ensure a foreground color meets minimum contrast ratio against background
 * See COLOR-THEORY.md #4 "Contrast Ratios"
 */
function ensureContrast(foreground: string, background: string, minRatio: number = 4.5): string {
  const fg = parseOKLCH(foreground);
  const currentRatio = getContrastRatio(foreground, background);

  if (currentRatio >= minRatio) {
    return foreground;
  }

  const lightRatio = getContrastRatio(toOKLCH({ l: 0.98, c: fg.c, h: fg.h }), background);
  const darkRatio = getContrastRatio(toOKLCH({ l: 0.02, c: fg.c, h: fg.h }), background);
  const shouldLighten = lightRatio > darkRatio;

  const chromaMultipliers = [1.0, 0.5, 0.2];
  const result = chromaMultipliers.reduce<{ lightness: number; chroma: number } | null>(
    (found, chromaMult) => {
      if (found !== null) return found;
      const lightness = findContrastingLightness(
        fg,
        background,
        shouldLighten,
        chromaMult,
        minRatio
      );
      return lightness !== null ? { lightness, chroma: fg.c * chromaMult } : null;
    },
    null
  );

  if (result !== null) {
    return toOKLCH({ l: result.lightness, c: result.chroma, h: fg.h });
  }

  return toOKLCH({
    l: shouldLighten ? 0.98 : 0.02,
    c: fg.c * 0.1,
    h: fg.h,
  });
}

export interface GeneratedTheme {
  light: Record<string, string>;
  dark: Record<string, string>;
}

/**
 * Generate a complete light + dark theme from a base color
 *
 * Strategy:
 * 1. Extract base hue from input color
 * 2. Keep all colors within a narrow hue range (monochromatic/analogous)
 * 3. Vary lightness for hierarchy
 * 4. Adjust chroma for emphasis
 * 5. Generate complementary for destructive actions
 */
export function generateThemeFromColor(options: ThemeGeneratorOptions): GeneratedTheme {
  const { baseColor, hueRange = 20, useComplementary = false, chromaScale = 1.0 } = options;

  const base = parseOKLCH(baseColor);
  const baseHue = base.h;
  const baseChroma = base.c * chromaScale;

  // Helper to create color within hue range
  const createColor = (lightness: number, chroma: number, hueOffset: number = 0): string => {
    const targetHue = (baseHue + hueOffset + 360) % 360;
    return toOKLCH({
      l: lightness,
      c: chroma,
      h: targetHue,
    });
  };

  const lightPrimaryL = base.l < 0.35 ? 0.5 : base.l > 0.85 ? 0.6 : base.l;

  const { lightness: darkPrimaryL, chroma: darkPrimaryC } = calculateDarkModeAdjustments(
    base.l,
    baseChroma
  );

  const destructiveHue = useComplementary ? 180 : 20 - baseHue;
  const successHue = 150 - baseHue;
  const warningHue = 85 - baseHue;
  const infoHue = 240 - baseHue;

  interface PaletteSpec {
    readonly key: string;
    readonly l: number | (() => number);
    readonly c: number | (() => number);
    readonly h: number;
    readonly comment?: string;
  }

  // Helper to create palette entries - reduces duplication
  type PaletteEntry = Pick<PaletteSpec, 'key' | 'l' | 'c' | 'h'>;

  const createEntry = (key: string, l: number, c: number, h: number): PaletteEntry => ({
    key,
    l,
    c,
    h,
  });

  // Mode-specific configuration constants
  interface ModeConfig {
    readonly fg: number;
    readonly bg: number;
    readonly fgChroma: number;
    readonly bgChroma: number;
    readonly primaryL: number;
    readonly primaryC: number;
  }

  const MODE_CONFIGS: Record<'light' | 'dark', ModeConfig> = {
    light: {
      fg: 0.36,
      bg: 0.97,
      fgChroma: baseChroma * 0.3,
      bgChroma: baseChroma * 0.05,
      primaryL: lightPrimaryL,
      primaryC: baseChroma,
    },
    dark: {
      fg: 0.95,
      bg: 0.12,
      fgChroma: baseChroma * 0.2,
      bgChroma: baseChroma * 0.15,
      primaryL: darkPrimaryL,
      primaryC: darkPrimaryC,
    },
  };

  // Helper functions for mode-specific value selection
  const modeValue = <T>(mode: 'light' | 'dark', light: T, dark: T): T =>
    mode === 'light' ? light : dark;

  const modeChroma = (mode: 'light' | 'dark', lightMult: number, darkMult: number): number =>
    baseChroma * (mode === 'light' ? lightMult : darkMult);

  const modeHue = (mode: 'light' | 'dark', lightMult: number, darkMult: number): number =>
    hueRange * (mode === 'light' ? lightMult : darkMult);

  // Common palette structure with theme-specific values
  const createPaletteSpec = (mode: 'light' | 'dark'): PaletteSpec[] => {
    const cfg = MODE_CONFIGS[mode];

    return [
      // Base colors
      createEntry('background', cfg.bg, cfg.bgChroma, modeHue(mode, -0.1, -0.2)),
      createEntry(
        'card',
        modeValue(mode, 1.0, 0.18),
        modeValue(mode, 0, baseChroma * 0.2),
        modeValue(mode, 0, -hueRange * 0.2)
      ),
      createEntry(
        'popover',
        modeValue(mode, 1.0, 0.18),
        modeValue(mode, 0, baseChroma * 0.2),
        modeValue(mode, 0, -hueRange * 0.2)
      ),
      createEntry(
        'secondary',
        modeValue(mode, 0.86, 0.27),
        modeChroma(mode, 0.3, 0.4),
        modeHue(mode, 0.2, 0.3)
      ),
      createEntry(
        'muted',
        modeValue(mode, 0.91, 0.22),
        modeChroma(mode, 0.15, 0.25),
        modeHue(mode, 0.1, 0.15)
      ),

      // Foregrounds
      createEntry('foreground', cfg.fg, cfg.fgChroma, 0),
      createEntry('card-foreground', cfg.fg, cfg.fgChroma, 0),
      createEntry('popover-foreground', cfg.fg, cfg.fgChroma, 0),
      createEntry('secondary-foreground', cfg.fg, cfg.fgChroma, 0),
      createEntry(
        'muted-foreground',
        modeValue(mode, 0.45, 0.7),
        modeChroma(mode, 0.25, 0.3),
        modeHue(mode, -0.2, 0.2)
      ),

      // Primary
      createEntry('primary', cfg.primaryL, cfg.primaryC, 0),
      createEntry(
        'primary-foreground',
        modeValue(mode, 0.98, 0.12),
        modeValue(mode, baseChroma * 0.1, darkPrimaryC * 0.3),
        0
      ),

      // Accent
      createEntry('accent', modeValue(mode, 0.8, 0.4), modeChroma(mode, 0.8, 0.6), hueRange * 2.5),
      createEntry(
        'accent-foreground',
        modeValue(mode, 0.18, 0.95),
        modeChroma(mode, 0.3, 0.2),
        hueRange * 2.5
      ),

      // Destructive
      createEntry(
        'destructive',
        modeValue(mode, 0.55, 0.65),
        modeValue(mode, 0.15, 0.13),
        destructiveHue
      ),
      createEntry(
        'destructive-foreground',
        modeValue(mode, 0.98, 0.12),
        modeValue(mode, 0.02, 0.05),
        destructiveHue
      ),

      // Success (green — absolute hue 150)
      createEntry('success', modeValue(mode, 0.55, 0.65), modeValue(mode, 0.15, 0.13), successHue),
      createEntry(
        'success-foreground',
        modeValue(mode, 0.98, 0.12),
        modeValue(mode, 0.02, 0.05),
        successHue
      ),

      // Warning (yellow — absolute hue 85, needs dark foreground)
      createEntry('warning', modeValue(mode, 0.82, 0.78), modeValue(mode, 0.15, 0.13), warningHue),
      createEntry(
        'warning-foreground',
        modeValue(mode, 0.2, 0.15),
        modeValue(mode, 0.02, 0.05),
        warningHue
      ),

      // Info (blue — absolute hue 240)
      createEntry('info', modeValue(mode, 0.55, 0.65), modeValue(mode, 0.15, 0.13), infoHue),
      createEntry(
        'info-foreground',
        modeValue(mode, 0.98, 0.12),
        modeValue(mode, 0.02, 0.05),
        infoHue
      ),

      // UI elements
      createEntry(
        'border',
        modeValue(mode, 0.79, 0.3),
        modeChroma(mode, 0.2, 0.35),
        modeHue(mode, 0.15, -0.25)
      ),
      createEntry(
        'input',
        modeValue(mode, 0.91, 0.24),
        modeChroma(mode, 0.1, 0.3),
        modeHue(mode, 0.1, -0.2)
      ),
      createEntry('ring', cfg.primaryL, cfg.primaryC, 0),

      // Charts - mostly same across themes
      createEntry('chart-1', cfg.primaryL, cfg.primaryC, 0),
      createEntry('chart-2', 0.65, modeChroma(mode, 0.9, 0.8), hueRange * 3),
      createEntry('chart-3', 0.6, baseChroma * 0.7, 120),
      createEntry('chart-4', 0.7, modeChroma(mode, 0.8, 0.75), -120),
      createEntry('chart-5', 0.55, baseChroma * 0.85, -hueRange * 2),

      // Sidebar
      createEntry(
        'sidebar-background',
        modeValue(mode, 0.93, 0.1),
        modeChroma(mode, 0.08, 0.12),
        modeHue(mode, 0.1, -0.25)
      ),
      createEntry('sidebar-foreground', modeValue(mode, 0.2, 0.95), cfg.fgChroma, 0),
      createEntry('sidebar-primary', cfg.primaryL, cfg.primaryC, 0),
      createEntry(
        'sidebar-primary-foreground',
        modeValue(mode, 0.98, 0.12),
        modeValue(mode, baseChroma * 0.1, darkPrimaryC * 0.3),
        0
      ),
      createEntry(
        'sidebar-accent',
        modeValue(mode, 0.8, 0.4),
        modeChroma(mode, 0.8, 0.6),
        hueRange * 2.5
      ),
      createEntry(
        'sidebar-accent-foreground',
        modeValue(mode, 0.18, 0.95),
        modeChroma(mode, 0.3, 0.2),
        hueRange * 2.5
      ),
      createEntry(
        'sidebar-border',
        modeValue(mode, 0.82, 0.27),
        modeChroma(mode, 0.15, 0.3),
        modeHue(mode, 0.2, -0.3)
      ),
      createEntry('sidebar-ring', cfg.primaryL, cfg.primaryC, 0),

      // Selection
      createEntry(
        'selection',
        modeValue(mode, 0.88, 0.3),
        modeChroma(mode, 0.4, 0.5),
        hueRange * 0.3
      ),
      createEntry('selection-foreground', modeValue(mode, 0.2, 0.95), cfg.fgChroma, hueRange * 0.3),
    ];
  };

  const LIGHT_PALETTE_SPEC: PaletteSpec[] = createPaletteSpec('light');
  const DARK_PALETTE_SPEC: PaletteSpec[] = createPaletteSpec('dark');

  const generatePalette = (spec: readonly PaletteSpec[]): Readonly<Record<string, string>> => {
    return Object.fromEntries(
      spec.map(({ key, l, c, h }) => {
        const lightness = typeof l === 'function' ? l() : l;
        const chroma = typeof c === 'function' ? c() : c;
        return [key, createColor(lightness, chroma, h)];
      })
    ) as Readonly<Record<string, string>>;
  };

  const light = generatePalette(LIGHT_PALETTE_SPEC);
  const dark = generatePalette(DARK_PALETTE_SPEC);

  const CONTRAST_PAIRS = [
    { fg: 'foreground', bg: 'background', ratio: 4.5 },
    { fg: 'card-foreground', bg: 'card', ratio: 4.5 },
    { fg: 'popover-foreground', bg: 'popover', ratio: 4.5 },
    { fg: 'secondary-foreground', bg: 'secondary', ratio: 4.5 },
    { fg: 'muted-foreground', bg: 'muted', ratio: 4.5 },
    { fg: 'primary-foreground', bg: 'primary', ratio: 4.5 },
    { fg: 'accent-foreground', bg: 'accent', ratio: 4.5 },
    { fg: 'destructive-foreground', bg: 'destructive', ratio: 4.5 },
    { fg: 'success-foreground', bg: 'success', ratio: 4.5 },
    { fg: 'warning-foreground', bg: 'warning', ratio: 4.5 },
    { fg: 'info-foreground', bg: 'info', ratio: 4.5 },
    { fg: 'sidebar-foreground', bg: 'sidebar-background', ratio: 4.5 },
    { fg: 'sidebar-primary-foreground', bg: 'sidebar-primary', ratio: 4.5 },
    { fg: 'sidebar-accent-foreground', bg: 'sidebar-accent', ratio: 4.5 },
    { fg: 'selection-foreground', bg: 'selection', ratio: 4.5 },
    { fg: 'chart-1', bg: 'background', ratio: 3 },
    { fg: 'chart-2', bg: 'background', ratio: 3 },
    { fg: 'chart-3', bg: 'background', ratio: 3 },
    { fg: 'chart-4', bg: 'background', ratio: 3 },
    { fg: 'chart-5', bg: 'background', ratio: 3 },
  ] as const;

  const enforceContrasts = (theme: Record<string, string>): Record<string, string> => {
    const result = CONTRAST_PAIRS.reduce(
      (enforced, { fg, bg, ratio }) => ({
        ...enforced,
        [fg]: ensureContrast(theme[fg], theme[bg], ratio),
      }),
      { ...theme } // Start with a copy to avoid mutating input
    );
    // Freeze the result to prevent accidental mutations
    return Object.freeze(result);
  };

  const enforcedLight = enforceContrasts(light);
  const enforcedDark = enforceContrasts(dark);

  return Object.freeze({ light: enforcedLight, dark: enforcedDark });
}

/**
 * Generate a monochromatic tinted-neutral theme from a base color.
 *
 * Uses the same lightness hierarchy as the shadcn neutral theme but tints
 * every token with the base hue at a chroma that scales with the input color:
 *   - baseColor with C=0 → pure grayscale (identical to shadcn neutral)
 *   - baseColor with C>0 → tinted neutrals (e.g. purple-tinted grays)
 *
 * Chart colors always use vibrant hues (main hue + offsets) so data
 * visualizations remain legible regardless of the tint level.
 *
 * Lightness structure reference: shadcn/ui neutral theme (shadcn.com/themes)
 */
export function generateMonochromaticTheme(options: ThemeGeneratorOptions): GeneratedTheme {
  const { baseColor, chromaScale = 1.0 } = options;
  const base = parseOKLCH(baseColor);
  const hue = base.h;
  const baseChroma = base.c * chromaScale;

  // Maximum tint chroma — ~20 % of base chroma keeps neutrals neutral.
  // At baseChroma=0 every color is pure gray; at baseChroma=0.185 (vivid
  // purple) the maximum tint is ≈0.037, giving a subtle tinted cast.
  const maxTint = baseChroma * 0.2;

  /**
   * Perceptual tint amount at a given lightness.
   *
   * Two-part curve:
   *  - L ≥ 0.35: standard gamut arc, peaks near L=0.5, tapers to 0 at L=1
   *  - L < 0.35: linear ramp down to 0 at L=0
   *
   * The dark-end ramp prevents warm hues (red, orange) from producing
   * muddy browns at very low lightness, where even tiny chroma looks earthy.
   */
  const tintAt = (l: number, scale = 1.0): number => {
    const arc = Math.min(1, 4 * l * (1 - l) * 2); // 0 at extremes, peaks ~0.5
    const darkRamp = l < 0.35 ? l / 0.35 : 1.0; // linear fade below L=0.35
    return maxTint * arc * darkRamp * scale;
  };

  const mkColor = (l: number, c?: number): string =>
    toOKLCH({ l, c: c !== undefined ? c : tintAt(l), h: hue });

  // Chart colors — always vibrant for categorical data distinction.
  // When baseChroma is 0 (pure mono) we fall back to the shadcn neutral
  // chart palette; otherwise we anchor chart-1 to the base hue and spread
  // the rest evenly around the wheel.
  const chartC = (fallback: number) => (baseChroma > 0 ? baseChroma * 1.2 : fallback);
  const chartHue = (offset: number) => (hue + offset) % 360;

  const light: Record<string, string> = {
    // L=0.97 (not 1.0) so the tint arc produces visible chroma instead of 0
    background: mkColor(0.97),
    foreground: mkColor(0.145),
    card: mkColor(0.99, tintAt(0.99, 0.3)),
    'card-foreground': mkColor(0.145),
    popover: mkColor(0.99, tintAt(0.99, 0.3)),
    'popover-foreground': mkColor(0.145),
    primary: mkColor(0.205),
    'primary-foreground': mkColor(0.97),
    secondary: mkColor(0.93, tintAt(0.93, 0.5)),
    'secondary-foreground': mkColor(0.205),
    muted: mkColor(0.93, tintAt(0.93, 0.5)),
    'muted-foreground': mkColor(0.5),
    accent: mkColor(0.93, tintAt(0.93, 0.5)),
    'accent-foreground': mkColor(0.205),
    destructive: 'oklch(0.577 0.245 27.325)',
    'destructive-foreground': mkColor(0.97, 0),
    success: 'oklch(0.55 0.15 150)',
    'success-foreground': mkColor(0.97, 0),
    warning: 'oklch(0.82 0.15 85)',
    'warning-foreground': mkColor(0.2, 0),
    info: 'oklch(0.55 0.15 240)',
    'info-foreground': mkColor(0.97, 0),
    border: mkColor(0.88, tintAt(0.88, 0.4)),
    input: mkColor(0.88, tintAt(0.88, 0.4)),
    ring: mkColor(0.6),
    'chart-1': toOKLCH({ l: 0.646, c: chartC(0.222), h: chartHue(0) }),
    'chart-2': toOKLCH({ l: 0.6, c: chartC(0.118), h: chartHue(180) }),
    'chart-3': toOKLCH({ l: 0.398, c: chartC(0.07), h: chartHue(220) }),
    'chart-4': toOKLCH({ l: 0.828, c: chartC(0.189), h: chartHue(80) }),
    'chart-5': toOKLCH({ l: 0.769, c: chartC(0.188), h: chartHue(60) }),
    'sidebar-background': mkColor(0.93, tintAt(0.93, 0.3)),
    'sidebar-foreground': mkColor(0.2),
    'sidebar-primary': mkColor(0.6),
    'sidebar-primary-foreground': mkColor(0.98),
    'sidebar-accent': mkColor(0.9, tintAt(0.9, 0.4)),
    'sidebar-accent-foreground': mkColor(0.2),
    'sidebar-border': mkColor(0.82, tintAt(0.82, 0.3)),
    'sidebar-ring': mkColor(0.6),
    selection: mkColor(0.88, tintAt(0.88, 0.5)),
    'selection-foreground': mkColor(0.145),
  };

  // Colored hues (baseChroma > 0) need lighter darks to avoid warm-hue
  // muddiness (reds/oranges turn brown at very low lightness).
  // Pure grays (baseChroma = 0) keep shadcn's deep-black levels.
  const tinted = baseChroma > 0;
  const dkBg = tinted ? 0.24 : 0.145;
  const dkCard = tinted ? 0.27 : 0.18; // cards lighter than bg for elevation
  const dkSub = tinted ? 0.3 : 0.269; // secondary / muted / border
  const dkSbr = tinted ? 0.1 : 0.08; // sidebar — noticeably darker than bg
  const dkRng = tinted ? 0.5 : 0.439; // ring

  const dark: Record<string, string> = {
    background: mkColor(dkBg),
    foreground: mkColor(0.97),
    card: mkColor(dkCard),
    'card-foreground': mkColor(0.97),
    popover: mkColor(dkCard),
    'popover-foreground': mkColor(0.97),
    primary: mkColor(0.97),
    'primary-foreground': mkColor(dkBg),
    secondary: mkColor(dkSub),
    'secondary-foreground': mkColor(0.97),
    muted: mkColor(dkSub),
    // L=0.80 — enough lightness to clear WCAG AA 4.5:1 against dkSub
    'muted-foreground': mkColor(0.8),
    accent: mkColor(dkSub),
    'accent-foreground': mkColor(0.97),
    destructive: 'oklch(0.396 0.141 25.723)',
    'destructive-foreground': mkColor(0.97, 0),
    success: 'oklch(0.65 0.13 150)',
    'success-foreground': mkColor(0.97, 0),
    warning: 'oklch(0.78 0.13 85)',
    'warning-foreground': mkColor(0.15, 0),
    info: 'oklch(0.65 0.13 240)',
    'info-foreground': mkColor(0.97, 0),
    border: mkColor(dkSub),
    input: mkColor(dkSub),
    ring: mkColor(dkRng),
    'chart-1': toOKLCH({ l: 0.488, c: chartC(0.243), h: chartHue(0) }),
    'chart-2': toOKLCH({ l: 0.696, c: chartC(0.17), h: chartHue(180) }),
    'chart-3': toOKLCH({ l: 0.769, c: chartC(0.188), h: chartHue(60) }),
    'chart-4': toOKLCH({ l: 0.627, c: chartC(0.265), h: chartHue(100) }),
    'chart-5': toOKLCH({ l: 0.645, c: chartC(0.246), h: chartHue(20) }),
    'sidebar-background': mkColor(dkSbr),
    'sidebar-foreground': mkColor(0.95),
    'sidebar-primary': mkColor(0.82),
    'sidebar-primary-foreground': mkColor(0.12),
    'sidebar-accent': mkColor(tinted ? 0.22 : 0.2),
    'sidebar-accent-foreground': mkColor(0.95),
    'sidebar-border': mkColor(tinted ? 0.27 : 0.22),
    'sidebar-ring': mkColor(dkRng),
    selection: mkColor(dkSub),
    'selection-foreground': mkColor(0.97),
  };

  return Object.freeze({ light, dark });
}

export function previewTheme(theme: GeneratedTheme): void {
  console.log('\n🎨 Generated Theme Preview\n');

  console.log('Light Theme:');
  console.log('  Primary:', theme.light.primary);
  console.log('  Background:', theme.light.background);
  console.log('  Foreground:', theme.light.foreground);

  console.log('\nDark Theme:');
  console.log('  Primary:', theme.dark.primary);
  console.log('  Background:', theme.dark.background);
  console.log('  Foreground:', theme.dark.foreground);
}
