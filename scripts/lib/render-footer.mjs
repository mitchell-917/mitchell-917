// Footer wave with the refresh timestamp. The wave is two periods wide and slides one period per loop.
import { svgOpen, svgClose, gradientDefs, text, longDate } from './svg.mjs';

const W = 900;
const H = 96;

function wavePath(amplitude, baseline, phase) {
  // Two full periods across 2W so a translateX(-W) loop is seamless.
  const period = W / 2;
  let d = `M0 ${baseline}`;
  for (let x = 0; x <= 2 * W; x += period / 2) {
    const cx1 = x + period / 4, cx2 = x + period / 4;
    const y1 = baseline + amplitude * Math.sin(((x + phase) / period) * Math.PI * 2);
    const y2 = baseline + amplitude * Math.sin(((x + period / 2 + phase) / period) * Math.PI * 2);
    d += ` C ${cx1} ${y1}, ${cx2} ${y2}, ${x + period / 2} ${baseline}`;
  }
  return `${d} L${2 * W} ${H} L0 ${H} Z`;
}

export function renderFooter(profile, theme) {
  const refreshed = longDate(profile.generatedAt.slice(0, 10));
  const style = `
  .w1 { animation: slide 14s linear infinite; }
  .w2 { animation: slide 22s linear infinite reverse; }
  @keyframes slide { to { transform: translateX(-${W}px); } }`;

  let s = svgOpen({ w: W, h: H, title: 'Footer', desc: `Profile refreshed ${refreshed}.`, style });
  s += `<defs>${gradientDefs('brand', theme.gradient)}<clipPath id="clip"><rect width="${W}" height="${H}" rx="16"/></clipPath></defs>`;
  s += `<g clip-path="url(#clip)">
  <path class="w2" d="${wavePath(10, 44, 120)}" fill="url(#brand)" opacity=".35"/>
  <path class="w1" d="${wavePath(8, 52, 0)}" fill="url(#brand)" opacity=".95"/>
</g>`;
  s += text(W / 2, 80, `Refreshed ${refreshed}  ·  every graphic on this page is generated inside this repository by GitHub Actions`, { size: 12, weight: 600, fill: '#ffffff', anchor: 'middle', opacity: 0.95 });
  s += text(W / 2, 24, 'Thanks for stopping by.', { size: 13, weight: 600, fill: theme.muted, anchor: 'middle' });
  s += svgClose();
  return s;
}
