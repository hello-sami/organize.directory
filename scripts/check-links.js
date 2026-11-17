// Link check for organize.directory — READ-ONLY. It never edits anything in data/.
//
//   node scripts/check-links.js            # check every website link, write a report
//   node scripts/check-links.js --recheck  # re-test only what failed last time (fast)
//   node scripts/check-links.js --help
//
// What it checks: every listing's main `url`, plus any `links` entry of type
// "website", in data/locations, data/states and data/topics.
// What it skips: Instagram, Facebook, X/Twitter, Bluesky, TikTok, LinkedIn, Threads.
// Those sites block automated visitors, so a "dead" answer from them can't be trusted.
//
// Output goes to .cache/link-check/ (gitignored):
//   report.md     the short list, grouped by city / state / topic page, with the file
//   results.json  every URL checked, with its final status (for digging deeper)

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, '.cache', 'link-check');
const RESULTS = path.join(OUT_DIR, 'results.json');
const REPORT = path.join(OUT_DIR, 'report.md');

const args = new Set(process.argv.slice(2));
if (args.has('--help')) {
  console.log('Usage: node scripts/check-links.js [--recheck]\n  --recheck  only re-test URLs that were flagged or blocked in the last run');
  process.exit(0);
}

const TIMEOUT_MS = 20000;
const CONCURRENCY = 24;
const PER_HOST = 2;
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0 Safari/537.36';

// Sites that block scripts; we can't judge their links.
const SOCIAL = /(^|\.)(instagram\.com|facebook\.com|fb\.com|fb\.me|x\.com|twitter\.com|bsky\.app|tiktok\.com|linkedin\.com|threads\.net)$/;

// Phrases that parked / expired / for-sale domains put on their pages.
const PARKED = [
  /this domain (name )?(is|may be) for sale/i, /buy this domain/i, /domain (is )?for sale/i,
  /this domain has (expired|been registered)/i, /domain (name )?(has )?expired/i,
  /sedoparking|hugedomains|afternic\.com|dan\.com\/buy|parkingcrew|bodis\.com/i,
  /this (web )?site (is )?(currently )?(suspended|unavailable)/i, /account (has been )?suspended/i,
  /related searches|sponsored listings/i,
];

// ---------- 1. collect every link from data/ ----------
function collect() {
  const entries = []; // one row per (listing, url)
  for (const kind of ['states', 'locations', 'topics']) {
    const dir = path.join(ROOT, 'data', kind);
    for (const f of fs.readdirSync(dir).filter((x) => x.endsWith('.json')).sort()) {
      const file = `data/${kind}/${f}`;
      const data = JSON.parse(fs.readFileSync(path.join(ROOT, file), 'utf8'));
      const page = { file, kind, title: data.title || data.slug || f };
      const walk = (o, section) => {
        if (Array.isArray(o)) return o.forEach((x) => walk(x, section));
        if (!o || typeof o !== 'object') return;
        if (typeof o.title === 'string' && Array.isArray(o.initiatives)) section = o.title || section;
        if (typeof o.name === 'string' && (o.url || o.links)) {
          if (o.url) entries.push({ ...page, section, name: o.name, field: 'url', url: o.url });
          for (const l of o.links || []) {
            if (l && l.type === 'website' && l.url) entries.push({ ...page, section, name: o.name, field: 'website link', url: l.url });
          }
        }
        for (const v of Object.values(o)) walk(v, section);
      };
      walk(data, '');
    }
  }
  return entries;
}

// ---------- 2. helpers ----------
const hostOf = (u) => { try { return new URL(u).hostname.toLowerCase(); } catch { return ''; } };
const TWO_PART = /^(co|com|org|net|ac|gov)\.(uk|au|nz|za|jp|in|br)$/;
function registrable(host) {
  host = host.replace(/^www\./, '');
  const p = host.split('.');
  if (p.length <= 2) return host;
  return TWO_PART.test(p.slice(-2).join('.')) ? p.slice(-3).join('.') : p.slice(-2).join('.');
}
const isSocial = (u) => SOCIAL.test(hostOf(u));

