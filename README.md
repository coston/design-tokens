# @coston/design-tokens

Production-ready CSS design tokens built with OKLCH colors. Framework-agnostic, semantic naming, and built-in light/dark themes.

## Features

- **Pure CSS Variables** - Zero runtime, works everywhere
- **OKLCH Colors** - Perceptually uniform, mathematically sound (see [resources/color-theory.md](resources/color-theory.md))
- **Gamut-Aware** - Automatic sRGB gamut mapping ensures all colors are displayable
- **Semantic Tokens** - `primary`, `secondary`, `muted`, etc. work across light/dark themes
- **Framework Agnostic** - React, Vue, Svelte, Angular, vanilla JS, or any CSS
- **WCAG Validated** - Automatic contrast checking
- **TypeScript Support** - Full type definitions included
- **Optional Tailwind** - Pre-built integration if you want utility classes

## Quick Start

### 1. Install

```bash
npm install @coston/design-tokens
```

### 2. Import in your CSS

```css
/* styles.css */
@import '@coston/design-tokens/tokens.css';
```

Or in JavaScript:

```js
import '@coston/design-tokens/tokens.css';
```

### 3. Use CSS variables

```css
.button {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
}

.card {
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius);
}
```

### Optional: Tailwind Integration

Using Tailwind? Import `tailwind.css` instead for utility classes:

```css
/* styles.css */
@import '@coston/design-tokens/tailwind.css';
```

Then use Tailwind classes:

```jsx
<div className="bg-primary text-primary-foreground">
  <button className="bg-secondary text-secondary-foreground rounded-sm">Click me</button>
</div>
```

## Dark Mode

Toggle dark mode by adding/removing the `.dark` class on the document root:

```js
// Toggle dark mode
document.documentElement.classList.toggle('dark');

// Or set explicitly
document.documentElement.classList.add('dark'); // Enable
document.documentElement.classList.remove('dark'); // Disable
```

### Alternative Themes

Apply alternative color themes using `data-theme`:

```js
// Available: "forest" (green), "purple" (muted)
document.documentElement.dataset.theme = 'forest';

// Combine with dark mode
document.documentElement.dataset.theme = 'purple';
document.documentElement.classList.add('dark');
```

## Available Tokens

**Colors:**

- `--background`, `--foreground` - Page background and text
- `--primary`, `--primary-foreground` - Primary actions
- `--secondary`, `--secondary-foreground` - Secondary actions
- `--card`, `--card-foreground` - Card backgrounds
- `--muted`, `--muted-foreground` - Subtle elements
- `--accent`, `--accent-foreground` - Accent highlights
- `--destructive`, `--destructive-foreground` - Danger actions
- `--border`, `--input`, `--ring` - Borders and focus rings
- `--chart-1` through `--chart-5` - Chart colors
- `--sidebar-*` - Sidebar-specific tokens

**Other:**

- `--radius` - Border radius (0.5rem default)

## JavaScript/TypeScript Access

Access token values from the JSON file:

```typescript
import tokens from '@coston/design-tokens/tokens.json';

console.log(tokens.semantic.primary); // "oklch(0.530 0.186 255)"
console.log(tokens.themes.dark.background); // "oklch(0.137 0 0)"
```

## Advanced: Custom Theme Generation

Generate a complete custom theme from your brand color:

```typescript
import { generateThemeFromColor } from '@coston/design-tokens';

const theme = generateThemeFromColor({
  baseColor: 'oklch(0.6 0.15 280)', // Your brand color
  hueRange: 30, // Optional: hue variation range (default: 60)
});

// Returns { light: {...}, dark: {...} }
// Each contains all semantic tokens (primary, secondary, etc.)
console.log(theme.light.primary); // "oklch(0.530 0.186 280)"
console.log(theme.dark.background); // "oklch(0.137 0 0)"
```

This generates a mathematically balanced theme with proper contrast ratios for both light and dark modes.

## Package Exports

- `@coston/design-tokens` - Theme generation utility (`generateThemeFromColor`)
- `@coston/design-tokens/tokens.json` - Token data (core, semantic, themes)
- `@coston/design-tokens/tokens.css` - Pure CSS variables
- `@coston/design-tokens/tailwind.css` - Tailwind utility classes

## Demo

**[🎨 View Live Demo](https://coston.github.io/design-tokens/)**

Interactive showcase with component examples, theme switching, and token visualization.

See the [demo/](./demo) directory for the source code and local development:

```bash
npm install && npm run build
cd demo && npm install && npm run dev
```

## Documentation

- **[resources/color-theory.md](resources/color-theory.md)** - Color science fundamentals and OKLCH explanation
- **[CHANGELOG.md](CHANGELOG.md)** - Version history
- **[demo/README.md](demo/README.md)** - Framework integration guides (React, Vue, Svelte, Vanilla JS)

## License

MIT
