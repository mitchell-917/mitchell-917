// Shared SVG primitives, theme tokens and text metrics for the profile generator.
// Everything renders with system fonts only: GitHub's image proxy blocks external resources.

export const FONT = `-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Noto Sans', Helvetica, Arial, sans-serif`;
export const MONO = `ui-monospace, SFMono-Regular, 'SF Mono', Menlo, Consolas, 'Liberation Mono', monospace`;

export const THEMES = {
  dark: {
    name: 'dark',
    pageBg: '#0d1117',
    card: '#161b22',
    card2: '#1c2128',
    border: '#30363d',
    borderSoft: '#262c36',
    text: '#e6edf3',
    muted: '#9198a1',
    faint: '#636c76',
    primary: '#7c8cf8',
    secondary: '#a78bfa',
    accent: '#f472b6',
    success: '#3fb950',
    cyan: '#38bdf8',
    amber: '#f0b429',
    heat: ['#1b2230', '#2e3d8f', '#4a5fd8', '#7c8cf8', '#c4b5fd'],
    gradient: ['#7c8cf8', '#a78bfa', '#f472b6'],
    onDark: true,
  },
  light: {
    name: 'light',
    pageBg: '#ffffff',
    card: '#ffffff',
    card2: '#f6f8fa',
    border: '#d0d7de',
    borderSoft: '#e6e9ed',
    text: '#1f2328',
    muted: '#59636e',
    faint: '#8c959f',
    primary: '#4f5fd8',
    secondary: '#7c3aed',
    accent: '#db2777',
    success: '#1a7f37',
    cyan: '#0284c7',
    amber: '#9a6700',
    heat: ['#eef1f6', '#c9d1fb', '#94a3f3', '#5b6ee6', '#3644b8'],
    gradient: ['#4f5fd8', '#7c3aed', '#db2777'],
    onDark: false,
  },
};

export const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

export const fmt = (n) => Number(n || 0).toLocaleString('en-US');

export const compact = (n) => {
  n = Number(n || 0);
  if (n >= 1e6) return (n / 1e6).toFixed(1).replace(/\.0$/, '') + 'M';
  if (n >= 1e3) return (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'K';
  return String(n);
};

export const round = (n, d = 1) => Math.round(n * 10 ** d) / 10 ** d;

// Approximate glyph advance widths (em) for a UI sans; tuned to Segoe UI / SF Pro / Inter.
const NARROW = new Set(['i', 'l', 'j', 't', 'f', 'r', 'I', '.', ',', ':', ';', "'", '|', '!', '(', ')', '[', ']', '{', '}', '/', '\\']);
const WIDE = new Set(['m', 'w', 'M', 'W', '@', '%']);
function charFactor(ch, weight) {
  let f;
  if (ch === ' ') f = 0.28;
  else if (NARROW.has(ch)) f = 0.31;
  else if (WIDE.has(ch)) f = 0.82;
  else if (/[A-Z]/.test(ch)) f = 0.66;
  else if (/[0-9]/.test(ch)) f = 0.56;
  else if (/[ -￿]/.test(ch)) f = 1.0;
  else f = 0.53;
  return weight >= 600 ? f * 1.07 : f;
}

export function textWidth(str, size = 14, weight = 400, mono = false) {
  const s = String(str ?? '');
  if (mono) return [...s].length * size * 0.6;
  let w = 0;
  for (const ch of s) w += size * charFactor(ch, weight);
  return w;
}

// Greedy word wrap using the width heuristic. Returns an array of lines.
export function wrap(text, maxWidth, size = 13, weight = 400, maxLines = Infinity) {
  const words = String(text ?? '').split(/\s+/).filter(Boolean);
  const lines = [];
  let line = '';
  for (const word of words) {
    const candidate = line ? `${line} ${word}` : word;
    if (textWidth(candidate, size, weight) <= maxWidth || !line) {
      line = candidate;
    } else {
      lines.push(line);
      line = word;
    }
  }
  if (line) lines.push(line);
  if (lines.length > maxLines) {
    const kept = lines.slice(0, maxLines);
    let last = kept[maxLines - 1];
    while (textWidth(last + '…', size, weight) > maxWidth && last.includes(' ')) {
      last = last.slice(0, last.lastIndexOf(' '));
    }
    kept[maxLines - 1] = last + '…';
    return kept;
  }
  return lines;
}

export function svgOpen({ w, h, title, desc, style = '', extraAttrs = '' }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" role="img" aria-labelledby="t d" ${extraAttrs}>
<title id="t">${esc(title)}</title>
<desc id="d">${esc(desc || title)}</desc>
<style>
  text { font-family: ${FONT}; }
  .mono { font-family: ${MONO}; }
  ${style}
</style>
`;
}

export const svgClose = () => `</svg>\n`;

export function gradientDefs(id, colors, { x1 = 0, y1 = 0, x2 = 1, y2 = 0 } = {}) {
  const stops = colors
    .map((c, i) => `<stop offset="${Math.round((i / (colors.length - 1)) * 100)}%" stop-color="${c}"/>`)
    .join('');
  return `<linearGradient id="${id}" x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}">${stops}</linearGradient>`;
}

