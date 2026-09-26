// Hero banner: name, rotating taglines, live chips and an animated market-line motif.
// One artwork for both GitHub themes: deep indigo reads well on light and dark pages.
import { svgOpen, svgClose, esc, text, textWidth, mulberry32 } from './svg.mjs';

const W = 900;
const H = 280;

export function renderHero(profile) {
  const { config, user, heroChips } = profile;
  const name = user.name || config.name;
  const subtitle = `${config.title} · ${user.location || config.location}`;
  const taglines = (config.taglines || []).slice(0, 3);
  const cycle = taglines.length * 3;

  // Base styles are the final, visible state. Keyframes carry the "from" state, so clients
  // that do not run CSS animations inside images still render a complete banner.
  const style = `
  .tl { opacity: 0; animation: cycle ${cycle}s ease-in-out infinite; }
  .tl0 { opacity: 1; }
  ${taglines.map((_, i) => `.tl${i} { animation-delay: ${i * 3}s; }`).join('\n  ')}
  @keyframes cycle {
    0% { opacity: 0; transform: translateY(6px); }
    4% { opacity: 1; transform: translateY(0); }
    ${Math.round((3 / cycle) * 100) - 4}% { opacity: 1; transform: translateY(0); }
    ${Math.round((3 / cycle) * 100)}% { opacity: 0; transform: translateY(-6px); }
    100% { opacity: 0; }
  }
  .orb { animation: drift 14s ease-in-out infinite alternate; }
  .orb2 { animation-duration: 18s; animation-delay: -6s; }
  .orb3 { animation-duration: 22s; animation-delay: -11s; }
  @keyframes drift { from { transform: translate(0, 0); } to { transform: translate(40px, -24px); } }
  .line { stroke-dasharray: 1200; animation: draw 2.6s cubic-bezier(.4,0,.2,1) both; }
  .area { animation: fade 1.4s ease-out 1.6s both; }
  .tip { animation: fade .6s ease-out 2.4s both; }
  .ring { transform-box: fill-box; transform-origin: center; animation: pulse 2.4s ease-out 2.6s infinite; }
  @keyframes draw { from { stroke-dashoffset: 1200; } to { stroke-dashoffset: 0; } }
  @keyframes fade { from { opacity: 0; } to { opacity: 1; } }
  @keyframes pulse { 0% { transform: scale(.6); opacity: .9; } 100% { transform: scale(2.6); opacity: 0; } }
  .fade-in { animation: fade .8s ease-out both; }
  .d1 { animation-delay: .15s } .d2 { animation-delay: .35s } .d3 { animation-delay: .55s } .d4 { animation-delay: .75s }
  `;

  let s = svgOpen({ w: W, h: H, title: `${name} — ${config.title}`, desc: `${name}, ${subtitle}. ${taglines.join(' ')}`, style });

  s += `<defs>
  <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0%" stop-color="#0b1020"/><stop offset="55%" stop-color="#141a3a"/><stop offset="100%" stop-color="#2a1650"/>
  </linearGradient>
  <radialGradient id="o1"><stop offset="0%" stop-color="#6e7ff3" stop-opacity=".55"/><stop offset="100%" stop-color="#6e7ff3" stop-opacity="0"/></radialGradient>
  <radialGradient id="o2"><stop offset="0%" stop-color="#a78bfa" stop-opacity=".5"/><stop offset="100%" stop-color="#a78bfa" stop-opacity="0"/></radialGradient>
  <radialGradient id="o3"><stop offset="0%" stop-color="#f472b6" stop-opacity=".45"/><stop offset="100%" stop-color="#f472b6" stop-opacity="0"/></radialGradient>
  <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0"><stop offset="0%" stop-color="#7c8cf8"/><stop offset="60%" stop-color="#c4b5fd"/><stop offset="100%" stop-color="#f472b6"/></linearGradient>
  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="#a78bfa" stop-opacity=".35"/><stop offset="100%" stop-color="#a78bfa" stop-opacity="0"/></linearGradient>
  <pattern id="grid" width="28" height="28" patternUnits="userSpaceOnUse"><path d="M28 0H0V28" fill="none" stroke="#ffffff" stroke-opacity=".045"/></pattern>
  <clipPath id="frame"><rect width="${W}" height="${H}" rx="18"/></clipPath>
</defs>
<g clip-path="url(#frame)">
  <rect width="${W}" height="${H}" fill="url(#bg)"/>
  <rect width="${W}" height="${H}" fill="url(#grid)"/>
  <g class="orb"><circle cx="150" cy="60" r="220" fill="url(#o1)"/></g>
  <g class="orb orb2"><circle cx="700" cy="260" r="240" fill="url(#o2)"/></g>
  <g class="orb orb3"><circle cx="860" cy="40" r="200" fill="url(#o3)"/></g>
  ${marketArt()}
  <rect x=".5" y=".5" width="${W - 1}" height="${H - 1}" rx="17.5" fill="none" stroke="#ffffff" stroke-opacity=".12"/>
</g>`;

  // Text column
  s += text(48, 96, name, { size: 54, weight: 800, fill: '#ffffff', letterSpacing: -1.5, cls: 'fade-in d1' });
  s += text(48, 130, subtitle, { size: 18, weight: 500, fill: '#ffffff', opacity: 0.78, cls: 'fade-in d2' });
  s += `<rect x="48" y="158" width="3" height="18" rx="1.5" fill="#f472b6" class="fade-in d3"/>`;
  taglines.forEach((t, i) => {
    s += `<text x="60" y="172" font-size="15" font-weight="500" fill="#d8d3ff" class="tl tl${i}">${esc(t)}</text>`;
  });

  // Chips
  let cx = 48;
  const chipY = 210;
  for (const label of heroChips) {
    const w = Math.ceil(textWidth(label, 11.5, 600) + 20);
    s += `<g class="fade-in d4" transform="translate(${cx} ${chipY})">
  <rect width="${w}" height="26" rx="13" fill="#ffffff" fill-opacity=".09" stroke="#ffffff" stroke-opacity=".18"/>
  ${text(w / 2, 17.2, label, { size: 11.5, weight: 600, fill: '#ffffff', anchor: 'middle', opacity: 0.92 })}
</g>`;
    cx += w + 10;
  }

  s += text(W - 28, 30, `github.com/${user.login}`, { size: 12, fill: '#ffffff', opacity: 0.45, anchor: 'end', mono: true });
  s += svgClose();
  return s;
}

