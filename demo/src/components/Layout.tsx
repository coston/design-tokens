import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { Button } from '@coston/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@coston/ui/dropdown-menu';
import { cn } from '@coston/ui/lib/utils';
import tokens from '@coston/design-tokens/tokens.json';

interface LayoutProps {
  children: React.ReactNode;
}

// Auto-generate available themes from tokens (exclude dark mode variants)
const availableThemes = Object.keys(tokens.themes)
  .filter(name => !name.endsWith('-dark') && name !== 'dark') // Exclude dark variants and standalone dark
  .map(name => ({
    value: name === 'light' ? 'default' : name,
    label: name === 'light' ? 'Default' : name.charAt(0).toUpperCase() + name.slice(1),
  }));

type BrandTheme = (typeof availableThemes)[number]['value'];

export function Layout({ children }: LayoutProps) {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    if (saved) {
      return saved === 'dark';
    }
    // Detect OS preference if no saved preference
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [brand, setBrand] = useState<BrandTheme>(() => {
    const saved = localStorage.getItem('theme-variant') || localStorage.getItem('theme-brand');
    // Handle old tokyo-night value
    if (saved === 'tokyo-night') {
      return 'purple';
    }
    return (saved as BrandTheme) || 'default';
  });
  const location = useLocation();

  // Helper to apply theme based on current brand and dark mode
  const applyTheme = (currentBrand: BrandTheme, currentDark: boolean) => {
    // All themes now use .dark class consistently
    if (currentBrand === 'default') {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = currentBrand;
    }
    document.documentElement.classList.toggle('dark', currentDark);
  };

  useEffect(() => {
    // Apply theme on mount
    applyTheme(brand, isDark);
  }, []);

  const toggleTheme = () => {
    const newDark = !isDark;
    setIsDark(newDark);
    applyTheme(brand, newDark);
    localStorage.setItem('theme-mode', newDark ? 'dark' : 'light');
  };

  const selectBrand = (selectedBrand: BrandTheme) => {
    setBrand(selectedBrand);
    applyTheme(selectedBrand, isDark);
    localStorage.setItem('theme-variant', selectedBrand);
  };

  const navigation = [
    { name: 'Components', path: '/' },
    { name: 'Tokens', path: '/tokens' },
    { name: 'Theme Creator', path: '/theme-creator' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground transition-colors">
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-lg font-bold">Design Tokens</h1>
                <p className="text-xs text-muted-foreground">Semantic tokens for web apps</p>
              </div>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              {navigation.map(item => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    'text-sm font-medium transition-colors hover:text-primary',
                    location.pathname === item.path ? 'text-foreground' : 'text-muted-foreground'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
            <div className="ml-auto md:ml-0 flex items-center gap-2">
              <Button variant="outline" size="icon" onClick={toggleTheme}>
                {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                <span className="sr-only">Toggle theme</span>
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="icon">
                    <Palette className="h-4 w-4" />
                    <span className="sr-only">Select theme</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Select Theme</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {availableThemes.map(theme => (
                    <DropdownMenuItem
                      key={theme.value}
                      onClick={() => selectBrand(theme.value)}
                      className="cursor-pointer"
                    >
                      {theme.label}
                      {brand === theme.value && <Check className="ml-auto h-4 w-4" />}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
          <nav className="flex md:hidden items-center gap-4 mt-4 border-t border-border pt-4">
            {navigation.map(item => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  'text-sm font-medium transition-colors hover:text-primary',
                  location.pathname === item.path ? 'text-foreground' : 'text-muted-foreground'
                )}
              >
                {item.name}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">{children}</main>
      <footer className="border-t border-border mt-16">
        <div className="container mx-auto px-4 py-6 text-center text-sm text-muted-foreground">
          <p>@coston/design-tokens · OKLCH colors · Tailwind v4 · Framework agnostic</p>
        </div>
      </footer>
    </div>
  );
}
