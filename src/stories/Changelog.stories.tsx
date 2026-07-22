import React, { useState } from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FigmaBadge } from '../components/FigmaBadge';

const meta: Meta = {
  title: 'Design System/Changelog',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;

// ─── Types ────────────────────────────────────────────────────────────────────

type ChangeType = 'added' | 'changed' | 'removed';

interface TokenChange {
  token: string;
  collection: string;
  type: ChangeType;
  before?: string | number;
  after?: string | number;
  date: string;
  note?: string;
}

// ─── Load diff files via Vite's import.meta.glob ─────────────────────────────

type DiffFile = { date: string; changes: TokenChange[] };

const diffModules = import.meta.glob('../../changelog/diffs/*.json', { eager: true });

function loadDiffs(): TokenChange[] {
  const all: TokenChange[] = [];
  for (const raw of Object.values(diffModules)) {
    const mod = raw as { default?: DiffFile } | DiffFile;
    const data: DiffFile | undefined =
      (mod as { default?: DiffFile }).default ?? (mod as DiffFile | undefined);
    if (data?.changes) {
      for (const change of data.changes) {
        all.push({ ...change, date: data.date });
      }
    }
  }
  return all.sort((a, b) => b.date.localeCompare(a.date));
}

// ─── Badge ────────────────────────────────────────────────────────────────────

function TypeBadge({ type }: { type: ChangeType }) {
  const styles: Record<ChangeType, { bg: string; color: string }> = {
    added:   { bg: '#D8F3E3', color: '#12653A' },
    changed: { bg: '#EAEEFF', color: '#0937CC' },
    removed: { bg: '#FDDCDC', color: '#951F1F' },
  };
  const s = styles[type];
  return (
    <span style={{
      display: 'inline-block', padding: '2px 8px', borderRadius: 4,
      fontSize: 11, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace',
      background: s.bg, color: s.color, textTransform: 'uppercase',
    }}>
      {type}
    </span>
  );
}

// ─── Empty state ──────────────────────────────────────────────────────────────

function EmptyState() {
  return (
    <div style={{
      textAlign: 'center', padding: '64px 32px',
      color: 'var(--colour-text-tertiary)',
      fontFamily: 'Instrument Sans, sans-serif',
    }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
      <h3 style={{ margin: '0 0 8px', fontSize: 18, fontWeight: 600 }}>No changelog entries yet</h3>
      <p style={{ margin: 0, fontSize: 14, maxWidth: 400, display: 'inline-block' }}>
        Run <code style={{ fontFamily: 'IBM Plex Mono, monospace', background: 'var(--colour-surface-secondary)', padding: '2px 6px', borderRadius: 4 }}>npm run sync</code> to pull the latest tokens from Figma and generate the first diff.
      </p>
    </div>
  );
}

// ─── Main page ────────────────────────────────────────────────────────────────

function ChangelogPage() {
  const allChanges = loadDiffs();
  const [filterType, setFilterType] = useState<ChangeType | 'all'>('all');
  const [filterCollection, setFilterCollection] = useState('all');
  const [search, setSearch] = useState('');

  const collections = ['all', ...Array.from(new Set(allChanges.map((c) => c.collection)))];

  const filtered = allChanges.filter((c) => {
    if (filterType !== 'all' && c.type !== filterType) return false;
    if (filterCollection !== 'all' && c.collection !== filterCollection) return false;
    if (search && !c.token.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by date
  const byDate: Record<string, TokenChange[]> = {};
  for (const c of filtered) {
    if (!byDate[c.date]) byDate[c.date] = [];
    byDate[c.date].push(c);
  }

  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'Alte Haas Grotesk, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--colour-text-primary, #161D1D)' }}>
            Changelog
          </h1>
          <p style={{ margin: 0, color: 'var(--colour-text-secondary)', fontSize: 15 }}>
            Token changes synced from Figma. Run <code style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13 }}>npm run sync</code> to update.
          </p>
        </div>
        <FigmaBadge />
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap', alignItems: 'center' }}>
        <input
          placeholder="Search token name…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '8px 12px', borderRadius: 6, border: '1px solid var(--colour-border-default)', background: 'var(--colour-surface-elevated)',
            fontFamily: 'Instrument Sans, sans-serif', fontSize: 13, color: 'var(--colour-text-primary)',
            outline: 'none', minWidth: 240,
          }}
        />
        <select value={filterType} onChange={(e) => setFilterType(e.target.value as ChangeType | 'all')}
          style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--colour-border-default)', background: 'var(--colour-surface-elevated)', fontFamily: 'Instrument Sans, sans-serif', fontSize: 13, color: 'var(--colour-text-primary)' }}>
          <option value="all">All types</option>
          <option value="added">Added</option>
          <option value="changed">Changed</option>
          <option value="removed">Removed</option>
        </select>
        <select value={filterCollection} onChange={(e) => setFilterCollection(e.target.value)}
          style={{ padding: '8px 10px', borderRadius: 6, border: '1px solid var(--colour-border-default)', background: 'var(--colour-surface-elevated)', fontFamily: 'Instrument Sans, sans-serif', fontSize: 13, color: 'var(--colour-text-primary)' }}>
          {collections.map((c) => <option key={c} value={c}>{c === 'all' ? 'All collections' : c}</option>)}
        </select>
        <span style={{ fontSize: 12, color: 'var(--colour-text-tertiary)' }}>
          {filtered.length} change{filtered.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table or empty */}
      {allChanges.length === 0 ? <EmptyState /> : filtered.length === 0 ? (
        <p style={{ color: 'var(--colour-text-tertiary)', fontStyle: 'italic' }}>No results match your filters.</p>
      ) : (
        Object.entries(byDate).map(([date, changes]) => (
          <div key={date} style={{ marginBottom: 32 }}>
            <h2 style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 14, fontWeight: 600, color: 'var(--colour-text-tertiary)', margin: '0 0 8px', borderBottom: '2px solid var(--colour-border-strong)', paddingBottom: 8 }}>
              {date}
            </h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--colour-border-default)' }}>
                  {['Type', 'Collection', 'Token', 'Before', 'After', 'Note'].map((h) => (
                    <th key={h} style={{ padding: '6px 10px', textAlign: 'left', fontFamily: 'Instrument Sans', fontSize: 11, fontWeight: 600, color: 'var(--colour-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {changes.map((c, i) => (
                  <tr key={i} style={{ borderBottom: '1px solid var(--colour-border-default)' }}>
                    <td style={{ padding: '10px 10px' }}><TypeBadge type={c.type} /></td>
                    <td style={{ padding: '10px 10px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: 'var(--colour-text-tertiary)' }}>{c.collection}</td>
                    <td style={{ padding: '10px 10px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 600 }}>{c.token}</td>
                    <td style={{ padding: '10px 10px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#951F1F', background: c.before ? 'rgba(201,42,42,0.04)' : 'transparent' }}>
                      {c.before !== undefined ? (typeof c.before === 'string' ? c.before.toUpperCase() : String(c.before)) : '—'}
                    </td>
                    <td style={{ padding: '10px 10px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: '#12653A', background: c.after ? 'rgba(27,138,78,0.04)' : 'transparent' }}>
                      {c.after !== undefined ? (typeof c.after === 'string' ? c.after.toUpperCase() : String(c.after)) : '—'}
                    </td>
                    <td style={{ padding: '10px 10px', fontSize: 12, color: 'var(--colour-text-secondary)' }}>{c.note ?? ''}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}

export const Log: StoryObj = {
  name: 'Log',
  render: () => <ChangelogPage />,
};
