/* Interactive Lab — shared runtime: data loading, navigation, theme tokens and small helpers. */
(function () {
  const TOOLS = [
    { file: 'index.html', title: 'Lab' },
    { file: 'contribution-graph-3d.html', title: '3D Graph' },
    { file: 'live-coding-stats.html', title: 'Terminal' },
    { file: 'skill-radar.html', title: 'Skill Radar' },
    { file: 'project-showcase.html', title: 'Projects' },
    { file: 'banner-generator.html', title: 'Banner' },
  ];
  const PROFILE_URL = 'https://github.com/mitchell-917';

  let profilePromise = null;

  function nav(current) {
    const host = document.getElementById('lab-nav');
    if (!host) return;
    host.className = 'lab-nav';
    host.innerHTML = `
      <a class="brand" href="index.html"><span class="dot">M</span><span>Interactive Lab</span></a>
      ${TOOLS.map((t) => `<a class="item${t.file === current ? ' active' : ''}" href="${t.file}">${t.title}</a>`).join('')}
      <span class="spacer"></span>
      <a class="profile" href="${PROFILE_URL}" rel="noopener">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true"><path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/></svg>
        GitHub profile
      </a>`;
  }

  function demoProfile() {
    // Deterministic stand-in used only when assets/data/profile.json cannot be loaded.
    let seed = 917;
    const rnd = () => { seed = (seed * 1664525 + 1013904223) % 4294967296; return seed / 4294967296; };
    const days = [];
    const start = new Date(); start.setUTCDate(start.getUTCDate() - 370);
    for (let i = 0; i <= 370; i++) {
      const d = new Date(start); d.setUTCDate(start.getUTCDate() + i);
      const dow = d.getUTCDay();
      const base = dow === 0 || dow === 6 ? 0.35 : 0.8;
      const count = rnd() < base ? Math.floor(rnd() * 9) + 1 : 0;
      days.push({ date: d.toISOString().slice(0, 10), count });
    }
    const weeks = []; let w = new Array(new Date(days[0].date).getUTCDay()).fill(null);
    for (const d of days) { w.push(d); if (w.length === 7) { weeks.push(w); w = []; } }
    if (w.length) { while (w.length < 7) w.push(null); weeks.push(w); }
    const total = days.reduce((s, d) => s + d.count, 0);
    return {
      demo: true,
      generatedAt: new Date().toISOString(),
      user: { login: 'mitchell-917', name: 'Mitchell', location: 'London', followers: 0, url: PROFILE_URL },
      totals: { stars: 0, publicRepos: 0 },
      calendar: { total, days, weeks, weekly: weeks.map((wk) => wk.reduce((s, d) => s + (d ? d.count : 0), 0)), activeDays: days.filter((d) => d.count).length, max: 9, thresholds: [3, 5, 7], currentStreak: 0, longestStreak: 0, byWeekday: [0, 0, 0, 0, 0, 0, 0], busiest: null },
      languages: [{ name: 'TypeScript', percent: 85, color: '#3178c6' }, { name: 'Pine Script', percent: 12, color: '#2962ff' }, { name: 'Ruby', percent: 3, color: '#701516' }],
      repos: [], projects: [],
      config: { name: 'Mitchell', title: 'Software Engineer', location: 'London, UK', taglines: [], skills: [], tools: [], links: { github: PROFILE_URL } },
    };
  }

  function load() {
    if (!profilePromise) {
      profilePromise = fetch('assets/data/profile.json', { cache: 'no-cache' })
        .then((r) => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
        .catch((err) => { console.warn('Lab: using demo data —', err.message); return demoProfile(); });
    }
    return profilePromise;
  }

  function cssVar(name) { return getComputedStyle(document.documentElement).getPropertyValue(name).trim(); }
  function theme() {
    return {
      bg: cssVar('--bg'), bg2: cssVar('--bg-2'), card: cssVar('--card'), card2: cssVar('--card-2'), border: cssVar('--border'), borderSoft: cssVar('--border-soft'),
      text: cssVar('--text'), muted: cssVar('--muted'), faint: cssVar('--faint'),
      primary: cssVar('--primary'), secondary: cssVar('--secondary'), accent: cssVar('--accent'), success: cssVar('--success'), cyan: cssVar('--cyan'), amber: cssVar('--amber'),
      heat: [0, 1, 2, 3, 4].map((i) => cssVar('--heat-' + i)),
      isDark: matchMedia('(prefers-color-scheme: dark)').matches || !matchMedia('(prefers-color-scheme: light)').matches,
    };
  }
  function onThemeChange(cb) { matchMedia('(prefers-color-scheme: dark)').addEventListener('change', cb); }

  const fmt = (n) => Number(n || 0).toLocaleString('en-US');
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  function longDate(iso) { const d = new Date(iso.length > 10 ? iso : iso + 'T00:00:00Z'); return `${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`; }
  function level(count, thresholds) { if (!count) return 0; if (count <= thresholds[0]) return 1; if (count <= thresholds[1]) return 2; if (count <= thresholds[2]) return 3; return 4; }

  function animateNumber(el, to, { duration = 1400, format = fmt, suffix = '' } = {}) {
    if (!el) return;
    const done = () => { el.textContent = format(to) + suffix; };
    if (document.hidden || matchMedia('(prefers-reduced-motion: reduce)').matches) return done();
    const start = performance.now();
    const ease = (t) => 1 - Math.pow(1 - t, 3);
    function frame(now) {
      const p = Math.min(1, (now - start) / duration);
      el.textContent = format(Math.round(to * ease(p))) + suffix;
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
    // requestAnimationFrame pauses in background tabs; make sure the final value always lands.
    setTimeout(done, duration + 50);
  }

  // Sizes a canvas for the device pixel ratio and returns a context scaled to CSS pixels.
  function hidpi(canvas, width, height) {
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
    canvas.style.width = width + 'px';
    canvas.style.height = height + 'px';
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    return ctx;
  }

  function download(canvas, filename) {
    const a = document.createElement('a');
    a.download = filename;
    a.href = canvas.toDataURL('image/png');
    a.click();
    toast(`Saved ${filename}`);
  }

  let toastEl;
  function toast(msg) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.className = 'toast'; document.body.appendChild(toastEl); }
    toastEl.textContent = msg;
    toastEl.classList.add('show');
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(() => toastEl.classList.remove('show'), 2200);
  }

  function footer(profile) {
    const host = document.getElementById('lab-footer');
    if (!host) return;
    host.className = 'lab-footer';
    const when = profile.demo ? 'demo data (snapshot not reachable)' : `snapshot ${longDate(profile.generatedAt)} · refreshed daily by GitHub Actions`;
    host.innerHTML = `<span class="${profile.demo ? '' : 'note live'}">${when}</span><span>Built with vanilla Canvas, CSS and JavaScript · <a href="https://github.com/mitchell-917/mitchell-917">source</a></span>`;
  }

  window.Lab = { TOOLS, nav, load, theme, onThemeChange, fmt, longDate, level, animateNumber, hidpi, download, toast, footer, MONTHS };
})();
