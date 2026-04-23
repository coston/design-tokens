# @coston/design-tokens

Production-ready CSS design tokens built with OKLCH colors. Framework-agnostic, semantic naming, built-in light/dark themes, and a CLI for generating, linting, and maintaining W3C DTCG token files.

## Features

- **Pure CSS Variables** - Zero runtime, works everywhere
- **OKLCH Colors** - Perceptually uniform, mathematically sound (see [resources/color-theory.md](resources/color-theory.md))
- **Gamut-Aware** - Automatic sRGB gamut mapping ensures all colors are displayable
- **Semantic Tokens** - `primary`, `secondary`, `muted`, etc. work across light/dark themes
- **Framework Agnostic** - React, Vue, Svelte, Angular, vanilla JS, or any CSS
- **WCAG Validated** - Automatic contrast checking
- **TypeScript Support** - Full type definitions included
- **Optional Tailwind** - Pre-built integration if you want utility classes
- **CLI Tools** - `init`, `lint`, `diff`, `fix` commands for W3C DTCG token files

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

## CLI

The package includes a CLI for generating, validating, and maintaining W3C DTCG token files.

### `design-tokens init <color>`

Generate a complete token set from a single base color:

```bash
# From a hex color
design-tokens init "#0461DE"

# From an OKLCH color
design-tokens init "oklch(0.6 0.175 240)"

# Custom output directory, no dark theme
design-tokens init "#0461DE" --out ./src/tokens --no-dark

# Adjust color theory parameters
design-tokens init "#0461DE" --hue-range 30 --chroma-scale 0.8
```

Generates W3C DTCG JSON files with 34 semantic color tokens per theme (light and dark), including all foreground pairs, chart colors, and sidebar variants. All foreground/background pairs are WCAG AA contrast-enforced.

### `design-tokens lint [dir]`

Validate token files without generating output:

```bash
design-tokens lint                     # Current directory
design-tokens lint ./tokens            # Specific directory
design-tokens lint --rule wcag-contrast  # Single rule
design-tokens lint --json              # JSON output for CI
```

**Rules:**

| Rule                     | Severity | Description                                         |
| ------------------------ | -------- | --------------------------------------------------- |
| `broken-references`      | error    | Unresolved `{token.path}` references                |
| `wcag-contrast`          | error    | Foreground/background pairs failing WCAG AA (4.5:1) |
| `missing-pairs`          | warning  | Background token without `-foreground` sibling      |
| `stale-annotations`      | warning  | WCAG annotation data doesn't match computed values  |
| `orphaned-tokens`        | warning  | Tokens never referenced by semantic tokens          |
| `missing-metadata`       | warning  | Tokens missing `$description` or `$type`            |
| `missing-semantic-roles` | warning  | No primary/background/foreground tokens defined     |

**Exit codes:** 0 = pass, 1 = errors, 2 = warnings only.

### `design-tokens diff [ref]`

Compare current tokens against a git ref:

```bash
design-tokens diff                     # Compare against HEAD~1
design-tokens diff v0.2.0              # Compare against a tag
design-tokens diff main                # Compare against a branch
design-tokens diff HEAD~3 --json       # JSON output
```

Shows added, removed, and modified tokens with WCAG contrast impact for color changes.

### `design-tokens fix [dir]`

Auto-update derivable metadata in token source files:

```bash
design-tokens fix                      # Fix in place
design-tokens fix --check              # Dry run (exit 1 if stale)
design-tokens fix --check --json       # CI mode
```

**Operations:**

- Updates WCAG annotation ratios/levels in `$extensions.*.wcag` blocks
- Scaffolds missing `$extensions` blocks
- Infers missing `$type` from `$value` (hex/oklch = "color", px/rem = "dimension")

### Programmatic API

All CLI commands are available as importable functions:

```typescript
import { generateThemeFromColor } from '@coston/design-tokens';

// Theme generation (used by init command)
const theme = generateThemeFromColor({
  baseColor: 'oklch(0.6 0.175 240)',
  hueRange: 20,
});
// Returns { light: Record<string, string>, dark: Record<string, string> }
```

### Config File

Create `design-tokens.config.json` in your project root to customize lint behavior:

```json
{
  "tokenPaths": ["tokens/core/*.json", "tokens/semantic/*.json"],
  "lint": {
    "orphanAllowlist": ["brand.tan", "brand.ui-cyan"],
    "contrastMinimum": 4.5,
    "ignorePaths": ["tokens/experimental/**"]
  }
}
```

## Package Exports

- `@coston/design-tokens` - Theme generation API (`generateThemeFromColor`)
- `@coston/design-tokens/tokens.json` - Token data (core, semantic, themes)
- `@coston/design-tokens/tokens.css` - Pure CSS variables
- `@coston/design-tokens/tailwind.css` - Tailwind utility classes
- `design-tokens` (CLI) - `init`, `lint`, `diff`, `fix` commands

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
