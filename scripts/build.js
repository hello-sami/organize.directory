/**
 * build.js
 *
 * Generates static HTML from JSON data files.
 *
 * Reads:   data/locations/*.json, data/states/*.json, data/topics/*.json
 * Writes:  default → cities/*.html, states/*.html, topics/*.html, index.html (live output)
 *          --preview → the same pages into dist-preview/ (for a look before committing)
 *          (both) data/title-index.json, data/stats.json, _redirects, sitemap.xml, robots.txt
 *
 * Flags:
 *   --dry-run   Don't write anything, print counts only.
 *   --preview   Build the new (concept-d) design into dist-preview/ without
 *               touching the live output. To view locally:
 *                 npx serve dist-preview
 *               Once verified, Phase 7 cleanup will flip the default path.
 */

import fs from 'fs/promises';
import { readFileSync, existsSync } from 'fs';
import path from 'path';
import crypto from 'crypto';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');
const PREVIEW = process.argv.includes('--preview');

// ─── Asset cache-busting ────────────────────────────────────────────────────
// CSS/JS are served `immutable, max-age=1yr` (see _headers). Without a per-
// content token the browser would never re-fetch an edited file. We append
// ?v=<contenthash> so a changed file gets a new URL and is re-fetched, while
// unchanged files stay cached forever. Populated once at build start.
const VERSIONED_ASSETS = [
  '/assets/styles/system.css',
  '/assets/scripts/city-page.js',
  '/js/title-search.js',
  '/js/analytics.js',
];
const ASSET_HASHES = {};

