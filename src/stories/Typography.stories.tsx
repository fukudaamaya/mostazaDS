import React from 'react';
import type { Meta, StoryObj } from '@storybook/react';
import { TypeSpecimen } from '../components/TypeSpecimen';
import { FigmaBadge } from '../components/FigmaBadge';
import type { Platform } from '../lib/tokens';

const TYPE_STYLES = [
  'heading-1', 'heading-2', 'heading-3',
  'body-large', 'body-medium', 'body-small',
  'label', 'label-small', 'caption',
];

const meta: Meta = {
  title: 'Design System/Typography',
  parameters: { layout: 'fullscreen' },
  tags: ['autodocs'],
};
export default meta;

function TypographyPage({ platform }: { platform: Platform }) {
  return (
    <div style={{ padding: 32, maxWidth: 900 }}>
      <div style={{ marginBottom: 32, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ margin: '0 0 6px', fontFamily: 'Alte Haas Grotesk, sans-serif', fontSize: 32, fontWeight: 700, color: 'var(--colour-text-primary, #161D1D)' }}>
            Typography
          </h1>
          <p style={{ margin: 0, color: 'var(--colour-text-secondary, #444949)', fontSize: 15 }}>
            9 type styles across 3 families. Showing values for <strong>{platform}</strong> — toggle platform in the toolbar.
          </p>
        </div>
        <FigmaBadge />
      </div>

      <div style={{
        background: 'var(--colour-feedback-info-surface, #EAEEFF)',
        border: '1px solid var(--colour-border-default, #D0D2D2)',
        borderRadius: 8, padding: '12px 16px', marginBottom: 32, fontSize: 13,
        color: 'var(--colour-feedback-info-text, #0937CC)', fontFamily: 'Instrument Sans, sans-serif',
      }}>
        <strong>Font note:</strong> Instrument Sans and IBM Plex Mono load from Google Fonts. Alte Haas Grotesk must be self-hosted — see <code>.storybook/preview-head.html</code> for instructions. Heading-1 specimens may show a system fallback until the font is configured.
      </div>

      {TYPE_STYLES.map((style) => (
        <TypeSpecimen key={style} styleName={style} platform={platform} />
      ))}
    </div>
  );
}

export const All: StoryObj = {
  name: 'All Styles',
  render: (_, ctx) => {
    const platform = (ctx.globals.platform as Platform) ?? 'web';
    return <TypographyPage platform={platform} />;
  },
};
