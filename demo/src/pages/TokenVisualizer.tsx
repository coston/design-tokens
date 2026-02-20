import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface TokenSwatchProps {
  name: string;
  cssVar: string;
  description?: string;
}

function TokenSwatch({ name, cssVar, description }: TokenSwatchProps) {
  const computedValue = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .trim();

  return (
    <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
      <div
        className="w-16 h-16 rounded-md border border-border shadow-sm flex-shrink-0"
        style={{ background: `var(${cssVar})` }}
      />
      <div className="flex-1 min-w-0">
        <div className="font-mono text-sm font-semibold">{name}</div>
        <div className="text-xs text-muted-foreground font-mono truncate">
          {cssVar}
        </div>
        <div className="text-xs text-muted-foreground mt-1 truncate">
          {computedValue || 'Not set'}
        </div>
        {description && (
          <div className="text-xs text-muted-foreground mt-1">{description}</div>
        )}
      </div>
    </div>
  );
}

export function TokenVisualizerPage() {
  const colorTokens = [
    { name: 'background', cssVar: '--background', description: 'Page background' },
    { name: 'foreground', cssVar: '--foreground', description: 'Page text' },
    { name: 'primary', cssVar: '--primary', description: 'Primary actions' },
    { name: 'primary-foreground', cssVar: '--primary-foreground', description: 'Text on primary' },
    { name: 'secondary', cssVar: '--secondary', description: 'Secondary actions' },
    { name: 'secondary-foreground', cssVar: '--secondary-foreground', description: 'Text on secondary' },
    { name: 'muted', cssVar: '--muted', description: 'Subtle backgrounds' },
    { name: 'muted-foreground', cssVar: '--muted-foreground', description: 'Subtle text' },
    { name: 'accent', cssVar: '--accent', description: 'Accent highlights' },
    { name: 'accent-foreground', cssVar: '--accent-foreground', description: 'Text on accent' },
    { name: 'destructive', cssVar: '--destructive', description: 'Destructive actions' },
    { name: 'destructive-foreground', cssVar: '--destructive-foreground', description: 'Text on destructive' },
    { name: 'card', cssVar: '--card', description: 'Card backgrounds' },
    { name: 'card-foreground', cssVar: '--card-foreground', description: 'Card text' },
    { name: 'popover', cssVar: '--popover', description: 'Popover backgrounds' },
    { name: 'popover-foreground', cssVar: '--popover-foreground', description: 'Popover text' },
    { name: 'border', cssVar: '--border', description: 'Border color' },
    { name: 'input', cssVar: '--input', description: 'Input borders' },
    { name: 'ring', cssVar: '--ring', description: 'Focus rings' },
  ];

  const chartTokens = [
    { name: 'chart-1', cssVar: '--chart-1', description: 'Chart color 1' },
    { name: 'chart-2', cssVar: '--chart-2', description: 'Chart color 2' },
    { name: 'chart-3', cssVar: '--chart-3', description: 'Chart color 3' },
    { name: 'chart-4', cssVar: '--chart-4', description: 'Chart color 4' },
    { name: 'chart-5', cssVar: '--chart-5', description: 'Chart color 5' },
  ];

  const sidebarTokens = [
    { name: 'sidebar-background', cssVar: '--sidebar-background' },
    { name: 'sidebar-foreground', cssVar: '--sidebar-foreground' },
    { name: 'sidebar-primary', cssVar: '--sidebar-primary' },
    { name: 'sidebar-primary-foreground', cssVar: '--sidebar-primary-foreground' },
    { name: 'sidebar-accent', cssVar: '--sidebar-accent' },
    { name: 'sidebar-accent-foreground', cssVar: '--sidebar-accent-foreground' },
    { name: 'sidebar-border', cssVar: '--sidebar-border' },
    { name: 'sidebar-ring', cssVar: '--sidebar-ring' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Token Visualizer</h1>
        <p className="text-lg text-muted-foreground">
          View all design tokens with their computed OKLCH values
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Semantic Color Tokens</CardTitle>
          <CardDescription>
            Core color tokens for UI elements. These adapt to light and dark modes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {colorTokens.map((token) => (
              <TokenSwatch key={token.name} {...token} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Chart Colors</CardTitle>
          <CardDescription>
            Color palette for data visualization. Consistent across themes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {chartTokens.map((token) => (
              <TokenSwatch key={token.name} {...token} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Sidebar Tokens</CardTitle>
          <CardDescription>
            Specific tokens for sidebar components
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {sidebarTokens.map((token) => (
              <TokenSwatch key={token.name} {...token} />
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Other Tokens</CardTitle>
          <CardDescription>Spacing and border radius tokens</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center gap-4 p-4 rounded-lg border border-border">
              <div
                className="h-16 bg-primary"
                style={{ width: 'var(--radius)', borderRadius: 'var(--radius)' }}
              />
              <div className="flex-1">
                <div className="font-mono text-sm font-semibold">radius</div>
                <div className="text-xs text-muted-foreground font-mono">--radius</div>
                <div className="text-xs text-muted-foreground mt-1">
                  {getComputedStyle(document.documentElement)
                    .getPropertyValue('--radius')
                    .trim()}
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