async function computeAssetHashes() {
  for (const a of VERSIONED_ASSETS) {
    try {
      const buf = await fs.readFile(path.join(ROOT, a.replace(/^\//, '')));
      ASSET_HASHES[a] = crypto.createHash('sha256').update(buf).digest('hex').slice(0, 8);
    } catch {
      /* asset missing (e.g. partial checkout) — leave unversioned */
    }
  }
}

// Append the content hash to a site-absolute asset path: /x.css → /x.css?v=ab12cd34
function assetUrl(p) {
  const h = ASSET_HASHES[p];
  return h ? `${p}?v=${h}` : p;
}

function escapeRegExp(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// Hand-maintained pages (location.html, add.html, …) carry their own static
// <head> and body rather than going through the renderers. This keeps their
// shared parts in step with generated pages: the header bar is re-rendered
// from renderMast(), any leftover footer is stripped, the head gets the same font
// preload, favicons and browser tint, and assets get the same ?v=<hash>
// cache-busting. Idempotent — re-running with nothing changed is a no-op, so
// it only churns these files when something they share actually changed.
const STATIC_PAGES = [
  'location.html', 'topics.html', 'guides.html',
  'add.html', '404.html',
];

// Which nav link each static page counts as "current" (aria-current).
const STATIC_CURRENT = { 'location.html': '/location', 'topics.html': '/topics', 'add.html': '/add' };

function processStaticHead(html, file = '') {
  // 1. Drop Google Fonts preconnects + stylesheet link (fonts are self-hosted).
  html = html
    .split('\n')
    .filter(l => !/fonts\.(googleapis|gstatic)\.com/.test(l))
    .join('\n');

  // 2. Dark mode is gone: drop the pre-paint theme script and the toggle script.
  html = html.replace(/[ \t]*<!-- Pre-paint theme init[^\n]*\n[ \t]*<script>[\s\S]*?<\/script>\n\n?/, '');
  html = html.replace(/[ \t]*<script src="\/assets\/scripts\/theme-toggle\.js[^"]*" defer><\/script>\n/g, '');

  // 3. One browser tint, the paper color.
  html = html.replace(
    /([ \t]*)<meta name="theme-color"[^>]*>(\n[ \t]*<meta name="theme-color"[^>]*>)*/,
    `$1<meta name="theme-color" content="${PAPER_COLOR}">`,
  );

  // 4. Preload the body font (replacing the old Archivo preload).
  html = html.replace(/<link rel="preload" href="\/assets\/fonts\/[^"]+\.woff2"/,
    '<link rel="preload" href="/assets/fonts/plex-sans-condensed-400-latin.woff2"');
  if (!html.includes('/assets/fonts/plex-sans-condensed-400-latin.woff2')) {
    html = html.replace(
      /([ \t]*)(<link rel="stylesheet" href="\/assets\/styles\/system\.css)/,
      '$1<link rel="preload" href="/assets/fonts/plex-sans-condensed-400-latin.woff2" as="font" type="font/woff2" crossorigin>\n$1$2',
    );
  }

  // 5. SVG favicon first, PNGs as fallback.
  if (!html.includes('href="/favicon.svg"')) {
    html = html.replace(
      /([ \t]*)(<link rel="apple-touch-icon")/,
      '$1<link rel="icon" type="image/svg+xml" href="/favicon.svg">\n$1$2',
    );
  }

  // 6. Match generated pages: large Twitter card (preview.png is a wide image).
  html = html.replace(
    /(<meta name="twitter:card" content=")summary(">)/,
    '$1summary_large_image$2',
  );

  // 7. Shared header bar; the footer is gone (Add a group lives in the bar).
  html = html.replace(/<header class="(?:mast|bar)">[\s\S]*?<\/header>/, renderMast(STATIC_CURRENT[file] || ''));
  html = html.replace(/\n*<footer>[\s\S]*?<\/footer>\n*/, '\n\n');

  // 8. Apply ?v=<hash> to every known asset (stripping any prior ?v=…).
  for (const a of VERSIONED_ASSETS) {
    const h = ASSET_HASHES[a];
    if (!h) continue;
    const re = new RegExp(escapeRegExp(a) + '(\\?v=[a-f0-9]+)?', 'g');
    html = html.replace(re, `${a}?v=${h}`);
  }
  return html;
}

async function processStaticPages(rootDir) {
  let changed = 0;
  for (const f of STATIC_PAGES) {
    const fp = path.join(rootDir, f);
    let html;
    try {
      html = await fs.readFile(fp, 'utf-8');
    } catch {
      continue; // page not present (e.g. preview root before copy)
    }
    const out = processStaticHead(html, f);
    if (out !== html) {
      await fs.writeFile(fp, out, 'utf-8');
      changed++;
    }
  }
  return changed;
}

// ─── Shared helpers ─────────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function fmt(n) {
  return n.toLocaleString('en-US');
}

function pluralize(n, singular, plural) {
  return `${n} ${n === 1 ? singular : plural}`;
}

function hostFromUrl(url) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

// ============================================================================
// RENDERERS (uses /assets/styles/system.css — the "Phone Book" design)
// ============================================================================

const PAPER_COLOR = '#f1e49b'; // browser UI tint; matches --yellow in system.css

// The mark: a thumb notch (a D) with a punched hole (an O). The hole is a real
// hole (evenodd), so the paper shows through it.
const NOTCH_PATH = 'M0 0A50 50 0 0 1 0 100Z M20 34a16 16 0 1 0 .001 0Z';
function notchSvg(cls = '') {
  return `<svg${cls ? ` class="${cls}"` : ''} viewBox="0 0 50 100" aria-hidden="true" focusable="false"><path fill-rule="evenodd" d="${NOTCH_PATH}"/></svg>`;
}

function systemHead({ title, description, canonicalPath, ogImage = '/preview.png' }) {
  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="https://organize.directory${canonicalPath}">
  <meta name="theme-color" content="${PAPER_COLOR}">

  <!-- Open Graph / Social Media -->
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://organize.directory${canonicalPath}">
  <meta property="og:image" content="https://organize.directory${ogImage}">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Favicons -->
  <link rel="icon" type="image/svg+xml" href="/favicon.svg">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="manifest" href="/site.webmanifest">

  <!-- Fonts (self-hosted — see @font-face in system.css). Preload the body
       weight so text doesn't flash late. -->
  <link rel="preload" href="/assets/fonts/plex-sans-condensed-400-latin.woff2" as="font" type="font/woff2" crossorigin>

  <!-- Styles -->
  <link rel="stylesheet" href="${assetUrl('/assets/styles/system.css')}">

  <!-- Analytics -->
  <script src="${assetUrl('/js/analytics.js')}" defer></script>`;
}

// Header bar: logo cut into the page edge, links on desktop, a Menu
// disclosure on phones. `current` is the path of the page being rendered,
// so its link gets aria-current.
const NAV_PRIMARY = [
  ['/location', 'Local Listings'],
  ['/topics', 'Issue Listings'],
  ['/add', 'Add a group'],
];
const NAV_MENU = NAV_PRIMARY;

function navLinks(items, current) {
  return items
    .map(([href, label]) => `<a href="${href}"${href === current ? ' aria-current="page"' : ''}>${label}</a>`)
    .join('');
}

function renderMast(current = '') {
  return `<header class="bar">
  <a href="/" class="logo">Organize Directory</a>
  <nav class="bar-nav" aria-label="Main">${navLinks(NAV_PRIMARY, current)}</nav>
  <details class="menu">
    <summary>Menu</summary>
    <nav aria-label="Main">${navLinks(NAV_MENU, current)}</nav>
  </details>
</header>`;
}

// Running head: guide words left (first – last section; city-page.js keeps
// it in step with what's on screen), which book in the middle, place right.
function renderRunhead({ guide = '', book, right = '' }) {
  return `<div class="runhead">
  <span class="l" data-guide>${esc(guide)}</span>
  <span class="c">${esc(book)}</span>
  <span class="r">${esc(right)}</span>
</div>`;
}

function guideWords(entries) {
  const titled = entries.filter(e => e.title && e.title.trim());
  if (!titled.length) return '';
  const first = titled[0].title;
  const last = titled[titled.length - 1].title;
  return first === last ? first : `${first} – ${last}`;
}

function renderSuggest() {
  return `<aside class="ad">
        <p><b>Know a group we're missing?</b>This directory grows through community contributions. Add the organizers doing the work in your neighborhood.</p>
        <a href="/add" class="go">Suggest a group →</a>
      </aside>`;
}

// One listing: name · leader dots · website, description hanging below,
// the way a phone book lines up a name with its number.
function renderGroupItem(init) {
  const url = String(init.url || '');
  const external = /^https?:\/\//i.test(url);
  const extAttrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
  const host = external ? hostFromUrl(url) : '';
  const name = String(init.name || '');
  const desc = String(init.description || '');
  const hostHtml = host
    ? `<span class="dots" aria-hidden="true"></span><span class="host">${esc(host)}</span>`
    : '';
  const descHtml = desc ? `\n          <p class="desc">${esc(desc)}</p>` : '';
  return `        <li data-name="${esc(name.toLowerCase())}" data-desc="${esc(desc.toLowerCase())}">
          <a class="row" href="${esc(url)}"${extAttrs}><span class="name">${esc(name)}</span>${hostHtml}</a>${descHtml}
        </li>`;
}

function renderHeading(title, count) {
  const countHtml = count != null ? `<span class="k" aria-hidden="true">${count}</span>` : '';
  return `      <h2 class="hd"><span>${esc(title)}</span>${countHtml}</h2>\n`;
}

function renderGroupSection(section) {
  const items = section.initiatives.map(renderGroupItem).join('\n');
  const hasTitle = section.title && section.title.trim();
  const titleBlock = hasTitle ? renderHeading(section.title, section.initiatives.length) : '';
  const sectionKey = section.id || 'section';
  return `    <section id="${esc(sectionKey)}" class="group-section" data-section="${esc(sectionKey)}" data-title="${esc(hasTitle ? section.title : '')}">
${titleBlock}      <ol class="groups">
${items}
      </ol>
    </section>`;
}

// Thumb index: one notch per section, cut into the left edge. Entries are
// { id, title, count, hideCount? }; untitled or empty sections drop out.
// Fewer than two entries isn't worth a column, so the page goes full width.
function renderThumbs(entries) {
  const tocEntries = entries.filter(e => e.id && e.title && e.title.trim() && e.count > 0);
  if (tocEntries.length < 2) return '';
  const items = tocEntries
    .map(e => {
      const count = e.hideCount ? '' : `<span class="k">${e.count}</span>`;
      return `      <a href="#${esc(e.id)}" data-section="${esc(e.id)}"><span class="notch" aria-hidden="true"></span><span class="lbl">${esc(e.title)}</span>${count}</a>`;
    })
    .join('\n');
  return `    <nav class="thumbs" aria-label="Sections on this page">
${items}
    </nav>`;
}

// Child locations (NYC → boroughs, California → cities) as a dense index at
// the top of the page. Same section chrome as group sections, so the thumb
// notches and the filter work on it too.
function renderChildrenSection(children, { id, label }) {
  if (!children.length) return '';
  const sorted = children.slice().sort((a, b) => a.title.localeCompare(b.title));
  const items = sorted
    .map(c => `        <li data-name="${esc(String(c.title || '').toLowerCase())}" data-desc=""><a href="/${esc(c.slug)}"><span class="n">${esc(c.title)}</span></a></li>`)
    .join('\n');
  return `    <section id="${esc(id)}" class="group-section" data-section="${esc(id)}" data-title="${esc(label)}">
${renderHeading(label, null)}      <ol class="index-list">
${items}
      </ol>
    </section>`;
}

// The shared body of every list page: opener, then thumbs + sections.
function renderListPage({ bodyClass, current, runhead, opener, entries, sectionsHtml, filterLabel, filterPlaceholder, emptyText }) {
  const thumbsHtml = renderThumbs(entries);
  return `<body class="${bodyClass}">
<a href="#main" class="skip">Skip to content</a>
${renderMast(current)}
${renderRunhead({ ...runhead, guide: guideWords(entries) })}

<main id="main">

  <div class="opener">
${opener}
    <div class="filter" role="search">
      <label class="skip" for="page-filter">${esc(filterLabel)}</label>
      <input id="page-filter" type="search" placeholder="${esc(filterPlaceholder)}" autocomplete="off">
    </div>
  </div>

  <div class="spread">
${thumbsHtml}
    <div class="main-col">
      <div id="sections-root">
${sectionsHtml}
        <p class="empty" id="empty-state" hidden>${emptyText}</p>
      </div>

      ${renderSuggest()}
    </div>
  </div>

</main>

<script src="${assetUrl('/assets/scripts/city-page.js')}" defer></script>

</body>`;
}

function renderCity(data, { breadcrumbs, children }) {
  const titleTag = `${data.title} — Organize Directory`;
  const description = `Leftist, grassroots, and mutual aid organizations in ${data.title}.`;

  const sections = data.sections.filter(s => s.initiatives && s.initiatives.length > 0);
  const totalGroups = sections.reduce((sum, s) => sum + s.initiatives.length, 0);

  // Parent chain, outermost first (New York → New York City). Skip the
  // synthetic "States" root.
  const realCrumbs = breadcrumbs.filter(c => c.slug !== 'location');
  const stateName = realCrumbs.length ? realCrumbs[0].title : '';

  const hasChildren = children.length > 0;
  const childrenLabel = 'Neighborhoods';
  const childrenHtml = hasChildren
    ? renderChildrenSection(children, { id: 'neighborhoods', label: childrenLabel })
    : '';
  const sectionsHtml = [childrenHtml, ...sections.map(renderGroupSection)].filter(Boolean).join('\n\n');

  const entries = [
    ...(hasChildren ? [{ id: 'neighborhoods', title: childrenLabel, count: children.length, hideCount: true }] : []),
    ...sections.map(s => ({ id: s.id, title: s.title, count: s.initiatives.length })),
  ];

  // "60 groups. Part of New York City, New York." — nearest parent first.
  const parents = realCrumbs.slice().reverse();
  const partOf = parents.length
    ? ` <nav aria-label="Breadcrumb">Part of ${parents.map(c => `<a href="/${esc(c.slug)}">${esc(c.title)}</a>`).join(', ')}.</nav>`
    : '';
  const count = totalGroups ? `<b>${fmt(totalGroups)}</b> ${totalGroups === 1 ? 'group' : 'groups'}.` : '';
  const placeLabel = stateName && stateName !== data.title ? `${data.title}, ${stateName}` : data.title;

  return `<!DOCTYPE html>
<html lang="en">
<head>
${systemHead({ title: titleTag, description, canonicalPath: `/${data.slug}` })}
</head>
${renderListPage({
    bodyClass: 'white',
    current: '/location',
    runhead: { book: 'Local Listings', right: placeLabel },
    opener: `    <h1 class="title">${esc(data.title)}</h1>
    <div class="meta">${count}${partOf}</div>`,
    entries,
    sectionsHtml,
    filterLabel: `Filter groups in ${data.title}`,
    filterPlaceholder: `Filter groups in ${data.title}`,
    emptyText: 'No groups match <b id="empty-query"></b>. Try a different search.',
  })}
</html>
`;
}

function renderStateHub(data, { children }) {
  const titleTag = `${data.title} — Organize Directory`;
  const description = `Cities and statewide organizations in ${data.title}.`;

  const sections = (data.sections || []).filter(s => s.initiatives && s.initiatives.length > 0);
  const totalStatewide = sections.reduce((s, sec) => s + sec.initiatives.length, 0);

  // A state's direct children mix cities, counties, and regions, so "Places".
  const hasChildren = children.length > 0;
  const childrenLabel = 'Places';
  const childrenHtml = hasChildren
    ? renderChildrenSection(children, { id: 'places', label: childrenLabel })
    : '';
  const sectionsHtml = [childrenHtml, ...sections.map(renderGroupSection)].filter(Boolean).join('\n\n');

  const entries = [
    ...(hasChildren ? [{ id: 'places', title: childrenLabel, count: children.length, hideCount: true }] : []),
    ...sections.map(s => ({ id: s.id, title: s.title, count: s.initiatives.length })),
  ];

  const meta = totalStatewide
    ? `    <p class="meta"><b>${fmt(totalStatewide)}</b> statewide ${totalStatewide === 1 ? 'group' : 'groups'}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
${systemHead({ title: titleTag, description, canonicalPath: `/${data.slug}` })}
</head>
${renderListPage({
    bodyClass: 'white',
    current: '/location',
    runhead: { book: 'Local Listings', right: data.title },
    opener: `    <h1 class="title">${esc(data.title)}</h1>
${meta}`,
    entries,
    sectionsHtml,
    filterLabel: `Filter ${data.title}`,
    filterPlaceholder: `Filter ${data.title}`,
    emptyText: 'No places or groups match <b id="empty-query"></b>. Try a different search.',
  })}
</html>
`;
}

function renderTopicPage(data) {
  const titleTag = `${data.title} — Organize Directory`;
  const description = data.subtitle || `Organizations and initiatives focused on ${data.title}.`;

  const sections = data.sections.filter(s => s.initiatives && s.initiatives.length > 0);
  const totalGroups = sections.reduce((s, sec) => s + sec.initiatives.length, 0);
  const sectionsHtml = sections.map(renderGroupSection).join('\n\n');
  const entries = sections.map(s => ({ id: s.id, title: s.title, count: s.initiatives.length }));

  const lede = data.subtitle ? `\n    <p class="lede">${esc(data.subtitle.replace(/\s+/g, ' ').trim())}</p>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
${systemHead({ title: titleTag, description, canonicalPath: `/topics/${data.slug}` })}
</head>
${renderListPage({
    bodyClass: 'yellow',
    current: '/topics',
    runhead: { book: 'Issue Listings', right: data.title },
    opener: `    <h1 class="title">${esc(data.title)}</h1>
    <p class="meta"><b>${fmt(totalGroups)}</b> ${totalGroups === 1 ? 'group' : 'groups'}</p>${lede}`,
    entries,
    sectionsHtml,
    filterLabel: `Filter groups in ${data.title}`,
    filterPlaceholder: 'Filter groups',
    emptyText: 'No groups match <b id="empty-query"></b>. Try a different search.',
  })}
</html>
`;
}

// Groups per state, counting statewide groups plus every place in the state.
function stateGroupCounts(locationIndex, stateIndex) {
  const count = d => (d.sections || []).reduce((n, s) => n + (s.initiatives ? s.initiatives.length : 0), 0);
  const totals = {};
  for (const st of Object.values(stateIndex)) totals[st.slug] = count(st);
  for (const loc of Object.values(locationIndex)) {
    const st = String(loc.state || '').trim();
    if (st in totals) totals[st] += count(loc);
  }
  return totals;
}

function formatEditionDate(iso) {
  return new Date(iso).toLocaleDateString('en-US', {
    timeZone: 'America/New_York', year: 'numeric', month: 'long', day: 'numeric',
  });
}

// The homepage is the phone book's cover: title, edition line, tagline and
// search, a two-line contents list, and every state.
function renderHome(stats, { locationIndex, stateIndex }) {
  const titleTag = 'Organize Directory';
  const description = "An (incomplete) list of leftist and grassroots groups in the US. Find your people and get to work.";

  const totals = stateGroupCounts(locationIndex, stateIndex);
  const states = Object.values(stateIndex).sort((a, b) => a.title.localeCompare(b.title));
  const stateItems = states
    .map(s => `      <li><a href="/${esc(s.slug)}"><span class="n">${esc(s.title)}</span><span class="c">${totals[s.slug] ? fmt(totals[s.slug]) : ''}</span></a></li>`)
    .join('\n');

  return `<!DOCTYPE html>
<html lang="en">
<head>
${systemHead({ title: titleTag, description, canonicalPath: '/' })}
</head>
<body class="yellow">
<a href="#main" class="skip">Skip to content</a>
${renderMast('/')}

<main id="main">

  <div class="cover-top">
    <div>
      <div class="cover-title">${notchSvg()}<h1>Organize<br>Directory</h1></div>
      <p class="edition"><span>United States</span><span>Updated ${esc(formatEditionDate(stats.generatedAt))}</span><span>${fmt(stats.groups)} listings</span></p>
    </div>
    <div>
      <p class="tagline">Don't despair. Organize.</p>
      <p class="cover-sub">An (incomplete) list of leftist and grassroots groups in the US. Find your people and get to work.</p>
      <form class="lookup" role="search" action="/search" method="get" onsubmit="event.preventDefault()">
        <label class="skip" for="site-search">Search the directory</label>
        <input id="site-search" name="q" type="search" placeholder="Search city, state, issue, or group" autocomplete="off">
        <button type="submit">Look up</button>
      </form>
    </div>
  </div>

  <nav class="contents" aria-label="Contents">
    <a class="row" href="/location"><span class="name">Local Listings</span><span class="dots" aria-hidden="true"></span><span class="host">${fmt(stats.cities)} cities</span></a>
    <a class="row" href="/topics"><span class="name">Issue Listings</span><span class="dots" aria-hidden="true"></span><span class="host">${fmt(stats.categories)} issues</span></a>
  </nav>

  <section class="state-index" aria-labelledby="states-heading">
    <h2 class="hd" id="states-heading"><span>States</span><span class="k">Groups</span></h2>
    <ol class="index-list">
${stateItems}
    </ol>
  </section>

</main>

<script src="${assetUrl('/js/title-search.js')}" defer></script>
</body>
</html>
`;
}

// ============================================================================
// DATA LOADING + SHARED BUILD LOGIC
// ============================================================================

async function loadDir(dir) {
  const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json'));
  const entries = await Promise.all(
    files.map(async f => {
      const data = JSON.parse(await fs.readFile(path.join(dir, f), 'utf-8'));
      return [data.slug, data];
    }),
  );
  return Object.fromEntries(entries);
}

function buildBreadcrumbs(slug, locationIndex, stateIndex) {
  // Walk parent chain from current slug upward, collecting crumbs in reverse.
  const crumbs = [];
  const visited = new Set([slug]);
  let parentSlug = locationIndex[slug]?.parent;

  while (parentSlug && !visited.has(parentSlug)) {
    visited.add(parentSlug);
    const parentData = locationIndex[parentSlug] || stateIndex[parentSlug];
    if (!parentData) break;
    crumbs.unshift({ slug: parentSlug, title: parentData.title });
    parentSlug = parentData.parent || null;
  }

  // If first crumb is a state, prepend the "States" root for the legacy design.
  // The system renderer filters this out in renderBreadcrumb.
  if (crumbs.length && stateIndex[crumbs[0].slug]) {
    crumbs.unshift({ slug: 'location', title: 'States' });
  }

  return crumbs;
}

async function writeBatch(pairs) {
  const BATCH = 20;
  for (let i = 0; i < pairs.length; i += BATCH) {
    await Promise.all(
      pairs.slice(i, i + BATCH).map(([outPath, html]) => fs.writeFile(outPath, html, 'utf-8')),
    );
  }
}

async function ensureDir(dirPath) {
  await fs.mkdir(dirPath, { recursive: true });
}

function computeStats(locationIndex, stateIndex, topicIndex) {
  const count = data => data.sections.reduce(
    (sum, s) => sum + (s.initiatives ? s.initiatives.length : 0),
    0,
  );
  return {
    groups:
      Object.values(locationIndex).reduce((s, d) => s + count(d), 0) +
      Object.values(stateIndex).reduce((s, d) => s + count(d), 0) +
      Object.values(topicIndex).reduce((s, d) => s + count(d), 0),
    cities: Object.keys(locationIndex).length,
    categories: Object.keys(topicIndex).length,
    generatedAt: new Date().toISOString(),
  };
}

function buildTitleIndex(locationIndex, stateIndex, topicIndex) {
  return [
    ...Object.values(locationIndex).map(d => ({ slug: d.slug, title: d.title, type: 'location' })),
    ...Object.values(stateIndex).map(d => ({ slug: d.slug, title: d.title, type: 'state' })),
    ...Object.values(topicIndex).map(d => ({ slug: d.slug, title: d.title, type: 'topic' })),
  ].sort((a, b) => a.title.localeCompare(b.title));
}

// data/redirects.json maps the slug of a retired/merged page to the slug it
// now lives under, so old links keep working (301). Ignored if the old slug is
// a live page again.
function retiredRedirects(sortedLocations, sortedStates) {
  const file = path.join(ROOT, 'data', 'redirects.json');
  if (!existsSync(file)) return [];
  const map = JSON.parse(readFileSync(file, 'utf-8'));
  const live = new Set([...sortedLocations, ...sortedStates]);
  const rules = Object.entries(map)
    .filter(([from]) => !live.has(from))
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([from, to]) => `/${from}\t/${to}\t301`);
  return rules.length ? ['# Retired pages (data/redirects.json)', ...rules, ''] : [];
}

function buildRedirects(locationIndex, stateIndex) {
  // States listed first so they win slug collisions (/washington → state,
  // not washington-dc city).
  const sortedLocations = Object.values(locationIndex).map(d => d.slug).sort();
  const sortedStates = Object.values(stateIndex).map(d => d.slug).sort();

  const stateSet = new Set(sortedStates);
  const collisions = sortedLocations.filter(slug => stateSet.has(slug));
  if (collisions.length) {
    process.stderr.write(
      `\n⚠️  Slug collisions between cities and states (state will win in _redirects):\n` +
      collisions.map(s => `   /${s}  ←  data/locations/${s}.json  vs  data/states/${s}.json`).join('\n') +
      '\n   Recommend renaming the city slug or merging into the state.\n\n',
    );
  }

  const text = [
    '# Auto-generated by scripts/build.js — do not edit by hand.',
    '# One 200 rewrite per city and state so /chicago, /california, etc. serve',
    '# the correct HTML file without a Cloudflare Worker in the hot path.',
    '# States are listed first so they win on slug collisions.',
    '',
    '# Retired pages (newsletter and contact-form thank-you): send old links home',
    '/subscribe\t/\t301',
    '/subscribe.html\t/\t301',
    '/thank-you\t/\t301',
    '/thank-you.html\t/\t301',
    '# Contact page removed: the add-a-group page has the email address',
    '/contact\t/add\t301',
    '/contact.html\t/add\t301',
    '',
    '# States',
    ...sortedStates.map(slug => `/${slug}\t/states/${slug}.html\t200`),
    '',
    '# Cities',
    ...sortedLocations.map(slug => `/${slug}\t/cities/${slug}.html\t200`),
    '',
    ...retiredRedirects(sortedLocations, sortedStates),
  ].join('\n');

  return { text, sortedLocations, sortedStates };
}

function buildSitemap(sortedStates, sortedLocations, topicIndex) {
  const today = new Date().toISOString().split('T')[0];
  const SITE = 'https://organize.directory';
  const STATIC_PAGES = ['/', '/location', '/topics', '/guides', '/add'];
  const sitemapUrls = [
    ...STATIC_PAGES.map(p => ({ loc: SITE + p, priority: p === '/' ? '1.0' : '0.8' })),
    ...sortedStates.map(slug => ({ loc: `${SITE}/${slug}`, priority: '0.7' })),
    ...sortedLocations.map(slug => ({ loc: `${SITE}/${slug}`, priority: '0.6' })),
    ...Object.values(topicIndex).map(d => d.slug).sort()
      .map(slug => ({ loc: `${SITE}/topics/${slug}`, priority: '0.6' })),
  ];
  const xml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapUrls.map(u =>
      `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`,
    ),
    '</urlset>',
    '',
  ].join('\n');
  const robots = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE}/sitemap.xml`,
    '',
  ].join('\n');
  return { xml, robots, count: sitemapUrls.length };
}

// ============================================================================
// PREVIEW-ONLY HELPERS — copy static assets into dist-preview/ so the
// generated HTML resolves all its references when served as a web root.
// ============================================================================

// Manual recursive copy that uses writeFile instead of cp/rename.
// fs.cp calls unlink() to overwrite, which some mounts refuse after a prior
// build. writeFile with O_TRUNC works fine, so we walk the tree ourselves.
async function copyFileOverwrite(src, dest) {
  const buf = await fs.readFile(src);
  await fs.writeFile(dest, buf);
}

async function copyRecursive(src, dest) {
  const stat = await fs.stat(src);
  if (stat.isDirectory()) {
    await fs.mkdir(dest, { recursive: true });
    const entries = await fs.readdir(src, { withFileTypes: true });
    for (const entry of entries) {
      await copyRecursive(path.join(src, entry.name), path.join(dest, entry.name));
    }
  } else if (stat.isFile()) {
    await fs.mkdir(path.dirname(dest), { recursive: true });
    await copyFileOverwrite(src, dest);
  }
}

async function copyIfExists(src, dest) {
  try {
    await copyRecursive(src, dest);
    return true;
  } catch (err) {
    if (err.code === 'ENOENT') return false;
    throw err;
  }
}

async function copyPreviewAssets(previewRoot) {
  // Recursive assets directory (system.css + shared scripts)
  await copyIfExists(path.join(ROOT, 'assets'), path.join(previewRoot, 'assets'));

  // Shared /js/ utilities referenced by the new design
  // (analytics, title-search, title-index, generate-titles-index)
  await copyIfExists(path.join(ROOT, 'js'), path.join(previewRoot, 'js'));

  // Hand-maintained static pages on the new design system. Copied in so the nav
  // (`/location`, `/topics`, `/add`) doesn't 404 locally.
  for (const f of [
    'location.html',
    'topics.html',
    'guides.html',
    'add.html',
    '404.html',
  ]) {
    await copyIfExists(path.join(ROOT, f), path.join(previewRoot, f));
  }

  // Favicons + manifest + og-image
  for (const f of [
    'apple-touch-icon.png',
    'favicon-32x32.png',
    'favicon-16x16.png',
    'favicon.ico',
    'favicon.svg',
    'site.webmanifest',
    'preview.png',
    'logo.svg',
    'logo.png',
    'android-chrome-192x192.png',
    'android-chrome-512x512.png',
  ]) {
    await copyIfExists(path.join(ROOT, f), path.join(previewRoot, f));
  }
}

// ============================================================================
// BUILD DISPATCHERS
// ============================================================================

async function runLiveBuild({ locationIndex, stateIndex, topicIndex, childrenOf, stats }) {
  // Live build writes into the repo root for Cloudflare Pages deployment.
  // File paths stay nested under /cities/, /states/, /topics/ — the existing
  // `_redirects` file maps `/<slug>` to these locations, so URL surface
  // doesn't change during the design cutover.
  const locationPairs = [];
  for (const data of Object.values(locationIndex)) {
    try {
      const breadcrumbs = buildBreadcrumbs(data.slug, locationIndex, stateIndex);
      const children = childrenOf[data.slug] || [];
      const html = renderCity(data, { breadcrumbs, children });
      locationPairs.push([path.join(ROOT, 'cities', `${data.slug}.html`), html]);
    } catch (err) {
      process.stderr.write(`ERROR rendering location ${data.slug}: ${err.message}\n`);
    }
  }
  console.log(`Rendered ${locationPairs.length} cities`);

  const statePairs = [];
  for (const data of Object.values(stateIndex)) {
    try {
      const children = childrenOf[data.slug] || [];
      const html = renderStateHub(data, { children });
      statePairs.push([path.join(ROOT, 'states', `${data.slug}.html`), html]);
    } catch (err) {
      process.stderr.write(`ERROR rendering state ${data.slug}: ${err.message}\n`);
    }
  }
  console.log(`Rendered ${statePairs.length} states`);

  const topicPairs = [];
  for (const data of Object.values(topicIndex)) {
    try {
      const html = renderTopicPage(data);
      topicPairs.push([path.join(ROOT, 'topics', `${data.slug}.html`), html]);
    } catch (err) {
      process.stderr.write(`ERROR rendering topic ${data.slug}: ${err.message}\n`);
    }
  }
  console.log(`Rendered ${topicPairs.length} topics`);

  const homeHtml = renderHome(stats, { locationIndex, stateIndex });

  // Shared build outputs
  const titleIndex = buildTitleIndex(locationIndex, stateIndex, topicIndex);
  const { text: redirectsText, sortedLocations, sortedStates } = buildRedirects(locationIndex, stateIndex);
  const { xml: sitemapXml, robots: robotsText, count: sitemapCount } = buildSitemap(sortedStates, sortedLocations, topicIndex);

  if (DRY_RUN) return { locationPairs, statePairs, topicPairs, sitemapCount };

  console.log('Writing cities...');
  await writeBatch(locationPairs);
  console.log('Writing states...');
  await writeBatch(statePairs);
  console.log('Writing topics...');
  await writeBatch(topicPairs);
  await fs.writeFile(path.join(ROOT, 'index.html'), homeHtml, 'utf-8');
  console.log('Wrote index.html (homepage)');
  await fs.writeFile(path.join(ROOT, 'data', 'title-index.json'), JSON.stringify(titleIndex, null, 2), 'utf-8');
  console.log('Wrote title-index.json');
  await fs.writeFile(path.join(ROOT, '_redirects'), redirectsText, 'utf-8');
  console.log(`Wrote _redirects (${sortedLocations.length + sortedStates.length} rules)`);
  await fs.writeFile(path.join(ROOT, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`Wrote sitemap.xml (${sitemapCount} urls)`);
  await fs.writeFile(path.join(ROOT, 'robots.txt'), robotsText, 'utf-8');
  console.log('Wrote robots.txt');
  await fs.writeFile(path.join(ROOT, 'data', 'stats.json'), JSON.stringify(stats, null, 2), 'utf-8');
  console.log(`Wrote data/stats.json (${stats.groups} groups, ${stats.cities} cities, ${stats.categories} categories)`);

  const staticChanged = await processStaticPages(ROOT);
  console.log(`Processed static pages (font + cache-bust): ${staticChanged} updated`);

  return { locationPairs, statePairs, topicPairs, sitemapCount };
}

async function runPreviewBuild({ locationIndex, stateIndex, topicIndex, childrenOf, stats }) {
  const PREVIEW_ROOT = path.join(ROOT, 'dist-preview');

  // Render pages.
  // URLs for cities and states are flat (`/san-francisco`, `/california`),
  // so we write the HTML at `dist-preview/<slug>.html` — that way
  // `npx serve` with its default `cleanUrls: true` resolves the URLs
  // without needing the Cloudflare `_redirects` file in the preview.
  // On collision (only `washington` right now), cities are written first
  // and states overwrite — matching the `_redirects` precedence.
  const locationPairs = [];
  for (const data of Object.values(locationIndex)) {
    try {
      const breadcrumbs = buildBreadcrumbs(data.slug, locationIndex, stateIndex);
      const children = childrenOf[data.slug] || [];
      const html = renderCity(data, { breadcrumbs, children });
      locationPairs.push([path.join(PREVIEW_ROOT, `${data.slug}.html`), html]);
    } catch (err) {
      process.stderr.write(`PREVIEW: error rendering location ${data.slug}: ${err.message}\n`);
    }
  }
  console.log(`Rendered ${locationPairs.length} cities (preview)`);

  const statePairs = [];
  for (const data of Object.values(stateIndex)) {
    try {
      const children = childrenOf[data.slug] || [];
      const html = renderStateHub(data, { children });
      statePairs.push([path.join(PREVIEW_ROOT, `${data.slug}.html`), html]);
    } catch (err) {
      process.stderr.write(`PREVIEW: error rendering state ${data.slug}: ${err.message}\n`);
    }
  }
  console.log(`Rendered ${statePairs.length} states (preview)`);

  const topicPairs = [];
  for (const data of Object.values(topicIndex)) {
    try {
      const html = renderTopicPage(data);
      topicPairs.push([path.join(PREVIEW_ROOT, 'topics', `${data.slug}.html`), html]);
    } catch (err) {
      process.stderr.write(`PREVIEW: error rendering topic ${data.slug}: ${err.message}\n`);
    }
  }
  console.log(`Rendered ${topicPairs.length} topics (preview)`);

  const homeHtml = renderHome(stats, { locationIndex, stateIndex });

  // Shared data outputs
  const titleIndex = buildTitleIndex(locationIndex, stateIndex, topicIndex);
  const { text: redirectsText, sortedLocations, sortedStates } = buildRedirects(locationIndex, stateIndex);
  const { xml: sitemapXml, robots: robotsText, count: sitemapCount } = buildSitemap(sortedStates, sortedLocations, topicIndex);

  if (DRY_RUN) return { locationPairs, statePairs, topicPairs, sitemapCount };

  // Write everything into dist-preview/
  await ensureDir(PREVIEW_ROOT);
  await ensureDir(path.join(PREVIEW_ROOT, 'topics'));
  await ensureDir(path.join(PREVIEW_ROOT, 'data'));

  console.log('Writing cities...');
  await writeBatch(locationPairs);
  console.log('Writing states...');
  await writeBatch(statePairs);
  console.log('Writing topics...');
  await writeBatch(topicPairs);

  await fs.writeFile(path.join(PREVIEW_ROOT, 'index.html'), homeHtml, 'utf-8');
  console.log('Wrote index.html (preview homepage)');

  await fs.writeFile(path.join(PREVIEW_ROOT, 'data', 'title-index.json'), JSON.stringify(titleIndex, null, 2), 'utf-8');
  console.log('Wrote data/title-index.json');
  await fs.writeFile(path.join(PREVIEW_ROOT, '_redirects'), redirectsText, 'utf-8');
  console.log(`Wrote _redirects (${sortedLocations.length + sortedStates.length} rules)`);
  await fs.writeFile(path.join(PREVIEW_ROOT, 'sitemap.xml'), sitemapXml, 'utf-8');
  console.log(`Wrote sitemap.xml (${sitemapCount} urls)`);
  await fs.writeFile(path.join(PREVIEW_ROOT, 'robots.txt'), robotsText, 'utf-8');
  console.log('Wrote robots.txt');
  await fs.writeFile(path.join(PREVIEW_ROOT, 'data', 'stats.json'), JSON.stringify(stats, null, 2), 'utf-8');
  console.log(`Wrote data/stats.json (${stats.groups} groups, ${stats.cities} cities, ${stats.categories} categories)`);

  await copyPreviewAssets(PREVIEW_ROOT);
  console.log('Copied /assets, favicons, and /js/title-search.js + /js/analytics.js into dist-preview/');

  const staticChanged = await processStaticPages(PREVIEW_ROOT);
  console.log(`Processed static pages (font + cache-bust): ${staticChanged} updated`);

  return { locationPairs, statePairs, topicPairs, sitemapCount };
}

// ============================================================================
// MAIN
// ============================================================================

async function run() {
  const mode = PREVIEW ? '🔬 PREVIEW' : (DRY_RUN ? '🔍 DRY RUN' : '🏗  BUILD');
  console.log(`${mode}  Building HTML from JSON\n`);

  await computeAssetHashes();

  const [locationIndex, stateIndex, topicIndex] = await Promise.all([
    loadDir(path.join(ROOT, 'data/locations')),
    loadDir(path.join(ROOT, 'data/states')),
    loadDir(path.join(ROOT, 'data/topics')),
  ]);
  console.log(`Loaded ${Object.keys(locationIndex).length} locations, ${Object.keys(stateIndex).length} states, ${Object.keys(topicIndex).length} topics`);

  // Build parent → children map (locations only)
  const childrenOf = {};
  for (const loc of Object.values(locationIndex)) {
    if (loc.parent) {
      (childrenOf[loc.parent] ||= []).push({ slug: loc.slug, title: loc.title });
    }
  }

  const stats = computeStats(locationIndex, stateIndex, topicIndex);

  const result = PREVIEW
    ? await runPreviewBuild({ locationIndex, stateIndex, topicIndex, childrenOf, stats })
    : await runLiveBuild({ locationIndex, stateIndex, topicIndex, childrenOf, stats });

  const total = Object.keys(locationIndex).length + Object.keys(stateIndex).length + Object.keys(topicIndex).length;
  console.log(`\n── Summary ──
  Mode      : ${PREVIEW ? 'preview (dist-preview/)' : 'live'}
  Locations : ${Object.keys(locationIndex).length}
  States    : ${Object.keys(stateIndex).length}
  Topics    : ${Object.keys(topicIndex).length}
  Total     : ${total}
  Groups    : ${stats.groups}
  Written   : ${DRY_RUN ? '(dry run)' : total + 5}
`);

  if (PREVIEW && !DRY_RUN) {
    console.log('To view the preview:');
    console.log('  npx serve dist-preview');
    console.log('Then open the URL printed by `serve` in your browser.\n');
  }
}

run().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
