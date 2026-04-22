# Code Review — organize.directory

A brutally-honest pass over the repo as it stands today. Grouped by severity. File and line references are where I actually looked, so you can jump straight to them.

The TL;DR: the content model and the static-site build (`scripts/build.js` + `data/*.json`) are the good bones of this project. Almost everything wrapped around them — the Cloudflare middleware, the form plumbing, the sidebar/mobile-menu tangle, the inline style soup — is doing more harm than good. Ripping ~40% of the JS and consolidating the routing would probably leave the site faster, cleaner, and easier to reason about.

---

## Critical — fix before anyone else sees it

### 1. Three form handlers, two of them dead; one of them leaks stack traces
You have **three** server-side form endpoints and a direct-to-Web3Forms client form, and they don't agree with each other.

- `contact.html:94` and `subscribe.html` post **directly** to `https://api.web3forms.com/submit` with the Web3Forms access key as a hidden input. This is how Web3Forms is designed to work — the key is public by design. Fine.
- `functions/api/submit.js` is a Cloudflare Function that also calls Web3Forms with the **same hardcoded key**. Nothing in the HTML or client JS posts to `/api/submit`. It is dead code.
- `functions/form.js` and `functions/contact.js` are two more handlers that just `console.log` the submission and 302 redirect. Also unreferenced. Dead.
- `form-handler/src/index.js` is a separate Worker that calls **MailChannels** (`api.mailchannels.net`). Cloudflare's free MailChannels integration was shut down in mid-2024; this would no-op even if anything called it. Also: the `fetch` result isn't checked, so failures are silently swallowed. `form-handler/index.js` is empty.

Three of four endpoints should be deleted. While you're in there: `functions/api/submit.js:190` returns `err.stack` to the client on 500. That's a classic info-disclosure footgun — never ship stack traces to the public. Kill the file entirely if you keep the direct-to-Web3Forms approach.

### 2. The "captcha" is theater and the honeypot is broken
`contact.js:54-65` generates `num1 + num2` in JavaScript and stores the answer in a **hidden input** (`contact.html:152`). A bot posting directly to Web3Forms doesn't load your JS; a bot that does can read `#captchaAnswer` directly. This stops zero spam.

The "honeypot" is a `<input type="checkbox" name="botcheck" style="display:none">` — checkboxes are not what bots auto-fill. The standard honeypot pattern is a **text input** named something like `website` or `url`, hidden via off-screen CSS, and you reject any submission where it's non-empty. The `csrf_token` hidden field set to the literal string `"true"` (`contact.html:111`) is also not a CSRF token — it's just a string called one.

Rely on Web3Forms' own built-in spam filters, add a proper honeypot text field, and drop the math puzzle. Or put Cloudflare Turnstile on the form.

### 3. `_routes.json` is half-invented
The `src`/`dest` pattern at `_routes.json:3-30` is **not a Cloudflare Pages feature**. Cloudflare's `_routes.json` schema only has `version`, `include`, and `exclude` — everything with `src`/`dest` is silently ignored. You're getting routing behavior from `functions/_middleware.js`, not from `_routes.json`. This is a time bomb: if someone "cleans up" middleware thinking the routes file does the job, the site breaks.

Either delete the `routes` array entirely and move everything to `_redirects`:
```
/cities/:slug /cities/:slug.html 200
/states/:slug /states/:slug.html 200
/topics/:slug /topics/:slug.html 200
/posts/:slug /posts/:slug.html 200
```
…or leave middleware as the source of truth but drop the fake routes so the file stops lying about what it does.

### 4. `functions/_middleware.js` is the wrong tool for the job, running on every request
This file (`functions/_middleware.js`, ~780 lines) hardcodes a **list of every city and state name** (lines 89-683, 695-746). That list has to be kept in sync by hand with `data/locations/*.json` and `cities/*.html` every time a city is added. I counted 356 HTML files in `cities/` but ~540 names in the hardcoded array — they are already out of sync.

