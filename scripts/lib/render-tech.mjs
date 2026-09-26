// Tech stack: grouped chips with embedded Simple Icons glyphs (no external image requests).
import { svgOpen, svgClose, cardFrame, gradientDefs, text, textWidth, iconPath, monogram, visibleColor } from './svg.mjs';

const W = 900;
const CHIP_H = 34, CHIP_GAP = 10, ROW_GAP = 10, ICON = 18;
const MONOGRAMS = { mql5: 'M5', metatrader: 'MT', zustand: 'Z', recharts: 'Re', matplotlib: 'mpl', pinescript: 'Pi' };

export function renderTech(profile, theme, icons) {
  const groups = profile.config.techStack || [];

  // Layout pass first so the card height is exact.
  const layout = [];
  let y = 58;
  let chipIndex = 0;
  for (const group of groups) {
    const rows = [[]];
    let x = 24;
    for (const item of group.items) {
      const w = Math.ceil(36 + textWidth(item.label, 13, 600) + 12);
      if (x + w > W - 24 && rows[rows.length - 1].length) {
        rows.push([]);
        x = 24;
      }
      rows[rows.length - 1].push({ ...item, x, w, index: chipIndex++ });
      x += w + CHIP_GAP;
    }
    layout.push({ group: group.group, y, rows });
    y += 22 + rows.length * (CHIP_H + ROW_GAP) + 10;
  }
  const H = y + 6;

  const style = `
  .chip { animation: up .55s cubic-bezier(.2,.7,.2,1) both; }
  @keyframes up { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: none; } }`;

  let s = svgOpen({ w: W, h: H, title: 'Tech stack', desc: groups.map((g) => `${g.group}: ${g.items.map((i) => i.label).join(', ')}`).join('. '), style });
  s += `<defs>${gradientDefs('brand', theme.gradient)}</defs>`;
  s += cardFrame({ w: W, h: H, theme });
  s += text(24, 36, 'Tech stack', { size: 16, weight: 700, fill: theme.text });
  s += text(W - 24, 36, 'what I reach for, grouped by job', { size: 12, fill: theme.muted, anchor: 'end' });

  for (const block of layout) {
    s += text(24, block.y + 8, block.group.toUpperCase(), { size: 10, weight: 700, fill: theme.muted, letterSpacing: 1.2 });
    block.rows.forEach((row, ri) => {
      const cy = block.y + 22 + ri * (CHIP_H + ROW_GAP);
      for (const chip of row) {
        const color = visibleColor(chip.color || theme.primary, theme);
        const glyph = icons[chip.icon]
          ? iconPath(icons, chip.icon, 11, (CHIP_H - ICON) / 2, ICON, color)
          : monogram(MONOGRAMS[chip.icon] || chip.label.slice(0, 2), 11, (CHIP_H - ICON) / 2, ICON, chip.color || theme.primary, theme);
        // Positioning lives on the outer group; the animated transform on the inner one must not override it.
        s += `<g transform="translate(${chip.x} ${cy})"><g class="chip" style="animation-delay:${chip.index * 28}ms">
  <rect x=".5" y=".5" width="${chip.w - 1}" height="${CHIP_H - 1}" rx="10" fill="${theme.card2}" stroke="${theme.borderSoft}"/>
  ${glyph}
  ${text(36, CHIP_H / 2 + 4.6, chip.label, { size: 13, weight: 600, fill: theme.text })}
</g></g>`;
      }
    });
  }

  s += svgClose();
  return s;
}
