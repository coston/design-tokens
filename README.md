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

Access token values programmatically:

```typescript
import tokens from '@coston/design-tokens';

console.log(tokens.semantic.primary); // "oklch(0.530 0.186 255)"
console.log(tokens.themes.dark.background); // "oklch(0.137 0 0)"
```

## Advanced Features

### Theme Generation

Generate complete themes from a single brand color using mathematical color theory:

```typescript
import { generateThemeFromColor } from '@coston/design-tokens/utils';

const theme = generateThemeFromColor({
  baseColor: 'oklch(0.6 0.08 300)', // Your brand color (required)
  hueRange: 20, // Optional: Keep colors within ±20° hue (default: 60)
});

// Returns { light: {...}, dark: {...} }
console.log(theme.light.primary); // "oklch(0.530 0.186 300)"
console.log(theme.dark.background); // "oklch(0.137 0 0)"
```

**Generate theme files (for package developers):**

```bash
# Generate theme files from a base color
npm run theme:generate "oklch(0.6 0.15 240)" my-theme
# Creates: my-theme-light.json, my-theme-dark.json

# With defaults
npm run theme:generate
# Creates: generated-light.json, generated-dark.json
```

### Color Scale Generation

Create perceptually uniform color scales (50-950):

```typescript
import { generateColorScale } from '@coston/design-tokens/utils';

const scale = generateColorScale('oklch(0.6 0.2 280)');
// Returns: { 50: 'oklch(...)', 100: 'oklch(...)', ..., 950: 'oklch(...)' }

console.log(scale[500]); // Base color
console.log(scale[900]); // Very dark variant
```

**Generate scale files (for package developers):**

```bash
# Generate color scale from a base color
npm run scale:generate "oklch(0.65 0.2 150)" green-scale
# Creates: green-scale.json with 50-950 scale

# With defaults
npm run scale:generate
# Creates: scale.json
```

### Color Utilities

```typescript
import {
  lighten,
  darken,
  adjustLightness,
  adjustChroma,
  adjustHue,
  getComplementary,
  getAnalogous,
  getTriadic,
  checkContrast,
  oklchToHex,
} from '@coston/design-tokens/utils';

// Adjust colors
lighten('oklch(0.5 0.2 200)', 0.1); // Increase lightness by 0.1
darken('oklch(0.5 0.2 200)', 0.1); // Decrease lightness by 0.1
adjustChroma('oklch(0.5 0.2 200)', 0.05); // Increase saturation
adjustHue('oklch(0.5 0.2 200)', 30); // Rotate hue by 30°

// Color harmonies
getComplementary('oklch(0.6 0.2 200)'); // Opposite hue (180° rotation)
getAnalogous('oklch(0.6 0.2 200)'); // Adjacent hues (±30°)
getTriadic('oklch(0.6 0.2 200)'); // Three evenly spaced hues (120° apart)

// WCAG contrast validation
const result = checkContrast('oklch(0.2 0.1 240)', 'oklch(0.95 0.02 240)');
console.log(result.ratio); // 12.5
console.log(result.AA); // true (passes WCAG AA: 4.5:1)
console.log(result.AAA); // true (passes WCAG AAA: 7:1)

// Convert to hex for CSS fallbacks
oklchToHex('oklch(0.6 0.2 280)'); // "#7b4eff"
```

## Package Exports

- `@coston/design-tokens/tokens.css` - Pure CSS variables
- `@coston/design-tokens/tailwind.css` - With Tailwind utility classes
- `@coston/design-tokens/tokens.json` - Token metadata as JSON
- `@coston/design-tokens` - JavaScript/TypeScript module
- `@coston/design-tokens/utils` - Color utilities and theme generation

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
