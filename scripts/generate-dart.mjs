/**
 * Dart token generator — reads token JSON, writes 4 Dart files to build/dart/
 * Run: node scripts/generate-dart.mjs
 * Dart 3 + Flutter 3.19+
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root = join(__dir, '..');
mkdirSync(join(root, 'build/dart'), { recursive: true });

const primitives   = JSON.parse(readFileSync(join(root, 'tokens/primitives.json'), 'utf8'));
const colorLight   = JSON.parse(readFileSync(join(root, 'tokens/color.light.json'), 'utf8'));
const colorDark    = JSON.parse(readFileSync(join(root, 'tokens/color.dark.json'), 'utf8'));
const dimWeb       = JSON.parse(readFileSync(join(root, 'tokens/dimensions.web.json'), 'utf8'));
const dimMobile    = JSON.parse(readFileSync(join(root, 'tokens/dimensions.mobile.json'), 'utf8'));

// ─── Helpers ─────────────────────────────────────────────────────────────────

function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && '$value' in v) out[path] = v;
    else if (v && typeof v === 'object') Object.assign(out, flatten(v, path));
  }
  return out;
}

const primFlat = flatten(primitives);

function hexToDart(hex) {
  const h = hex.replace('#', '').toUpperCase();
  return `const Color(0xFF${h})`;
}

function rgbaToDart(rgba) {
  const m = rgba.match(/rgba\(\s*(\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\s*\)/);
  if (!m) throw new Error(`Cannot parse: ${rgba}`);
  return `Color.fromRGBO(${m[1]}, ${m[2]}, ${m[3]}, ${m[4]})`;
}

// "{neutral.900}" → "AppColorPrimitives.neutral900"
function primRefToDart(ref) {
  const path = ref.slice(1, -1); // strip {}
  const parts = path.split('.');
  return `AppColorPrimitives.${parts[0]}${parts[1]}`;
}

function colorValueToDart(value) {
  if (typeof value === 'string' && value.startsWith('{')) return primRefToDart(value);
  if (typeof value === 'string' && value.startsWith('rgba')) return rgbaToDart(value);
  if (typeof value === 'string' && value.startsWith('#')) return hexToDart(value);
  return `Color(0xFF000000) /* unknown: ${value} */`;
}

// "colour/text/primary" → "textPrimary"
// "colour/feedback/error-text" → "feedbackErrorText"
function toDartField(tokenPath) {
  return tokenPath
    .replace(/^colour\//, '')
    .split('/')
    .flatMap(seg => seg.split('-'))
    .map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

// "spacing/block-gap" → "blockGap", "radius/small" → "radiusSmall"
function toDartSpacingField(tokenPath) {
  return tokenPath
    .split('/')
    .flatMap(seg => seg.split('-'))
    .map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1))
    .join('');
}

function dimValue(node, path, platform) {
  const flat = platform === 'web' ? flatten(dimWeb) : flatten(dimMobile);
  const token = flat[path];
  if (!token) return 0;
  const v = token.$value;
  if (typeof v === 'string' && v.startsWith('{')) {
    const primPath = v.slice(1, -1);
    return primFlat[primPath]?.$value ?? 0;
  }
  return v;
}

// Flat colour token list (in stable order)
const colorTokenPaths = [
  'colour/text/primary', 'colour/text/secondary', 'colour/text/tertiary',
  'colour/text/disabled', 'colour/text/inverse', 'colour/text/brand',
  'colour/text/link', 'colour/text/link-hover', 'colour/text/on-accent',
  'colour/text/on-brand',
  'colour/surface/page', 'colour/surface/default', 'colour/surface/secondary',
  'colour/surface/elevated', 'colour/surface/inverse', 'colour/surface/overlay',
  'colour/surface/brand', 'colour/surface/accent',
  'colour/border/default', 'colour/border/focus', 'colour/border/strong',
  'colour/action/default', 'colour/action/hover', 'colour/action/pressed',
  'colour/action/disabled',
  'colour/accent/highlight', 'colour/accent/highlight-subtle',
  'colour/feedback/success-text', 'colour/feedback/success-surface',
  'colour/feedback/warning-text', 'colour/feedback/warning-surface',
  'colour/feedback/error-text', 'colour/feedback/error-surface',
  'colour/feedback/info-text', 'colour/feedback/info-surface',
];

function getColorValue(path, theme) {
  const flat = flatten(theme === 'light' ? colorLight : colorDark);
  const key = path.replace(/\//g, '.'); // "colour/text/primary" → "colour.text.primary"
  return flat[key]?.$value ?? '#000000';
}

// Spacing token paths (Dimensions)
const spacingPaths = [
  'spacing/inline-gap', 'spacing/component-padding', 'spacing/content-gap',
  'spacing/card-padding', 'spacing/block-gap', 'spacing/page-margin',
  'spacing/section-gap', 'spacing/signature-gap',
];

const radiusPaths = [
  'radius/small', 'radius/medium', 'radius/large',
  'radius/feature', 'radius/shell', 'radius/pill',
];

const layoutPaths = [
  'layout/grid-columns', 'layout/grid-gutter',
  'layout/max-content-width', 'layout/max-text-width',
];

const typeStyles = [
  'heading-1', 'heading-2', 'heading-3',
  'body-large', 'body-medium', 'body-small',
  'label', 'label-small', 'caption',
];

// ─── app_colors.dart ─────────────────────────────────────────────────────────

const colorPrimitives = Object.entries(primFlat)
  .filter(([, v]) => v.$type === 'color')
  .map(([path, v]) => {
    const [group, step] = path.split('.');
    const fieldName = `${group}${step}`;
    return `  static ${hexToDart(v.$value)} get ${fieldName} => ${hexToDart(v.$value)};`;
  });

// Deduplicate (primitive path → field, avoid overwriting)
const primColorFields = [];
const seen = new Set();
for (const [path, v] of Object.entries(primFlat)) {
  if (v.$type !== 'color') continue;
  const parts = path.split('.');
  const name = `${parts[0]}${parts[1]}`;
  if (seen.has(name)) continue;
  seen.add(name);
  primColorFields.push({ name, value: v.$value, desc: v.$description });
}

const dartColors = `// GENERATED — do not edit by hand.
// Source: tokens/primitives.json + tokens/color.{light,dark}.json
// Run:   npm run build:tokens
// ignore_for_file: lines_longer_than_80_chars

