import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';
import MarkdownIt from 'markdown-it';
import frontMatter from 'front-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const md = new MarkdownIt();

const app = express();

// Serve static files
app.use(express.static('.'));

// Handle blog posts
app.get('/posts/:slug.html', async (req, res, next) => {
  try {
    // Load posts.json
    const postsData = await fs.readFile(path.join(__dirname, 'posts', 'posts.json'), 'utf-8');
    const { posts } = JSON.parse(postsData);
    
    // Find the post metadata
    const post = posts.find(p => p.slug === req.params.slug);
    if (!post) {
      return next();
    }
    
    // Read and convert markdown file
    const mdContent = await fs.readFile(path.join(__dirname, 'posts', `${post.date}.md`), 'utf-8');
    const { body } = frontMatter(mdContent);
    const htmlContent = md.render(body);
    
    // Send rendered HTML
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${post.title}</title>
          <link rel="stylesheet" href="/styles.css">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
          <script src="/theme-init.js"></script>
      </head>
      <body>
          <div class="layout">
              <aside id="sidebar" aria-label="Main navigation"></aside>
              <main class="content" role="main">
                  <article class="post">
                      <header class="page-header">
                          <h1>${post.title}</h1>
                          <time datetime="${post.date}">${new Date(post.date).toLocaleDateString('en-US', {
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric'
                          })}</time>
                      </header>
                      ${htmlContent}
                  </article>
              </main>
          </div>
          <script type="module">
              import { createSidebar } from '/components/sidebar.js';
              document.getElementById('sidebar').replaceWith(createSidebar('home'));
          </script>
          <script src="/theme.js" type="module"></script>
      </body>
      </html>
    `);
  } catch (error) {
    console.error('Error handling post:', error);
    next(error);
  }
});

// Handle clean URLs
app.get('*', (req, res, next) => {
  // Remove trailing slash for matching
  const path_without_slash = req.path.endsWith('/') ? req.path.slice(0, -1) : req.path;
  const segments = path_without_slash.split('/').filter(Boolean);
  
  // Skip if it's a file request
  if (path_without_slash.includes('.')) {
    return next();
  }

  // Handle main pages
  if (segments.length === 1) {
    const page = segments[0];
    if (['cities', 'issues', 'about', 'location', 'resources'].includes(page)) {
      res.sendFile(path.join(__dirname, `${page}.html`));
      return;
    }
    
    // Handle clean state URLs (e.g., /alabama)
    res.sendFile(path.join(__dirname, 'states', `${page}.html`), err => {
      if (err) {
        next();
      }
    });
    return;
  }

  // Handle state pages with /states/ prefix
  if (segments.length === 2 && segments[0] === 'states') {
    const stateSlug = segments[1];
    res.sendFile(path.join(__dirname, 'states', `${stateSlug}.html`), err => {
      if (err) {
        next();
      }
    });
    return;
  }

  // Handle city pages
  if (segments.length === 2 && segments[0] === 'cities') {
    const citySlug = segments[1];
    res.sendFile(path.join(__dirname, 'cities', `${citySlug}.html`), err => {
      if (err) {
        next();
      }
    });
    return;
  }

  // Handle issue pages
  if (segments.length === 2 && segments[0] === 'issues') {
    const issueSlug = segments[1];
    res.sendFile(path.join(__dirname, 'issues', `${issueSlug}.html`), err => {
      if (err) {
        next();
      }
    });
    return;
  }

  // If no matches, try next middleware
  next();
});

// Serve index for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 