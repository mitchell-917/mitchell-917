// Turns raw GitHub responses into the normalized profile snapshot that every
// renderer and the interactive lab consume (assets/data/profile.json).

const DAY = 86_400_000;
const iso = (d) => new Date(d).toISOString().slice(0, 10);

function quantile(sorted, q) {
  if (!sorted.length) return 0;
  const pos = (sorted.length - 1) * q;
  const lo = Math.floor(pos), hi = Math.ceil(pos);
  return sorted[lo] + (sorted[hi] - sorted[lo]) * (pos - lo);
}

export function summarizeCalendar(days, today = new Date()) {
  const sorted = [...days].filter((d) => d && d.date).sort((a, b) => a.date.localeCompare(b.date));
  if (!sorted.length) {
    return { total: 0, days: [], weeks: [], activeDays: 0, max: 0, thresholds: [1, 2, 3], currentStreak: 0, longestStreak: 0, byWeekday: [0, 0, 0, 0, 0, 0, 0], weekly: [], monthly: [], busiest: null, first: null, last: null };
  }
  const total = sorted.reduce((s, d) => s + d.count, 0);
  const nonZero = sorted.map((d) => d.count).filter(Boolean).sort((a, b) => a - b);
  const thresholds = nonZero.length
    ? [Math.max(1, Math.round(quantile(nonZero, 0.25))), Math.max(2, Math.round(quantile(nonZero, 0.5))), Math.max(3, Math.round(quantile(nonZero, 0.75)))]
    : [1, 2, 3];
  for (let i = 1; i < 3; i++) if (thresholds[i] <= thresholds[i - 1]) thresholds[i] = thresholds[i - 1] + 1;

  // Streaks: a streak is alive if today is still empty but yesterday counted.
  const todayIso = iso(today);
  let longest = 0, run = 0, longestEnd = null;
  for (const d of sorted) {
    run = d.count > 0 ? run + 1 : 0;
    if (run > longest) { longest = run; longestEnd = d.date; }
  }
  let current = 0;
  for (let i = sorted.length - 1; i >= 0; i--) {
    const d = sorted[i];
    if (d.date > todayIso) continue;
    if (d.count > 0) current++;
    else if (d.date === todayIso && current === 0) continue;
    else break;
  }

  const byWeekday = [0, 0, 0, 0, 0, 0, 0];
  const monthlyMap = new Map();
  for (const d of sorted) {
    const dt = new Date(d.date + 'T00:00:00Z');
    byWeekday[dt.getUTCDay()] += d.count;
    const key = d.date.slice(0, 7);
    monthlyMap.set(key, (monthlyMap.get(key) || 0) + d.count);
  }

  // Columns start on Sunday like GitHub's own graph; pad the first week.
  const weeks = [];
  const firstDow = new Date(sorted[0].date + 'T00:00:00Z').getUTCDay();
  let week = new Array(firstDow).fill(null);
  for (const d of sorted) {
    week.push(d);
    if (week.length === 7) { weeks.push(week); week = []; }
  }
  if (week.length) { while (week.length < 7) week.push(null); weeks.push(week); }

  const weekly = weeks.map((w) => w.reduce((s, d) => s + (d ? d.count : 0), 0));
  const busiest = sorted.reduce((a, b) => (b.count > (a?.count ?? -1) ? b : a), null);

  return {
    total,
    days: sorted,
    weeks,
    weekly,
    monthly: [...monthlyMap.entries()].map(([month, count]) => ({ month, count })),
    activeDays: sorted.filter((d) => d.count > 0).length,
    max: busiest?.count || 0,
    busiest,
    thresholds,
    currentStreak: current,
    longestStreak: longest,
    longestStreakEnd: longestEnd,
    byWeekday,
    first: sorted[0].date,
    last: sorted[sorted.length - 1].date,
  };
}

