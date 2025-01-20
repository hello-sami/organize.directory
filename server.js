const express = require('express');
const path = require('path');
const app = express();

// Serve static files
app.use(express.static('.'));

// Handle clean URLs
app.get('*', (req, res, next) => {
  // Remove trailing slash for matching
  const path_without_slash = req.path.endsWith('/') ? req.path.slice(0, -1) : req.path;
  const slug = path_without_slash.substring(1); // Remove leading slash
  
  // Skip if it's a file request
  if (slug.includes('.')) {
    return next();
  }

  // Handle main pages
  if (['cities', 'issues', 'about'].includes(slug)) {
    res.sendFile(path.join(__dirname, `${slug}.html`));
    return;
  }

  // Try to serve from cities directory
  res.sendFile(path.join(__dirname, 'cities', `${slug}.html`), err => {
    if (err) {
      // If not found in cities, try issues directory
      res.sendFile(path.join(__dirname, 'issues', `${slug}.html`), err => {
        if (err) {
          next();
        }
      });
    }
  });
});

// Serve index for root
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

const PORT = process.env.PORT || 5500;
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
}); 