async function fetchOnce(url) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, {
      redirect: 'follow', signal: ctl.signal,
      headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml,*/*;q=0.8', 'accept-language': 'en-US,en;q=0.9' },
    });
    let body = '';
    try {
      const reader = res.body.getReader();
      const dec = new TextDecoder();
      while (body.length < 60000) {
        const { done, value } = await reader.read();
        if (done) break;
        body += dec.decode(value, { stream: true });
      }
      reader.cancel().catch(() => {});
    } catch { /* body is optional */ }
    return { ok: true, status: res.status, finalUrl: res.url, body };
  } catch (e) {
    const cause = e.cause?.code || e.cause?.message || e.name;
    return { ok: false, error: String(cause || e.message) };
  } finally { clearTimeout(timer); }
}

// Turn a raw fetch result into a verdict.
function judge(url, r) {
  if (!r.ok) {
    if (/ENOTFOUND|EAI_AGAIN/.test(r.error)) return { verdict: 'dead', why: 'Domain no longer exists (DNS lookup fails)' };
    if (/CERT|SSL|TLS|certificate/i.test(r.error)) return { verdict: 'suspicious', why: `Certificate/SSL problem (${r.error})` };
    if (/ECONNREFUSED|ECONNRESET|UND_ERR_SOCKET/.test(r.error)) return { verdict: 'dead', why: `Server refuses connections (${r.error})` };
    if (/Abort|Timeout/i.test(r.error)) return { verdict: 'dead', why: `No response after ${TIMEOUT_MS / 1000}s (timed out)` };
    return { verdict: 'suspicious', why: `Could not connect (${r.error})` };
  }
  const { status, finalUrl, body } = r;
  if (status === 404 || status === 410) return { verdict: 'dead', why: `Page not found (HTTP ${status})` };
  if (status >= 500) return { verdict: 'suspicious', why: `Server error (HTTP ${status})` };
  if ([401, 403, 429, 999].includes(status)) return { verdict: 'blocked', why: `Site blocks scripts (HTTP ${status}); can't tell` };
  if (status >= 400) return { verdict: 'suspicious', why: `HTTP ${status}` };

  const a = new URL(url), b = new URL(finalUrl);
  if (registrable(a.hostname) !== registrable(b.hostname)) {
    return { verdict: 'redirect-offsite', why: `Redirects to a different site: ${finalUrl}` };
  }
  const deepBefore = a.pathname.replace(/\/+$/, '').length > 1;
  const homeAfter = b.pathname.replace(/\/+$/, '') === '' && !b.search;
  if (deepBefore && homeAfter) return { verdict: 'redirect-home', why: `Deep page now redirects to the home page: ${finalUrl}` };
  const text = (body || '').slice(0, 60000);
  const hit = PARKED.find((re) => re.test(text));
  if (hit) return { verdict: 'suspicious', why: 'Page looks parked / expired / suspended (matched wording on page)' };
  return { verdict: 'ok', why: '' };
}

// ---------- 3. run ----------
async function pool(items, worker, concurrency, perHost) {
  const queue = [...items];
  const active = new Map();
  let running = 0, done = 0;
  await new Promise((resolve) => {
    const pump = () => {
      while (running < concurrency && queue.length) {
        const i = queue.findIndex((it) => (active.get(hostOf(it.url)) || 0) < perHost);
        if (i === -1) break;
        const it = queue.splice(i, 1)[0];
        const h = hostOf(it.url);
        active.set(h, (active.get(h) || 0) + 1);
        running++;
        worker(it).finally(() => {
          active.set(h, active.get(h) - 1);
          running--; done++;
          if (done % 100 === 0) process.stderr.write(`  ${done}/${items.length}\n`);
          pump();
        });
      }
      if (!running && !queue.length) resolve();
    };
    pump();
  });
}

async function checkUrls(urls, label) {
  const out = {};
  console.error(`${label}: checking ${urls.length} URLs…`);
  await pool(urls.map((url) => ({ url })), async ({ url }) => {
    let r = await fetchOnce(url);
    out[url] = { ...judge(url, r), status: r.status || null, finalUrl: r.finalUrl || null };
  }, CONCURRENCY, PER_HOST);
  return out;
}

