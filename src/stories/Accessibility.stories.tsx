import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { FigmaBadge } from '../components/FigmaBadge';
import { resolveColorHex, primHex } from '../lib/tokens';
import { checkContrast } from '../lib/contrast';
import type { Theme } from '../lib/tokens';

const meta: Meta = {
  title: 'Design System/Accessibility',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;

// ─── Contrast pairs ───────────────────────────────────────────────────────────

const PAIRS: Array<{
  fg: string;
  bg: string;
  context: string;
}> = [
  { fg: 'colour/text/primary',   bg: 'colour/surface/page',     context: 'Body text on page canvas' },
  { fg: 'colour/text/primary',   bg: 'colour/surface/default',  context: 'Body text on card surface' },
  { fg: 'colour/text/secondary', bg: 'colour/surface/page',     context: 'Secondary text on page' },
  { fg: 'colour/text/tertiary',  bg: 'colour/surface/page',     context: 'Tertiary / captions on page (14px min)' },
  { fg: 'colour/text/link',      bg: 'colour/surface/page',     context: 'Inline links on page' },
  { fg: 'colour/text/brand',     bg: 'colour/surface/page',     context: 'Brand display text (large, 3:1 threshold)' },
  { fg: 'colour/text/on-brand',  bg: 'colour/action/default',   context: 'Button label on primary action' },
  { fg: 'colour/text/on-brand',  bg: 'colour/surface/brand',    context: 'Text on brand-blue panel' },
  { fg: 'colour/text/on-accent', bg: 'colour/surface/accent',   context: 'Text on yellow accent panel' },
  { fg: 'colour/text/inverse',   bg: 'colour/surface/inverse',  context: 'Inverse text on dark hero/footer' },
  { fg: 'colour/text/primary',   bg: 'colour/surface/elevated', context: 'Text on elevated card/modal' },
  { fg: 'colour/feedback/success-text',  bg: 'colour/feedback/success-surface', context: 'Success message text' },
  { fg: 'colour/feedback/warning-text',  bg: 'colour/feedback/warning-surface', context: 'Warning message text' },
  { fg: 'colour/feedback/error-text',    bg: 'colour/feedback/error-surface',   context: 'Error message text' },
  { fg: 'colour/feedback/info-text',     bg: 'colour/feedback/info-surface',    context: 'Info message text' },
  { fg: 'colour/text/disabled', bg: 'colour/action/disabled',   context: 'Disabled button label (intentionally sub-AA)' },
];

type Level = 'AAA' | 'AA' | 'fail';

function Badge({ level }: { level: Level }) {
  const styles: Record<Level, { bg: string; color: string }> = {
    AAA:  { bg: '#D8F3E3', color: '#12653A' },
    AA:   { bg: '#EAEEFF', color: '#0937CC' },
    fail: { bg: '#FDDCDC', color: '#951F1F' },
  };
  const s = styles[level];
  return (
    <span style={{
      display: 'inline-block', padding: '2px 7px', borderRadius: 4,
      fontSize: 11, fontWeight: 700, fontFamily: 'IBM Plex Mono, monospace',
      background: s.bg, color: s.color,
    }}>
      {level === 'fail' ? 'FAIL' : level}
    </span>
  );
}

interface RowProps {
  fg: string;
  bg: string;
  context: string;
  theme: Theme;
}

function ContrastRow({ fg, bg, context, theme }: RowProps) {
  const fgHex = resolveColorHex(fg, theme);
  const bgHex = resolveColorHex(bg, theme);
  const result = checkContrast(fgHex, bgHex);

  return (
    <tr style={{ borderBottom: '1px solid var(--colour-border-default, #D0D2D2)' }}>
      {/* Color preview */}
      <td style={{ padding: '10px 12px' }}>
        <div style={{ width: 48, height: 32, borderRadius: 6, background: bgHex, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.06)' }}>
          <span style={{ color: fgHex, fontSize: 13, fontWeight: 700, fontFamily: 'Instrument Sans, sans-serif' }}>Aa</span>
        </div>
      </td>
      {/* Foreground */}
      <td style={{ padding: '10px 12px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>{fg}</div>
        <div style={{ color: '#737777' }}>{fgHex.toUpperCase()}</div>
      </td>
      {/* Background */}
      <td style={{ padding: '10px 12px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 11 }}>
        <div style={{ fontWeight: 600, marginBottom: 2 }}>{bg}</div>
        <div style={{ color: '#737777' }}>{bgHex.toUpperCase()}</div>
      </td>
      {/* Ratio */}
      <td style={{ padding: '10px 12px', fontFamily: 'IBM Plex Mono, monospace', fontSize: 13, fontWeight: 700, textAlign: 'center' }}>
        {result.ratioStr}
      </td>
      {/* Normal text */}
      <td style={{ padding: '10px 12px', textAlign: 'center' }}><Badge level={result.normalText} /></td>
      {/* Large text */}
      <td style={{ padding: '10px 12px', textAlign: 'center' }}><Badge level={result.largeText} /></td>
      {/* Icons (3:1) */}
      <td style={{ padding: '10px 12px', textAlign: 'center' }}><Badge level={result.icons} /></td>
      {/* Context */}
      <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--colour-text-secondary)', maxWidth: 220 }}>{context}</td>
    </tr>
  );
}

function AccessibilityPage({ theme }: { theme: Theme }) {
  return (
    <div style={{ padding: 32 }}>
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'Alte Haas Grotesk, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--colour-text-primary, #161D1D)' }}>
            Accessibility
          </h1>
          <p style={{ margin: 0, color: 'var(--colour-text-secondary)', fontSize: 15 }}>
            WCAG 2.1 contrast ratios for all meaningful foreground/background pairings. Theme: <strong>{theme}</strong>.
          </p>
        </div>
        <FigmaBadge />
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--colour-border-strong, #828686)' }}>
              {['Preview', 'Foreground', 'Background', 'Ratio', 'Normal text', 'Large text (18px+)', 'Icons / UI', 'Context'].map((h) => (
                <th key={h} style={{ padding: '8px 12px', textAlign: h === 'Ratio' || h.includes('text') || h.includes('Icons') ? 'center' : 'left', fontFamily: 'Instrument Sans, sans-serif', fontSize: 11, fontWeight: 600, color: 'var(--colour-text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {PAIRS.map((pair) => (
              <ContrastRow key={`${pair.fg}__${pair.bg}`} {...pair} theme={theme} />
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ marginTop: 24, padding: '12px 16px', background: 'var(--colour-surface-secondary)', borderRadius: 8, fontSize: 12, color: 'var(--colour-text-secondary)', lineHeight: 1.6 }}>
        <strong>WCAG 2.1 thresholds:</strong> Normal text AA ≥ 4.5:1 · Normal text AAA ≥ 7:1 · Large text (18px+ or 14px+ bold) AA ≥ 3:1 · Large text AAA ≥ 4.5:1 · UI components and icons ≥ 3:1
      </div>
    </div>
  );
}

export const Ratios: StoryObj = {
  name: 'Contrast Ratios',
  render: (_, ctx) => {
    const theme = (ctx.globals.theme as Theme) ?? 'light';
    return <AccessibilityPage theme={theme} />;
  },
};
