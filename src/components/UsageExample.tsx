import React from 'react';

/** Mini usage examples shown next to semantic colour tokens. */

const examples: Record<string, React.ReactNode> = {
  'colour/action/default': (
    <button style={{
      background: 'var(--colour-action-default)',
      color: 'var(--colour-text-on-brand)',
      fontFamily: 'Instrument Sans, sans-serif',
      fontSize: 14, fontWeight: 500,
      padding: '8px 20px', borderRadius: 999,
      border: 'none', cursor: 'default',
    }}>
      Contact me
    </button>
  ),
  'colour/action/hover': (
    <button style={{
      background: 'var(--colour-action-hover)',
      color: 'var(--colour-text-on-brand)',
      fontFamily: 'Instrument Sans, sans-serif',
      fontSize: 14, fontWeight: 500,
      padding: '8px 20px', borderRadius: 999,
      border: 'none', cursor: 'default',
    }}>
      Contact me ↗
    </button>
  ),
  'colour/surface/page': (
    <div style={{
      background: 'var(--colour-surface-page)',
      border: '1px solid var(--colour-border-default)',
      borderRadius: 8, padding: '10px 14px', fontSize: 12,
      color: 'var(--colour-text-primary)', fontFamily: 'Instrument Sans, sans-serif',
    }}>
      Page canvas
    </div>
  ),
  'colour/surface/elevated': (
    <div style={{
      background: 'var(--colour-surface-elevated)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
      borderRadius: 12, padding: '12px 16px', fontSize: 12,
      color: 'var(--colour-text-primary)', fontFamily: 'Instrument Sans, sans-serif',
    }}>
      Card / modal surface
    </div>
  ),
  'colour/feedback/error-text': (
    <div style={{
      background: 'var(--colour-feedback-error-surface)',
      border: '1px solid var(--colour-feedback-error-text)',
      borderRadius: 6, padding: '8px 12px',
      color: 'var(--colour-feedback-error-text)',
      fontFamily: 'Instrument Sans, sans-serif', fontSize: 12, fontWeight: 500,
    }}>
      ✕ This field is required
    </div>
  ),
  'colour/feedback/success-text': (
    <div style={{
      background: 'var(--colour-feedback-success-surface)',
      borderRadius: 6, padding: '8px 12px',
      color: 'var(--colour-feedback-success-text)',
      fontFamily: 'Instrument Sans, sans-serif', fontSize: 12, fontWeight: 500,
    }}>
      ✓ Message sent
    </div>
  ),
  'colour/feedback/warning-text': (
    <div style={{
      background: 'var(--colour-feedback-warning-surface)',
      borderRadius: 6, padding: '8px 12px',
      color: 'var(--colour-feedback-warning-text)',
      fontFamily: 'Instrument Sans, sans-serif', fontSize: 12, fontWeight: 500,
    }}>
      ⚠ Draft — not yet published
    </div>
  ),
  'colour/feedback/info-text': (
    <div style={{
      background: 'var(--colour-feedback-info-surface)',
      borderRadius: 6, padding: '8px 12px',
      color: 'var(--colour-feedback-info-text)',
      fontFamily: 'Instrument Sans, sans-serif', fontSize: 12, fontWeight: 500,
    }}>
      ℹ This project is under NDA
    </div>
  ),
  'colour/accent/highlight': (
    <span style={{
      background: 'var(--colour-accent-highlight)',
      padding: '2px 6px', borderRadius: 3,
      fontFamily: 'Instrument Sans, sans-serif', fontSize: 13, fontWeight: 600,
      color: 'var(--colour-text-on-accent)',
    }}>
      Featured project
    </span>
  ),
  'colour/accent/highlight-subtle': (
    <span style={{
      background: 'var(--colour-accent-highlight-subtle)',
      padding: '2px 4px',
      fontFamily: 'Instrument Sans, sans-serif', fontSize: 13,
      color: 'var(--colour-text-on-accent)',
    }}>
      Highlighted text
    </span>
  ),
  'colour/border/focus': (
    <div style={{
      border: '2px solid var(--colour-border-focus)',
      outline: '3px solid var(--colour-action-default)',
      outlineOffset: 2,
      borderRadius: 6, padding: '8px 12px',
      fontFamily: 'Instrument Sans, sans-serif', fontSize: 13,
      color: 'var(--colour-text-primary)',
      background: 'var(--colour-surface-elevated)',
    }}>
      Focused input
    </div>
  ),
};

interface Props {
  tokenName: string;
}

export function UsageExample({ tokenName }: Props) {
  const example = examples[tokenName];
  if (!example) return null;
  return (
    <div style={{ marginTop: 10, display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
      <span style={{ fontSize: 10, color: '#9FA2A2', fontFamily: 'IBM Plex Mono, monospace', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Used as:</span>
      {example}
    </div>
  );
}
