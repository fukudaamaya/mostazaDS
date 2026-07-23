# Mostaza DS

Design system token pipeline for the Mostaza design system. Single source of truth flows from `tokens/*.json` → CSS + Dart, with Storybook docs published at [mostaza-ds.vercel.app](https://mostaza-ds.vercel.app).

## What's in the box

| Output | Path | Used by |
|--------|------|---------|
| CSS custom properties | `build/css/tokens.css` | Web apps |
| Dart ThemeExtension | `build/dart/app_*.dart` | Flutter |
| Storybook docs | [mostaza-ds.vercel.app](https://mostaza-ds.vercel.app) | Design + eng |
| Token JSON | `tokens/*.json` | Source of truth |

## Quick start

```bash
npm install
npm run build:tokens   # generate CSS + Dart from token JSON
npm run storybook      # open docs at localhost:6006
```

## Updating tokens

Edit the token JSON files in `tokens/` directly, then rebuild and push:

```bash
# 1. Edit one or more token files
#    tokens/primitives.json        — raw hex values, spacing, font families
#    tokens/color.light.json       — semantic colour aliases (light mode)
#    tokens/color.dark.json        — semantic colour aliases (dark mode)
#    tokens/dimensions.web.json    — type scale, spacing, layout (web)
#    tokens/dimensions.mobile.json — type scale, spacing, layout (mobile)

# 2. Rebuild CSS + Dart output
npm run build:tokens

# 3. Push — Vercel redeploys automatically
git add tokens/ build/css/ && git commit -m "chore: update tokens" && git push
```

Vercel picks up every push to `main` and redeploys [mostaza-ds.vercel.app](https://mostaza-ds.vercel.app) within ~30 seconds.

## Token structure

```
tokens/
├── primitives.json        # raw hex values, spacing units, font families
├── color.light.json       # semantic colour aliases → primitives (light mode)
├── color.dark.json        # semantic colour aliases → primitives (dark mode)
├── dimensions.web.json    # type scale, spacing, layout — web values
└── dimensions.mobile.json # type scale, spacing, layout — mobile values
```

All files use the [W3C DTCG](https://tr.designtokens.org/format/) format (`$value`, `$type`, `$description`).

## CSS usage

```css
@import 'path/to/build/css/tokens.css';

.button {
  background: var(--colour-action-default);
  color: var(--colour-text-on-brand);
  border-radius: var(--radius-medium);
  padding: var(--spacing-component-padding);
}
```

Dark mode and mobile overrides apply automatically via attribute selectors:

```html
<html data-theme="dark" data-platform="mobile">
```

## Dart / Flutter usage

```dart
import 'build/dart/app_theme.dart';

MaterialApp(
  theme: mostazaTheme(brightness: Brightness.light, platform: TokenPlatform.web),
  darkTheme: mostazaTheme(brightness: Brightness.dark, platform: TokenPlatform.mobile),
);

// Access tokens anywhere in the widget tree
final tokens = KnowunityTokens.of(context);
Text('Hello', style: TextStyle(color: tokens.colors.textPrimary));
```

## Storybook stories

| Story | What it shows |
|-------|---------------|
| Colors → Primitives | Full colour scales with hex values |
| Colors → Semantic | Alias chains, usage examples, WCAG badges |
| Typography | Live type specimens per style, web vs mobile toggle |
| Spacing | Proportional rulers, radius demos, layout grid |
| Accessibility | WCAG 2.1 contrast ratios for all meaningful pairs |
| Changelog | Token diffs over time, filterable by type + collection |

Use the **Web / Mobile** and **Light / Dark** toolbar toggles to switch contexts.

## Typography note

**Alte Haas Grotesk** (display face) is not on Google Fonts and must be self-hosted. See `.storybook/preview-head.html` for the self-hosting instructions and a commented-out `@font-face` template. Instrument Sans and IBM Plex Mono load from Google Fonts automatically.

## Figma source

[Mostaza DS](https://www.figma.com/design/HTR0eJ4FeRCHlC56RxbyDw/Mostaza-DS) — file key `HTR0eJ4FeRCHlC56RxbyDw`
