import React, { useState, useCallback } from 'react';

interface Props {
  value: string;
  label?: string;
  variant?: 'css' | 'dart' | 'default';
}

const colors: Record<string, { bg: string; text: string; border: string }> = {
  css:     { bg: '#EBF5FF', text: '#0937CC', border: '#B0C2FD' },
  dart:    { bg: '#EFF8F4', text: '#12653A', border: '#D8F3E3' },
  default: { bg: '#F3F3F3', text: '#444949', border: '#D0D2D2' },
};

export function CopyButton({ value, label, variant = 'default' }: Props) {
  const [copied, setCopied] = useState(false);
  const c = colors[variant];

  const copy = useCallback(() => {
    navigator.clipboard.writeText(value).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [value]);

  return (
    <button
      onClick={copy}
      title={`Copy: ${value}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 4,
        padding: '3px 8px',
        borderRadius: 4,
        border: `1px solid ${copied ? '#1B8A4E' : c.border}`,
        background: copied ? '#D8F3E3' : c.bg,
        color: copied ? '#12653A' : c.text,
        fontSize: 11,
        fontFamily: 'IBM Plex Mono, monospace',
        cursor: 'pointer',
        transition: 'all 0.15s',
        whiteSpace: 'nowrap',
        maxWidth: 260,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {copied ? '✓ Copied' : (label ?? value)}
    </button>
  );
}
