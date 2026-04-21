import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Moon, Sun, Palette, Check } from 'lucide-react';
import { Separator } from '@coston/ui/separator';
import { SidebarTrigger } from '@coston/ui/sidebar';
import { Button } from '@coston/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@coston/ui/dropdown-menu';
import tokens from '@coston/design-tokens/tokens.json';

const availableThemes = Object.keys(tokens.themes)
  .filter(name => !name.endsWith('-dark') && name !== 'dark')
  .map(name => ({
    value: name === 'light' ? 'default' : name,
    label: name === 'light' ? 'Default' : name.charAt(0).toUpperCase() + name.slice(1),
  }));

type BrandTheme = (typeof availableThemes)[number]['value'];

function applyTheme(brand: BrandTheme, isDark: boolean) {
  if (brand === 'default') {
    delete document.documentElement.dataset.theme;
  } else {
    document.documentElement.dataset.theme = brand;
  }
  document.documentElement.classList.toggle('dark', isDark);
}

export function SiteHeader() {
  const [isDark, setIsDark] = useState(() => {
    const saved = localStorage.getItem('theme-mode');
    if (saved) return saved === 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });
  const [brand, setBrand] = useState<BrandTheme>(() => {
    const saved = localStorage.getItem('theme-variant') || localStorage.getItem('theme-brand');
    if (saved === 'tokyo-night') return 'purple';
    return (saved as BrandTheme) || 'default';
  });

  useEffect(() => {
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

  const location = useLocation();
  const pageNames: Record<string, string> = {
    '/': 'Dashboard',
    '/mail': 'Mail',
    '/files': 'Files',
    '/notifications': 'Notifications',
    '/cards': 'Cards',
    '/gallery': 'Gallery',
    '/settings': 'Settings',
    '/pricing': 'Pricing',
    '/typography': 'Typography',
    '/colors': 'Colors',
  };
  const currentPage = pageNames[location.pathname] || 'Dashboard';

  return (
    <header className="flex h-12 shrink-0 items-center gap-2 border-b border-border/50 transition-[width,height] ease-linear">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
        <h1 className="text-base font-medium">{currentPage}</h1>
        <div className="ml-auto flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={toggleTheme}>
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-7 w-7">
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
    </header>
  );
}
