import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@coston/ui/card';
import { Button } from '@coston/ui/button';
import { Download, Copy, Check, Info } from 'lucide-react';
import type { GeneratedTheme } from '@coston/design-tokens';

interface ThemeExportProps {
  theme: GeneratedTheme | null;
  radius?: number;
}

export function ThemeExport({ theme, radius = 0.5 }: ThemeExportProps) {
  const [copiedJSON, setCopiedJSON] = useState(false);
  const [copiedCSS, setCopiedCSS] = useState(false);
  const [showInstructions, setShowInstructions] = useState(false);

  if (!theme) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Export Theme</CardTitle>
          <CardDescription>Generate a theme first to export</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Adjust the color sliders and select a theme mode to generate an exportable theme.
          </p>
        </CardContent>
      </Card>
    );
  }

  const handleDownloadJSON = () => {
    const exportData = {
      ...theme,
      radius: `${radius}rem`,
    };
    const data = JSON.stringify(exportData, null, 2);
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'custom-theme.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopyCSS = async () => {
    const cssLight = Object.entries(theme.light)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n');

    const cssDark = Object.entries(theme.dark)
      .map(([key, value]) => `  --${key}: ${value};`)
      .join('\n');

    const css = `:root {\n${cssLight}\n  --radius: ${radius}rem;\n}\n\n.dark {\n${cssDark}\n}`;

    try {
      await navigator.clipboard.writeText(css);
      setCopiedCSS(true);
      setTimeout(() => setCopiedCSS(false), 2000);
    } catch (err) {
      console.error('Failed to copy CSS:', err);
    }
  };

  const handleCopyJSON = async () => {
    const exportData = {
      ...theme,
      radius: `${radius}rem`,
    };
    const data = JSON.stringify(exportData, null, 2);
    try {
      await navigator.clipboard.writeText(data);
      setCopiedJSON(true);
      setTimeout(() => setCopiedJSON(false), 2000);
    } catch (err) {
      console.error('Failed to copy JSON:', err);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Export Theme</CardTitle>
        <CardDescription>Download or copy your generated theme</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Export Options */}
        <div className="grid gap-3">
          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex-1">
              <div className="font-medium text-sm">Download as JSON</div>
              <div className="text-xs text-muted-foreground mt-1">
                Save theme structure for later use
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleCopyJSON}>
                {copiedJSON ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-1" />
                    Copy
                  </>
                )}
              </Button>
              <Button size="sm" onClick={handleDownloadJSON}>
                <Download className="h-4 w-4 mr-1" />
                Download
              </Button>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 rounded-lg border border-border bg-muted/30">
            <div className="flex-1">
              <div className="font-medium text-sm">Copy as CSS Variables</div>
              <div className="text-xs text-muted-foreground mt-1">
                Ready to paste into your stylesheet
              </div>
            </div>
            <Button size="sm" variant="outline" onClick={handleCopyCSS}>
              {copiedCSS ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  Copy CSS
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="pt-4 border-t border-border">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setShowInstructions(!showInstructions)}
            className="w-full justify-start"
          >
            <Info className="h-4 w-4 mr-2" />
            How to use your exported theme
          </Button>

          {showInstructions && (
            <div className="mt-4 p-4 rounded-lg bg-muted/50 text-sm space-y-3">
              <div>
                <div className="font-semibold mb-1">Option 1: Add to your project</div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground ml-2">
                  <li>
                    Save the JSON file to{' '}
                    <code className="bg-background px-1 py-0.5 rounded">
                      src/themes/custom-theme.json
                    </code>
                  </li>
                  <li>
                    Add theme to{' '}
                    <code className="bg-background px-1 py-0.5 rounded">themes.config.ts</code>:
                    <pre className="bg-background p-2 rounded mt-1 overflow-x-auto">
                      {`{
  name: 'custom',
  baseColor: 'oklch(...)',
  mode: 'default'
}`}
                    </pre>
                  </li>
                  <li>
                    Run <code className="bg-background px-1 py-0.5 rounded">npm run build</code>
                  </li>
                </ol>
              </div>

              <div>
                <div className="font-semibold mb-1">Option 2: Use CSS directly</div>
                <ol className="list-decimal list-inside space-y-1 text-xs text-muted-foreground ml-2">
                  <li>Copy the CSS variables using the button above</li>
                  <li>Paste into your global stylesheet or CSS file</li>
                  <li>
                    The variables will be available as{' '}
                    <code className="bg-background px-1 py-0.5 rounded">var(--primary)</code>, etc.
                  </li>
                </ol>
              </div>

              <div className="pt-2 border-t border-border">
                <p className="text-xs text-muted-foreground">
                  <strong>Note:</strong> Theme generation uses color theory and gamut mapping to
                  ensure all colors are displayable in sRGB and meet accessibility standards.
                </p>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
