/**
 * build.js
 *
 * Generates static HTML from JSON data files.
 *
 * Reads:   data/locations/*.json, data/states/*.json, data/topics/*.json
 * Writes:  cities/*.html, states/*.html, topics/*.html
 *          data/title-index.json  (for search)
 *
 * Run with: node scripts/build.js
 * Add --dry-run to skip writing files (prints counts only).
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DRY_RUN = process.argv.includes('--dry-run');

// ─── HTML Helpers ────────────────────────────────────────────────────────────

function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function sharedHead({ title, description, ogTitle, ogDescription, canonicalPath, sidebarType }) {
  return `
  <!-- Google Analytics -->
  <script src="/js/analytics.js" defer></script>

  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
  <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
  <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
  <link rel="manifest" href="/site.webmanifest">

  <title>${esc(title)}</title>
  <meta name="description" content="${esc(description)}">
  <link rel="canonical" href="https://organize.directory${canonicalPath}">

  <!-- Open Graph / Social Media -->
  <meta property="og:title" content="${esc(ogTitle || title)}">
  <meta property="og:description" content="${esc(ogDescription || description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="https://organize.directory${canonicalPath}">
  <meta property="og:image" content="https://organize.directory/preview.png">
  <meta name="twitter:card" content="summary">

  <!-- Styles -->
  <link rel="stylesheet" href="/styles.css">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="/fonts/fonts.css">

  <!-- Initialize Components -->
  <script type="module">
    import { initializeSidebar } from '/components/sidebar.js';
    import { initializeComponents } from '/utils/init.js';
    initializeSidebar('${sidebarType}');
    initializeComponents({});
  </script>
  <script src="/js/mobile-optimizations.js" defer></script>`.trimStart();
}

function renderInitiative(init) {
  const desc = init.description
    ? `\n      <p>${esc(init.description)}</p>`
    : '';
  // Treat http(s) URLs as external — open in a new tab and protect against
  // tabnabbing on the user-supplied URL. Same-origin or hash links stay default.
  const url = String(init.url || '');
  const externalAttrs = /^https?:\/\//i.test(url)
    ? ' target="_blank" rel="noopener noreferrer"'
    : '';
  return `    <div class="initiative">
      <a href="${esc(url)}"${externalAttrs}>${esc(init.name)}</a>${desc}
    </div>`;
}

function renderSection(section) {
  const heading = section.title ? `\n    <h2>${esc(section.title)}</h2>` : '';
  const initiatives = section.initiatives.map(renderInitiative).join('\n');
  const idAttr = section.id ? ` id="${esc(section.id)}"` : '';
  const classAttr = section.id ? ' class="city-section"' : '';
  return `  <section${idAttr}${classAttr}>${heading}\n${initiatives}\n  </section>`;
}

function renderToc(sections) {
  const items = sections
    .filter(s => s.initiatives.length > 0 && s.id)
    .map((s, i) => `          <li class="toc-item">
            <a href="#${esc(s.id)}" class="toc-link">
              <span class="toc-number">${i + 1}.</span>
              <span class="toc-text">${esc(s.title || s.id)}</span>
            </a>
          </li>`)
    .join('\n');
  return `        <aside class="toc-container">
          <nav class="toc" role="navigation" aria-label="Table of Contents" id="toc">
            <ul class="toc-list">
${items}
            </ul>
          </nav>
        </aside>`;
}

function renderChildrenList(children) {
  if (!children.length) return '';
  const links = children
    .sort((a, b) => a.title.localeCompare(b.title))
    .map(c => `          <a href="/${esc(c.slug)}" class="city-link location-link-base">${esc(c.title)}</a>`)
    .join('\n');
  return `  <section>
    <div class="cities-list">
      <h2>Locations</h2>
      <div class="city-links-container">
${links}
      </div>
    </div>
  </section>`;
}

function renderBreadcrumbs(crumbs, currentTitle) {
  const parts = crumbs.map(c => `<a href="/${esc(c.slug)}">${esc(c.title)}</a>`);
  parts.push(`<span>${esc(currentTitle)}</span>`);
  const inner = parts.join('\n          <span>›</span>\n          ');
  return `<div class="breadcrumb">
          ${inner}
        </div>`;
}

// ─── Page Templates ──────────────────────────────────────────────────────────

function renderLocation(data, { breadcrumbs, children }) {
  const hasMultipleSections = data.sections.filter(s => s.initiatives.length > 0).length > 1;
  const hasToc = hasMultipleSections && data.sections.every(s => s.id);

  const titleTag = `${data.title} Mutual Aid Networks - Local Support & Community Resources`;
  const description = `Find mutual aid initiatives and community support networks in ${data.title}. Connect with local organizations and community resources.`;

  const breadcrumbHtml = breadcrumbs.length
    ? renderBreadcrumbs(breadcrumbs, data.title)
    : `<div class="breadcrumb"><a href="/location">States</a><span>›</span><span>${esc(data.title)}</span></div>`;

  const sectionsHtml = [
    ...data.sections.map(renderSection),
    children.length ? renderChildrenList(children) : '',
  ].filter(Boolean).join('\n\n');

  const tocHtml = hasToc ? renderToc(data.sections) : '';
  const wrapperOpen = hasToc ? '<div class="content-wrapper">' : '';
  const wrapperClose = hasToc ? '</div>' : '';

  return `<!DOCTYPE html>
<html lang="en">

<head>
${sharedHead({
    title: titleTag,
    description,
    ogTitle: titleTag,
    ogDescription: description,
    canonicalPath: `/${data.slug}`,
    sidebarType: 'location',
  })}
</head>

<body>
  <div class="layout">
    <div id="sidebar-placeholder"></div>

    <main class="content" role="main">
      ${wrapperOpen}
      <div class="city-page">
        ${breadcrumbHtml}

        <h1>${esc(data.title)}</h1>

        <div class="city-content">
${sectionsHtml}
        </div>
      </div>
${tocHtml}
      ${wrapperClose}
    </main>
  </div>

  <script src="/js/initiative-collapsible.js" defer></script>
  ${hasToc ? '<script src="/js/city-toc.js" defer></script>' : ''}
</body>

</html>
`;
}

function renderState(data, { children }) {
  const titleTag = `${data.title} Mutual Aid Networks - Local Support & Community Resources`;
  const description = `Find mutual aid networks and community support initiatives in ${data.title}. Connect with local organizations and community resources.`;

  const breadcrumbHtml = `<div class="breadcrumb">
          <a href="/location">States</a>
          <span>›</span>
          <span>${esc(data.title)}</span>
        </div>`;

  const childrenHtml = children.length ? renderChildrenList(children) : '';
  const sectionsHtml = data.sections.map(renderSection).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">

<head>
${sharedHead({
    title: titleTag,
    description,
    ogTitle: titleTag,
    ogDescription: description,
    canonicalPath: `/${data.slug}`,
    sidebarType: 'location',
  })}
</head>

<body>
  <div class="layout">
    <div id="sidebar-placeholder"></div>

    <main class="content" role="main">
      <div class="city-page state-page">
        ${breadcrumbHtml}

        <h1>${esc(data.title)}</h1>

${childrenHtml}

${sectionsHtml}
      </div>
    </main>
  </div>

  <script src="/js/initiative-collapsible.js" defer></script>
</body>

</html>
`;
}

function renderTopic(data) {
  const titleTag = `${data.title} - The Organize Directory`;
  const description = data.subtitle || `Find organizations and initiatives focused on ${data.title}.`;

  const subtitleHtml = data.subtitle
    ? `\n        <p class="subtitle">${esc(data.subtitle)}</p>`
    : '';

  const sectionsHtml = data.sections.map(renderSection).join('\n\n');

  return `<!DOCTYPE html>
<html lang="en">

<head>
${sharedHead({
    title: titleTag,
    description,
    ogTitle: titleTag,
    ogDescription: description,
    canonicalPath: `/topics/${data.slug}`,
    sidebarType: 'topics',
  })}
</head>

<body>
  <div class="layout">
    <div id="sidebar-placeholder"></div>

    <main class="content" role="main">
      <div class="city-page state-page">
        <div class="breadcrumb">
          <a href="/topics">Topics</a>
          <span>›</span>
          <span>${esc(data.title)}</span>
        </div>

        <h1>${esc(data.title)}</h1>${subtitleHtml}

${sectionsHtml}
      </div>
    </main>
  </div>

  <script src="/js/initiative-collapsible.js" defer></script>
</body>

</html>
`;
}

// ─── Data Loading ─────────────────────────────────────────────────────────────

async function loadDir(dir) {
  const files = (await fs.readdir(dir)).filter(f => f.endsWith('.json'));
  const entries = await Promise.all(
    files.map(async f => {
      const data = JSON.parse(await fs.readFile(path.join(dir, f), 'utf-8'));
      return [data.slug, data];
    })
  );
  return Object.fromEntries(entries);
}

// ─── Breadcrumb chain builder ─────────────────────────────────────────────────

function buildBreadcrumbs(slug, locationIndex, stateIndex) {
  // Walk parent chain from current slug upward, collecting crumbs in reverse
  const crumbs = [];
  const visited = new Set([slug]); // guard against circular parent refs
  let parentSlug = locationIndex[slug]?.parent;

  while (parentSlug && !visited.has(parentSlug)) {
    visited.add(parentSlug);
    const parentData = locationIndex[parentSlug] || stateIndex[parentSlug];
    if (!parentData) break;
    crumbs.unshift({ slug: parentSlug, title: parentData.title });
    parentSlug = parentData.parent || null;
  }

  // If first crumb is a state, prepend the "States" root
  if (crumbs.length && stateIndex[crumbs[0].slug]) {
    crumbs.unshift({ slug: 'location', title: 'States' });
  }

  return crumbs;
}

// Write files in batches to avoid overwhelming the filesystem
async function writeBatch(pairs) {
  const BATCH = 20;
  for (let i = 0; i < pairs.length; i += BATCH) {
    await Promise.all(
      pairs.slice(i, i + BATCH).map(([outPath, html]) => fs.writeFile(outPath, html, 'utf-8'))
    );
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function run() {
  console.log(DRY_RUN ? '🔍 DRY RUN\n' : '🏗  Building HTML from JSON\n');

  const [locationIndex, stateIndex, topicIndex] = await Promise.all([
    loadDir(path.join(ROOT, 'data/locations')),
    loadDir(path.join(ROOT, 'data/states')),
    loadDir(path.join(ROOT, 'data/topics')),
  ]);
  console.log(`Loaded ${Object.keys(locationIndex).length} locations, ${Object.keys(stateIndex).length} states, ${Object.keys(topicIndex).length} topics`);

  // Build parent → children map (locations only)
  const childrenOf = {}; // slug → [{ slug, title }]
  for (const loc of Object.values(locationIndex)) {
    if (loc.parent) {
      (childrenOf[loc.parent] ||= []).push({ slug: loc.slug, title: loc.title });
    }
  }

  // ── Generate all HTML ────────────────────────────────────────────────────────
  const locationPairs = [];
  for (const data of Object.values(locationIndex)) {
    try {
      const breadcrumbs = buildBreadcrumbs(data.slug, locationIndex, stateIndex);
      const children = childrenOf[data.slug] || [];
      const html = renderLocation(data, { breadcrumbs, children });
      locationPairs.push([path.join(ROOT, 'cities', `${data.slug}.html`), html]);
    } catch (err) {
      process.stderr.write(`ERROR rendering location ${data.slug}: ${err.message}\n`);
    }
  }
  console.log(`Rendered ${locationPairs.length} locations`);

  const statePairs = [];
  for (const data of Object.values(stateIndex)) {
    try {
      const children = childrenOf[data.slug] || [];
      const html = renderState(data, { children });
      statePairs.push([path.join(ROOT, 'states', `${data.slug}.html`), html]);
    } catch (err) {
      process.stderr.write(`ERROR rendering state ${data.slug}: ${err.message}\n`);
    }
  }
  console.log(`Rendered ${statePairs.length} states`);

  const topicPairs = [];
  for (const data of Object.values(topicIndex)) {
    try {
      const html = renderTopic(data);
      topicPairs.push([path.join(ROOT, 'topics', `${data.slug}.html`), html]);
    } catch (err) {
      process.stderr.write(`ERROR rendering topic ${data.slug}: ${err.message}\n`);
    }
  }
  console.log(`Rendered ${topicPairs.length} topics`);

  // ── title-index.json ────────────────────────────────────────────────────────
  const titleIndex = [
    ...Object.values(locationIndex).map(d => ({ slug: d.slug, title: d.title, type: 'location' })),
    ...Object.values(stateIndex).map(d => ({ slug: d.slug, title: d.title, type: 'state' })),
    ...Object.values(topicIndex).map(d => ({ slug: d.slug, title: d.title, type: 'topic' })),
  ].sort((a, b) => a.title.localeCompare(b.title));

  // ── _redirects (Cloudflare Pages) ──────────────────────────────────────────
  // Pages automatically resolves /foo → /foo.html for top-level files and for
  // anything in-directory (/states/california → /states/california.html), so the
  // only mappings we need are the bare-slug clean URLs that expand to /cities/*
  // and /states/*. Sorting keeps output stable between builds (cleaner diffs).
  //
  // States are listed FIRST so they win when a city and a state share a slug
  // (e.g. /washington → state, not the small Washington-DC city page). The first
  // matching rule wins in Cloudflare Pages _redirects.
  const sortedLocations = Object.values(locationIndex).map(d => d.slug).sort();
  const sortedStates = Object.values(stateIndex).map(d => d.slug).sort();

  // Warn loudly on slug collisions — they hide real data bugs.
  const stateSet = new Set(sortedStates);
  const collisions = sortedLocations.filter(slug => stateSet.has(slug));
  if (collisions.length) {
    process.stderr.write(
      `\n⚠️  Slug collisions between cities and states (state will win in _redirects):\n` +
      collisions.map(s => `   /${s}  ←  data/locations/${s}.json  vs  data/states/${s}.json`).join('\n') +
      '\n   Recommend renaming the city slug or merging into the state.\n\n'
    );
  }

  const redirectsText = [
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

  // ── Stats (groups / cities / categories) ────────────────────────────────────
  // Used both to inject into index.html and to write data/stats.json so other
  // pages or scripts can consume the same source-of-truth.
  const countInitiatives = data => data.sections.reduce(
    (sum, s) => sum + (s.initiatives ? s.initiatives.length : 0),
    0,
  );
  const stats = {
    groups:
      Object.values(locationIndex).reduce((s, d) => s + countInitiatives(d), 0) +
      Object.values(stateIndex).reduce((s, d) => s + countInitiatives(d), 0) +
      Object.values(topicIndex).reduce((s, d) => s + countInitiatives(d), 0),
    cities: Object.keys(locationIndex).length,
    categories: Object.keys(topicIndex).length,
    generatedAt: new Date().toISOString(),
  };

  // ── sitemap.xml + robots.txt ─────────────────────────────────────────────────
  // Search engines need an explicit map of every canonical URL. We list the
  // hand-maintained top-level pages plus every generated city / state / topic
  // at its clean URL (matching the canonical tags injected into each page).
  const today = new Date().toISOString().split('T')[0];
  const SITE = 'https://organize.directory';
  const STATIC_PAGES = ['/', '/location', '/topics', '/guides', '/contact', '/subscribe'];
  const sitemapUrls = [
    ...STATIC_PAGES.map(p => ({ loc: SITE + p, priority: p === '/' ? '1.0' : '0.8' })),
    ...sortedStates.map(slug => ({ loc: `${SITE}/${slug}`, priority: '0.7' })),
    ...sortedLocations.map(slug => ({ loc: `${SITE}/${slug}`, priority: '0.6' })),
    ...Object.values(topicIndex).map(d => d.slug).sort()
      .map(slug => ({ loc: `${SITE}/topics/${slug}`, priority: '0.6' })),
  ];
  const sitemapXml = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...sitemapUrls.map(u =>
      `  <url><loc>${u.loc}</loc><lastmod>${today}</lastmod><changefreq>weekly</changefreq><priority>${u.priority}</priority></url>`
    ),
    '</urlset>',
    '',
  ].join('\n');

  const robotsText = [
    'User-agent: *',
    'Allow: /',
    '',
    `Sitemap: ${SITE}/sitemap.xml`,
    '',
  ].join('\n');

  // ── Homepage stat injection ─────────────────────────────────────────────────
  // Replace the hardcoded numbers in index.html so the GROUPS / CITIES /
  // CATEGORIES tiles always reflect the current data. Anchored on the label so
  // the substitution is order-independent and survives layout tweaks.
  let indexHtml = await fs.readFile(path.join(ROOT, 'index.html'), 'utf-8');
  const fmt = n => n.toLocaleString('en-US');
  const replaceStat = (html, label, value) => html
    .replace(
      new RegExp(`(<span class="stat-number">)[\\d,]+(</span>\\s*<span class="stat-label">${label}</span>)`),
      `$1${fmt(value)}$2`,
    )
    .replace(
      new RegExp(`(<span class="stat-mobile-label">${label}: )[\\d,]+(</span>)`),
      `$1${fmt(value)}$2`,
    );
  indexHtml = replaceStat(indexHtml, 'GROUPS', stats.groups);
  indexHtml = replaceStat(indexHtml, 'CITIES', stats.cities);
  indexHtml = replaceStat(indexHtml, 'CATEGORIES', stats.categories);

  if (!DRY_RUN) {
    console.log('Writing locations...');
    await writeBatch(locationPairs);
    console.log('Writing states...');
    await writeBatch(statePairs);
    console.log('Writing topics...');
    await writeBatch(topicPairs);
    await fs.writeFile(
      path.join(ROOT, 'data', 'title-index.json'),
      JSON.stringify(titleIndex, null, 2),
      'utf-8'
    );
    console.log('Wrote title-index.json');
    await fs.writeFile(path.join(ROOT, '_redirects'), redirectsText, 'utf-8');
    console.log(`Wrote _redirects (${sortedLocations.length + sortedStates.length} rules)`);
    await fs.writeFile(path.join(ROOT, 'sitemap.xml'), sitemapXml, 'utf-8');
    console.log(`Wrote sitemap.xml (${sitemapUrls.length} urls)`);
    await fs.writeFile(path.join(ROOT, 'robots.txt'), robotsText, 'utf-8');
    console.log('Wrote robots.txt');
    await fs.writeFile(
      path.join(ROOT, 'data', 'stats.json'),
      JSON.stringify(stats, null, 2),
      'utf-8'
    );
    console.log(`Wrote data/stats.json (${stats.groups} groups, ${stats.cities} cities, ${stats.categories} categories)`);
    await fs.writeFile(path.join(ROOT, 'index.html'), indexHtml, 'utf-8');
    console.log('Updated index.html stats');
  }

  const total = Object.keys(locationIndex).length + Object.keys(stateIndex).length + Object.keys(topicIndex).length;
  console.log(`\n── Summary ──
  Locations : ${Object.keys(locationIndex).length}
  States    : ${Object.keys(stateIndex).length}
  Topics    : ${Object.keys(topicIndex).length}
  Total     : ${total}
  Groups    : ${stats.groups}
  Written   : ${DRY_RUN ? '(dry run)' : total + 5}
`);
}

run().catch(err => {
  console.error('Build failed:', err);
  process.exit(1);
});
