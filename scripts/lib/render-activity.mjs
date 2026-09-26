// Contribution heatmap (GitHub-style grid in brand colors) with streak chips and a legend.
import { svgOpen, svgClose, cardFrame, gradientDefs, text, fmt, heatLevel, monthShort, longDate, pill } from './svg.mjs';

const W = 900;
const H = 252;
const CELL = 12, GAP = 3, STEP = CELL + GAP;

export function renderActivity(profile, theme) {
  const c = profile.calendar;
  const weeks = c.weeks.slice(-53);
  const x0 = 56, y0 = 66;

  const style = `
  ${theme.heat.map((col, i) => `.l${i} { fill: ${col}; }`).join(' ')}
  .c { transform-box: fill-box; transform-origin: center; animation: pop .5s cubic-bezier(.2,.7,.3,1.2) both; }
  ${weeks.map((_, i) => `.w${i} { animation-delay: ${(i * 22).toFixed(0)}ms; }`).join(' ')}
  @keyframes pop { from { opacity: 0; transform: scale(.4); } to { opacity: 1; transform: scale(1); } }
  .late { animation: fade .6s ease-out 1.3s both; }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }`;

  let s = svgOpen({ w: W, h: H, title: 'Contribution activity, last 12 months', desc: `${fmt(c.total)} contributions between ${c.first} and ${c.last}.`, style });
  s += `<defs>${gradientDefs('brand', theme.gradient)}</defs>`;
  s += cardFrame({ w: W, h: H, theme });
  s += text(24, 36, 'Contribution activity', { size: 16, weight: 700, fill: theme.text });
  s += text(W - 24, 36, `${fmt(c.total)} contributions in the last year`, { size: 12.5, fill: theme.muted, anchor: 'end' });

  // Month labels
  let lastMonth = null, lastLabelX = -100;
  weeks.forEach((week, wi) => {
    const firstDay = week.find(Boolean);
    if (!firstDay) return;
    const m = firstDay.date.slice(0, 7);
    if (m !== lastMonth) {
      const x = x0 + wi * STEP;
      if (x - lastLabelX >= 30 && wi < weeks.length - 1) {
        s += text(x, y0 - 8, monthShort(firstDay.date), { size: 10.5, fill: theme.muted });
        lastLabelX = x;
      }
      lastMonth = m;
    }
  });

  // Weekday labels (rows: Sun..Sat)
  [['Mon', 1], ['Wed', 3], ['Fri', 5]].forEach(([label, row]) => {
    s += text(x0 - 8, y0 + row * STEP + 9.5, label, { size: 10, fill: theme.muted, anchor: 'end' });
  });

  // Cells
  weeks.forEach((week, wi) => {
    week.forEach((day, di) => {
      if (!day) return;
      const level = heatLevel(day.count, c.thresholds);
      s += `<rect class="c l${level} w${wi}" x="${x0 + wi * STEP}" y="${y0 + di * STEP}" width="${CELL}" height="${CELL}" rx="3"/>`;
    });
  });

  // Footer row: streak chips + legend
  const fy = y0 + 7 * STEP + 22;
  let cx = 24;
  const chips = [
    { label: `Current streak  ${c.currentStreak} days`, color: theme.success },
    { label: `Longest streak  ${c.longestStreak} days`, color: theme.accent },
    c.busiest ? { label: `Busiest day  ${fmt(c.busiest.count)} on ${longDate(c.busiest.date)}`, color: theme.primary } : null,
  ].filter(Boolean);
  s += '<g class="late">';
  for (const chip of chips) {
    const p = pill({ x: cx, y: fy, label: chip.label, theme, color: chip.color, size: 11.5, height: 26, padX: 12 });
    s += p.svg;
    cx += p.width + 8;
  }
  // Legend
  let lx = W - 24 - 5 * (CELL + 4) - 4;
  s += text(lx - 30, fy + 17.5, 'Less', { size: 10.5, fill: theme.muted, anchor: 'end' });
  s += text(W - 24, fy + 17.5, 'More', { size: 10.5, fill: theme.muted, anchor: 'end' });
  lx = W - 24 - 34 - 5 * (CELL + 4);
  theme.heat.forEach((col, i) => {
    s += `<rect x="${lx + i * (CELL + 4)}" y="${fy + 7}" width="${CELL}" height="${CELL}" rx="3" fill="${col}"/>`;
  });
  s += '</g>';

  s += svgClose();
  return s;
}
