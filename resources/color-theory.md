# Color Theory Fundamentals

This document explains the color science foundations behind `@coston/design-tokens`.

Tokens are generated and validated using measurable color models and standards:

- Perceptual lightness modeling (Oklab/OKLCH)
- Hue-angle geometry
- Chroma–lightness interaction
- WCAG contrast mathematics
- sRGB gamut constraints

The system is engineered using established color science and accessibility standards rather than aesthetic guesswork.

# 1. Hue Geometry: The Color Wheel

In cylindrical color models (HSL, HSV, OKLCH), hue is represented as an angle on a 360° circle.

```
  0° = Red
 30° = Red-Orange
 60° = Orange
 90° = Yellow
120° = Yellow-Green
150° = Green
180° = Cyan
210° = Blue-Cyan
240° = Blue
270° = Blue-Violet
300° = Violet/Magenta
330° = Red-Violet
360° = Red (back to start)
```

These angle conventions are standard in digital color systems.

## Hue Distance and Harmony

Color harmony schemes are commonly defined using angular relationships on the hue circle.

### Analogous (adjacent hues, typically ~30–60° apart)

Colors near each other on the wheel tend to feel cohesive because they share spectral proximity.

```ts
purple = adjustHue(base, +40);
```

The ±30–60° range is a conventional design guideline, not a physical law.

### Complementary (180° apart)

Opposite hues maximize chromatic separation within the hue dimension.

```ts
complement = adjustHue(base, +180);
```

Complementary pairs increase perceptual distinction, particularly when luminance contrast is also sufficient.

### Split Complement (180° ± ~30°)

Provides strong hue contrast with slightly reduced visual tension compared to strict complements.

## Semantic Hue Strategy

| Role        | Hue         | Rationale (conventional)                                         |
| ----------- | ----------- | ---------------------------------------------------------------- |
| Primary     | 240° Blue   | Commonly associated with stability and trust (culture-dependent) |
| Accent      | 280° Purple | Adjacent harmony with creative differentiation                   |
| Success     | 150° Green  | Widely associated with “safe” or “go” in UI systems              |
| Warning     | 85° Yellow  | High visibility; commonly signals caution                        |
| Destructive | 20° Red     | Strong alert signal in many cultural contexts                    |

Warm–cool separation enhances categorical distinction, though emotional meaning is context- and culture-dependent.

# 2. Perceptual Uniformity: Why Use OKLCH

RGB and HSL are device-based coordinate systems derived from display primaries. They are not perceptually uniform.

Human brightness perception is nonlinear and cannot be accurately modeled by linear RGB interpolation.

OKLCH (derived from Oklab) is designed to be approximately perceptually uniform for lightness and color difference.

```
L = Perceptual lightness (0–1)
C = Chroma
H = Hue angle (0–360°)
```

Equal steps in OKLCH lightness (L) tend to produce more consistent perceived differences than equal steps in HSL lightness.

No color model is perfectly uniform across all hues and observers, but OKLCH significantly improves uniformity relative to HSL/HSV.

## Lightness Curve Generation

Human brightness perception follows a nonlinear response curve (often modeled using power-law approximations).

In display systems, gamma transfer functions (commonly approximated near 2.2 in sRGB workflows) reflect nonlinear intensity encoding.

We generate lightness ramps using a custom nonlinear blend of power functions:

```ts
const L = Math.pow(1 - t, 2.2) * 0.985 + Math.pow(t, 1 / 2.2) * 0.137;
```

This curve is not a formal sRGB transfer function. It is a perceptual easing strategy inspired by gamma-style nonlinear behavior to improve visual step consistency.

The goal is visually even spacing, not strict adherence to a specific display transfer curve.

# 3. Chroma Behavior and the Helmholtz–Kohlrausch Effect

The Helmholtz–Kohlrausch (HK) effect describes how highly saturated colors can appear brighter than less saturated colors of equal luminance.

For example:

```
oklch(0.5 0 240)
oklch(0.5 0.2 240)
```

Even with matched lightness values, the higher-chroma color may appear perceptually brighter.

HK is traditionally described relative to luminance, but similar perceptual phenomena occur when comparing colors with matched lightness correlates.

## Chroma Curve by Lightness

Because:

- High-chroma near-white colors can appear neon
- High-chroma near-black colors can appear muddy
- Mid-lightness regions tolerate stronger chroma before distortion

We apply a chroma adjustment curve across the lightness ramp.

Mid-tones (often around L ≈ 0.5–0.6) typically allow greater chroma within sRGB before clipping or perceptual imbalance, though exact behavior varies by hue.

This approach balances vibrancy with natural appearance and gamut safety.

