/**
 * build.js
 *
 * Generates static HTML from JSON data files.
 *
 * Reads:   data/locations/*.json, data/states/*.json, data/topics/*.json
 * Writes:  default → cities/*.html, states/*.html, topics/*.html (live output, old design)
 *          --preview → dist-preview/** (new design using assets/styles/system.css)
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
  '/assets/scripts/theme-toggle.js',
  '/js/title-search.js',
  '/js/analytics.js',
  '/js/newsletter-form.js',
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

// Hand-maintained pages (location.html, contact.html, …) carry their own static
// <head> rather than going through systemHead(). This brings them in line with
// generated pages: drop the Google Fonts <link> (fonts are self-hosted now),
// preload the body font, and apply the same ?v=<hash> cache-busting. Idempotent
// — re-running with unchanged assets is a no-op, so it only churns these files
// when an asset they reference actually changed.
const STATIC_PAGES = [
  'location.html', 'topics.html', 'guides.html', 'contact.html',
  'subscribe.html', 'thank-you.html', 'add.html', '404.html',
];

function processStaticHead(html) {
  // 1. Drop Google Fonts preconnects + stylesheet link (now self-hosted).
  html = html
    .split('\n')
    .filter(l => !/fonts\.(googleapis|gstatic)\.com/.test(l))
    .join('\n');

  // 2. Preload the self-hosted body font, just before the system stylesheet.
  if (!html.includes('/assets/fonts/archivo-latin-var.woff2')) {
    html = html.replace(
      /([ \t]*)(<link rel="stylesheet" href="\/assets\/styles\/system\.css)/,
      '$1<link rel="preload" href="/assets/fonts/archivo-latin-var.woff2" as="font" type="font/woff2" crossorigin>\n$1$2',
    );
  }

  // 3. Match generated pages: large Twitter card (preview.png is a wide image).
  html = html.replace(
    /(<meta name="twitter:card" content=")summary(">)/,
    '$1summary_large_image$2',
  );

  // 4. Apply ?v=<hash> to every known asset (stripping any prior ?v=…).
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
    const out = processStaticHead(html);
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
// RENDERERS (uses /assets/styles/system.css + Google Fonts)
// ============================================================================

function systemHead({ title, description, canonicalPath, ogImage = '/preview.png' }) {
  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">

  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="https://organize.directory${canonicalPath}">
  <meta name="theme-color" content="#fce0c8" media="(prefers-color-scheme: light)">
  <meta name="theme-color" content="#15100d" media="(prefers-color-scheme: dark)">

  <!-- Open Graph / Social Media -->
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://organize.directory${canonicalPath}">
  <meta property="og:image" content="https://organize.directory${ogImage}">
  <meta name="twitter:card" content="summary_large_image">

  <!-- Favicons -->
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="manifest" href="/site.webmanifest">

  <!-- Pre-paint theme init (must run before any stylesheet paints) -->
  <script>
    (function(){
      try {
        var stored = localStorage.getItem('theme');
        var dark = stored ? stored === 'dark'
                 : window.matchMedia('(prefers-color-scheme: dark)').matches;
        document.documentElement.classList.add(dark ? 'dark' : 'light');
      } catch(e) { document.documentElement.classList.add('light'); }
    })();
  </script>

  <!-- Fonts (self-hosted — see @font-face in system.css). Preload the primary
       body weight so text doesn't flash late. -->
  <link rel="preload" href="/assets/fonts/archivo-latin-var.woff2" as="font" type="font/woff2" crossorigin>

  <!-- Styles -->
  <link rel="stylesheet" href="${assetUrl('/assets/styles/system.css')}">

  <!-- Analytics -->
  <script src="${assetUrl('/js/analytics.js')}" defer></script>`;
}

function renderMast() {
  return `<header class="mast">
  <a href="/" class="wordmark" aria-label="Organize.Directory — home">Organize<span class="dot" aria-hidden="true">.</span>Directory</a>
  <div style="display:flex;align-items:center;gap:.5rem">
    <button class="theme-toggle" type="button" aria-label="Toggle dark mode">
      <svg class="icon-moon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
      <svg class="icon-sun" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
    </button>
  </div>
</header>`;
}

function renderFooter() {
  return `<footer>
  <a href="/add">Add a group</a>
  <a href="/subscribe">Subscribe</a>
  <a href="/contact">Contact</a>
</footer>`;
}

function renderBreadcrumb(crumbs, currentTitle) {
  // Drop the legacy "States" synthetic root — the new design uses Home only.
  const clean = crumbs.filter(c => c.slug !== 'location');
  const parts = [`<a href="/">Home</a>`];
  for (const c of clean) {
    parts.push(`<span class="sep" aria-hidden="true">/</span>`);
    parts.push(`<a href="/${esc(c.slug)}">${esc(c.title)}</a>`);
  }
  parts.push(`<span class="sep" aria-hidden="true">/</span>`);
  parts.push(`<span aria-current="page">${esc(currentTitle)}</span>`);
  return `<nav class="crumbs" aria-label="Breadcrumb">
    ${parts.join('\n    ')}
  </nav>`;
}

function renderSuggest() {
  return `<aside class="suggest">
    <p><b>Know a group we're missing?</b> This directory grows through community contributions. Add the organizers doing the work in your neighborhood.</p>
    <a href="/add" class="btn">
      <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/></svg>
      Suggest a group
    </a>
  </aside>`;
}

function renderGroupItem(init) {
  const url = String(init.url || '');
  const external = /^https?:\/\//i.test(url);
  const extAttrs = external ? ' target="_blank" rel="noopener noreferrer"' : '';
  const host = external ? hostFromUrl(url) : '';
  const name = String(init.name || '');
  const desc = String(init.description || '');
  const nameSearchable = name.toLowerCase();
  const descSearchable = desc.toLowerCase();
  const hostHtml = host ? `\n            <span class="host">${esc(host)}</span>` : '';
  const extArrow = external ? ' <span class="ext" aria-hidden="true">↗</span>' : '';
  const descHtml = desc
    ? `\n          <p class="desc">${esc(desc)}</p>`
    : '';
  return `        <li data-name="${esc(nameSearchable)}" data-desc="${esc(descSearchable)}">
          <div class="row">
            <a class="name" href="${esc(url)}"${extAttrs}>${esc(name)}${extArrow}</a>${hostHtml}
          </div>${descHtml}
        </li>`;
}

function renderGroupSection(section) {
  const items = section.initiatives.map(renderGroupItem).join('\n');
  const hasTitle = section.title && section.title.trim();
  const titleBlock = hasTitle
    ? `      <h2 class="section-title">${esc(section.title)}</h2>\n`
    : '';
  const sectionKey = section.id || 'section';
  return `    <section id="${esc(sectionKey)}" class="group-section" data-section="${esc(sectionKey)}">
${titleBlock}      <ol class="groups">
${items}
      </ol>
    </section>`;
}

// Build TOC from a flat list of entries { id, title, count, hideCount? }.
// Sections with no id / no title drop out (e.g. the Portland "section-0" case).
function renderTocSidebar(entries) {
  const tocEntries = entries.filter(e => e.id && e.title && e.title.trim() && e.count > 0);
  if (tocEntries.length === 0) return '';

  const first = tocEntries[0];
  const items = tocEntries
    .map(e => {
      const countBadge = e.hideCount ? '' : ` <span class="count">${e.count}</span>`;
      return `      <a href="#${esc(e.id)}" data-section="${esc(e.id)}"><span class="label">${esc(e.title)}</span>${countBadge}</a>`;
    })
    .join('\n');

  return `  <nav class="toc" aria-label="Sections on this page">
    <button class="toc-toggle" type="button" aria-expanded="false" aria-controls="toc-panel">
      <span class="current">
        <span class="current-label">Section ·</span>
        <span class="current-name">${esc(first.title)}</span>
      </span>
      <svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"><polyline points="6 9 12 15 18 9"/></svg>
    </button>
    <div id="toc-panel" class="toc-scroll">
${items}
    </div>
  </nav>`;
}

// Child-location list rendered as a group-section — same chrome as regular
// sections so the TOC highlighter, filter, and "jump to" all work for free.
// Used at the top of container-city pages (e.g. NYC → boroughs) and on
// state hubs (e.g. California → cities).
//
// No count subhead and no TOC count badge: seeing "5 neighborhoods" or
// "57 cities" isn't useful to someone already drilling in for specificity.
// Uses .children-list modifier for compact multi-column grid.
function renderChildrenSection(children, { id, label }) {
  if (!children.length) return '';
  const sorted = children.slice().sort((a, b) => a.title.localeCompare(b.title));
  const items = sorted
    .map(c => {
      const nameKey = String(c.title || '').toLowerCase();
      return `        <li data-name="${esc(nameKey)}" data-desc=""><a class="name" href="/${esc(c.slug)}">${esc(c.title)}</a></li>`;
    })
    .join('\n');
  return `    <section id="${esc(id)}" class="group-section" data-section="${esc(id)}">
      <h2 class="section-title">${esc(label)}</h2>
      <ol class="groups children-list">
${items}
      </ol>
    </section>`;
}

// Back-compat alias — state hubs still call this. Will consolidate in Phase 5.
function renderChildrenGrid(children, label /* singular/plural no longer used */) {
  return renderChildrenSection(children, { id: 'cities', label });
}

