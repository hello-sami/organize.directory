const express = require('express');
const path = require('path');
const app = express();
const port = 3001;

// Serve static files from root directory
app.use(express.static('.'));

// Handle favicon.ico requests
app.get('/favicon.ico', (req, res) => {
    res.status(204).end(); // No content response for favicon
});

// Routes for main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/cities', (req, res) => {
    res.sendFile(path.join(__dirname, 'cities.html'));
});

app.get('/issues', (req, res) => {
    res.sendFile(path.join(__dirname, 'issues.html'));
});

app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'about.html'));
});

// Route for individual city pages - serve the HTML file directly from cities directory
app.get('/:city', (req, res) => {
    // Skip if requesting favicon
    if (req.params.city === 'favicon.ico') return;
    
    const cityPath = path.join(__dirname, 'cities', `${req.params.city}.html`);
    res.sendFile(cityPath, (err) => {
        if (err) {
            console.error(`Error serving ${cityPath}:`, err);
            res.status(404).send('City page not found');
        }
    });
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
}); 