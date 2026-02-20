/**
 * Type definitions for design tokens
 */

export interface TokenValue {
  $ref?: string;
  [key: string]: unknown;
}

export interface TokenCollection {
  [key: string]: string | TokenValue | TokenCollection;
}

export interface CoreTokens {
  colors?: TokenCollection;
  spacing?: TokenCollection;
  fontFamily?: TokenCollection;
  fontSize?: TokenCollection;
  fontWeight?: TokenCollection;
  lineHeight?: TokenCollection;
  radii?: TokenCollection;
}

export interface SemanticTokens {
  semantic: {
    [key: string]: string | TokenValue;
  };
}

export interface ThemeOverrides {
  theme: {
    name: string;
    selector: string;
    overrides: {
      [key: string]: string | TokenValue;
    };
  };
}

export interface FlatTokens {
  [key: string]: string;
}

export interface ResolvedTheme {
  name: string;
  selector: string;
  tokens: FlatTokens;
  fallbacks: FlatTokens;
}

export const REQUIRED_TOKENS = [
  'background',
  'foreground',
  'card',
  'card-foreground',
  'popover',
  'popover-foreground',
  'primary',
  'primary-foreground',
  'secondary',
  'secondary-foreground',
  'muted',
  'muted-foreground',
  'accent',
  'accent-foreground',
  'destructive',
  'destructive-foreground',
  'border',
  'input',
  'ring',
  'chart-1',
  'chart-2',
  'chart-3',
  'chart-4',
  'chart-5',
  'sidebar-background',
  'sidebar-foreground',
  'sidebar-primary',
  'sidebar-primary-foreground',
  'sidebar-accent',
  'sidebar-accent-foreground',
  'sidebar-border',
  'sidebar-ring',
  'radius',
] as const;

export type RequiredToken = (typeof REQUIRED_TOKENS)[number];