// Card container: surface, border and an optional gradient hairline along the top edge.
export function cardFrame({ x = 0, y = 0, w, h, theme, r = 16, hairline = true, hairlineId = 'brand', fill }) {
  const clip = `clip-${x}-${y}-${w}-${h}`.replace(/\./g, '_');
  return `
<defs><clipPath id="${clip}"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/></clipPath></defs>
<rect x="${x + 0.5}" y="${y + 0.5}" width="${w - 1}" height="${h - 1}" rx="${r}" fill="${fill || theme.card}" stroke="${theme.border}"/>
${hairline ? `<rect x="${x}" y="${y}" width="${w}" height="3" fill="url(#${hairlineId})" clip-path="url(#${clip})"/>` : ''}`;
}

export function text(x, y, str, { size = 14, weight = 400, fill, anchor = 'start', mono = false, opacity, letterSpacing, cls = '' } = {}) {
  const attrs = [
    `x="${x}"`,
    `y="${y}"`,
    `font-size="${size}"`,
    weight !== 400 ? `font-weight="${weight}"` : '',
    fill ? `fill="${fill}"` : '',
    anchor !== 'start' ? `text-anchor="${anchor}"` : '',
    opacity != null ? `opacity="${opacity}"` : '',
    letterSpacing ? `letter-spacing="${letterSpacing}"` : '',
    mono || cls ? `class="${[mono ? 'mono' : '', cls].filter(Boolean).join(' ')}"` : '',
  ]
    .filter(Boolean)
    .join(' ');
  return `<text ${attrs}>${esc(str)}</text>`;
}

// Simple Icons glyphs are 24x24 single paths.
export function iconPath(icons, slug, x, y, size, color) {
  const icon = icons[slug];
  if (!icon) return '';
  const s = size / 24;
  return `<g transform="translate(${x} ${y}) scale(${s})"><path d="${icon.d}" fill="${color}"/></g>`;
}

// Fallback glyph for tools without a Simple Icons entry: a rounded tile with a monogram.
export function monogram(letters, x, y, size, color, theme) {
  const fontSize = letters.length > 2 ? size * 0.42 : size * 0.52;
  return `<g transform="translate(${x} ${y})">
<rect width="${size}" height="${size}" rx="${size * 0.22}" fill="${color}" opacity="${theme.onDark ? 0.9 : 1}"/>
<text x="${size / 2}" y="${size / 2 + fontSize * 0.36}" font-size="${fontSize}" font-weight="700" text-anchor="middle" fill="#ffffff" letter-spacing="-0.5">${esc(letters)}</text>
</g>`;
}

// Ensures near-black brand colors stay visible on dark surfaces and near-white ones on light.
export function visibleColor(hex, theme) {
  const c = hex.replace('#', '');
  const r = parseInt(c.slice(0, 2), 16), g = parseInt(c.slice(2, 4), 16), b = parseInt(c.slice(4, 6), 16);
  const lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
  if (theme.onDark && lum < 0.2) return theme.text;
  if (!theme.onDark && lum > 0.88) return '#5c5c5c';
  return hex;
}

export function pill({ x, y, label, size = 12, weight = 600, theme, color, height = 24, padX = 10, mono = false }) {
  const w = Math.ceil(textWidth(label, size, weight, mono) + padX * 2);
  const fill = color || theme.primary;
  return {
    width: w,
    svg: `<g transform="translate(${x} ${y})">
<rect width="${w}" height="${height}" rx="${height / 2}" fill="${fill}" opacity="${theme.onDark ? 0.16 : 0.12}"/>
<rect x="0.5" y="0.5" width="${w - 1}" height="${height - 1}" rx="${(height - 1) / 2}" fill="none" stroke="${fill}" opacity="0.45"/>
${text(w / 2, height / 2 + size * 0.36, label, { size, weight, fill, anchor: 'middle', mono })}
</g>`,
  };
}

export const heatLevel = (count, thresholds) => {
  if (!count) return 0;
  if (count <= thresholds[0]) return 1;
  if (count <= thresholds[1]) return 2;
  if (count <= thresholds[2]) return 3;
  return 4;
};

export function monthShort(dateStr) {
  return ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][new Date(dateStr + 'T00:00:00Z').getUTCMonth()];
}

export function longDate(dateStr) {
  const d = new Date(dateStr.length > 10 ? dateStr : dateStr + 'T00:00:00Z');
  return `${d.getUTCDate()} ${monthShort(d.toISOString().slice(0, 10))} ${d.getUTCFullYear()}`;
}

// Deterministic PRNG so decorative art never changes between runs (keeps git diffs quiet).
export function mulberry32(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
