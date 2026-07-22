# Mostaza DS

Design system token pipeline for the Mostaza design system. Single source of truth flows from Figma → JSON → CSS + Dart.

## What's in the box

| Output | Path | Used by |
|--------|------|---------|
| CSS custom properties | `build/css/tokens.css` | Web apps |
| Dart ThemeExtension | `build/dart/app_*.dart` | Flutter |
| Storybook docs | `http://localhost:6006` | Design + eng |
| Token JSON | `tokens/*.json` | Source of truth |

## Quick start

```bash
npm install
npm run build:tokens   # generate CSS + Dart
npm run storybook      # open docs at localhost:6006
```

## Syncing from Figma

```bash
FIGMA_TOKEN=figd_xxx npm run sync
```

Diffs the live Figma variables against the current token JSON, writes a dated entry to `changelog/diffs/`, prepends to `CHANGELOG.md`, updates the JSON files, and rebuilds CSS + Dart.

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
