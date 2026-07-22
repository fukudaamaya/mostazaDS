import React from 'react';
import { CopyButton } from './CopyButton';
import { FigmaBadge } from './FigmaBadge';
import { cssColourAccessor, dartColourAccessor, primHex } from '../lib/tokens';
import type { FlatToken, Theme } from '../lib/tokens';

interface Props {
  token: FlatToken;
  theme: Theme;
  /** For semantic tokens that point to a primitive, show the alias chain */
  showAlias?: boolean;
}

function hexToRgb(hex: string) {
  const h = hex.replace('#', '');
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgb(${r} ${g} ${b})`;
}

export function ColorSwatch({ token, theme, showAlias = false }: Props) {
  const resolved = token.resolvedValue as string;
  const isRgba   = resolved?.startsWith('rgba');
  const hexValue = isRgba ? resolved : (resolved?.startsWith('#') ? resolved : '#000');

  // For semantic tokens: "neutral/900" alias → resolve to hex for display
  const aliasHex = token.aliasOf ? primHex(token.aliasOf) : undefined;
  const displayHex = aliasHex ?? hexValue;

  const cssVar  = cssColourAccessor(token.displayName);
  const dartAcc = token.collection === 'color'
    ? dartColourAccessor(token.displayName)
    : `AppColorPrimitives.${token.displayName.replace('/', '')}`;

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '56px 1fr',
        gap: 12,
        padding: '12px 0',
        borderBottom: '1px solid var(--colour-border-default, #D0D2D2)',
        alignItems: 'start',
      }}
    >
      {/* Swatch */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: 8,
            background: isRgba ? resolved : displayHex,
            border: '1px solid rgba(0,0,0,0.08)',
            flexShrink: 0,
          }}
        />
        <span style={{ fontSize: 10, color: '#737777', fontFamily: 'IBM Plex Mono, monospace', textAlign: 'center' }}>
          {isRgba ? 'rgba' : displayHex.toUpperCase()}
        </span>
      </div>

      {/* Details */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, minWidth: 0 }}>
        {/* Name */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, fontWeight: 600, color: 'var(--colour-text-primary, #161D1D)' }}>
            {token.displayName}
          </span>
          <FigmaBadge label="Figma" />
        </div>

        {/* Alias chain */}
        {showAlias && token.aliasOf && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ color: '#737777', fontFamily: 'IBM Plex Mono, monospace' }}>{cssVar}</span>
            <span style={{ color: '#9FA2A2' }}>→</span>
            <span style={{ color: '#5F6363', fontFamily: 'IBM Plex Mono, monospace' }}>
              --{token.aliasOf.replace(/\//g, '-')}
            </span>
            <span style={{ color: '#9FA2A2' }}>→</span>
            <span style={{ fontFamily: 'IBM Plex Mono, monospace', color: '#5F6363' }}>
              {aliasHex?.toUpperCase() ?? resolved}
            </span>
          </div>
        )}

        {/* Description */}
        {token.$description && (
          <p style={{ margin: 0, fontSize: 12, color: 'var(--colour-text-secondary, #444949)', lineHeight: 1.5, maxWidth: 560 }}>
            {token.$description}
          </p>
        )}

        {/* Copy buttons */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          <CopyButton value={cssVar} label={`CSS ${cssVar}`} variant="css" />
          {token.collection === 'color' && (
            <CopyButton value={dartAcc} label={`Dart .${dartColourAccessor(token.displayName).split('.').pop()}`} variant="dart" />
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Primitive scale row ──────────────────────────────────────────────────────

export function PrimitiveSwatch({ token }: { token: FlatToken }) {
  const hex = token.resolvedValue as string;
  const cssVar = `--${token.displayName.replace(/\//g, '-')}`;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '8px 0', borderBottom: '1px solid var(--colour-border-default, #D0D2D2)' }}>
      <div style={{ width: 40, height: 40, borderRadius: 6, background: hex, border: '1px solid rgba(0,0,0,0.08)', flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 12, fontWeight: 600 }}>{token.displayName}</span>
          <span style={{ fontFamily: 'IBM Plex Mono, monospace', fontSize: 11, color: '#737777' }}>{hex?.toUpperCase()}</span>
        </div>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#737777', lineHeight: 1.4 }}>{token.$description?.split('.')[0]}.</p>
      </div>
      <CopyButton value={`var(${cssVar})`} label={`var(${cssVar})`} variant="css" />
    </div>
  );
}
