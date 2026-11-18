#!/usr/bin/env node
// Copies only the files that make up the website into dist/, so the repo's
// working files (scripts/, package.json, README.md, .claude/, …) are never
// published. Cloudflare Pages runs this as its build command and serves dist/.
//
// This does NOT regenerate any pages: scripts/build.js (JSON → HTML) is run by
// you or the CMS, and its output is committed. This script just picks the
// committed site files out of the repo.
//
// Uses only Node built-ins so it works on Cloudflare with no extra setup.
//
// It is a whitelist on purpose: anything not listed below is not published.
// That means a NEW site file must be added here, or it silently won't go live.
// To catch the most likely case (a new top-level page), the script stops with
// an error if a top-level .html file is in neither list.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');

// Single files copied to the same path in dist/.
const FILES = [
  // pages
  'index.html', 'location.html', 'topics.html', 'guides.html', 'add.html', '404.html',
  // Cloudflare Pages config + crawler files
  '_headers', '_redirects', 'robots.txt', 'sitemap.xml',
  // icons, logo, share image, manifest
  'site.webmanifest', 'favicon.ico', 'favicon.svg', 'favicon-16x16.png', 'favicon-32x32.png',
  'apple-touch-icon.png', 'android-chrome-192x192.png', 'android-chrome-512x512.png',
  'logo.png', 'logo.svg', 'preview.png',
  // the two scripts the pages load (js/ also holds dev-only files, so no whole folder)
  'js/analytics.js', 'js/title-search.js',
];

// Whole folders copied as they are.
//   data/ stays public: the header search reads data/title-index.json, and the
//   JSON content has always been served (with CORS open, see _headers).
const DIRS = ['cities', 'states', 'topics', 'assets', 'data'];

// Top-level .html files that deliberately are NOT published.
const HTML_NOT_PUBLISHED = ['design-system.html']; // local design exploration, gitignored

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    if (entry.name === '.DS_Store') continue;
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(s, d);
    else if (entry.isFile()) fs.copyFileSync(s, d);
  }
}

// 1. Stop on a top-level page nobody has classified.
const unclassified = fs.readdirSync(ROOT).filter(
  f => f.endsWith('.html') && !FILES.includes(f) && !HTML_NOT_PUBLISHED.includes(f),
);
if (unclassified.length) {
  console.error(
    `make-dist: top-level page(s) not in the publish list: ${unclassified.join(', ')}\n` +
    `Add each to FILES (to publish it) or HTML_NOT_PUBLISHED (to keep it out) in scripts/make-dist.js.`,
  );
  process.exit(1);
}

// 2. Every listed file/folder must exist, so a missing _headers or page fails
//    the build (and Cloudflare keeps serving the last good deploy) instead of
//    shipping a broken site.
const missing = [...FILES, ...DIRS].filter(p => !fs.existsSync(path.join(ROOT, p)));
if (missing.length) {
  console.error(`make-dist: missing from the repo: ${missing.join(', ')}`);
  process.exit(1);
}

// 3. Start clean so deleted pages don't linger, then copy.
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });
for (const f of FILES) {
  fs.mkdirSync(path.dirname(path.join(DIST, f)), { recursive: true });
  fs.copyFileSync(path.join(ROOT, f), path.join(DIST, f));
}
for (const d of DIRS) copyDir(path.join(ROOT, d), path.join(DIST, d));

// 4. Count what went in.
let count = 0;
(function walk(dir) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    if (e.isDirectory()) walk(path.join(dir, e.name)); else count++;
  }
})(DIST);
console.log(`make-dist: ${count} files copied to dist/`);
