# Design Tokens Demo

Interactive demonstration of `@coston/design-tokens` showing how to use CSS variables for theming.

> **Note:** This demo uses React + Tailwind for convenience, but the design tokens work with **any framework** using pure CSS variables. See the setup guides below for framework-agnostic usage.

## Quick Start

```bash
# From the root directory, build the tokens package first
cd ..
npm install
npm run build

# Then run the demo
cd demo
npm install
npm run dev
```

The demo will be available at `http://localhost:5173`

## What's Included

- **Component Examples** - Buttons, cards, dialogs, forms styled with tokens
- **Theme Switching** - Light/dark mode toggle
- **Token Visualizer** - View all available tokens and their values
- **CSS Variable Examples** - See how tokens work without any framework

## Project Structure

```
demo/
├── src/
│   ├── components/
│   │   ├── ui/              # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   ├── dialog.tsx
│   │   │   ├── dropdown-menu.tsx
│   │   │   ├── input.tsx
│   │   │   ├── label.tsx
│   │   │   ├── tabs.tsx
│   │   │   └── badge.tsx
│   │   └── Layout.tsx       # Main layout with nav
│   ├── pages/
│   │   ├── Home.tsx         # Component showcase
│   │   ├── TokenVisualizer.tsx
│   │   └── Contract.tsx     # CSS variables list
│   ├── lib/
│   │   └── utils.ts         # cn() helper
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── package.json
├── vite.config.ts
└── tsconfig.json
```

## Setup in Your Project (Framework Agnostic)

The design tokens are **pure CSS variables** that work with any framework or no framework at all.

### Basic Setup (Any Framework)

#### 1. Install

```bash
npm install @coston/design-tokens
```

#### 2. Import the CSS

In your global stylesheet:

```css
/* styles.css or app.css or index.css */
@import '@coston/design-tokens/tokens.css';
```

Or in your JavaScript entry point:

```js
// main.js, index.js, App.tsx, etc.
import '@coston/design-tokens/tokens.css';
```

#### 3. Use CSS variables

```css
/* In your CSS files */
.button {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  border: none;
}

.card {
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.page {
  background: var(--background);
  color: var(--foreground);
  min-height: 100vh;
}
```

#### 4. Add dark mode toggle

```js
// Toggle dark mode by adding/removing the 'dark' class
function toggleDarkMode() {
  document.documentElement.classList.toggle('dark');
}

// Enable dark mode
document.documentElement.classList.add('dark');

// Disable dark mode
document.documentElement.classList.remove('dark');
```

### Framework-Specific Examples

#### React (with CSS)

```tsx
// main.tsx
import '@coston/design-tokens/tokens.css';
import './styles.css'; // Your custom CSS using the tokens

function App() {
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', isDark);
  }, [isDark]);

  return (
    <div className="page">
      <button className="button" onClick={() => setIsDark(!isDark)}>
        {isDark ? '☀️' : '🌙'}
      </button>
      <h1 style={{ color: 'var(--primary)' }}>Hello World</h1>
    </div>
  );
}
```

```css
/* styles.css */
.page {
  background: var(--background);
  color: var(--foreground);
  min-height: 100vh;
}

.button {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  border: none;
  cursor: pointer;
}
```

#### Vue (with CSS)

```vue
<!-- App.vue -->
<script setup>
import { ref, watch } from 'vue';
import '@coston/design-tokens/tokens.css';
import './styles.css';

const isDark = ref(false);

watch(isDark, dark => {
  document.documentElement.classList.toggle('dark', dark);
});
</script>

<template>
  <div class="page">
    <button class="button" @click="isDark = !isDark">
      {{ isDark ? '☀️' : '🌙' }}
    </button>
    <h1 :style="{ color: 'var(--primary)' }">Hello World</h1>
  </div>
</template>
```

#### Svelte (with CSS)

```svelte
<script>
  import '@coston/design-tokens/tokens.css';
  import './styles.css';

  let isDark = false;

  $: {
    if (typeof document !== 'undefined') {
      document.documentElement.classList.toggle('dark', isDark);
    }
  }
</script>

<div class="page">
  <button class="button" on:click={() => isDark = !isDark}>
    {isDark ? '☀️' : '🌙'}
  </button>
  <h1 style="color: var(--primary)">Hello World</h1>
</div>
```

#### Vanilla JavaScript

```html
<!DOCTYPE html>
<html>
  <head>
    <style>
      body {
        background: var(--background);
        color: var(--foreground);
        font-family: system-ui;
        min-height: 100vh;
        margin: 0;
        padding: 2rem;
      }

      .button {
        background: var(--primary);
        color: var(--primary-foreground);
        border-radius: var(--radius);
        padding: 0.5rem 1rem;
        border: none;
        cursor: pointer;
        font-size: 1rem;
      }

      .card {
        background: var(--card);
        color: var(--card-foreground);
        border: 1px solid var(--border);
        border-radius: var(--radius);
        padding: 1.5rem;
        margin-top: 1rem;
      }
    </style>
  </head>
  <body>
    <button class="button" id="theme-toggle">🌙 Toggle Theme</button>
    <h1 style="color: var(--primary)">Hello World</h1>

    <div class="card">
      <h2>Card Title</h2>
      <p style="color: var(--muted-foreground)">This is a card using design tokens.</p>
    </div>

    <script type="module">
      import '@coston/design-tokens/tokens.css';

      const btn = document.getElementById('theme-toggle');
      let isDark = false;

      btn.addEventListener('click', () => {
        isDark = !isDark;
        document.documentElement.classList.toggle('dark', isDark);
        btn.textContent = isDark ? '☀️ Toggle Theme' : '🌙 Toggle Theme';
      });
    </script>
  </body>
</html>
```

