import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = 3001;

// Serve static files from the dist directory
app.use(express.static('dist'));

// Handle city pages
app.get('/:city', (req, res, next) => {
    const citySlug = req.params.city;
    // Try to serve the city's HTML file
    res.sendFile(path.join(__dirname, 'dist', `${citySlug}.html`), err => {
        if (err) {
            // If file doesn't exist, fall back to index.html for client-side routing
            res.sendFile(path.join(__dirname, 'dist', 'index.html'));
        }
    });
});

// Handle all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
    console.log(`Network: http://${os.networkInterfaces()['en0']?.[1]?.address || 'localhost'}:${port}`);
}); 