// Candles and a rising line in the right half. Seeded so the output is stable between runs.
function marketArt() {
  const rnd = mulberry32(917);
  const x0 = 540, x1 = 880, yTop = 48, yBot = 236;
  const n = 26;
  const step = (x1 - x0) / n;
  let price = 0.7;
  const pts = [];
  let candles = '';
  for (let i = 0; i < n; i++) {
    const drift = 0.018 + (rnd() - 0.5) * 0.12;
    const open = price;
    const close = Math.min(0.98, Math.max(0.05, price + drift));
    const hi = Math.min(1, Math.max(open, close) + rnd() * 0.05);
    const lo = Math.max(0, Math.min(open, close) - rnd() * 0.05);
    const y = (v) => yTop + (1 - v) * (yBot - yTop);
    const cx = x0 + i * step + step / 2;
    const up = close >= open;
    const color = up ? '#3fb950' : '#f472b6';
    candles += `<line x1="${cx.toFixed(1)}" y1="${y(hi).toFixed(1)}" x2="${cx.toFixed(1)}" y2="${y(lo).toFixed(1)}" stroke="${color}" stroke-opacity=".28" stroke-width="1"/>`;
    candles += `<rect x="${(cx - step * 0.28).toFixed(1)}" y="${y(Math.max(open, close)).toFixed(1)}" width="${(step * 0.56).toFixed(1)}" height="${Math.max(1.5, Math.abs(y(open) - y(close))).toFixed(1)}" rx="1" fill="${color}" fill-opacity=".28"/>`;
    pts.push([cx, y((open + close) / 2 + 0.04)]);
    price = close;
  }
  const smooth = pts.map(([x, y]) => `${x.toFixed(1)} ${y.toFixed(1)}`).join(' L ');
  const linePath = `M ${smooth}`;
  const areaPath = `${linePath} L ${pts[pts.length - 1][0].toFixed(1)} ${yBot} L ${pts[0][0].toFixed(1)} ${yBot} Z`;
  const [ex, ey] = pts[pts.length - 1];
  return `<g>
  ${candles}
  <path d="${areaPath}" fill="url(#areaGrad)" class="area"/>
  <path d="${linePath}" fill="none" stroke="url(#lineGrad)" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round" class="line"/>
  <g class="tip">
    <circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="5" fill="#f472b6" class="ring" opacity=".7"/>
    <circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="4" fill="#ffffff"/>
  </g>
</g>`;
}