export function summarizeLanguages({ config, repos, extBytes, linguist }) {
  const { excludeRepos = [], extensions = {}, colors = {} } = config.languages || {};
  const totals = new Map();
  const add = (name, bytes) => totals.set(name, (totals.get(name) || 0) + bytes);
  for (const repo of repos) {
    if (repo.fork || excludeRepos.includes(repo.name)) continue;
    const ext = extBytes[repo.name];
    if (ext) {
      for (const [key, { bytes }] of Object.entries(ext)) {
        const lang = extensions[key];
        if (lang) add(lang, bytes);
      }
    } else if (linguist[repo.name]) {
      for (const [lang, bytes] of Object.entries(linguist[repo.name])) add(lang, bytes);
    }
  }
  const sum = [...totals.values()].reduce((a, b) => a + b, 0) || 1;
  const list = [...totals.entries()]
    .map(([name, bytes]) => ({ name, bytes, percent: (bytes / sum) * 100, color: colors[name] || '#8b949e' }))
    .sort((a, b) => b.bytes - a.bytes);
  return list;
}

function resolveTokens(str, ctx) {
  return String(str || '').replace(/\{([a-zA-Z]+)(?::([^}]+))?\}/g, (m, key, arg) => {
    if (key === 'files') return String(ctx.ext?.[arg]?.files ?? '');
    if (key === 'stars') return String(ctx.repo?.stargazers_count ?? '');
    if (key === 'contributions') return Number(ctx.contributions || 0).toLocaleString('en-US');
    return m;
  });
}

export function buildProfile({ config, raw, generatedAt = new Date() }) {
  const { user, repos: rawRepos, calendar: rawCalendar, extBytes = {}, linguist = {} } = raw;
  const repos = [...rawRepos]
    .map((r) => ({
      name: r.name,
      description: r.description || '',
      language: r.language,
      stars: r.stargazers_count || 0,
      forks: r.forks_count || 0,
      fork: !!r.fork,
      archived: !!r.archived,
      pushedAt: r.pushed_at,
      createdAt: r.created_at,
      homepage: r.homepage || null,
      hasPages: !!r.has_pages,
      defaultBranch: r.default_branch,
      url: r.html_url || `https://github.com/${config.login}/${r.name}`,
      topics: r.topics || [],
    }))
    .sort((a, b) => (b.pushedAt || '').localeCompare(a.pushedAt || ''));

  const own = repos.filter((r) => !r.fork);
  const totals = {
    stars: own.reduce((s, r) => s + r.stars, 0),
    forks: own.reduce((s, r) => s + r.forks, 0),
    publicRepos: own.length,
    allRepos: repos.length,
  };

  const calendar = summarizeCalendar(rawCalendar?.days || [], generatedAt);
  calendar.source = rawCalendar?.source || 'none';

  const languages = summarizeLanguages({ config, repos: rawRepos, extBytes, linguist });

  const projects = (config.projects || []).map((p) => {
    const repo = rawRepos.find((r) => r.name === p.repo);
    const ctx = { repo, ext: extBytes[p.repo], contributions: calendar.total };
    return {
      ...p,
      description: resolveTokens(p.description, ctx),
      url: repo?.html_url || `https://github.com/${config.login}/${p.repo}`,
      stars: repo?.stargazers_count ?? 0,
      forks: repo?.forks_count ?? 0,
      language: p.language || repo?.language || null,
      pushedAt: repo?.pushed_at || null,
      hasPages: !!repo?.has_pages,
      files: extBytes[p.repo] ? Object.values(extBytes[p.repo]).reduce((s, v) => s + v.files, 0) : null,
    };
  });

  const heroChips = (config.heroChips || []).map((c) => resolveTokens(c, { contributions: calendar.total }));

  const years = Math.max(1, Math.floor((generatedAt - new Date(user.created_at)) / (365.25 * DAY)));

  return {
    generatedAt: generatedAt.toISOString(),
    user: {
      login: user.login,
      name: user.name || config.name,
      bio: user.bio || '',
      location: user.location || config.location,
      followers: user.followers || 0,
      following: user.following || 0,
      publicRepos: user.public_repos || repos.length,
      createdAt: user.created_at,
      yearsOnGitHub: years,
      avatarUrl: user.avatar_url,
      url: user.html_url || `https://github.com/${user.login}`,
    },
    totals,
    calendar,
    languages,
    repos,
    projects,
    heroChips,
    config: {
      name: config.name,
      title: config.title,
      location: config.location,
      taglines: config.taglines,
      links: config.links,
      privateWork: config.privateWork,
      skills: config.skills,
      tools: config.tools,
      techStack: config.techStack,
    },
  };
}
