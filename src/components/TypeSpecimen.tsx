import React from 'react';
import { CopyButton } from './CopyButton';
import { FigmaBadge } from './FigmaBadge';
import type { Platform } from '../lib/tokens';
import { getDimTokens } from '../lib/tokens';

interface Props {
  styleName: string; // "heading-1"
  platform: Platform;
}

const SPECIMEN_TEXT: Record<string, string> = {
  'heading-1':    'Building experiences that last',
  'heading-2':    'Case study — Discovery phase',
  'heading-3':    'Research findings',
  'body-large':   'An investigation into how users navigate complex information hierarchies when time pressure is a factor in their decision making.',
  'body-medium':  'The design system provides a coherent visual language across all touchpoints, ensuring that every interaction feels intentional and considered.',
  'body-small':   'Last updated March 2026 · 5 min read',
  'label':        'Contact me',
  'label-small':  'UX Design · 2024',
  'caption':      'Figure 1 · User journey map · Mostaza portfolio',
};

export function TypeSpecimen({ styleName, platform }: Props) {
  const tokens = getDimTokens(platform);
  const get = (prop: string) => tokens.find((t) => t.displayName === `type/${styleName}/${prop}`);

  const sizeToken   = get('size');
  const weightToken = get('weight');
  const lhToken     = get('line-height');
  const lsToken     = get('letter-spacing');
  const famToken    = get('family');

  const size   = sizeToken?.resolvedValue   as number ?? 16;
  const weight = weightToken?.resolvedValue as number ?? 400;
  const lh     = lhToken?.resolvedValue     as number ?? 24;
  const ls     = lsToken?.resolvedValue     as number ?? 0;
  const family = famToken?.resolvedValue    as string ?? 'Instrument Sans';

  const cssPrefix = `type-${styleName}`;
  const dartField = styleName.split('-').map((w, i) => i === 0 ? w : w.charAt(0).toUpperCase() + w.slice(1)).join('');

  const specimenText = SPECIMEN_TEXT[styleName] ?? 'The quick brown fox';

  return (
    <div style={{ borderBottom: '1px solid var(--colour-border-default, #D0D2D2)', padding: '24px 0' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
        <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 600, color: 'var(--colour-text-tertiary, #737777)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          type/{styleName}
        </span>
        <FigmaBadge label="Figma" />
      </div>

      {/* Live specimen */}
      <p
        style={{
          fontFamily: family,
          fontSize: size,
          fontWeight: weight,
          lineHeight: `${lh}px`,
          letterSpacing: ls,
          margin: '0 0 16px',
          color: 'var(--colour-text-primary, #161D1D)',
          maxWidth: 720,
        }}
      >
        {specimenText}
      </p>

      {/* Specs table */}
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', marginBottom: 12 }}>
        {[
          ['Family',  family],
          ['Size',    `${size}px`],
          ['Weight',  String(weight)],
          ['Line-h',  `${lh}px`],
          ['Tracking',ls ? `${ls}px` : '0'],
        ].map(([label, val]) => (
          <div key={label}>
            <div style={{ fontSize: 10, color: '#9FA2A2', fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 2 }}>{label}</div>
            <div style={{ fontSize: 13, fontFamily: 'IBM Plex Mono, monospace', color: 'var(--colour-text-secondary, #444949)' }}>{val}</div>
          </div>
        ))}
      </div>

      {/* Description */}
      {sizeToken?.$description && (
        <p style={{ margin: '0 0 10px', fontSize: 12, color: 'var(--colour-text-secondary, #444949)', maxWidth: 560, lineHeight: 1.5 }}>
          {sizeToken.$description}
        </p>
      )}

      {/* Copy */}
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <CopyButton value={`var(--${cssPrefix}-size)`} label={`CSS --${cssPrefix}-*`} variant="css" />
        <CopyButton value={`KnowunityTokens.of(context).typography.${dartField}`} label={`Dart .${dartField}`} variant="dart" />
      </div>
    </div>
  );
}
