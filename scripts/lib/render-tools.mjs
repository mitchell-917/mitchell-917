// Banner for the interactive lab (GitHub Pages). One link target, five tool glyphs.
import { svgOpen, svgClose, cardFrame, gradientDefs, text, wrap } from './svg.mjs';

const W = 900;
const H = 132;

export const TOOL_GLYPHS = {
  cube: (c) => `<path d="M12 2.5 L21 7.3 L21 16.7 L12 21.5 L3 16.7 L3 7.3 Z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><path d="M3 7.3 L12 12 L21 7.3 M12 12 L12 21.5" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/>`,
  terminal: (c) => `<rect x="3" y="4.5" width="18" height="15" rx="2.5" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M7.5 9.5 L10.5 12 L7.5 14.5 M12.5 14.5 H16.5" fill="none" stroke="${c}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>`,
  radar: (c) => `<circle cx="12" cy="12" r="9" fill="none" stroke="${c}" stroke-width="1.8"/><circle cx="12" cy="12" r="4.5" fill="none" stroke="${c}" stroke-width="1.5" opacity=".7"/><path d="M12 12 L18.5 5.5" stroke="${c}" stroke-width="1.8" stroke-linecap="round"/><circle cx="12" cy="12" r="1.6" fill="${c}"/>`,
  layers: (c) => `<path d="M12 3.5 L20.5 8 L12 12.5 L3.5 8 Z" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><path d="M3.5 12 L12 16.5 L20.5 12 M3.5 16 L12 20.5 L20.5 16" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/>`,
  image: (c) => `<rect x="3" y="4.5" width="18" height="15" rx="2.5" fill="none" stroke="${c}" stroke-width="1.8"/><path d="M3.5 16.5 L8.5 11.5 L12.5 15.5 L15.5 12.5 L20.5 17.5" fill="none" stroke="${c}" stroke-width="1.8" stroke-linejoin="round"/><circle cx="16" cy="9" r="1.6" fill="${c}"/>`,
};

export function renderTools(profile, theme) {
  const tools = profile.config.tools || [];
  const style = `
  .tile { animation: up .6s cubic-bezier(.2,.7,.2,1) both; }
  @keyframes up { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: none; } }
  .arrow { animation: nudge 1.6s ease-in-out infinite; }
  @keyframes nudge { 0%,100% { transform: translateX(0); } 50% { transform: translateX(4px); } }`;

  let s = svgOpen({ w: W, h: H, title: 'Interactive lab', desc: `${tools.length} interactive tools: ${tools.map((t) => t.title).join(', ')}.`, style });
  s += `<defs>${gradientDefs('brand', theme.gradient)}</defs>`;
  s += cardFrame({ w: W, h: H, theme });

  s += text(28, 50, 'Interactive Lab', { size: 20, weight: 800, fill: theme.text, letterSpacing: -0.3 });
  const blurb = `${tools.length} live tools built with vanilla Canvas and CSS, fed by the same data snapshot that renders this page.`;
  wrap(blurb, 470, 13, 400, 2).forEach((line, i) => {
    s += text(28, 74 + i * 18, line, { size: 13, fill: theme.muted });
  });
  s += `<g class="arrow">${text(28, H - 22, 'Open the lab', { size: 12.5, weight: 700, fill: theme.primary })}${text(28 + 84, H - 22, '→', { size: 13, weight: 700, fill: theme.primary })}</g>`;

  const colors = [theme.primary, theme.secondary, theme.accent, theme.cyan, theme.success];
  tools.slice(0, 5).forEach((tool, i) => {
    const x = 560 + i * 64, y = 38, size = 56;
    const color = colors[i % colors.length];
    s += `<g transform="translate(${x} ${y})"><g class="tile" style="animation-delay:${150 + i * 90}ms">
  <rect x=".5" y=".5" width="${size - 1}" height="${size - 1}" rx="14" fill="${theme.card2}" stroke="${theme.borderSoft}"/>
  <rect x="1" y="1" width="${size - 2}" height="${size - 2}" rx="13.5" fill="${color}" opacity="${theme.onDark ? 0.1 : 0.08}"/>
  <g transform="translate(${(size - 28) / 2} ${(size - 28) / 2}) scale(${28 / 24})">${(TOOL_GLYPHS[tool.icon] || TOOL_GLYPHS.cube)(color)}</g>
</g></g>`;
  });

  s += svgClose();
  return s;
}
