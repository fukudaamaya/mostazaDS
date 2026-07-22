/**
 * sync-figma.mjs — pull latest tokens from Figma REST API, diff vs current
 * JSON, write changelog, update token files.
 *
 * Usage: FIGMA_TOKEN=figd_xxx node scripts/sync-figma.mjs
 *   or:  npm run sync  (set FIGMA_TOKEN in .env.local)
 *
 * Requires Node 20+ for built-in fetch.
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dir = dirname(fileURLToPath(import.meta.url));
const root  = join(__dir, '..');

const FILE_KEY  = 'HTR0eJ4FeRCHlC56RxbyDw';
const API_BASE  = 'https://api.figma.com/v1';
const TOKEN_ENV = process.env.FIGMA_TOKEN;

if (!TOKEN_ENV) {
  console.error('❌  FIGMA_TOKEN env var not set.');
  console.error('    Run: FIGMA_TOKEN=figd_xxx node scripts/sync-figma.mjs');
  process.exit(1);
}

// ─── Figma REST helpers ───────────────────────────────────────────────────────

async function figmaGet(path) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'X-Figma-Token': TOKEN_ENV },
  });
  if (!res.ok) throw new Error(`Figma API ${res.status}: ${await res.text()}`);
  return res.json();
}

// ─── Parse Figma variables response into our token JSON format ────────────────

function figmaColorToHex({ r, g, b, a }) {
  const to255 = (x) => Math.round(x * 255);
  if (a !== undefined && a < 1) {
    return `rgba(${to255(r)}, ${to255(g)}, ${to255(b)}, ${a.toFixed(2)})`;
  }
  const hex = (x) => to255(x).toString(16).padStart(2, '0');
  return `#${hex(r)}${hex(g)}${hex(b)}`.toUpperCase();
}

function buildTokenJSON(variables, collections) {
  // Result: { Primitives: {Value: {...}}, Color: {Light: {...}, Dark: {...}}, Dimensions: {Mobile: {...}, Web: {...}} }
  const result = {};

  for (const [, coll] of Object.entries(collections)) {
    result[coll.name] = {};
    for (const mode of coll.modes) {
      result[coll.name][mode.name] = {};
    }
  }

  for (const [, variable] of Object.entries(variables)) {
    const coll = collections[variable.variableCollectionId];
    if (!coll) continue;

    const parts  = variable.name.split('/');
    const $type  = variable.resolvedType === 'COLOR' ? 'color'
                 : variable.resolvedType === 'FLOAT' ? 'dimension'
                 : variable.resolvedType === 'STRING' ? 'fontFamily'
                 : 'unknown';

    for (const mode of coll.modes) {
      const rawVal = variable.valuesByMode[mode.modeId];
      let $value;

      if (rawVal?.type === 'VARIABLE_ALIAS') {
        // Find the referenced variable
        const refVar = variables[rawVal.id];
        if (refVar) {
          $value = `{${refVar.name.replace(/\//g, '.')}}`;
        } else {
          $value = null;
        }
      } else if (variable.resolvedType === 'COLOR' && rawVal) {
        $value = figmaColorToHex(rawVal);
      } else {
        $value = rawVal ?? null;
      }

      // Build nested structure
      let node = result[coll.name][mode.name];
      for (let i = 0; i < parts.length - 1; i++) {
        if (!node[parts[i]]) node[parts[i]] = {};
        node = node[parts[i]];
      }
      const leaf = parts[parts.length - 1];
      node[leaf] = {
        $value,
        $type,
        $description: variable.description || '',
      };
    }
  }

  return result;
}

// ─── Flatten for diffing ──────────────────────────────────────────────────────

function flattenForDiff(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k.startsWith('$')) continue;
    const path = prefix ? `${prefix}/${k}` : k;
    if (v && typeof v === 'object' && '$value' in v) out[path] = v.$value;
    else if (v && typeof v === 'object') Object.assign(out, flattenForDiff(v, path));
  }
  return out;
}

function diff(before, after) {
  const added   = [];
  const changed = [];
  const removed = [];

  const allKeys = new Set([...Object.keys(before), ...Object.keys(after)]);
  for (const key of allKeys) {
    if (!(key in before)) {
      added.push({ token: key, after: after[key] });
    } else if (!(key in after)) {
      removed.push({ token: key, before: before[key] });
    } else if (JSON.stringify(before[key]) !== JSON.stringify(after[key])) {
      changed.push({ token: key, before: before[key], after: after[key] });
    }
  }
  return { added, changed, removed };
}

// ─── Write token files ────────────────────────────────────────────────────────

function readCurrentJSON(filePath) {
  if (!existsSync(filePath)) return {};
  return JSON.parse(readFileSync(filePath, 'utf8'));
}

function writeJSON(filePath, data) {
  writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n');
}

// ─── CHANGELOG.md update ─────────────────────────────────────────────────────

function changelogEntry(date, diffs) {
  const lines = [`## ${date}\n`];

  if (diffs.added.length) {
    lines.push(`### Added (${diffs.added.length})`);
    for (const c of diffs.added) lines.push(`- \`${c.token}\` → \`${c.after}\``);
    lines.push('');
  }
  if (diffs.changed.length) {
    lines.push(`### Changed (${diffs.changed.length})`);
    for (const c of diffs.changed) lines.push(`- \`${c.token}\`: \`${c.before}\` → \`${c.after}\``);
    lines.push('');
  }
  if (diffs.removed.length) {
    lines.push(`### Removed (${diffs.removed.length})`);
    for (const c of diffs.removed) lines.push(`- \`${c.token}\``);
    lines.push('');
  }

  return lines.join('\n');
}

// ─── Main ─────────────────────────────────────────────────────────────────────

console.log(`Fetching variables from Figma (file: ${FILE_KEY})…`);

const res = await figmaGet(`/files/${FILE_KEY}/variables/local`);
const { variables, variableCollections } = res.meta;

console.log(`  ${Object.keys(variables).length} variables across ${Object.keys(variableCollections).length} collections.`);

const parsed = buildTokenJSON(variables, variableCollections);

// Map to our file structure
const collMap = {
  Primitives: {
    Value: join(root, 'tokens/primitives.json'),
  },
  Color: {
    Light: join(root, 'tokens/color.light.json'),
    Dark:  join(root, 'tokens/color.dark.json'),
  },
  Dimensions: {
    Web:    join(root, 'tokens/dimensions.web.json'),
    Mobile: join(root, 'tokens/dimensions.mobile.json'),
  },
};

const date = new Date().toISOString().slice(0, 10);
const allChanges = [];

for (const [collName, modes] of Object.entries(collMap)) {
  for (const [modeName, filePath] of Object.entries(modes)) {
    const newData  = parsed[collName]?.[modeName] ?? {};
    const oldData  = readCurrentJSON(filePath);
    const before   = flattenForDiff(oldData);
    const after    = flattenForDiff(newData);
    const d        = diff(before, after);
    const total    = d.added.length + d.changed.length + d.removed.length;

    if (total > 0) {
      console.log(`  ${collName}/${modeName}: +${d.added.length} ~${d.changed.length} -${d.removed.length}`);
      for (const c of [...d.added, ...d.changed, ...d.removed]) {
        allChanges.push({ ...c, collection: `${collName}/${modeName}`, type: c.after && c.before ? 'changed' : c.after ? 'added' : 'removed' });
      }
    } else {
      console.log(`  ${collName}/${modeName}: no changes`);
    }

    writeJSON(filePath, newData);
  }
}

// Write diff JSON
if (allChanges.length > 0) {
  mkdirSync(join(root, 'changelog/diffs'), { recursive: true });
  const diffPath = join(root, `changelog/diffs/${date}.json`);
  writeJSON(diffPath, { date, changes: allChanges });

  // Prepend to CHANGELOG.md
  const clPath  = join(root, 'changelog/CHANGELOG.md');
  const existing = existsSync(clPath) ? readFileSync(clPath, 'utf8') : '';
  const entry   = changelogEntry(date, {
    added:   allChanges.filter((c) => c.type === 'added'),
    changed: allChanges.filter((c) => c.type === 'changed'),
    removed: allChanges.filter((c) => c.type === 'removed'),
  });
  writeFileSync(clPath, `# Mostaza DS — Token Changelog\n\n${entry}\n${existing.replace(/^# Mostaza DS.*\n\n/, '')}`);

  console.log(`\n✅  ${allChanges.length} change(s) written to changelog/diffs/${date}.json`);
} else {
  console.log('\n✅  Tokens are up to date — no changes.');
}
