import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Palette, Sun, Moon } from 'lucide-react';
import { ColorInput } from '@/components/theme-creator/ColorInput';
import { ThemePreview } from '@/components/theme-creator/ThemePreview';
import { ThemeExport } from '@/components/theme-creator/ThemeExport';
import { RadiusInput } from '@/components/theme-creator/RadiusInput';
// Public API
import { generateThemeFromColor, type GeneratedTheme } from '@coston/design-tokens';
// Demo-specific imports (not part of public API)
import { parseOKLCH, toOKLCH } from '@internal/color-utils';

interface ColorState {
  l: number;
  c: number;
  h: number;
}

// Helper to get current primary color from CSS
const getCurrentPrimaryColor = (): ColorState => {
  const primaryOKLCH = getComputedStyle(document.documentElement)
    .getPropertyValue('--primary')
    .trim();

  try {
    const parsed = parseOKLCH(primaryOKLCH);
    return { l: parsed.l, c: parsed.c, h: parsed.h };
  } catch {
    // Fallback to a default blue
    return { l: 0.6, c: 0.15, h: 240 };
  }
};

export function ThemeCreatorPage() {
  const [baseColor, setBaseColor] = useState<ColorState>(getCurrentPrimaryColor);
  const [radius, setRadius] = useState<number>(0.5); // Default to medium radius
  const [isDarkPreview, setIsDarkPreview] = useState(false);
  const [generatedTheme, setGeneratedTheme] = useState<GeneratedTheme | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Debounced theme generation
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      generateTheme();
    }, 300);

    return () => clearTimeout(timeoutId);
  }, [baseColor]);

  const generateTheme = async () => {
    setIsGenerating(true);

    // Small delay to show loading state
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const colorString = toOKLCH(baseColor);
      const theme = generateThemeFromColor({
        baseColor: colorString,
        gamutMapping: true,
      });

      setGeneratedTheme(theme);
    } catch (error) {
      console.error('Error generating theme:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Badge variant="secondary">Interactive</Badge>
          <Badge variant="outline">Color Theory</Badge>
        </div>
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold tracking-tight flex items-center gap-3">
              <Palette className="h-8 w-8 text-primary" />
              Theme Creator
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl">
              Generate mathematical themes from any base color using OKLCH color space and color
              theory principles. Built-in guardrails automatically enforce WCAG AA contrast
              requirements, so every generated theme is accessible.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Inputs */}
        <div className="space-y-6">
          {/* Color Input */}
          <Card>
            <CardHeader>
              <CardTitle>Base Color</CardTitle>
              <CardDescription>Select your primary color using OKLCH sliders</CardDescription>
            </CardHeader>
            <CardContent>
              <ColorInput color={baseColor} onChange={setBaseColor} />
            </CardContent>
          </Card>

          {/* Radius Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Border Radius</CardTitle>
              <CardDescription>Adjust the roundness of component corners</CardDescription>
            </CardHeader>
            <CardContent>
              <RadiusInput radius={radius} onChange={setRadius} />
            </CardContent>
          </Card>

          {/* Export */}
          <ThemeExport theme={generatedTheme} radius={radius} />
        </div>

        {/* Right Column - Preview */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Live Preview</CardTitle>
                  <CardDescription>See your theme applied to real components</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  {isGenerating && <Badge variant="secondary">Generating...</Badge>}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Dark Mode Toggle for Preview */}
              <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
                <div className="flex items-center gap-2">
                  {isDarkPreview ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                  <Label htmlFor="preview-dark-toggle" className="cursor-pointer">
                    Preview in {isDarkPreview ? 'Light' : 'Dark'} Mode
                  </Label>
                </div>
                <Button
                  id="preview-dark-toggle"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsDarkPreview(!isDarkPreview)}
                >
                  Toggle
                </Button>
              </div>

              {/* Theme Preview */}
              <ThemePreview theme={generatedTheme} isDark={isDarkPreview} radius={radius} />
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Info Section */}
      <Card className="bg-muted/50">
        <CardHeader>
          <CardTitle>How It Works</CardTitle>
          <CardDescription>Mathematical theme generation explained</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <h4 className="font-semibold mb-2 text-sm">Color Theory</h4>
              <p className="text-sm text-muted-foreground">
                Themes are generated using color wheel relationships (analogous, complementary,
                split-complementary) to ensure harmonious color combinations.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Perceptual Uniformity</h4>
              <p className="text-sm text-muted-foreground">
                OKLCH color space ensures equal numeric changes produce equal visual changes, unlike
                RGB or HSL which can appear uneven.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Gamut Mapping</h4>
              <p className="text-sm text-muted-foreground">
                All colors are automatically constrained to the sRGB gamut using mathematical
                functions that find maximum displayable chroma for each lightness and hue.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-sm">Contrast Enforcement</h4>
              <p className="text-sm text-muted-foreground">
                Built-in guardrails automatically adjust lightness values during generation to
                guarantee WCAG AA compliance (4.5:1). Contrast violations are prevented, not just
                detected.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
