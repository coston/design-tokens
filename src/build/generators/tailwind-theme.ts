import type { FlatTokens } from '../utils/types.js';

/**
 * Format Tailwind variable mappings
 */
function formatTailwindVar(entries: [string, string][]): string {
  return entries
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([tokenName, tailwindVar]) => `  ${tailwindVar}: var(--${tokenName});`)
    .join('\n');
}

/**
 * Generate @theme inline block for Tailwind v4
 */
export function generateTailwindTheme(_baseTokens: FlatTokens): string {
  // Map shadcn tokens to Tailwind color names
  const colorMappings: Record<string, string> = {
    background: '--color-background',
    foreground: '--color-foreground',
    card: '--color-card',
    'card-foreground': '--color-card-foreground',
    popover: '--color-popover',
    'popover-foreground': '--color-popover-foreground',
    primary: '--color-primary',
    'primary-foreground': '--color-primary-foreground',
    secondary: '--color-secondary',
    'secondary-foreground': '--color-secondary-foreground',
    muted: '--color-muted',
    'muted-foreground': '--color-muted-foreground',
    accent: '--color-accent',
    'accent-foreground': '--color-accent-foreground',
    destructive: '--color-destructive',
    'destructive-foreground': '--color-destructive-foreground',
    border: '--color-border',
    input: '--color-input',
    ring: '--color-ring',
    'chart-1': '--color-chart-1',
    'chart-2': '--color-chart-2',
    'chart-3': '--color-chart-3',
    'chart-4': '--color-chart-4',
    'chart-5': '--color-chart-5',
    'sidebar-background': '--color-sidebar',
    'sidebar-foreground': '--color-sidebar-foreground',
    'sidebar-primary': '--color-sidebar-primary',
    'sidebar-primary-foreground': '--color-sidebar-primary-foreground',
    'sidebar-accent': '--color-sidebar-accent',
    'sidebar-accent-foreground': '--color-sidebar-accent-foreground',
    'sidebar-border': '--color-sidebar-border',
    'sidebar-ring': '--color-sidebar-ring',
    selection: '--color-selection',
    'selection-foreground': '--color-selection-foreground',
  };

  const colorMappingLines = formatTailwindVar(Object.entries(colorMappings));

  return `/**
 * Tailwind v4 Theme Mappings
 * Maps CSS variables to Tailwind color names
 */

@theme inline {
${colorMappingLines}
  --radius-sm: var(--radius);
}`;
}
