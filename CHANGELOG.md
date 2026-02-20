# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-02-19

### Added

- **OKLCH Color System** - Perceptually uniform color space for all tokens
- **Theme Generation** - Mathematical theme generation from a single base color
  - `generateThemeFromColor()` - Creates cohesive light + dark themes
  - `generateColorScale()` - Generates 50-950 perceptually uniform scales
  - `npm run theme:generate` and `npm run scale:generate` scripts
- **Color Utilities** - Comprehensive OKLCH color manipulation
  - Adjust lightness, chroma, and hue
  - Color harmonies (complementary, analogous, triadic, tetradic, split-complementary)
  - Mix colors, lighten, darken, saturate, desaturate
  - Convert to hex for browser fallbacks
- **Contrast Validation** - WCAG accessibility checking
  - `checkContrast()` - Calculate contrast ratios
  - Build-time WCAG AA/AAA validation
  - Automatic suggestions for color adjustments
- **Semantic Tokens** - shadcn/ui-compatible token system
  - Light and dark themes with `.dark` class
  - Alternative themes via `data-theme` attribute
  - All color pairs validated for WCAG AA (4.5:1)
- **Framework Agnostic** - Pure CSS variables work everywhere
  - React, Vue, Svelte, vanilla JavaScript
  - Optional Tailwind v4 integration
  - TypeScript definitions included
- **Demo Application** - Interactive showcase with React + Tailwind
  - Component examples
  - Theme switching
  - Token visualizer
  - Framework integration guides

### Package Exports

- `@coston/design-tokens/tokens.css` - Pure CSS variables
- `@coston/design-tokens/tailwind.css` - With Tailwind utility classes
- `@coston/design-tokens/tokens.json` - Token metadata as JSON
- `@coston/design-tokens` - JavaScript/TypeScript module
- `@coston/design-tokens/utils` - Color utilities and theme generation

### Documentation

- **README.md** - Complete usage guide with examples
- **resources/color-theory.md** - Color science fundamentals
- **demo/README.md** - Framework integration guides
- **CHANGELOG.md** - Version history

[0.1.0]: https://github.com/yourusername/design-tokens/releases/tag/v0.1.0