import 'package:flutter/material.dart';

/// Raw color palette — use KnowunityColors via Theme.of(context) in production.
abstract final class AppColorPrimitives {
${primColorFields.map(f => `  /// ${f.desc.split('.')[0]}.
  static const Color ${f.name} = ${hexToDart(f.value)};`).join('\n')}
}

/// Semantic color tokens. Access via [KnowunityTokens.of(context).colors].
@immutable
final class KnowunityColors extends ThemeExtension<KnowunityColors> {
  const KnowunityColors({
${colorTokenPaths.map(p => `    required this.${toDartField(p)},`).join('\n')}
  });

${colorTokenPaths.map(p => `  final Color ${toDartField(p)};`).join('\n')}

  /// Light mode semantic token values.
  static const light = KnowunityColors(
${colorTokenPaths.map(p => `    ${toDartField(p)}: ${colorValueToDart(getColorValue(p, 'light'))},`).join('\n')}
  );

  /// Dark mode semantic token values.
  static const dark = KnowunityColors(
${colorTokenPaths.map(p => `    ${toDartField(p)}: ${colorValueToDart(getColorValue(p, 'dark'))},`).join('\n')}
  );

  @override
  KnowunityColors copyWith({
${colorTokenPaths.map(p => `    Color? ${toDartField(p)},`).join('\n')}
  }) =>
      KnowunityColors(
${colorTokenPaths.map(p => `        ${toDartField(p)}: ${toDartField(p)} ?? this.${toDartField(p)},`).join('\n')}
      );

