import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { ColorSwatch, PrimitiveSwatch } from '../components/ColorSwatch';
import { UsageExample } from '../components/UsageExample';
import { FigmaBadge } from '../components/FigmaBadge';
import {
  primTokens,
  getColorTokens,
  primitiveColorGroups,
  semanticColorGroups,
} from '../lib/tokens';

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta: Meta = {
  title: 'Design System/Colors',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;

// ─── Shared header ────────────────────────────────────────────────────────────

function PageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
      <div>
        <h1 style={{ margin: '0 0 6px', fontFamily: 'Alte Haas Grotesk, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--colour-text-primary, #161D1D)' }}>{title}</h1>
        <p style={{ margin: 0, color: 'var(--colour-text-secondary, #444949)', fontSize: 15 }}>{subtitle}</p>
      </div>
      <FigmaBadge />
    </div>
  );
}

function SectionLabel({ label }: { label: string }) {
  return (
    <h2 style={{ fontFamily: 'Instrument Sans, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--colour-text-tertiary, #737777)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '32px 0 8px' }}>
      {label}
    </h2>
  );
}

// ─── Primitives story ─────────────────────────────────────────────────────────

function PrimitivesPage() {
  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <PageHeader
        title="Color Primitives"
        subtitle="Raw color values. Always reference these via semantic tokens — never apply directly in components."
      />
      {primitiveColorGroups.map(({ label, prefix }) => {
        const tokens = primTokens.filter(
          (t) => t.$type === 'color' && t.displayName.startsWith(prefix),
        );
        if (!tokens.length) return null;
        return (
          <div key={prefix}>
            <SectionLabel label={label} />
            {tokens.map((t) => <PrimitiveSwatch key={t.path} token={t} />)}
          </div>
        );
      })}
    </div>
  );
}

export const Primitives: StoryObj = {
  name: 'Primitives',
  render: (_, ctx) => {
    // force re-render when theme changes (platform irrelevant for colors)
    void ctx.globals.theme;
    return <PrimitivesPage />;
  },
};

// ─── Semantic story ───────────────────────────────────────────────────────────

function SemanticPage({ theme }: { theme: 'light' | 'dark' }) {
  const colorTokens = getColorTokens(theme);

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <PageHeader
        title="Semantic Colors"
        subtitle={`Alias tokens — every value points to a primitive. Toggle Light / Dark in the toolbar. Showing: ${theme} mode.`}
      />
      {semanticColorGroups.map(({ label, prefix }) => {
        const tokens = colorTokens.filter((t) => t.displayName.startsWith(prefix));
        if (!tokens.length) return null;
        return (
          <div key={prefix}>
            <SectionLabel label={label} />
            {tokens.map((t) => (
              <div key={t.path}>
                <ColorSwatch token={t} theme={theme} showAlias />
                <UsageExample tokenName={t.displayName} />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );
}

export const Semantic: StoryObj = {
  name: 'Semantic',
  render: (_, ctx) => {
    const theme = (ctx.globals.theme as 'light' | 'dark') ?? 'light';
    return <SemanticPage theme={theme} />;
  },
};