function renderCity(data, { breadcrumbs, children }) {
  const titleTag = `${data.title} — Organize Directory`;
  const description = `Leftist, grassroots, and mutual aid organizations in ${data.title}.`;

  const sections = data.sections.filter(
    s => s.initiatives && s.initiatives.length > 0,
  );
  const totalGroups = sections.reduce((sum, s) => sum + s.initiatives.length, 0);

  // State name for the meta line — walked from breadcrumbs. Skip the synthetic
  // "States" root (slug === 'location') so we surface the actual state
  // (e.g. "New York") instead of the legacy placeholder.
  const realCrumbs = breadcrumbs.filter(c => c.slug !== 'location');
  const stateName = realCrumbs.length ? realCrumbs[0].title : '';

  // Container cities (e.g. NYC) may have child locations (Brooklyn, etc.).
  // Render them as the FIRST section on the page so people looking for
  // specificity can click straight through. City-wide groups follow.
  const hasChildren = children.length > 0;
  const childrenLabel = 'Neighborhoods';
  const childrenHtml = hasChildren
    ? renderChildrenSection(children, {
        id: 'neighborhoods',
        label: childrenLabel,
      })
    : '';

  const sectionsHtml = sections.map(renderGroupSection).join('\n\n');

  // TOC: put "Neighborhoods" at the top when present, then the content sections.
  // hideCount: true on the neighborhoods entry — the badge isn't useful there.
  const tocEntries = [
    ...(hasChildren
      ? [{ id: 'neighborhoods', title: childrenLabel, count: children.length, hideCount: true }]
      : []),
    ...sections.map(s => ({ id: s.id, title: s.title, count: s.initiatives.length })),
  ];
  const tocHtml = renderTocSidebar(tocEntries);

  const metaParts = [
    `<b>${totalGroups}</b> ${pluralize(totalGroups, 'group', 'groups').replace(/^\d+\s/, '')}`,
    stateName ? esc(stateName) : null,
  ].filter(Boolean);
  const metaHtml = metaParts
    .map((p, i) => i === 0 ? p : `<span class="sep" aria-hidden="true">·</span>\n      ${p}`)
    .join('\n      ');

  return `<!DOCTYPE html>
<html lang="en">
<head>
${systemHead({
    title: titleTag,
    description,
    canonicalPath: `/${data.slug}`,
  })}
</head>
<body>
<a href="#main" class="skip">Skip to content</a>
${renderMast()}

<main id="main">

  ${renderBreadcrumb(breadcrumbs, data.title)}

  <div class="page-head">
    <h1 class="title">${esc(data.title)}</h1>
    <p class="meta">
      ${metaHtml}
    </p>
  </div>

  <div class="filter" role="search">
    <label class="skip" for="page-filter">Filter groups in ${esc(data.title)}</label>
    <input id="page-filter" type="search" placeholder="Filter groups in ${esc(data.title)}…" autocomplete="off">
  </div>

  <div class="layout">
${tocHtml}
    <div class="main-col">

      <div id="sections-root">
${childrenHtml ? childrenHtml + '\n\n' : ''}${sectionsHtml}
        <p class="empty" id="empty-state" hidden>No groups match <b id="empty-query"></b>. Try a different search.</p>
      </div>

      ${renderSuggest()}

    </div>
  </div>

</main>

${renderFooter()}

<script src="${assetUrl('/assets/scripts/theme-toggle.js')}" defer></script>
<script src="${assetUrl('/assets/scripts/city-page.js')}" defer></script>

</body>
</html>
`;
}