  @override
  KnowunityColors lerp(ThemeExtension<KnowunityColors>? other, double t) {
    if (other is! KnowunityColors) return this;
    return KnowunityColors(
${colorTokenPaths.map(p => `      ${toDartField(p)}: Color.lerp(${toDartField(p)}, other.${toDartField(p)}, t)!,`).join('\n')}
    );
  }
}
`;

writeFileSync(join(root, 'build/dart/app_colors.dart'), dartColors);

// ─── app_typography.dart ─────────────────────────────────────────────────────

function familyRef(ref) {
  if (!ref.startsWith('{')) return `'${ref}'`;
  const path = ref.slice(1, -1); // "family.primary"
  return `AppFontFamilies.${path.split('.')[1]}`;
}

function typeStyleToDart(style, platform) {
  const prefix = `type.${style}`;
  const flat = platform === 'web' ? flatten(dimWeb) : flatten(dimMobile);
  const resolveNum = (key) => {
    const t = flat[`${prefix}.${key}`];
    if (!t) return 0;
    const v = t.$value;
    if (typeof v === 'string' && v.startsWith('{')) return primFlat[v.slice(1,-1)]?.$value ?? 0;
    return v;
  };
  const familyToken = flat[`${prefix}.family`];
  const familyValue = familyToken?.$value ?? '{family.primary}';
  const size = resolveNum('size');
  const lh   = resolveNum('line-height');
  const ls   = resolveNum('letter-spacing');
  const wt   = resolveNum('weight');
  const height = size > 0 ? (lh / size).toFixed(4) : '1.0';
  const styleKey = style.split('-').flatMap(s => s.split('-')).map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('');

  return `    ${styleKey}: const TextStyle(
      fontFamily: ${familyRef(familyValue)},
      fontSize: ${size}.0,
      fontWeight: FontWeight.w${wt},
      height: ${height},
      letterSpacing: ${ls},
    ),`;
}

const dartTypography = `// GENERATED — do not edit by hand.
// Source: tokens/dimensions.{web,mobile}.json
// Run:   npm run build:tokens
// ignore_for_file: lines_longer_than_80_chars

import 'package:flutter/material.dart';

/// Font family constants.
abstract final class AppFontFamilies {
  static const String display = 'Alte Haas Grotesk';
  static const String primary = 'Instrument Sans';
  static const String mono    = 'IBM Plex Mono';
}

/// Typography scale. Access via [KnowunityTokens.of(context).typography].
/// Note: register fonts in pubspec.yaml. Instrument Sans and IBM Plex Mono
/// are on Google Fonts; Alte Haas Grotesk must be self-hosted.
@immutable
final class KnowunityTypography extends ThemeExtension<KnowunityTypography> {
  const KnowunityTypography({
${typeStyles.map(s => `    required this.${s.split('-').flatMap(x => x.split('-')).map((w,i) => i===0?w:w[0].toUpperCase()+w.slice(1)).join('')},`).join('\n')}
  });

${typeStyles.map(s => `  final TextStyle ${s.split('-').flatMap(x => x.split('-')).map((w,i) => i===0?w:w[0].toUpperCase()+w.slice(1)).join('')};`).join('\n')}

  static const web = KnowunityTypography(
${typeStyles.map(s => typeStyleToDart(s, 'web')).join('\n')}
  );

  static const mobile = KnowunityTypography(
${typeStyles.map(s => typeStyleToDart(s, 'mobile')).join('\n')}
  );

  @override
  KnowunityTypography copyWith({
${typeStyles.map(s => `    TextStyle? ${s.split('-').flatMap(x=>x.split('-')).map((w,i)=>i===0?w:w[0].toUpperCase()+w.slice(1)).join('')},`).join('\n')}
  }) =>
      KnowunityTypography(
${typeStyles.map(s => { const f = s.split('-').flatMap(x=>x.split('-')).map((w,i)=>i===0?w:w[0].toUpperCase()+w.slice(1)).join(''); return `        ${f}: ${f} ?? this.${f},`; }).join('\n')}
      );

