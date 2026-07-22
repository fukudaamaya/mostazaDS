/** WCAG 2.1 contrast utilities */

function parseHex(hex: string): [number, number, number] {
  const h = hex.replace('#', '');
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toLinear(c: number): number {
  const s = c / 255;
  return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
}

export function relativeLuminance(hex: string): number {
  if (!hex || !hex.startsWith('#') || hex.length < 7) return 0;
  const [r, g, b] = parseHex(hex);
  return 0.2126 * toLinear(r) + 0.7152 * toLinear(g) + 0.0722 * toLinear(b);
}

export function contrastRatio(hex1: string, hex2: string): number {
  const l1 = relativeLuminance(hex1);
  const l2 = relativeLuminance(hex2);
  const lighter = Math.max(l1, l2);
  const darker  = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function wcagLevel(ratio: number, large = false): 'AAA' | 'AA' | 'fail' {
  if (large) return ratio >= 4.5 ? 'AAA' : ratio >= 3 ? 'AA' : 'fail';
  return ratio >= 7 ? 'AAA' : ratio >= 4.5 ? 'AA' : 'fail';
}

export interface ContrastResult {
  ratio: number;
  ratioStr: string;
  normalText: 'AAA' | 'AA' | 'fail';
  largeText:  'AAA' | 'AA' | 'fail';
  icons:      'AAA' | 'AA' | 'fail'; // same threshold as large text (3:1 min)
}

export function checkContrast(fgHex: string, bgHex: string): ContrastResult {
  const ratio = contrastRatio(fgHex, bgHex);
  return {
    ratio,
    ratioStr: ratio.toFixed(2) + ':1',
    normalText: wcagLevel(ratio, false),
    largeText:  wcagLevel(ratio, true),
    icons:      ratio >= 3 ? (ratio >= 4.5 ? 'AAA' : 'AA') : 'fail',
  };
}
