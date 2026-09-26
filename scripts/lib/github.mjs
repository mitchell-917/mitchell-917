// Collects public GitHub data for the profile. Works with or without a token and
// degrades gracefully: GraphQL -> REST -> public mirror -> last known snapshot.
import { readFile } from 'node:fs/promises';
import path from 'node:path';

const API = 'https://api.github.com';
const UA = 'mitchell-917-profile-generator';

function headers(token, accept = 'application/vnd.github+json') {
  const h = { Accept: accept, 'User-Agent': UA, 'X-GitHub-Api-Version': '2022-11-28' };
  if (token) h.Authorization = `Bearer ${token}`;
  return h;
}

async function request(url, { token, method = 'GET', body, retries = 3 } = {}) {
  let lastErr;
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, { method, headers: { ...headers(token), ...(body ? { 'Content-Type': 'application/json' } : {}) }, body });
      if (res.status === 404) return null;
      if (res.status === 403 || res.status === 429) {
        const reset = Number(res.headers.get('x-ratelimit-reset')) * 1000;
        const wait = Math.min(Math.max(reset - Date.now(), 2000), 60_000);
        if (attempt < retries) { await sleep(wait); continue; }
      }
      if (!res.ok) throw new Error(`${method} ${url} -> HTTP ${res.status}`);
      return await res.json();
    } catch (err) {
      lastErr = err;
      if (attempt < retries) await sleep(800 * 2 ** attempt);
    }
  }
  throw lastErr;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

export async function getUser(login, token) {
  return request(`${API}/users/${login}`, { token });
}

export async function getRepos(login, token) {
  const all = [];
  for (let page = 1; page <= 5; page++) {
    const batch = await request(`${API}/users/${login}/repos?per_page=100&type=owner&sort=updated&page=${page}`, { token });
    if (!batch || batch.length === 0) break;
    all.push(...batch);
    if (batch.length < 100) break;
  }
  return all;
}

// Returns [{ date: 'YYYY-MM-DD', count }] covering roughly the last 12 months, oldest first.
export async function getCalendar(login, token, log = () => {}) {
  if (token) {
    try {
      const query = `query($login:String!){ user(login:$login){ contributionsCollection{ contributionCalendar{ totalContributions weeks{ contributionDays{ date contributionCount } } } } } }`;
      const data = await request(`${API}/graphql`, { token, method: 'POST', body: JSON.stringify({ query, variables: { login } }) });
      const weeks = data?.data?.user?.contributionsCollection?.contributionCalendar?.weeks;
      if (weeks?.length) {
        const days = weeks.flatMap((w) => w.contributionDays.map((d) => ({ date: d.date, count: d.contributionCount })));
        log(`calendar: GraphQL (${days.length} days)`);
        return { days, source: 'graphql' };
      }
      log(`calendar: GraphQL returned no weeks (${JSON.stringify(data?.errors?.[0]?.message || '')})`);
    } catch (err) {
      log(`calendar: GraphQL failed (${err.message})`);
    }
  }
  try {
    const res = await fetch(`https://github-contributions-api.jogruber.de/v4/${login}?y=last`, { headers: { 'User-Agent': UA } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    const days = (json.contributions || []).map((c) => ({ date: c.date, count: c.count }));
    if (days.length) {
      log(`calendar: public mirror (${days.length} days)`);
      return { days, source: 'mirror' };
    }
  } catch (err) {
    log(`calendar: public mirror failed (${err.message})`);
  }
  return null;
}

// Aggregates blob sizes and file counts per extension from the repo's git tree.
export async function getRepoExtBytes(login, repo, branch, token, excludePaths = []) {
  const tree = await request(`${API}/repos/${login}/${repo}/git/trees/${encodeURIComponent(branch)}?recursive=1`, { token });
  if (!tree?.tree) return null;
  const out = {};
  for (const entry of tree.tree) {
    if (entry.type !== 'blob') continue;
    if (excludePaths.some((p) => entry.path.includes(p))) continue;
    const base = entry.path.split('/').pop();
    const key = base.includes('.') ? base.slice(base.lastIndexOf('.')).toLowerCase() : base;
    out[key] = out[key] || { bytes: 0, files: 0 };
    out[key].bytes += entry.size || 0;
    out[key].files += 1;
  }
  return out;
}

// Linguist fallback when the tree is unavailable: { Language: bytes }.
export async function getRepoLinguist(login, repo, token) {
  return request(`${API}/repos/${login}/${repo}/languages`, { token });
}

export async function collect({ config, token, seedDir, previous, log = () => {} }) {
  const login = config.login;
  if (seedDir) {
    const read = async (f) => JSON.parse(await readFile(path.join(seedDir, f), 'utf8'));
    const contributions = await read('contributions.json');
    log(`seed: reading ${seedDir}`);
    return {
      user: await read('user.json'),
      repos: await read('repos.json'),
      calendar: { days: contributions.contributions.map((c) => ({ date: c.date, count: c.count })), source: 'seed' },
      extBytes: await read('ext-bytes.json'),
      linguist: {},
    };
  }

  const user = await getUser(login, token);
  if (!user) throw new Error(`GitHub user ${login} not found`);
  const repos = await getRepos(login, token);
  log(`repos: ${repos.length} fetched`);

  let calendar = await getCalendar(login, token, log);
  if (!calendar && previous?.calendar?.days?.length) {
    calendar = { days: previous.calendar.days, source: 'previous-snapshot' };
    log('calendar: reusing previous snapshot');
  }

  const extBytes = {};
  const linguist = {};
  for (const repo of repos) {
    if (repo.fork) continue;
    try {
      const ext = await getRepoExtBytes(login, repo.name, repo.default_branch, token, config.languages.excludePaths);
      if (ext) extBytes[repo.name] = ext;
      else throw new Error('empty tree');
    } catch (err) {
      log(`tree ${repo.name}: ${err.message}; falling back to linguist`);
      try {
        const lang = await getRepoLinguist(login, repo.name, token);
        if (lang) linguist[repo.name] = lang;
      } catch (err2) {
        log(`linguist ${repo.name}: ${err2.message}`);
      }
    }
  }
  return { user, repos, calendar, extBytes, linguist };
}
