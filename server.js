import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Serve static files
app.use(express.static('.'));

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
    if (['cities', 'issues', 'about'].includes(page)) {
      res.sendFile(path.join(__dirname, `${page}.html`));
      return;
    }
  }

  // Handle state pages
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