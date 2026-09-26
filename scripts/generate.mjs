#!/usr/bin/env node
// Profile generator: fetches public GitHub data, writes a JSON snapshot and renders every
// SVG the README uses. Zero dependencies; runs on Node 20+.
//
//   node scripts/generate.mjs              live data (uses GITHUB_TOKEN when present)
//   node scripts/generate.mjs --offline    re-render from assets/data/profile.json
//   node scripts/generate.mjs --seed DIR   build from raw API fixtures in DIR (dev only)
//   node scripts/generate.mjs --dry-run    render, report, write nothing

import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { collect } from './lib/github.mjs';
import { buildProfile } from './lib/data.mjs';
import { THEMES } from './lib/svg.mjs';
import { renderHero } from './lib/render-hero.mjs';
import { renderOverview } from './lib/render-overview.mjs';
import { renderActivity } from './lib/render-activity.mjs';
import { renderLanguages } from './lib/render-languages.mjs';
import { renderProjectCard } from './lib/render-projects.mjs';
import { renderTech } from './lib/render-tech.mjs';
import { renderTools } from './lib/render-tools.mjs';
import { renderFooter } from './lib/render-footer.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'assets', 'generated');
const DATA = path.join(ROOT, 'assets', 'data', 'profile.json');

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const opt = (name) => { const i = args.indexOf(name); return i >= 0 ? args[i + 1] : undefined; };

const log = (msg) => console.log(`  ${msg}`);

async function main() {
  const started = Date.now();
  const config = JSON.parse(await readFile(path.join(ROOT, 'profile.config.json'), 'utf8'));
  const icons = JSON.parse(await readFile(path.join(ROOT, 'scripts', 'data', 'simple-icons.json'), 'utf8'));
  const previous = existsSync(DATA) ? JSON.parse(await readFile(DATA, 'utf8')) : null;

  let profile;
  if (flag('--offline')) {
    if (!previous) throw new Error('--offline needs an existing assets/data/profile.json');
    profile = previous;
    log(`offline: re-rendering snapshot from ${previous.generatedAt}`);
  } else {
    const token = process.env.GITHUB_TOKEN || process.env.GH_TOKEN || '';
    log(token ? 'auth: token present' : 'auth: anonymous (60 requests/hour)');
    const raw = await collect({ config, token, seedDir: opt('--seed'), previous, log });
    profile = buildProfile({ config, raw });
    if (!profile.calendar.days.length && previous?.calendar?.days?.length) {
      log('calendar: empty result, keeping previous calendar');
      profile.calendar = previous.calendar;
    }
  }

  const files = new Map();
  files.set('hero.svg', renderHero(profile));
  for (const theme of Object.values(THEMES)) {
    files.set(`overview-${theme.name}.svg`, renderOverview(profile, theme));
    files.set(`activity-${theme.name}.svg`, renderActivity(profile, theme));
    files.set(`languages-${theme.name}.svg`, renderLanguages(profile, theme));
    files.set(`tech-${theme.name}.svg`, renderTech(profile, theme, icons));
    files.set(`tools-${theme.name}.svg`, renderTools(profile, theme));
    files.set(`footer-${theme.name}.svg`, renderFooter(profile, theme));
    for (const project of profile.projects) {
      files.set(`projects/${project.repo}-${theme.name}.svg`, renderProjectCard(project, profile, theme));
    }
  }

  const summary = {
    contributions: profile.calendar.total,
    activeDays: profile.calendar.activeDays,
    currentStreak: profile.calendar.currentStreak,
    longestStreak: profile.calendar.longestStreak,
    calendarSource: profile.calendar.source,
    repos: profile.totals.publicRepos,
    stars: profile.totals.stars,
    languages: profile.languages.slice(0, 5).map((l) => `${l.name} ${l.percent.toFixed(1)}%`).join(', '),
  };
  console.log('\nSnapshot');
  for (const [k, v] of Object.entries(summary)) log(`${k.padEnd(16)} ${v}`);

  if (flag('--dry-run')) {
    console.log(`\nDry run: ${files.size} SVGs rendered, nothing written (${Date.now() - started} ms)`);
    return;
  }

  await mkdir(path.join(OUT, 'projects'), { recursive: true });
  await mkdir(path.dirname(DATA), { recursive: true });
  if (!flag('--offline')) await writeFile(DATA, JSON.stringify(profile, null, 2) + '\n');
  let bytes = 0;
  for (const [name, svg] of files) {
    await writeFile(path.join(OUT, name), svg);
    bytes += Buffer.byteLength(svg);
  }
  console.log(`\nWrote ${files.size} SVGs (${(bytes / 1024).toFixed(0)} KB) to assets/generated and ${path.relative(ROOT, DATA)} in ${Date.now() - started} ms`);
}

main().catch((err) => {
  console.error(`\nGeneration failed: ${err.stack || err.message}`);
  process.exit(1);
});
