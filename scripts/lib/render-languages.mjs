// Language mix from git trees of public repos: stacked bar plus a three-column legend.
import { svgOpen, svgClose, cardFrame, gradientDefs, text, round } from './svg.mjs';

const W = 900;
const MAX_ITEMS = 9;

export function renderLanguages(profile, theme) {
  let langs = profile.languages || [];
  if (langs.length > MAX_ITEMS) {
    const head = langs.slice(0, MAX_ITEMS - 1);
    const rest = langs.slice(MAX_ITEMS - 1);
    head.push({ name: 'Other', bytes: rest.reduce((a, b) => a + b.bytes, 0), percent: rest.reduce((a, b) => a + b.percent, 0), color: theme.faint });
    langs = head;
  }
  const rows = Math.ceil(langs.length / 3);
  const H = 104 + rows * 28 + 30;

  const style = `
  .bar { transform-origin: 24px 0; animation: grow 1.3s cubic-bezier(.2,.7,.2,1) .2s both; }
  @keyframes grow { from { transform: scaleX(0); } to { transform: scaleX(1); } }
  .row { animation: fade .6s ease-out both; }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }`;

  let s = svgOpen({ w: W, h: H, title: 'Languages across public repositories', desc: langs.map((l) => `${l.name} ${round(l.percent)}%`).join(', '), style });
  s += `<defs>${gradientDefs('brand', theme.gradient)}<clipPath id="barClip"><rect x="24" y="58" width="${W - 48}" height="14" rx="7"/></clipPath></defs>`;
  s += cardFrame({ w: W, h: H, theme });
  s += text(24, 36, 'Languages', { size: 16, weight: 700, fill: theme.text });
  s += text(W - 24, 36, 'by bytes of source in public repositories', { size: 12, fill: theme.muted, anchor: 'end' });

  // Stacked bar
  const barW = W - 48;
  s += `<rect x="24" y="58" width="${barW}" height="14" rx="7" fill="${theme.card2}" stroke="${theme.borderSoft}"/>`;
  let x = 24;
  s += `<g clip-path="url(#barClip)" class="bar">`;
  langs.forEach((l, i) => {
    const w = Math.max(3, (l.percent / 100) * barW);
    s += `<rect x="${x.toFixed(2)}" y="58" width="${w.toFixed(2)}" height="14" fill="${l.color}"${i ? ` stroke="${theme.card}" stroke-width="1.5"` : ''}/>`;
    x += w;
  });
  s += `</g>`;

  // Legend
  const colW = (W - 48) / 3;
  langs.forEach((l, i) => {
    const col = i % 3, row = Math.floor(i / 3);
    const lx = 24 + col * colW, ly = 104 + row * 28;
    s += `<g class="row" style="animation-delay:${400 + i * 70}ms">
  <circle cx="${lx + 6}" cy="${ly}" r="5.5" fill="${l.color}"/>
  ${text(lx + 20, ly + 4.5, l.name, { size: 13, weight: 600, fill: theme.text })}
  ${text(lx + colW - 16, ly + 4.5, `${l.percent.toFixed(l.percent < 1 ? 2 : 1)}%`, { size: 12.5, fill: theme.muted, anchor: 'end', mono: true })}
</g>`;
  });

  s += text(24, H - 16, 'Measured from git trees, so Pine Script and MQL5 count too. Lockfiles, vendored code and docs are excluded. Private repositories are not included.', { size: 10.5, fill: theme.faint });
  s += svgClose();
  return s;
}
