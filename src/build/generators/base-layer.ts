/**
 * Generate @layer base with default styles
 */
export function generateBaseLayer(): string {
  return `/**
 * Base Layer - Default Styles
 * Optional default styles using design tokens
 */

@layer base {
  * {
    @apply border-border;
    color-interpolation-method: oklab;
  }
  body {
    @apply bg-background text-foreground;
  }
  ::selection {
    @apply bg-selection text-selection-foreground;
  }
}`;
}