  @override
  KnowunityTypography lerp(ThemeExtension<KnowunityTypography>? other, double t) {
    if (other is! KnowunityTypography) return this;
    return KnowunityTypography(
${typeStyles.map(s => { const f = s.split('-').flatMap(x=>x.split('-')).map((w,i)=>i===0?w:w[0].toUpperCase()+w.slice(1)).join(''); return `      ${f}: TextStyle.lerp(${f}, other.${f}, t)!,`; }).join('\n')}
    );
  }
}
`;

writeFileSync(join(root, 'build/dart/app_typography.dart'), dartTypography);

// ─── app_spacing.dart ────────────────────────────────────────────────────────

function resolveSpacingVal(path, platform) {
  const flat = platform === 'web' ? flatten(dimWeb) : flatten(dimMobile);
  const key = path.replace(/\//g, '.');
  const token = flat[key];
  if (!token) return 0;
  const v = token.$value;
  if (typeof v === 'string' && v.startsWith('{')) return primFlat[v.slice(1,-1)]?.$value ?? 0;
  if (v === 9999) return null; // double.infinity
  return v;
}

function dartDouble(val) {
  return val === null ? 'double.infinity' : `${val}.0`;
}

const allSpacingPaths = [...spacingPaths, ...radiusPaths, ...layoutPaths];

const dartSpacing = `// GENERATED — do not edit by hand.
// Source: tokens/dimensions.{web,mobile}.json
// Run:   npm run build:tokens
// ignore_for_file: lines_longer_than_80_chars

import 'package:flutter/material.dart';

/// Raw spacing primitives — use KnowunitySpacing via theme in production.
abstract final class AppSpacePrimitives {
${Object.entries(primFlat).filter(([,v]) => v.$type === 'dimension').map(([p, v]) => {
  const parts = p.split('.');
  const name = `${parts[0]}${parts[1].charAt(0).toUpperCase()}${parts[1].slice(1)}`;
  return `  static const double ${name} = ${v.$value}.0;`;
}).join('\n')}
}

/// Spacing, radius, and layout tokens. Access via [KnowunityTokens.of(context).spacing].
@immutable
final class KnowunitySpacing extends ThemeExtension<KnowunitySpacing> {
  const KnowunitySpacing({
${allSpacingPaths.map(p => `    required this.${toDartSpacingField(p)},`).join('\n')}
  });

${allSpacingPaths.map(p => `  final double ${toDartSpacingField(p)};`).join('\n')}

  static const web = KnowunitySpacing(
${allSpacingPaths.map(p => `    ${toDartSpacingField(p)}: ${dartDouble(resolveSpacingVal(p, 'web'))},`).join('\n')}
  );

  static const mobile = KnowunitySpacing(
${allSpacingPaths.map(p => `    ${toDartSpacingField(p)}: ${dartDouble(resolveSpacingVal(p, 'mobile'))},`).join('\n')}
  );

  @override
  KnowunitySpacing copyWith({
${allSpacingPaths.map(p => `    double? ${toDartSpacingField(p)},`).join('\n')}
  }) =>
      KnowunitySpacing(
${allSpacingPaths.map(p => `        ${toDartSpacingField(p)}: ${toDartSpacingField(p)} ?? this.${toDartSpacingField(p)},`).join('\n')}
      );

  @override
  KnowunitySpacing lerp(ThemeExtension<KnowunitySpacing>? other, double t) {
    if (other is! KnowunitySpacing) return this;
    return KnowunitySpacing(
${allSpacingPaths.map(p => { const f = toDartSpacingField(p); return `      ${f}: lerpDouble(${f}, other.${f}, t)!,`; }).join('\n')}
    );
  }
}
`;

writeFileSync(join(root, 'build/dart/app_spacing.dart'), dartSpacing);

// ─── app_theme.dart ──────────────────────────────────────────────────────────

const dartTheme = `// GENERATED — do not edit by hand.
// Run:   npm run build:tokens
// ignore_for_file: lines_longer_than_80_chars

