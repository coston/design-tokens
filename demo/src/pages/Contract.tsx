import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertCircle } from 'lucide-react';

interface TokenStatus {
  name: string;
  cssVar: string;
  category: string;
  required: boolean;
}

export function ContractPage() {
  const requiredTokens: TokenStatus[] = [
    { name: 'background', cssVar: '--background', category: 'Page', required: true },
    { name: 'foreground', cssVar: '--foreground', category: 'Page', required: true },
    { name: 'card', cssVar: '--card', category: 'Surfaces', required: true },
    { name: 'card-foreground', cssVar: '--card-foreground', category: 'Surfaces', required: true },
    { name: 'popover', cssVar: '--popover', category: 'Surfaces', required: true },
    { name: 'popover-foreground', cssVar: '--popover-foreground', category: 'Surfaces', required: true },
    { name: 'primary', cssVar: '--primary', category: 'Actions', required: true },
    { name: 'primary-foreground', cssVar: '--primary-foreground', category: 'Actions', required: true },
    { name: 'secondary', cssVar: '--secondary', category: 'Actions', required: true },
    { name: 'secondary-foreground', cssVar: '--secondary-foreground', category: 'Actions', required: true },
    { name: 'muted', cssVar: '--muted', category: 'Subtle', required: true },
    { name: 'muted-foreground', cssVar: '--muted-foreground', category: 'Subtle', required: true },
    { name: 'accent', cssVar: '--accent', category: 'Highlights', required: true },
    { name: 'accent-foreground', cssVar: '--accent-foreground', category: 'Highlights', required: true },
    { name: 'destructive', cssVar: '--destructive', category: 'States', required: true },
    { name: 'destructive-foreground', cssVar: '--destructive-foreground', category: 'States', required: true },
    { name: 'border', cssVar: '--border', category: 'Borders', required: true },
    { name: 'input', cssVar: '--input', category: 'Borders', required: true },
    { name: 'ring', cssVar: '--ring', category: 'Focus', required: true },
    { name: 'chart-1', cssVar: '--chart-1', category: 'Charts', required: true },
    { name: 'chart-2', cssVar: '--chart-2', category: 'Charts', required: true },
    { name: 'chart-3', cssVar: '--chart-3', category: 'Charts', required: true },
    { name: 'chart-4', cssVar: '--chart-4', category: 'Charts', required: true },
    { name: 'chart-5', cssVar: '--chart-5', category: 'Charts', required: true },
    { name: 'sidebar-background', cssVar: '--sidebar-background', category: 'Sidebar', required: true },
    { name: 'sidebar-foreground', cssVar: '--sidebar-foreground', category: 'Sidebar', required: true },
    { name: 'sidebar-primary', cssVar: '--sidebar-primary', category: 'Sidebar', required: true },
    { name: 'sidebar-primary-foreground', cssVar: '--sidebar-primary-foreground', category: 'Sidebar', required: true },
    { name: 'sidebar-accent', cssVar: '--sidebar-accent', category: 'Sidebar', required: true },
    { name: 'sidebar-accent-foreground', cssVar: '--sidebar-accent-foreground', category: 'Sidebar', required: true },
    { name: 'sidebar-border', cssVar: '--sidebar-border', category: 'Sidebar', required: true },
    { name: 'sidebar-ring', cssVar: '--sidebar-ring', category: 'Sidebar', required: true },
    { name: 'radius', cssVar: '--radius', category: 'Spacing', required: true },
  ];

  const checkTokenExists = (cssVar: string): boolean => {
    const value = getComputedStyle(document.documentElement)
      .getPropertyValue(cssVar)
      .trim();
    return value !== '';
  };

  const getComputedValue = (cssVar: string): string => {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(cssVar)
      .trim();
  };

  const groupedTokens = requiredTokens.reduce((acc, token) => {
    if (!acc[token.category]) {
      acc[token.category] = [];
    }
    acc[token.category].push(token);
    return acc;
  }, {} as Record<string, TokenStatus[]>);

  const allTokensPresent = requiredTokens.every(token => checkTokenExists(token.cssVar));
  const presentCount = requiredTokens.filter(token => checkTokenExists(token.cssVar)).length;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold mb-2">Token Contract</h1>
        <p className="text-lg text-muted-foreground">
          Required CSS variables for shadcn/ui compatibility
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Contract Status</CardTitle>
              <CardDescription>
                Validation of required design tokens
              </CardDescription>
            </div>
            <Badge
              variant={allTokensPresent ? 'default' : 'destructive'}
              className="text-lg px-4 py-2"
            >
              {presentCount} / {requiredTokens.length}
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {allTokensPresent ? (
            <div className="flex items-center gap-3 p-4 bg-primary/10 text-primary rounded-lg">
              <CheckCircle2 className="w-6 h-6" />
              <div>
                <div className="font-semibold">All required tokens are present</div>
                <div className="text-sm opacity-80">
                  This theme is fully compatible with shadcn/ui components
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3 p-4 bg-destructive/10 text-destructive rounded-lg">
              <AlertCircle className="w-6 h-6" />
              <div>
                <div className="font-semibold">Missing required tokens</div>
                <div className="text-sm opacity-80">
                  Some tokens are not defined. Components may not work correctly.
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {Object.entries(groupedTokens).map(([category, tokens]) => (
        <Card key={category}>
          <CardHeader>
            <CardTitle>{category} Tokens</CardTitle>
            <CardDescription>
              {tokens.length} {tokens.length === 1 ? 'token' : 'tokens'} in this category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {tokens.map((token) => {
                const exists = checkTokenExists(token.cssVar);
                const value = getComputedValue(token.cssVar);

                return (
                  <div
                    key={token.name}
                    className="flex items-center justify-between p-3 rounded-lg border border-border"
                  >
                    <div className="flex items-center gap-3">
                      {exists ? (
                        <CheckCircle2 className="w-5 h-5 text-primary flex-shrink-0" />
                      ) : (
                        <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0" />
                      )}
                      <div>
                        <div className="font-mono text-sm font-semibold">
                          {token.name}
                        </div>
                        <div className="text-xs text-muted-foreground font-mono">
                          {token.cssVar}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      {exists ? (
                        <div className="text-xs text-muted-foreground font-mono max-w-xs truncate">
                          {value}
                        </div>
                      ) : (
                        <Badge variant="destructive" className="text-xs">
                          Missing
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ))}

      <Card>
        <CardHeader>
          <CardTitle>About the Contract</CardTitle>
          <CardDescription>
            Understanding the token requirements
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <p>
            The design token contract defines the minimum set of CSS variables required
            for shadcn/ui components to function correctly. These tokens follow the
            shadcn/ui naming conventions and ensure consistent theming across components.
          </p>
          <p>
            All themes (light, dark, and brand variants) must provide values for every
            required token. Missing tokens will cause components to fall back to browser
            defaults, resulting in inconsistent appearance.
          </p>
          <p>
            The contract is validated at build time using Vitest tests. Run{' '}
            <code className="px-1.5 py-0.5 bg-muted rounded text-xs font-mono">
              npm test
            </code>{' '}
            to verify your tokens meet the contract requirements.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
