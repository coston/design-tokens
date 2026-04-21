import { useEffect } from 'react';
import { Button } from '@coston/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@coston/ui/card';
import { Input } from '@coston/ui/input';
import { Label } from '@coston/ui/label';
import { Badge } from '@coston/ui/badge';
import type { GeneratedTheme } from '@coston/design-tokens';

interface ThemePreviewProps {
  theme: GeneratedTheme | null;
  isDark: boolean;
  radius?: number;
}

export function ThemePreview({ theme, isDark, radius = 0.5 }: ThemePreviewProps) {
  useEffect(() => {
    if (!theme) return;

    const tokens = isDark ? theme.dark : theme.light;

    // Create CSS variable declarations for colors
    const colorVars = Object.entries(tokens)
      .map(([key, value]) => `--${key}: ${value};`)
      .join('\n  ');

    // Add radius variables and override border-radius for all elements in preview
    const radiusVars = `
      --radius: ${radius}rem;
    `;

    // Override Tailwind's rounded-* classes within the preview
    const radiusOverrides = `
      .theme-preview-container button,
      .theme-preview-container [class*="rounded"] {
        border-radius: ${radius}rem !important;
      }
      .theme-preview-container input {
        border-radius: ${radius}rem !important;
      }
    `;

    // Inject into scoped style element
    const styleId = 'theme-preview-style';
    let styleEl = document.getElementById(styleId) as HTMLStyleElement;

    if (!styleEl) {
      styleEl = document.createElement('style');
      styleEl.id = styleId;
      document.head.appendChild(styleEl);
    }

    styleEl.textContent = `.theme-preview-container { ${colorVars} ${radiusVars} } ${radiusOverrides}`;

    // Cleanup function
    return () => {
      const el = document.getElementById(styleId);
      if (el) {
        el.remove();
      }
    };
  }, [theme, isDark, radius]);

  if (!theme) {
    return (
      <div className="flex items-center justify-center h-64 border-2 border-dashed border-border rounded-lg">
        <p className="text-muted-foreground">Adjust the color sliders to generate a theme</p>
      </div>
    );
  }

  return (
    <div
      className={`theme-preview-container space-y-6 p-6 rounded-lg border-2 border-border ${
        isDark ? 'bg-background' : ''
      }`}
      style={{
        backgroundColor: isDark ? theme.dark.background : theme.light.background,
        color: isDark ? theme.dark.foreground : theme.light.foreground,
      }}
    >
      {/* Header */}
      <div className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Preview</Badge>
          <Badge variant={isDark ? 'default' : 'outline'}>
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </Badge>
        </div>
        <h3 className="text-2xl font-bold">Theme Preview</h3>
        <p
          className="text-sm"
          style={{
            color: isDark ? theme.dark['muted-foreground'] : theme.light['muted-foreground'],
          }}
        >
          Live preview of your generated theme
        </p>
      </div>

      {/* Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Buttons</CardTitle>
          <CardDescription>Button variants with generated colors</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button>Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="destructive">Destructive</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
        </CardContent>
      </Card>

      {/* Form Inputs */}
      <Card>
        <CardHeader>
          <CardTitle>Form Elements</CardTitle>
          <CardDescription>Input fields and labels</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preview-name">Name</Label>
            <Input id="preview-name" placeholder="Enter your name" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="preview-email">Email</Label>
            <Input id="preview-email" type="email" placeholder="your@email.com" />
          </div>
        </CardContent>
      </Card>

      {/* Color Swatches */}
      <Card>
        <CardHeader>
          <CardTitle>Color Tokens</CardTitle>
          <CardDescription>Semantic color pairs</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-2 gap-4">
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: isDark ? theme.dark.primary : theme.light.primary,
              color: isDark ? theme.dark['primary-foreground'] : theme.light['primary-foreground'],
            }}
          >
            <div className="font-semibold text-sm">Primary</div>
            <div className="text-xs opacity-80 mt-1">Primary foreground</div>
          </div>
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: isDark ? theme.dark.secondary : theme.light.secondary,
              color: isDark
                ? theme.dark['secondary-foreground']
                : theme.light['secondary-foreground'],
            }}
          >
            <div className="font-semibold text-sm">Secondary</div>
            <div className="text-xs opacity-80 mt-1">Secondary foreground</div>
          </div>
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: isDark ? theme.dark.accent : theme.light.accent,
              color: isDark ? theme.dark['accent-foreground'] : theme.light['accent-foreground'],
            }}
          >
            <div className="font-semibold text-sm">Accent</div>
            <div className="text-xs opacity-80 mt-1">Accent foreground</div>
          </div>
          <div
            className="p-4 rounded-lg border"
            style={{
              backgroundColor: isDark ? theme.dark.muted : theme.light.muted,
              color: isDark ? theme.dark['muted-foreground'] : theme.light['muted-foreground'],
            }}
          >
            <div className="font-semibold text-sm">Muted</div>
            <div className="text-xs opacity-80 mt-1">Muted foreground</div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
