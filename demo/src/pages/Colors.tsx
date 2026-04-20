import * as React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const colorGroups = [
  {
    title: 'Backgrounds',
    colors: [
      { name: 'background', var: '--background', fg: '--foreground' },
      { name: 'card', var: '--card', fg: '--card-foreground' },
      { name: 'popover', var: '--popover', fg: '--popover-foreground' },
      { name: 'muted', var: '--muted', fg: '--muted-foreground' },
    ],
  },
  {
    title: 'Interactive',
    colors: [
      { name: 'primary', var: '--primary', fg: '--primary-foreground' },
      { name: 'secondary', var: '--secondary', fg: '--secondary-foreground' },
      { name: 'accent', var: '--accent', fg: '--accent-foreground' },
      { name: 'destructive', var: '--destructive', fg: '--destructive-foreground' },
    ],
  },
  {
    title: 'Borders & Inputs',
    colors: [
      { name: 'border', var: '--border' },
      { name: 'input', var: '--input' },
      { name: 'ring', var: '--ring' },
    ],
  },
  {
    title: 'Charts',
    colors: [
      { name: 'chart-1', var: '--chart-1' },
      { name: 'chart-2', var: '--chart-2' },
      { name: 'chart-3', var: '--chart-3' },
      { name: 'chart-4', var: '--chart-4' },
      { name: 'chart-5', var: '--chart-5' },
    ],
  },
  {
    title: 'Sidebar',
    colors: [
      { name: 'sidebar', var: '--sidebar-background', fg: '--sidebar-foreground' },
      { name: 'sidebar-primary', var: '--sidebar-primary', fg: '--sidebar-primary-foreground' },
      { name: 'sidebar-accent', var: '--sidebar-accent', fg: '--sidebar-accent-foreground' },
      { name: 'sidebar-border', var: '--sidebar-border' },
    ],
  },
];

function ColorSwatch({ name, cssVar, fgVar }: { name: string; cssVar: string; fgVar?: string }) {
  const [hex, setHex] = React.useState('');
  const swatchRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (swatchRef.current) {
      const computed = getComputedStyle(swatchRef.current).backgroundColor;
      // Convert rgb(r, g, b) to hex
      const match = computed.match(/\d+/g);
      if (match && match.length >= 3) {
        const [r, g, b] = match.map(Number);
        setHex(`#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`);
      }
    }
  });

  return (
    <div className="flex flex-col gap-1.5">
      <div
        ref={swatchRef}
        className="flex h-24 flex-col items-start justify-between rounded-lg border border-border/50 p-3 shadow-sm"
        style={{ backgroundColor: `var(${cssVar})` }}
      >
        {fgVar && (
          <span className="text-lg font-semibold" style={{ color: `var(${fgVar})` }}>
            Aa
          </span>
        )}
        {hex && (
          <span
            className="font-mono text-[10px] opacity-60"
            style={{ color: fgVar ? `var(${fgVar})` : undefined }}
          >
            {hex}
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium">{name}</p>
        <p className="font-mono text-xs text-muted-foreground">{cssVar}</p>
      </div>
    </div>
  );
}

export function ColorsPage() {
  return (
    <div className="flex flex-col gap-6 p-4 lg:p-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">Color Palette</h2>
        <p className="text-muted-foreground">
          All semantic color tokens from the current theme. Switch themes to see how colors adapt.
        </p>
      </div>
      {colorGroups.map(group => (
        <Card key={group.title}>
          <CardHeader>
            <CardTitle>{group.title}</CardTitle>
            <CardDescription>
              {group.title === 'Interactive'
                ? 'Action colors for buttons, links, and interactive elements'
                : group.title === 'Backgrounds'
                  ? 'Surface colors for containers and page backgrounds'
                  : group.title === 'Charts'
                    ? 'Data visualization colors'
                    : `${group.title} tokens`}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
              {group.colors.map(color => (
                <ColorSwatch
                  key={color.name}
                  name={color.name}
                  cssVar={color.var}
                  fgVar={color.fg}
                />
              ))}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