function renderStateHub(data, { children }) {
  const titleTag = `${data.title} — Organize Directory`;
  const description = `Cities and statewide organizations in ${data.title}.`;

  const sections = (data.sections || []).filter(
    s => s.initiatives && s.initiatives.length > 0,
  );
  const totalStatewide = sections.reduce((s, sec) => s + sec.initiatives.length, 0);

  // Child locations (cities, regions, counties) go at the top as a compact
  // grid, same pattern as NYC → boroughs. Label "Places" since a state's
  // direct children mix cities, counties, and regions (NorCal, Central Coast).
  const hasChildren = children.length > 0;
  const childrenLabel = 'Places';
  const childrenHtml = hasChildren
    ? renderChildrenSection(children, { id: 'places', label: childrenLabel })
    : '';

  const sectionsHtml = sections.map(renderGroupSection).join('\n\n');

  // TOC: "Places" entry first (no count badge), then any named statewide
  // sections. If the state has no named sections, only "Places" would remain,
  // which isn't a useful TOC on its own — drop it and go full-width.
  const namedSections = sections.filter(s => s.id && s.title && s.title.trim());
  const tocEntries = [
    ...(hasChildren
      ? [{ id: 'places', title: childrenLabel, count: children.length, hideCount: true }]
      : []),
    ...namedSections.map(s => ({ id: s.id, title: s.title, count: s.initiatives.length })),
  ];
  const tocHtml = namedSections.length > 0 ? renderTocSidebar(tocEntries) : '';

  const metaHtml = totalStatewide
    ? `<b>${totalStatewide}</b> statewide ${totalStatewide === 1 ? 'group' : 'groups'}`
    : '';
  const metaBlock = metaHtml
    ? `    <p class="meta">\n      ${metaHtml}\n    </p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
${systemHead({
    title: titleTag,
    description,
    canonicalPath: `/${data.slug}`,
  })}
</head>
<body>
<a href="#main" class="skip">Skip to content</a>
${renderMast()}

<main id="main">

  <nav class="crumbs" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span class="sep" aria-hidden="true">/</span>
    <span aria-current="page">${esc(data.title)}</span>
  </nav>

  <div class="page-head">
    <h1 class="title">${esc(data.title)}</h1>
${metaBlock}
  </div>

  <div class="filter" role="search">
    <label class="skip" for="page-filter">Filter ${esc(data.title)}</label>
    <input id="page-filter" type="search" placeholder="Filter ${esc(data.title)}…" autocomplete="off">
  </div>

  <div class="layout">
${tocHtml}
    <div class="main-col">

      <div id="sections-root">
${childrenHtml ? childrenHtml + '\n\n' : ''}${sectionsHtml}
        <p class="empty" id="empty-state" hidden>No places or groups match <b id="empty-query"></b>. Try a different search.</p>
      </div>

      ${renderSuggest()}

    </div>
  </div>

</main>

${renderFooter()}

<script src="${assetUrl('/assets/scripts/theme-toggle.js')}" defer></script>
<script src="${assetUrl('/assets/scripts/city-page.js')}" defer></script>

</body>
</html>
`;
}

