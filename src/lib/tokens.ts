import primitives   from '../../tokens/primitives.json';
import colorLight   from '../../tokens/color.light.json';
import colorDark    from '../../tokens/color.dark.json';
import dimWeb       from '../../tokens/dimensions.web.json';
import dimMobile    from '../../tokens/dimensions.mobile.json';

export type Platform = 'web' | 'mobile';
export type Theme    = 'light' | 'dark';

export interface FlatToken {
  path: string;        // dot-separated: "colour.text.primary"
  displayName: string; // slash-separated: "colour/text/primary"
  cssVar: string;      // "--colour-text-primary"
  dartField: string;   // "textPrimary"
  $type: string;
  $value: unknown;     // original (may be "{neutral.900}")
  $description: string;
  resolvedValue: unknown; // resolved hex / number / string
  aliasOf?: string;    // "neutral/900" if $value was a reference
  collection: 'primitives' | 'color' | 'dimensions';
  file: string;
}

// ─── Flatten nested token JSON ────────────────────────────────────────────────

function flattenJSON(
  obj: Record<string, unknown>,
  prefix = '',
): Record<string, { $value: unknown; $type: string; $description: string }> {
  const out: Record<string, { $value: unknown; $type: string; $description: string }> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue;
    const path = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === 'object' && '$value' in (v as object)) {
      out[path] = v as { $value: unknown; $type: string; $description: string };
    } else if (v && typeof v === 'object') {
      Object.assign(out, flattenJSON(v as Record<string, unknown>, path));
    }
  }
  return out;
}

const primFlat = flattenJSON(primitives as Record<string, unknown>);

// Resolve a {path.to.token} reference to its raw primitive value
function resolve(value: unknown): unknown {
  if (typeof value !== 'string') return value;
  const m = value.match(/^\{(.+)\}$/);
  if (!m) return value;
  return primFlat[m[1]]?.$value ?? value;
}

// Convert "colour/text/primary" → "textPrimary"
export function toDartField(displayName: string): string {
  return displayName
    .replace(/^colour\//, '')
    .split('/')
    .flatMap((seg) => seg.split('-'))
    .map((w, i) => (i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join('');
}

// Convert dot-path to slash display name and CSS var
function dotToSlash(path: string): string { return path.replace(/\./g, '/'); }
function dotToCssVar(path: string): string { return `--${path.replace(/\./g, '-')}`; }

// ─── Build flat token arrays ──────────────────────────────────────────────────

function buildFlat(
  json: Record<string, unknown>,
  collection: FlatToken['collection'],
  file: string,
): FlatToken[] {
  const flat = flattenJSON(json);
  return Object.entries(flat).map(([path, token]) => {
    const rawValue = token.$value;
    const aliasOf = typeof rawValue === 'string' && rawValue.startsWith('{')
      ? dotToSlash(rawValue.slice(1, -1))
      : undefined;
    const displayName = dotToSlash(path);
    return {
      path,
      displayName,
      cssVar: dotToCssVar(path),
      dartField: toDartField(displayName),
      $type: token.$type,
      $value: rawValue,
      $description: token.$description || '',
      resolvedValue: resolve(rawValue),
      aliasOf,
      collection,
      file,
    };
  });
}

export const primTokens = buildFlat(
  primitives as Record<string, unknown>, 'primitives', 'primitives',
);

export function getColorTokens(theme: Theme): FlatToken[] {
  return buildFlat(
    theme === 'light' ? (colorLight as Record<string, unknown>) : (colorDark as Record<string, unknown>),
    'color',
    `color.${theme}`,
  );
}

export function getDimTokens(platform: Platform): FlatToken[] {
  return buildFlat(
    platform === 'web' ? (dimWeb as Record<string, unknown>) : (dimMobile as Record<string, unknown>),
    'dimensions',
    `dimensions.${platform}`,
  );
}

// ─── Convenience: resolve hex for a semantic colour token ─────────────────────

/** Returns the resolved hex value of a semantic colour token in a given theme. */
export function resolveColorHex(displayName: string, theme: Theme): string {
  const tokens = getColorTokens(theme);
  const token = tokens.find((t) => t.displayName === displayName);
  if (!token) return '#000000';
  const v = token.resolvedValue;
  if (typeof v === 'string') return v;
  return '#000000';
}

/** Returns hex for a primitive colour token by its display name, e.g. "neutral/900". */
export function primHex(displayName: string): string {
  const key = displayName.replace(/\//g, '.');
  const v = primFlat[key]?.$value;
  return typeof v === 'string' ? v : '#000000';
}

// ─── Colour groups for story rendering ────────────────────────────────────────

export const primitiveColorGroups: Array<{ label: string; prefix: string }> = [
  { label: 'Neutral', prefix: 'neutral' },
  { label: 'Blue',    prefix: 'blue' },
  { label: 'Yellow',  prefix: 'yellow' },
  { label: 'Green',   prefix: 'green' },
  { label: 'Red',     prefix: 'red' },
];

export const semanticColorGroups: Array<{ label: string; prefix: string }> = [
  { label: 'Text',     prefix: 'colour/text' },
  { label: 'Surface',  prefix: 'colour/surface' },
  { label: 'Border',   prefix: 'colour/border' },
  { label: 'Action',   prefix: 'colour/action' },
  { label: 'Accent',   prefix: 'colour/accent' },
  { label: 'Feedback', prefix: 'colour/feedback' },
];

// Dart accessor string for a semantic colour token
export function dartColourAccessor(displayName: string): string {
  return `KnowunityTokens.of(context).colors.${toDartField(displayName)}`;
}

// CSS var accessor string
export function cssColourAccessor(displayName: string): string {
  return `var(--${displayName.replace(/\//g, '-')})`;
}

// Figma file deep link (to Style Tile page)
export const FIGMA_FILE_URL =
  'https://www.figma.com/design/HTR0eJ4FeRCHlC56RxbyDw/Mostaza-DS?node-id=5121-1294';