const needsRetry = (v) => ['dead', 'suspicious', 'blocked', 'redirect-home'].includes(v.verdict);

async function main() {
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const entries = collect();
  const checkable = entries.filter((e) => !isSocial(e.url));
  const skipped = entries.length - checkable.length;
  let urls = [...new Set(checkable.map((e) => e.url))];

  let previous = {};
  if (args.has('--recheck') && fs.existsSync(RESULTS)) {
    previous = JSON.parse(fs.readFileSync(RESULTS, 'utf8')).results || {};
    urls = urls.filter((u) => !previous[u] || needsRetry(previous[u]) || previous[u].verdict === 'redirect-offsite');
  }

  let results = await checkUrls(urls, 'pass 1');
  // Second pass: anything that failed gets one more try, slower, so a hiccup isn't reported as dead.
  const again = Object.keys(results).filter((u) => needsRetry(results[u]) || results[u].verdict === 'redirect-offsite');
  if (again.length) {
    await new Promise((r) => setTimeout(r, 5000));
    const second = await checkUrls(again, 'pass 2 (retry of failures)');
    for (const u of again) results[u] = { ...second[u], firstTry: results[u].verdict };
  }
  results = { ...previous, ...results };
  // drop URLs that are no longer in data/
  const live = new Set(checkable.map((e) => e.url));
  for (const u of Object.keys(results)) if (!live.has(u)) delete results[u];

  fs.writeFileSync(RESULTS, JSON.stringify({ checkedAt: new Date().toISOString(), skippedSocial: skipped, results }, null, 1));
  writeReport(entries, checkable, results, skipped);
  console.error(`\nDone. Report: ${path.relative(ROOT, REPORT)}`);
}

// ---------- 4. report ----------
function writeReport(entries, checkable, results, skipped) {
  const flagged = checkable.filter((e) => results[e.url] && !['ok', 'blocked'].includes(results[e.url].verdict));
  const count = (v) => checkable.filter((e) => results[e.url]?.verdict === v).length;
  const lines = [];
  lines.push('# Link check — organize.directory', '');
  lines.push(`Checked ${new Date().toISOString().slice(0, 16).replace('T', ' ')} UTC. Nothing in data/ was changed.`, '');
  lines.push(`- Website links checked: ${checkable.length} (${new Set(checkable.map((e) => e.url)).size} unique URLs)`);
  lines.push(`- Skipped, social media (can't be checked): ${skipped}`);
  lines.push(`- Fine: ${count('ok')} · Blocked, can't tell: ${count('blocked')}`);
  lines.push(`- **Dead: ${count('dead')} · Suspicious: ${count('suspicious')} · Redirects to a different site: ${count('redirect-offsite')} · Deep page now goes to home page: ${count('redirect-home')}**`, '');

  const kindOrder = { states: 0, locations: 1, topics: 2 };
  const kindName = { states: 'State', locations: 'City', topics: 'Topic' };
  const pages = new Map();
  for (const e of flagged) {
    if (!pages.has(e.file)) pages.set(e.file, { ...e, items: [] });
    pages.get(e.file).items.push(e);
  }
  const sorted = [...pages.values()].sort((a, b) => kindOrder[a.kind] - kindOrder[b.kind] || a.title.localeCompare(b.title));
  let lastKind = null;
  for (const p of sorted) {
    if (p.kind !== lastKind) { lines.push(`\n# ${kindName[p.kind]} pages`, ''); lastKind = p.kind; }
    lines.push(`## ${p.title} — \`${p.file}\``);
    for (const e of p.items) {
      const r = results[e.url];
      lines.push(`- **${e.name}** [${r.verdict}] ${e.url}${e.field !== 'url' ? ` (${e.field})` : ''}`);
      lines.push(`  - ${r.why}`);
    }
    lines.push('');
  }
  fs.writeFileSync(REPORT, lines.join('\n'));
}

main().catch((e) => { console.error(e); process.exit(1); });