function renderTopicPage(data) {
  const titleTag = `${data.title} — Organize Directory`;
  const description = data.subtitle || `Organizations and initiatives focused on ${data.title}.`;

  const sections = data.sections.filter(
    s => s.initiatives && s.initiatives.length > 0,
  );
  const totalGroups = sections.reduce((s, sec) => s + sec.initiatives.length, 0);

  const sectionsHtml = sections.map(renderGroupSection).join('\n\n');

  // TOC sidebar only when there's more than one named section — a single-
  // section topic (the common case) renders flat with no sidebar.
  const tocEntries = sections.map(s => ({
    id: s.id,
    title: s.title,
    count: s.initiatives.length,
  }));
  const tocHtml = tocEntries.length > 1 ? renderTocSidebar(tocEntries) : '';

  const subtitleHtml = data.subtitle
    ? `  <p class="topic-lede">${esc(data.subtitle)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
${systemHead({
    title: titleTag,
    description,
    canonicalPath: `/topics/${data.slug}`,
  })}
</head>
<body>
<a href="#main" class="skip">Skip to content</a>
${renderMast()}

<main id="main">

  <nav class="crumbs" aria-label="Breadcrumb">
    <a href="/">Home</a>
    <span class="sep" aria-hidden="true">/</span>
    <a href="/topics">Topics</a>
    <span class="sep" aria-hidden="true">/</span>
    <span aria-current="page">${esc(data.title)}</span>
  </nav>

  <div class="page-head">
    <h1 class="title">${esc(data.title)}</h1>
    <p class="meta"><b>${totalGroups}</b> ${pluralize(totalGroups, 'group', 'groups').replace(/^\d+\s/, '')}</p>
  </div>

${subtitleHtml}

  <div class="filter" role="search">
    <label class="skip" for="page-filter">Filter groups in ${esc(data.title)}</label>
    <input id="page-filter" type="search" placeholder="Filter groups…" autocomplete="off">
  </div>

  <div class="layout">
${tocHtml}
    <div class="main-col">

      <div id="sections-root">
${sectionsHtml}
        <p class="empty" id="empty-state" hidden>No groups match <b id="empty-query"></b>. Try a different search.</p>
      </div>

      ${renderSuggest()}

    </div>
  </div>

</main>

${renderFooter()}

<script src="${assetUrl('/assets/scripts/theme-toggle.js')}" defer></script>
<script src="${assetUrl('/assets/scripts/city-page.js')}" defer></script>

</body>
</html>
`;
}

