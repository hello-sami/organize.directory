const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// Serve static files from root directory first
app.use(express.static('.'));

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
    res.status(204).end();
});

// Routes for main pages - handle both with and without .html
app.get(['/cities', '/cities.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'cities.html'));
});

app.get(['/issues', '/issues.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'issues.html'));
});

app.get(['/about', '/about.html'], (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

// Handle direct city URLs (without /cities/ prefix)
app.get('/:city', (req, res, next) => {
    // Skip if it's a known route or static file
    if (['cities', 'issues', 'about'].includes(req.params.city) || 
        req.params.city.includes('.')) {
        return next();
    }
    
    const cityPath = path.join(__dirname, 'cities', `${req.params.city}.html`);
    res.sendFile(cityPath, (err) => {
        if (err) {
            // If city page doesn't exist, continue to next route
            return next();
        }
    });
});

// Route for city pages with /cities/ prefix
app.get('/cities/:city', (req, res, next) => {
    // Skip if the request is for a static file
    if (req.params.city.includes('.')) {
        return next();
    }
    
    const cityPath = path.join(__dirname, 'cities', `${req.params.city}.html`);
    res.sendFile(cityPath, (err) => {
        if (err) {
            console.error(`Error serving ${cityPath}:`, err);
            res.status(404).send('City page not found');
        }
    });
});

// Catch-all route for the homepage
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 