# 4. Contrast Mathematics (WCAG)

WCAG defines contrast ratio using relative luminance:

```
(L1 + 0.05) / (L2 + 0.05)
```

Where L1 ≥ L2 and luminance is computed from linear-light RGB.

Standard thresholds:

| Ratio | WCAG Level |
| -- | |
| 3:1 | AA (large text) |
| 4.5:1 | AA (normal text) |
| 7:1 | AAA (normal text) |
| 21:1 | Maximum theoretical (black on white) |

The formula itself is not logarithmic, but it compensates for nonlinear brightness perception through relative luminance modeling.

Meeting 4.5:1 supports WCAG AA compliance for standard text, improving accessibility for many users with low vision. It does not guarantee universal readability in all contexts.

# 5. Lightness Hierarchy and Value Structure

Munsell’s color system defines “value” as the lightness dimension of color.

In UI systems, lightness contrast strongly influences figure–ground perception and hierarchy.

Higher luminance contrast increases perceptual prominence.

## Light Theme Example

| Role | Approx L | Function |
| - | -- | |
| Background | ~0.98 | Recedes |
| Foreground | ~0.36 | Advances |
| Primary | ~0.60 | Emphasis |
| Muted | ~0.89 | Low emphasis |

These values are implementation decisions, not universal constants.

## Dark Theme Inversion

Dark themes invert lightness relationships while preserving hierarchy:

- Background ≈ 0.15
- Foreground ≈ 0.90
- Primary adjusted upward for visibility

Hierarchy is maintained through relative contrast, not absolute lightness values.

# 6. Simultaneous Contrast

Simultaneous contrast describes how a color’s appearance shifts depending on surrounding colors.

The same blue may appear:

- More saturated or darker on light backgrounds
- Harsher or more luminous on dark backgrounds

Therefore, dark mode is not a simple inversion of light mode.

## Dark Mode Adjustments

We typically:

- Increase lightness of key accents
- Reduce chroma to avoid oversaturation
- Use near-black backgrounds for depth

Example:

```
Light primary: oklch(0.60 0.15 240)
Dark primary:  oklch(0.82 0.105 240)
```

These deltas are heuristics informed by perceptual effects and testing, not universal constants.

# 7. Temperature and Semantic Mapping

Warm–cool distinctions are longstanding perceptual conventions:

- 210–270° perceived as cool
- 0–60° perceived as warm

Associations such as:

- Blue → trust
- Red → urgency
- Green → safe

are common in modern digital interfaces but are culturally influenced and context-dependent.

Large hue separation combined with adequate luminance contrast increases distinguishability.

Hue separation alone does not guarantee accessibility, especially for users with color vision deficiencies.

# 8. Gamut Mapping (sRGB Constraints)

OKLCH can represent colors outside the sRGB gamut.

Each hue–lightness pair has a maximum chroma that remains displayable in sRGB.

At mid lightness (~0.6), approximate sRGB limits often resemble:

| Hue | Approx Max Chroma |
| | -- |
| Red | ~0.22–0.24 |
| Green | ~0.18–0.20 |
| Blue | ~0.14–0.16 |
| Yellow | ~0.10–0.13 |

Exact limits depend on implementation, white point, and conversion precision.

Yellows typically have lower maximum chroma in sRGB relative to reds and magentas.

## Automatic Gamut Clamping

We compute the maximum valid chroma using binary search:

```ts
while (high - low > 0.001) {
  if (isInGamut(mid)) low = mid;
  else high = mid;
}
```

Chroma is clamped slightly below the computed maximum to avoid floating-point boundary artifacts:

```ts
C = Math.min(requested, maxChroma * 0.98);
```

This approach ensures:

- No RGB channel clipping
- Predictable sRGB output
- Maximum usable chroma within device constraints

It does not guarantee identical appearance across all physical displays, which vary in calibration and ambient conditions.

# How the System Integrates

Theme generation proceeds as:

1. Choose base hue (geometric relationship)
2. Generate perceptual lightness ramp
3. Apply chroma–lightness adjustment
4. Clamp to sRGB gamut
5. Validate WCAG contrast
6. Construct light and dark hierarchies
7. Apply semantic hue mapping

The resulting system is:

- Harmonically structured
- Approximately perceptually uniform
- Accessibility-aware
- Gamut-constrained
- Context-adjusted

# Core Principles

1. Lightness structures hierarchy.
2. Hue differentiates categories.
3. Chroma modulates energy.
4. Contrast supports accessibility.
5. Gamut defines physical limits.
6. Context alters perception.

Together, these form an engineering-driven color system grounded in contemporary color science and accessibility standards.
