// "At a glance" strip: four KPI tiles plus a 52-week sparkline.
import { svgOpen, svgClose, cardFrame, gradientDefs, text, fmt, longDate } from './svg.mjs';

const W = 900;
const H = 176;

export function renderOverview(profile, theme) {
  const c = profile.calendar;
  const pctActive = c.days.length ? Math.round((c.activeDays / c.days.length) * 100) : 0;
  const tiles = [
    { value: fmt(c.total), label: 'Contributions', sub: 'last 12 months', color: theme.primary },
    { value: fmt(c.activeDays), label: 'Active days', sub: `${pctActive}% of the year`, color: theme.secondary },
    { value: `${c.longestStreak} days`, label: 'Longest streak', sub: c.longestStreakEnd ? `ended ${longDate(c.longestStreakEnd)}` : '—', color: theme.accent },
    { value: `${c.currentStreak} ${c.currentStreak === 1 ? 'day' : 'days'}`, label: 'Current streak', sub: c.currentStreak ? 'and counting' : 'starts with the next commit', color: theme.success },
  ];

  const style = `
  .tile { animation: up .7s cubic-bezier(.2,.7,.2,1) both; }
  @keyframes up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .spark { stroke-dasharray: 600; animation: draw 1.8s ease-out .4s both; }
  .sparkArea { animation: fade 1s ease-out 1.4s both; }
  @keyframes draw { from { stroke-dashoffset: 600; } to { stroke-dashoffset: 0; } }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }`;

  let s = svgOpen({ w: W, h: H, title: 'GitHub activity at a glance', desc: `${fmt(c.total)} contributions, ${c.activeDays} active days, longest streak ${c.longestStreak} days, current streak ${c.currentStreak} days.`, style });
  s += `<defs>${gradientDefs('brand', theme.gradient)}
  <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${theme.primary}" stop-opacity=".45"/><stop offset="100%" stop-color="${theme.primary}" stop-opacity="0"/></linearGradient></defs>`;
  s += cardFrame({ w: W, h: H, theme });

  s += text(24, 36, 'At a glance', { size: 16, weight: 700, fill: theme.text });
  s += text(W - 24, 36, `updated ${longDate(profile.generatedAt.slice(0, 10))}`, { size: 12, fill: theme.faint, anchor: 'end' });

  const tileW = 150, tileH = 96, gap = 16, y = 56;
  tiles.forEach((t, i) => {
    const x = 24 + i * (tileW + gap);
    s += `<g class="tile" style="animation-delay:${i * 90}ms">
  <rect x="${x + 0.5}" y="${y + 0.5}" width="${tileW - 1}" height="${tileH - 1}" rx="12" fill="${theme.card2}" stroke="${theme.borderSoft}"/>
  <rect x="${x + 16}" y="${y + 18}" width="18" height="4" rx="2" fill="${t.color}"/>
  ${text(x + 16, y + 56, t.value, { size: 28, weight: 800, fill: theme.text, letterSpacing: -0.5 })}
  ${text(x + 16, y + 74, t.label.toUpperCase(), { size: 10, weight: 700, fill: theme.muted, letterSpacing: 1 })}
  ${text(x + 16, y + 88, t.sub, { size: 10.5, fill: theme.faint })}
</g>`;
  });

  // Sparkline panel
  const px = 24 + 4 * (tileW + gap), pw = W - 24 - px, py = y, ph = tileH;
  s += `<rect x="${px + 0.5}" y="${py + 0.5}" width="${pw - 1}" height="${ph - 1}" rx="12" fill="${theme.card2}" stroke="${theme.borderSoft}"/>`;
  s += text(px + 16, py + 22, 'WEEKLY RHYTHM', { size: 10, weight: 700, fill: theme.muted, letterSpacing: 1 });
  const weekly = c.weekly.length ? c.weekly : [0];
  const max = Math.max(1, ...weekly.map((v) => Math.sqrt(v)));
  const gx0 = px + 16, gx1 = px + pw - 16, gy0 = py + 34, gy1 = py + ph - 14;
  const pts = weekly.map((v, i) => {
    const x = gx0 + (i / Math.max(1, weekly.length - 1)) * (gx1 - gx0);
    const yv = gy1 - (Math.sqrt(v) / max) * (gy1 - gy0);
    return [x, yv];
  });
  const d = pts.map(([x, yv], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${yv.toFixed(1)}`).join(' ');
  s += `<path d="${d} L${gx1} ${gy1} L${gx0} ${gy1} Z" fill="url(#sparkFill)" class="sparkArea"/>`;
  s += `<path d="${d}" fill="none" stroke="${theme.primary}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round" class="spark"/>`;
  const [lx, ly] = pts[pts.length - 1];
  s += `<circle cx="${lx.toFixed(1)}" cy="${ly.toFixed(1)}" r="3" fill="${theme.accent}" class="sparkArea"/>`;
  s += text(gx1, py + 22, `${weekly.length} wk`, { size: 10, fill: theme.faint, anchor: 'end' });

  s += svgClose();
  return s;
}
