import React from 'react';
import { FIGMA_FILE_URL } from '../lib/tokens';

interface Props {
  label?: string;
}

export function FigmaBadge({ label = 'Open in Figma' }: Props) {
  return (
    <a
      href={FIGMA_FILE_URL}
      target="_blank"
      rel="noopener noreferrer"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 5,
        padding: '3px 8px',
        borderRadius: 4,
        background: '#1E1E1E',
        color: '#FFFFFF',
        fontSize: 11,
        fontFamily: 'Instrument Sans, sans-serif',
        fontWeight: 500,
        textDecoration: 'none',
        lineHeight: '16px',
        whiteSpace: 'nowrap',
      }}
    >
      <FigmaIcon />
      {label}
    </a>
  );
}

function FigmaIcon() {
  return (
    <svg width="10" height="14" viewBox="0 0 10 14" fill="none" aria-hidden>
      <path d="M5 7A2 2 0 1 1 5 3a2 2 0 0 1 0 4Z" fill="#1ABCFE" />
      <path d="M1 11a2 2 0 0 1 2-2h2v2a2 2 0 1 1-4 0Z" fill="#0ACF83" />
      <path d="M5 1H3a2 2 0 0 0 0 4h2V1Z" fill="#FF7262" />
      <path d="M5 5h2a2 2 0 0 1 0 4H5V5Z" fill="#F24E1E" />
      <path d="M5 1h2a2 2 0 0 1 0 4H5V1Z" fill="#FF7262" />
    </svg>
  );
}