Worse, the middleware calls `fetch(newUrl)` against its own origin for every clean-URL request (lines 53, 59, 73, 84, 90, 690, 751). You pay Worker CPU time + an asset request per page view, then **cache the response in `caches.default`** overriding whatever `_headers` says. That's why you have `Cache-Control: no-store` on `index.html` and `styles.css` yet the middleware is shoving responses into the edge cache anyway. The comments in `_headers` even admit the `styles.css` rule is "for debugging."

Replace this entire file with a Pages `_redirects` file (as in #3). `_redirects` rewrites run at the edge, don't invoke a Worker, don't double-fetch, and don't need a hardcoded city list.

### 5. Two different pieces of code wire up the mobile menu, and they fight each other
- `mobile-menu.js` (root): on `DOMContentLoaded`, `setTimeout(setupMobileMenu, 500)` — then polls (`setTimeout(setupMobileMenu, 500)` at line 96) until it finds the sidebar. Binds click on `.mobile-menu-button`. Injects a `<style id="mobile-menu-styles">` with the same `.mobile-menu-button` rule **twice** (lines 103-124 and 155-159).
- `components/sidebar.js` `setupMobileToggle()` (lines 181-232): also grabs `.mobile-menu-button`, also binds click, uses the `cloneNode(true)` trick to "remove existing listeners," which will clobber whichever handler registered first.

On top of that, `components/sidebar.js:292-323` has `ensureSidebarFooterPosition()` which applies the footer's positioning via `Object.assign(footer.style, …)` with `setTimeout(100)`, duplicating the inline `style="…"` already in the template string at line 20, which is ALSO presumably in `css/sidebar.css`. Triple-redundant.

This is the #1 smell-signature of a vibecoded UI: when something doesn't work, the fix is to apply the style a fourth way instead of debugging which of the previous three is wrong. Pick one mechanism (CSS file), delete the other two, and watch things get more reliable, not less.

### 6. `js/title-search.js` has two unescaped `innerHTML` injections
`handleSearchInput` at line 242-247 builds result items with
```js
resultItem.innerHTML = `<div class="result-title">${highlightMatch(result.title, query)}</div><div class="result-type">${...}</div>`;
```
and `highlightMatch` (line 257-259) does `text.replace(regex, '<span class="highlight">$1</span>')` on `result.title`. `result.title` comes from `data/title-index.json`, which is built from your data files, which are populated from submissions. Today it's trusted; as soon as user-submitted titles make it into the index, you have stored XSS. Same pattern in `js/posts.js:24` and `js/render-initiatives.js:10`.

Fix now, not later: escape with `textContent` for text nodes and build the wrapping DOM with `createElement`. The `scripts/build.js` template already has an `esc()` helper — use that pattern everywhere, or just stop using `innerHTML` for user-originated data.

Also: the regex `new RegExp(query, 'gi')` will throw on queries containing unescaped regex metacharacters (`foo (bar` → SyntaxError → no results rendered). Escape the query before building the regex.

### 7. Web3Forms endpoint is open CORS with no rate limit
`functions/api/submit.js:8-12` sets `Access-Control-Allow-Origin: *` with no origin check and no rate limiting. Even though this endpoint is dead code, if you ever wire it up, anyone can fire arbitrary messages through your Web3Forms account from any browser. Either scope the CORS header to your own origin, require a CSRF-style same-origin token, or delete the endpoint (recommended).

---

## High — real problems, fix soon

### 8. No `sitemap.xml`, no `robots.txt`, no `<link rel="canonical">` on a 450-page directory site
This is a directory. Its entire purpose is SEO surface area. Yet:
- `robots.txt` and `sitemap.xml` don't exist in the repo.
- `grep -l 'rel="canonical"'` on the HTML files returns nothing.
- Pages have `og:url` set to the clean URL (e.g. `https://organize.directory/chicago`), but the same content is reachable at `/chicago`, `/cities/chicago`, and `/cities/chicago.html`. Without canonical tags Google will guess — and guess wrong.

For a site this size this is the single biggest thing holding traffic back. Generate the sitemap in `scripts/build.js` (you already have the full URL list in memory), add a canonical tag to every page template, and add a `robots.txt` that points to the sitemap.

### 9. The homepage stats are hardcoded lies
`index.html:171-184`:
```html
<span class="stat-number">2,466</span> <span class="stat-label">GROUPS</span>
<span class="stat-number">343</span>   <span class="stat-label">CITIES</span>
<span class="stat-number">41</span>    <span class="stat-label">CATEGORIES</span>
```
`cities/` has 356 files, `topics/` has 41 (OK), and nobody updates the "2,466" when data changes. Either compute these in `scripts/build.js` and inject them, or delete the section. `scripts/count-initiatives.js` already does the counting — wire its output into the build.

### 10. `styles.css` is set to `no-store` in production
`_headers`:
```
/styles.css
  Cache-Control: no-store, no-cache, must-revalidate
  ...
```
with a comment explaining "no caching for debugging." Every page load re-downloads 96KB of CSS. Remove the override, use `Cache-Control: public, max-age=31536000, immutable` like your other static assets, and rely on the `?v=1.1.9` cache-bust query. (Better: ditch the query string and rename the file — query-string cache-busting doesn't play nicely with all CDN configurations, and you have five different versions floating around: `v=1.0.1`, `v=1.0.3`, `v=1.0.6`, `v=1.0.9`, `v=1.1.9`.)

Homepage (`index.html`) also has `Cache-Control: no-store, no-cache` via `_headers`. That's probably not what you want either; `max-age=600, stale-while-revalidate` is plenty for a site where new data ships via build.

### 11. `index.html` preloads the stylesheet three times
Lines 9, 10-24 (inline JS that appends *another* `<link rel="preload">` for the same URL), and 84 (the real `<link rel="stylesheet">`). Delete lines 10-24 entirely; the `<link rel="preload">` at line 9 is the only one you need, and if you're linking the stylesheet synchronously right after anyway, you don't even need that.

### 12. Click-hijacking on `index.html` forces `.html` extensions
Lines 50-78 attach a global click handler that rewrites any internal link without an extension to `href + '.html'`. Reasons this is bad:
- It defeats your own clean-URL rewriting. Users get ugly `.html` URLs in the address bar.
- It breaks middle-click and cmd-click in unpredictable ways (you only `preventDefault` on plain clicks).
- It causes an extra client-side redirect before the actual navigation.
- The comment says "Reduces worker calls," but worker calls are the problem of #4, not something to paper over here.

Delete the whole block. Let the server route.

### 13. DNS-prefetch + preconnect overload
`contact.html:36-47` preconnects to 5 third-party origins. Browsers limit concurrent preconnects (typically 6); blasting all of them wastes the connection budget on analytics and fonts instead of your actual critical path. Keep preconnect for the 1-2 most critical origins (fonts.gstatic.com), use dns-prefetch for the rest, and consider self-hosting Inter and Saira (you already have `fonts/fonts.css` — are the Google Fonts even needed?).

### 14. Google Analytics missing from the homepage
Every other page (cities, topics, states, contact, subscribe, 404) has the GA snippet inline at the top of `<head>`. `index.html` does not. Your traffic numbers are missing home-page sessions. Either add it to `index.html` or, better, pull the GA snippet out into a single `<script src="/js/analytics.js">` (you already have this file — it just isn't used) and include it on every page.

### 15. Initiative links open in the same tab on desktop, new tab on mobile
`js/initiative-collapsible.js:49-50` adds `target="_blank" rel="noopener noreferrer"` only on mobile (inside the `if (isMobile)` block starting line 8). On desktop, clicking an initiative navigates away from your site and the user-submitted external URL runs on your window without `rel="noopener"` — classic tabnabbing risk when the external link can control its opener.

Fix in the build: render every external `<a>` in initiatives with `target="_blank" rel="noopener noreferrer"` at generation time in `scripts/build.js`.

---

## Medium — code quality

### 16. `package.json` scripts reference files that don't exist
```
"update-css": "node batch-update-html.js"
"update-css-single": "node update-classes.js"
"add-updater": "node add-updater-to-html.js"
"build:cities": "node scripts/build-city-list.js"
"start": "node server.js"
```
None of `batch-update-html.js`, `update-classes.js`, `add-updater-to-html.js`, `scripts/build-city-list.js`, or `server.js` exist. `"main": "server.js"` also points nowhere. And there's no `npm run build` at all, even though your README says to run one.

The actual build command is `node scripts/build.js`. Add it as `"build": "node scripts/build.js"` and delete the rest.

### 17. `components/sidebar.js` is 323 lines of template + inline styles
The sidebar footer's inline styles at line 20 (positioning + `!important` on every property) plus the JS reapplication at line 297-308 plus presumably rules in `css/sidebar.css` — pick one. CSS file wins 100% of the time. The `#ffd4d4` is already `var(--bg-medium)`; using the variable in CSS lets you theme.

The `https://discord.gg/your-discord-invite` placeholder at line 25 is a dead link shipping to production. Either replace or remove the Discord icon.

### 18. Duplicate email regex + duplicate form validation patterns
`contact.js:140-142` and `js/newsletter-form.js:156-158` have the **same** 100-char email regex pasted twice. Same for the `resetErrors()` function (`contact.js:130-136` ↔ `newsletter-form.js:142-148`) and the input-blur error-clearing pattern. Extract into `js/form-utils.js` and import.

Bonus: browsers do email validation natively on `<input type="email" required>`. The regex exists to handle the "email is optional" case in the contact form; you can do that with a 5-line function.

### 19. `render-initiatives.js` is completely unused
134 lines of code that builds initiative HTML client-side from JSON. Zero HTML or JS files reference it. Either it was an abandoned alternative to the static build, or it's meant for a future dynamic page. Delete unless you have a plan.

Same check passes for `js/generate-titles-index.js` — only referenced via `npm run generate-title-index`, used during build, OK.

### 20. `mobile-toc.js` and `city-toc.js` both create a `.mobile-toc-toggle`
Pages with a TOC on mobile load both. `mobile-toc.js:22-36` checks if the toggle exists before creating; `city-toc.js:28-36` always creates. Whichever runs first wins; the other silently duplicates work or no-ops depending on DOM state. Merge them into one file with clear responsibilities.

### 21. Dead script and shell scripts in the repo root
- `add-collapsible-script.sh`, `run-mobile-optimizations.sh` — one-shot shell scripts used to bulk-patch HTML. They served their purpose; now they're lying around confusing future-you. Delete or move to `scripts/archive/`.
- `bypass-cache-worker.js` in the repo root is a separate standalone Worker that's not referenced from `package.json`, `wrangler.toml`, or deploy config. Is it actually deployed somewhere? If not, delete. If yes, document where and commit the wrangler config.

### 22. `posts/` is a mess
- `posts/posts.json` lists 4 posts (`housing-assistance-expansion`, `healthcare-initiatives-underserved`, `climate-crisis-response`, and one older).
- `posts/*.md` has 4 dated markdown files (none of which match the slugs in `posts.json`).
- `posts/*.html` has 3 files matching some posts.json slugs.
- No build script turns any of these into the other. The `<!-- <section class="daily-log"...`  in `index.html:192-197` that would display them is commented out.

Either build posts as part of `scripts/build.js` (markdown → HTML, generate post index, render on homepage) or delete the `posts/` directory and the `posts.json` and the `render-initiatives`-style code around it.

### 23. `scripts/count-initiatives-all.js` vs `scripts/count-initiatives.js`
Two nearly identical scripts that count initiatives. Pick one.

### 24. `.DS_Store` is in `.gitignore` and in the working tree
`.gitignore` has `.DS_Store`, and `git ls-files` doesn't show it committed, so that's actually OK — but it's sitting in the repo. Run `find . -name .DS_Store -delete` and be done with it. Also: `.ruby-lsp/` is in the repo but not in `.gitignore`. Add it.

### 25. `console.log` spam in production code
Count of `console.log`/`console.error` in shipped files:

- `mobile-menu.js`: 5
- `functions/api/submit.js`: 6 (including logging form email addresses)
- `functions/_middleware.js`: 3
- `functions/contact.js`, `functions/form.js`: 9 combined
- `js/posts.js`, `js/render-initiatives.js`: 3 combined

The ones in `functions/api/submit.js` that log user email addresses and form data are also a mild privacy concern — PII flowing into Cloudflare's logs. Gate behind `env.DEBUG` or delete.

### 26. Inline `style="…"` soup with `!important` spray
Grep for `!important` across `components/sidebar.js`, `mobile-menu.js`, and the injected styles in `js/font-awesome-loader.js` and `js/title-search.js` — you'll find dozens. `styles.css` itself has 70 `!important` declarations across 4,248 lines. This is the "nothing works, make everything urgent" escalation pattern. A quiet weekend rewriting the sidebar/nav/layout CSS without a single `!important` will pay dividends forever.

---

## Low — polish

### 27. `X-XSS-Protection: 1; mode=block` in `_headers` is deprecated
Modern browsers ignore it, and it's caused XSS vulnerabilities of its own in the past. Remove.

### 28. CSP allows `unsafe-inline` and `unsafe-eval`
`_headers` script-src has both. You're using `gtag` (inline init) and module imports, so you can't go full-strict, but `unsafe-eval` is probably not actually needed for any script you ship — remove it and see what breaks. Long-term: move the gtag init into a file with a hash or nonce and drop `unsafe-inline` for `script-src`.

### 29. `404.html` and `fallback.html` are nearly identical
163 lines each. Pick one and delete the other.

### 30. `Math.random().toString(36).substr(2, 9)`
`js/initiative-collapsible.js:33` uses the deprecated `String.prototype.substr`. Replace with `.slice(2, 11)` or `crypto.randomUUID()` (supported everywhere you care about).

### 31. Multiple `DOMContentLoaded` + `readyState` initializers in `components/sidebar.js`
Lines 273-287 register `DOMContentLoaded`, then immediately run the same code if `readyState !== "loading"`. The pattern is correct but awkwardly duplicated. Pull into one `onReady(fn)` helper.

### 32. README is aspirational
Says "Express.js backend," no such thing ships. Says `npm start` and `npm run build` — neither works (#16). Says `js/generate-titles-index.js` regenerates the search index via `npm run generate-title-index` — this one does work. Update the README to match reality; out-of-date docs are worse than no docs.

### 33. Five different cache-buster versions in flight
Across the HTML, stylesheets/scripts are requested at `v=1.0.1`, `v=1.0.3`, `v=1.0.6`, `v=1.0.9`, `v=1.1.9`. Bump them all together or (better) file-name-version the assets at build time.

### 34. `<header id="header" class="page-header"></header>` renders an empty element on every page
`scripts/build.js:178`, `contact.html:83`, etc. Either populate it or delete it.

---

## The architecture I'd aim for

Given where you are, the smallest set of changes that would unlock a big quality jump:

1. **Delete the middleware routing.** Replace with a Pages `_redirects` file. That kills 780 lines, the hardcoded city list, the edge-cache override, and the double-fetch-per-page-view.
2. **Delete `functions/api/submit.js`, `functions/contact.js`, `functions/form.js`, and `form-handler/`.** Keep the direct Web3Forms POST from the HTML forms. Add Turnstile for spam.
3. **Turn `scripts/build.js` into the single source of truth.** Make it also emit `sitemap.xml`, `robots.txt`, canonical tags in the page head, the home-page stats, and a `posts/` index from markdown. Wire up `"build": "node scripts/build.js"`.
4. **Collapse the JS mess.** One `sidebar.js` that owns the sidebar + mobile menu. One `search.js`. One `forms.js`. Delete `mobile-menu.js`, `render-initiatives.js`, `font-awesome-loader.js` (inline the SVG icons in the build — you already do this for some), and the dead form handlers.
5. **Fix `_headers`.** Cache `styles.css` for a year, unbusted homepage for 10 minutes, drop `X-XSS-Protection`, tighten CSP when you're ready.

That trims the JS in half, removes an entire class of "why doesn't this work" bugs, and makes every city page ~100ms faster to render.

---

The content itself (the data files, the directory taxonomy, the mission) is great. The substrate it's riding on just needs a ruthless pass. Don't take any of the above personally — every item is fixable in an afternoon, and most in 10 minutes.