import 'package:flutter/material.dart';
import 'app_colors.dart';
import 'app_typography.dart';
import 'app_spacing.dart';

/// Top-level token access. Usage:
///   final tokens = KnowunityTokens.of(context);
///   tokens.colors.textPrimary
///   tokens.typography.bodyMedium
///   tokens.spacing.sectionGap
@immutable
final class KnowunityTokens extends ThemeExtension<KnowunityTokens> {
  const KnowunityTokens({
    required this.colors,
    required this.typography,
    required this.spacing,
  });

  final KnowunityColors colors;
  final KnowunityTypography typography;
  final KnowunitySpacing spacing;

  static KnowunityTokens of(BuildContext context) =>
      Theme.of(context).extension<KnowunityTokens>()!;

  static const lightWeb = KnowunityTokens(
    colors: KnowunityColors.light,
    typography: KnowunityTypography.web,
    spacing: KnowunitySpacing.web,
  );

  static const lightMobile = KnowunityTokens(
    colors: KnowunityColors.light,
    typography: KnowunityTypography.mobile,
    spacing: KnowunitySpacing.mobile,
  );

  static const darkWeb = KnowunityTokens(
    colors: KnowunityColors.dark,
    typography: KnowunityTypography.web,
    spacing: KnowunitySpacing.web,
  );

  static const darkMobile = KnowunityTokens(
    colors: KnowunityColors.dark,
    typography: KnowunityTypography.mobile,
    spacing: KnowunitySpacing.mobile,
  );

  @override
  KnowunityTokens copyWith({
    KnowunityColors? colors,
    KnowunityTypography? typography,
    KnowunitySpacing? spacing,
  }) =>
      KnowunityTokens(
        colors: colors ?? this.colors,
        typography: typography ?? this.typography,
        spacing: spacing ?? this.spacing,
      );

  @override
  KnowunityTokens lerp(ThemeExtension<KnowunityTokens>? other, double t) {
    if (other is! KnowunityTokens) return this;
    return KnowunityTokens(
      colors: colors.lerp(other.colors, t) as KnowunityColors,
      typography: typography.lerp(other.typography, t) as KnowunityTypography,
      spacing: spacing.lerp(other.spacing, t) as KnowunitySpacing,
    );
  }
}

/// Helper to build a ThemeData with Mostaza tokens attached.
ThemeData mostazaTheme({
  required Brightness brightness,
  required TargetPlatform platform,
}) {
  final isMobile = platform == TargetPlatform.iOS || platform == TargetPlatform.android;
  final tokens = brightness == Brightness.light
      ? (isMobile ? KnowunityTokens.lightMobile : KnowunityTokens.lightWeb)
      : (isMobile ? KnowunityTokens.darkMobile  : KnowunityTokens.darkWeb);

  final colors = tokens.colors;

  return ThemeData(
    brightness: brightness,
    scaffoldBackgroundColor: colors.surfacePage,
    colorScheme: ColorScheme(
      brightness: brightness,
      primary: colors.actionDefault,
      onPrimary: colors.textOnBrand,
      secondary: colors.accentHighlight,
      onSecondary: colors.textOnAccent,
      error: colors.feedbackErrorText,
      onError: colors.textOnBrand,
      surface: colors.surfaceDefault,
      onSurface: colors.textPrimary,
    ),
    extensions: [tokens],
  );
}
`;

writeFileSync(join(root, 'build/dart/app_theme.dart'), dartTheme);

console.log('✅  build/dart/app_colors.dart');
console.log('✅  build/dart/app_typography.dart');
console.log('✅  build/dart/app_spacing.dart');
console.log('✅  build/dart/app_theme.dart');