## Using CSS Variables

Use the tokens directly in your CSS or inline styles:

```css
/* Button styles */
.button-primary {
  background: var(--primary);
  color: var(--primary-foreground);
  border-radius: var(--radius);
  padding: 0.5rem 1rem;
  border: none;
}

.button-primary:hover {
  opacity: 0.9;
}

.button-primary:focus {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

.button-secondary {
  background: var(--secondary);
  color: var(--secondary-foreground);
  border: 1px solid var(--border);
}

.button-destructive {
  background: var(--destructive);
  color: var(--destructive-foreground);
}

/* Card styles */
.card {
  background: var(--card);
  color: var(--card-foreground);
  border: 1px solid var(--border);
  border-radius: var(--radius);
  padding: 1.5rem;
}

.card-title {
  color: var(--foreground);
  font-weight: bold;
}

.card-description {
  color: var(--muted-foreground);
  margin-top: 0.5rem;
}

/* Input styles */
.input {
  background: var(--background);
  color: var(--foreground);
  border: 1px solid var(--input);
  border-radius: var(--radius);
  padding: 0.5rem 0.75rem;
}

.input:focus {
  outline: 2px solid var(--ring);
  outline-offset: 2px;
}

/* Page layout */
.page {
  background: var(--background);
  color: var(--foreground);
  min-height: 100vh;
}
```

Or use inline styles:

```tsx
<div
  style={{
    background: 'var(--card)',
    color: 'var(--card-foreground)',
    borderRadius: 'var(--radius)',
    padding: '1.5rem',
  }}
>
  <h2 style={{ color: 'var(--foreground)' }}>Card Title</h2>
  <p style={{ color: 'var(--muted-foreground)' }}>Description</p>
</div>
```

## Optional: Tailwind Integration

If you prefer using Tailwind CSS, import the Tailwind version instead in your global CSS:

```css
/* styles.css */
@import '@coston/design-tokens/tailwind.css';
```

Or in JavaScript:

```js
// main.js
import '@coston/design-tokens/tailwind.css';
```

Then install Tailwind:

```bash
npm install -D tailwindcss@4 @tailwindcss/postcss
```

Configure PostCSS:

```js
// postcss.config.js
export default {
  plugins: {
    '@tailwindcss/postcss': {},
  },
};
```

Now you can use Tailwind classes:

```tsx
<div className="bg-background text-foreground">
  <button className="bg-primary text-primary-foreground rounded-sm px-4 py-2">
    Primary Button
  </button>
  <div className="bg-card text-card-foreground border border-border rounded-lg p-6">
    <h2 className="text-foreground font-bold">Card Title</h2>
    <p className="text-muted-foreground">Card description</p>
  </div>
</div>
```

## Optional: shadcn/ui Integration

The demo uses shadcn/ui components (which require Tailwind). These are **optional** and only needed if you want pre-built React components.

### Installing shadcn/ui Components

```bash
# Initialize shadcn/ui (requires Tailwind)
npx shadcn@latest init

# Add individual components
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
```

### Copying Components from Demo

You can also copy components directly from the `src/components/ui/` directory. They're pre-configured to work with the design tokens but require Tailwind CSS.

## Available Tokens

All tokens are available as CSS variables:

### Color Tokens

- `--background`, `--foreground` - Page background and text
- `--primary`, `--primary-foreground` - Primary actions (buttons, links)
- `--secondary`, `--secondary-foreground` - Secondary actions
- `--card`, `--card-foreground` - Card/panel backgrounds
- `--popover`, `--popover-foreground` - Popover/dialog backgrounds
- `--muted`, `--muted-foreground` - Muted/subtle elements
- `--accent`, `--accent-foreground` - Accent highlights
- `--destructive`, `--destructive-foreground` - Destructive/danger actions
- `--border` - Border color
- `--input` - Input borders
- `--ring` - Focus ring color

### Chart Colors

- `--chart-1` through `--chart-5` - Data visualization colors

### Sidebar Tokens

- `--sidebar-background`, `--sidebar-foreground`
- `--sidebar-primary`, `--sidebar-primary-foreground`
- `--sidebar-accent`, `--sidebar-accent-foreground`
- `--sidebar-border`, `--sidebar-ring`

### Other

- `--radius` - Border radius (default: 0.5rem)

Run the demo and visit the **Token Visualizer** page to see all tokens with their current values in both light and dark modes.

## Building for Production

```bash
# Build the demo
npm run build

# Preview the build
npm run preview
```

The build output will be in the `dist/` directory.

## TypeScript Support

The package includes TypeScript definitions. Import token data from JSON:

```typescript
import tokens from '@coston/design-tokens/tokens.json';

console.log(tokens.semantic.primary);
// "oklch(0.530 0.186 255)"

console.log(tokens.themes.dark.background);
// "oklch(0.137 0 0)"
```

Import utilities from the main package:

```typescript
import { lighten, darken, generateThemeFromColor } from '@coston/design-tokens';
```

## Learn More

- [Main Documentation](../README.md) - Complete guide to using the design tokens
- [Color Theory](../resources/color-theory.md) - Understanding OKLCH and the color system
- [CHANGELOG](../CHANGELOG.md) - Version history and updates

### Optional Integration Docs

- [Tailwind v4 Documentation](https://tailwindcss.com/docs) - If using the Tailwind integration
- [shadcn/ui Documentation](https://ui.shadcn.com) - If using shadcn/ui components