function renderHome(stats) {
  const titleTag = 'Organize Directory';
  const description = "An (incomplete) list of leftist and grassroots groups in the US. Find your people and get to work.";

  return `<!DOCTYPE html>
<html lang="en">
<head>
${systemHead({
    title: titleTag,
    description,
    canonicalPath: '/',
  })}
</head>
<body>
<a href="#main" class="skip">Skip to content</a>
${renderMast()}

<main id="main" class="hero">
  <div class="hero-inner">
    <h1 class="hl">Don't <span class="soft">despair.</span><br><span class="warm">Organize.<svg class="underline" viewBox="0 0 300 16" preserveAspectRatio="none" aria-hidden="true" focusable="false"><path d="M4 10 C 60 2, 120 14, 180 6 S 280 10, 296 8" fill="none" stroke="currentColor" stroke-width="4" stroke-linecap="round"/></svg></span></h1>
    <p class="sub">An (incomplete) list of leftist and grassroots groups in the US. Find your people and get to work.</p>

    <div class="doors">
      <form class="search" role="search" action="/search" method="get" onsubmit="event.preventDefault()">
        <label class="skip" for="site-search">Search the directory</label>
        <input id="site-search" name="q" type="search" placeholder="Search city, state, issue, or group…" autocomplete="off">
        <button type="submit" aria-label="Search">Go <span aria-hidden="true">→</span></button>
      </form>

      <div class="cta-row">
        <a href="/location" class="btn primary">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
          Find Local Groups
        </a>
        <a href="/topics" class="btn ghost">
          <svg aria-hidden="true" focusable="false" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
          Browse by Issue
        </a>
      </div>
    </div>

    <p class="stats"><b>${fmt(stats.groups)}</b> groups<span class="sep" aria-hidden="true">·</span><b>${fmt(stats.cities)}</b> cities<span class="sep" aria-hidden="true">·</span><b>${fmt(stats.categories)}</b> topics</p>
  </div>
</main>

${renderFooter()}

<script src="${assetUrl('/assets/scripts/theme-toggle.js')}" defer></script>
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
    '# States',
    ...sortedStates.map(slug => `/${slug}\t/states/${slug}.html\t200`),
    '',
    '# Cities',
    ...sortedLocations.map(slug => `/${slug}\t/cities/${slug}.html\t200`),
    '',
  ].join('\n');

  return { text, sortedLocations, sortedStates };
}

function buildSitemap(sortedStates, sortedLocations, topicIndex) {
  const today = new Date().toISOString().split('T')[0];
  const SITE = 'https://organize.directory';
  const STATIC_PAGES = ['/', '/location', '/topics', '/guides', '/contact', '/subscribe', '/add'];
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
  // (analytics, title-search, title-index, newsletter-form, generate-titles-index)
  await copyIfExists(path.join(ROOT, 'js'), path.join(previewRoot, 'js'));

  // Form validation helper used by contact.js and newsletter-form.js
  await copyIfExists(path.join(ROOT, 'utils'), path.join(previewRoot, 'utils'));

  // Hand-maintained static pages on the new design system. Copied in so the nav
  // (`/location`, `/topics`, `/contact`, `/subscribe`) doesn't 404 locally.
  for (const f of [
    'location.html',
    'topics.html',
    'contact.html',
    'subscribe.html',
    'thank-you.html',
    'guides.html',
    'add.html',
    '404.html',
    'contact.js',
  ]) {
    await copyIfExists(path.join(ROOT, f), path.join(previewRoot, f));
  }

  // Favicons + manifest + og-image
  for (const f of [
    'apple-touch-icon.png',
    'favicon-32x32.png',
    'favicon-16x16.png',
    'favicon.ico',
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

  const homeHtml = renderHome(stats);

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

  const homeHtml = renderHome(stats);

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
