import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface TokenStatus {
  name: string;
  cssVar: string;
  category: string;
  required: boolean;
  description?: string;
}

interface TokenSwatchProps {
  name: string;
  cssVar: string;
  description?: string;
  exists: boolean;
}

function TokenSwatch({ name, cssVar, description, exists }: TokenSwatchProps) {
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
        <div className="flex items-center gap-2">
          <div className="font-mono text-sm font-semibold">{name}</div>
          {!exists && (
            <Badge variant="destructive" className="text-xs">
              Missing
            </Badge>
          )}
        </div>
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

export function TokensPage() {
  const requiredTokens: TokenStatus[] = [
    { name: 'primary', cssVar: '--primary', category: 'Actions', required: true, description: 'Primary actions' },
    { name: 'primary-foreground', cssVar: '--primary-foreground', category: 'Actions', required: true, description: 'Text on primary' },
    { name: 'secondary', cssVar: '--secondary', category: 'Actions', required: true, description: 'Secondary actions' },
    { name: 'secondary-foreground', cssVar: '--secondary-foreground', category: 'Actions', required: true, description: 'Text on secondary' },
    { name: 'background', cssVar: '--background', category: 'Page', required: true, description: 'Page background' },
    { name: 'foreground', cssVar: '--foreground', category: 'Page', required: true, description: 'Page text' },
    { name: 'card', cssVar: '--card', category: 'Surfaces', required: true, description: 'Card backgrounds' },
    { name: 'card-foreground', cssVar: '--card-foreground', category: 'Surfaces', required: true, description: 'Card text' },
    { name: 'popover', cssVar: '--popover', category: 'Surfaces', required: true, description: 'Popover backgrounds' },
    { name: 'popover-foreground', cssVar: '--popover-foreground', category: 'Surfaces', required: true, description: 'Popover text' },
    { name: 'muted', cssVar: '--muted', category: 'Subtle', required: true, description: 'Subtle backgrounds' },
    { name: 'muted-foreground', cssVar: '--muted-foreground', category: 'Subtle', required: true, description: 'Subtle text' },
    { name: 'accent', cssVar: '--accent', category: 'Highlights', required: true, description: 'Accent highlights' },
    { name: 'accent-foreground', cssVar: '--accent-foreground', category: 'Highlights', required: true, description: 'Text on accent' },
    { name: 'destructive', cssVar: '--destructive', category: 'States', required: true, description: 'Destructive actions' },
    { name: 'destructive-foreground', cssVar: '--destructive-foreground', category: 'States', required: true, description: 'Text on destructive' },
    { name: 'border', cssVar: '--border', category: 'Borders', required: true, description: 'Border color' },
    { name: 'input', cssVar: '--input', category: 'Borders', required: true, description: 'Input borders' },
    { name: 'ring', cssVar: '--ring', category: 'Focus', required: true, description: 'Focus rings' },
    { name: 'chart-1', cssVar: '--chart-1', category: 'Charts', required: true, description: 'Chart color 1' },
    { name: 'chart-2', cssVar: '--chart-2', category: 'Charts', required: true, description: 'Chart color 2' },
    { name: 'chart-3', cssVar: '--chart-3', category: 'Charts', required: true, description: 'Chart color 3' },
    { name: 'chart-4', cssVar: '--chart-4', category: 'Charts', required: true, description: 'Chart color 4' },
    { name: 'chart-5', cssVar: '--chart-5', category: 'Charts', required: true, description: 'Chart color 5' },
    { name: 'sidebar-background', cssVar: '--sidebar-background', category: 'Sidebar', required: true },
    { name: 'sidebar-foreground', cssVar: '--sidebar-foreground', category: 'Sidebar', required: true },
    { name: 'sidebar-primary', cssVar: '--sidebar-primary', category: 'Sidebar', required: true },
    { name: 'sidebar-primary-foreground', cssVar: '--sidebar-primary-foreground', category: 'Sidebar', required: true },
    { name: 'sidebar-accent', cssVar: '--sidebar-accent', category: 'Sidebar', required: true },
    { name: 'sidebar-accent-foreground', cssVar: '--sidebar-accent-foreground', category: 'Sidebar', required: true },
    { name: 'sidebar-border', cssVar: '--sidebar-border', category: 'Sidebar', required: true },
    { name: 'sidebar-ring', cssVar: '--sidebar-ring', category: 'Sidebar', required: true },
  ];

  const checkTokenExists = (cssVar: string): boolean => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(cssVar)
      .trim();
    return value !== '';
  };

  const groupedTokens = requiredTokens.reduce((acc, token) => {
    if (!acc[token.category]) {
      acc[token.category] = [];
    }
    acc[token.category].push(token);
    return acc;
  }, {} as Record<string, TokenStatus[]>);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Tokens</h1>
        <p className="text-lg text-muted-foreground">
          View all design tokens with their computed OKLCH values
        </p>
      </div>

      {Object.entries(groupedTokens).map(([category, tokens]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category} Tokens</CardTitle>
            <CardDescription>
              {tokens.length} {tokens.length === 1 ? 'token' : 'tokens'} in this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {tokens.map((token) => (
                <TokenSwatch
                  key={token.name}
                  name={token.name}
                  cssVar={token.cssVar}
                  description={token.description}
                  exists={checkTokenExists(token.cssVar)}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

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
