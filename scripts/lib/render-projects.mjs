// Featured project card (440x184). Four of these sit in a 2x2 grid, each wrapped in a link.
import { svgOpen, svgClose, cardFrame, text, textWidth, wrap, fmt, pill } from './svg.mjs';

export const CARD_W = 440;
export const CARD_H = 184;

const GLYPHS = {
  chart: (c) => `<path d="M9 30 L17 21 L23 26 L31 13 L36 17" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><circle cx="36" cy="17" r="2.6" fill="${c}"/>`,
  code: (c) => `<path d="M16 14 L8 22 L16 30" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M28 14 L36 22 L28 30" fill="none" stroke="${c}" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/><path d="M25 12 L19 32" stroke="${c}" stroke-width="2.4" stroke-linecap="round"/>`,
  bars: (c) => `<rect x="9" y="24" width="5" height="10" rx="1.5" fill="${c}"/><rect x="17" y="16" width="5" height="18" rx="1.5" fill="${c}"/><rect x="25" y="20" width="5" height="14" rx="1.5" fill="${c}"/><rect x="33" y="10" width="5" height="24" rx="1.5" fill="${c}"/>`,
  spark: (c) => `<path d="M22 8 L25.5 18.5 L36 22 L25.5 25.5 L22 36 L18.5 25.5 L8 22 L18.5 18.5 Z" fill="${c}"/><circle cx="34" cy="10" r="2" fill="${c}" opacity=".7"/><circle cx="10" cy="34" r="1.6" fill="${c}" opacity=".7"/>`,
};

const STAR = 'M8 1.5l2 4.2 4.6.6-3.4 3.2.9 4.6L8 11.8 3.9 14.1l.9-4.6L1.4 6.3 6 5.7z';

export function renderProjectCard(project, profile, theme) {
  const accent = project.accent || theme.primary;
  const langColor = (profile.languages.find((l) => l.name === project.language) || {}).color || theme.muted;
  const style = `
  .in { animation: fade .7s ease-out both; }
  .d1 { animation-delay: .1s } .d2 { animation-delay: .25s } .d3 { animation-delay: .4s }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }`;

  let s = svgOpen({ w: CARD_W, h: CARD_H, title: `${project.title} — ${project.repo}`, desc: project.description, style });
  s += `<defs><linearGradient id="acc" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="${accent}"/><stop offset="100%" stop-color="${accent}" stop-opacity=".25"/></linearGradient></defs>`;
  s += cardFrame({ w: CARD_W, h: CARD_H, theme, hairlineId: 'acc' });

  // Icon tile
  s += `<g class="in">
  <rect x="24" y="26" width="44" height="44" rx="12" fill="${accent}" opacity="${theme.onDark ? 0.18 : 0.12}"/>
  <g transform="translate(24 26)">${(GLYPHS[project.icon] || GLYPHS.spark)(accent)}</g>
</g>`;

  // Title + repo
  s += text(84, 46, project.title, { size: 18, weight: 700, fill: theme.text, letterSpacing: -0.2, cls: 'in' });
  s += text(84, 64, `${profile.user.login}/${project.repo}`, { size: 11.5, fill: theme.muted, mono: true, cls: 'in d1' });

  // Description
  const lines = wrap(project.description, CARD_W - 48, 13, 400, 3);
  lines.forEach((line, i) => {
    s += text(24, 96 + i * 18, line, { size: 13, fill: theme.muted, cls: 'in d2' });
  });

  // Bottom row: tech pills (left), stars + language (right)
  const by = CARD_H - 34;
  let rightW = 0;
  const starsLabel = fmt(project.stars);
  const langLabel = project.language || '';
  rightW += 16 + textWidth(starsLabel, 12, 600) + (langLabel ? 16 + 12 + textWidth(langLabel, 12, 500) : 0);
  const rightX = CARD_W - 24 - rightW;

  let px = 24;
  s += '<g class="in d3">';
  for (const tag of project.tech || []) {
    const p = pill({ x: px, y: by, label: tag, theme, color: accent, size: 10.5, weight: 600, height: 22, padX: 9 });
    if (px + p.width > rightX - 14) break;
    s += p.svg;
    px += p.width + 6;
  }
  // stars
  let rx = rightX;
  s += `<g transform="translate(${rx} ${by + 3})"><path d="${STAR}" fill="${theme.amber}"/></g>`;
  rx += 20;
  s += text(rx, by + 15.5, starsLabel, { size: 12, weight: 600, fill: theme.text });
  rx += textWidth(starsLabel, 12, 600) + 14;
  if (langLabel) {
    s += `<circle cx="${rx + 5}" cy="${by + 11}" r="5" fill="${langColor}"/>`;
    s += text(rx + 16, by + 15.5, langLabel, { size: 12, weight: 500, fill: theme.muted });
  }
  s += '</g>';

  if (project.demo) {
    const w = textWidth('LIVE', 9.5, 700) + 26;
    s += `<g class="in d1" transform="translate(${CARD_W - 24 - w} 30)">
  <rect width="${w}" height="20" rx="10" fill="${theme.success}" opacity="${theme.onDark ? 0.18 : 0.14}"/>
  <circle cx="10" cy="10" r="3" fill="${theme.success}"/>
  ${text(w - 9, 13.6, 'LIVE', { size: 9.5, weight: 700, fill: theme.success, anchor: 'end', letterSpacing: 0.8 })}
</g>`;
  }

  s += svgClose();
  return s;
}
