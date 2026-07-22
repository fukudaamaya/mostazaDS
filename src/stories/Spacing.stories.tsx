import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { CopyButton } from '../components/CopyButton';
import { FigmaBadge } from '../components/FigmaBadge';
import { getDimTokens } from '../lib/tokens';
import type { Platform } from '../lib/tokens';

const meta: Meta = {
  title: 'Design System/Spacing',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;

function Ruler({ value, label, description, cssVar, dartField, maxPx = 128 }: {
  value: number;
  label: string;
  description: string;
  cssVar: string;
  dartField: string;
  maxPx?: number;
}) {
  const pct = Math.min((value / maxPx) * 100, 100);
  return (
    <div style={{ padding: '10px 0', borderBottom: '1px solid var(--colour-border-default, #D0D2D2)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 6 }}>
        {/* Bar */}
        <div style={{ flex: 1, height: 12, background: 'var(--colour-surface-secondary, #D0D2D2)', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', background: 'var(--colour-action-default, #0B43EA)', borderRadius: 4 }} />
        </div>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, color: 'var(--colour-text-primary)', minWidth: 40, textAlign: 'right' }}>
          {value}px
        </span>
      </div>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 600, color: 'var(--colour-text-primary)' }}>{label}</span>
        <span style={{ fontSize: 12, color: 'var(--colour-text-tertiary)', flex: 1, minWidth: 200 }}>{description}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          <CopyButton value={`var(${cssVar})`} label={`CSS`} variant="css" />
          <CopyButton value={`KnowunityTokens.of(context).spacing.${dartField}`} label={`Dart`} variant="dart" />
        </div>
      </div>
    </div>
  );
}

function RadiusDemo({ value, label, description, cssVar }: {
  value: number;
  label: string;
  description: string;
  cssVar: string;
}) {
  const r = Math.min(value, 40);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '10px 0', borderBottom: '1px solid var(--colour-border-default, #D0D2D2)' }}>
      <div style={{
        width: 80, height: 48, flexShrink: 0,
        background: 'var(--colour-action-default, #0B43EA)',
        borderRadius: r,
      }} />
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', gap: 8, alignItems: 'baseline', marginBottom: 3 }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 600 }}>{label}</span>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#737777' }}>{value}px</span>
        </div>
        <p style={{ margin: 0, fontSize: 12, color: 'var(--colour-text-secondary)', lineHeight: 1.5 }}>{description}</p>
      </div>
      <CopyButton value={`var(${cssVar})`} label={cssVar} variant="css" />
    </div>
  );
}

function GridDiagram({ platform }: { platform: Platform }) {
  const tokens = getDimTokens(platform);
  const get = (name: string) => {
    const t = tokens.find((t) => t.displayName === name);
    const v = t?.resolvedValue as number;
    return v === 9999 ? null : v;
  };

  const cols     = get('layout/grid-columns') ?? 4;
  const gutter   = get('layout/grid-gutter')  ?? 8;
  const maxW     = get('layout/max-content-width');
  const maxText  = get('layout/max-text-width');

  return (
    <div style={{ padding: '16px 0' }}>
      <h3 style={{ fontFamily: 'Instrument Sans, sans-serif', fontSize: 14, fontWeight: 600, color: 'var(--colour-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: '0 0 12px' }}>
        Layout Grid · {platform}
      </h3>
      {/* Visual columns */}
      <div style={{ display: 'flex', gap: gutter > 24 ? 4 : 2, maxWidth: 600, height: 48, marginBottom: 16 }}>
        {Array.from({ length: cols }).map((_, i) => (
          <div key={i} style={{ flex: 1, background: 'rgba(11,67,234,0.12)', borderRadius: 3 }} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
        {[
          ['Columns', `${cols}`],
          ['Gutter', `${gutter}px`],
          ['Max content', maxW ? `${maxW}px` : 'none'],
          ['Max text', maxText ? `${maxText}px` : 'none'],
        ].map(([l, v]) => (
          <div key={l}>
            <div style={{ fontSize: 10, color: '#9FA2A2', fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{l}</div>
            <div style={{ fontSize: 14, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--colour-text-primary)', fontWeight: 600 }}>{v}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SpacingPage({ platform }: { platform: Platform }) {
  const tokens = getDimTokens(platform);

  const spacingTokens = tokens.filter((t) => t.displayName.startsWith('spacing/'));
  const radiusTokens  = tokens.filter((t) => t.displayName.startsWith('radius/'));

  const maxPx = Math.max(...spacingTokens.map((t) => Number(t.resolvedValue) || 0));

  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'Alte Haas Grotesk, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--colour-text-primary, #161D1D)' }}>Spacing</h1>
          <p style={{ margin: 0, color: 'var(--colour-text-secondary)', fontSize: 15 }}>
            Semantic spacing, radius, and layout tokens. Showing: <strong>{platform}</strong>.
          </p>
        </div>
        <FigmaBadge />
      </div>

      <h2 style={{ fontFamily: 'Instrument Sans', fontSize: 14, fontWeight: 600, color: 'var(--colour-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '0 0 4px' }}>Spacing Scale</h2>
      {spacingTokens.map((t) => {
        const v = t.resolvedValue as number;
        const field = t.displayName.split('/').flatMap((s) => s.split('-')).map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('');
        return (
          <Ruler
            key={t.path}
            value={v}
            label={t.displayName}
            description={t.$description}
            cssVar={`--${t.displayName.replace(/\//g, '-')}`}
            dartField={field}
            maxPx={maxPx}
          />
        );
      })}

      <h2 style={{ fontFamily: 'Instrument Sans', fontSize: 14, fontWeight: 600, color: 'var(--colour-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '32px 0 4px' }}>Corner Radius</h2>
      {radiusTokens.map((t) => (
        <RadiusDemo
          key={t.path}
          value={t.resolvedValue as number}
          label={t.displayName}
          description={t.$description}
          cssVar={`--${t.displayName.replace(/\//g, '-')}`}
        />
      ))}

      <h2 style={{ fontFamily: 'Instrument Sans', fontSize: 14, fontWeight: 600, color: 'var(--colour-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.08em', margin: '32px 0 4px' }}>Layout Grid</h2>
      <GridDiagram platform={platform} />
    </div>
  );
}

export const All: StoryObj = {
  name: 'All',
  render: (_, ctx) => {
    const platform = (ctx.globals.platform as Platform) ?? 'web';
    return <SpacingPage platform={platform} />;
  },
};
