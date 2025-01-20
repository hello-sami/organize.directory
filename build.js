import fs from 'fs/promises';
import path from 'path';
import { citiesByState } from './data.js';

const template = async (city, state) => {
    const citySlug = createSlug(city);
    
    return `<!DOCTYPE html>
<html lang="en" data-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Mutual Aid in ${city} - Local Support Networks & Community Resources</title>
    <meta name="description" content="Find mutual aid initiatives and community support networks in ${city}, ${state}. Connect with local organizations and community resources.">
    <meta property="og:title" content="Mutual Aid in ${city} - Local Support Networks">
    <meta property="og:description" content="Find mutual aid initiatives and community support networks in ${city}, ${state}. Connect with local organizations providing community-based support.">
    <meta property="og:type" content="website">
    <meta property="og:url" content="https://organize.directory/${citySlug}">
    <meta name="twitter:card" content="summary">
    <link rel="stylesheet" href="../styles.css">
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600&display=swap" rel="stylesheet">
</head>
<body>
    <div class="layout">
        <aside class="sidebar">
            <h1><a href="/" class="home-link">Mutual Aid Directory</a></h1>
            <nav>
                <a href="/cities" class="nav-link active">Cities</a>
                <a href="/issues" class="nav-link">Issues</a>
                <a href="/about" class="nav-link">About</a>
            </nav>
        </aside>

        <main class="content">
            <div class="city-page">
                <div class="breadcrumb">
                    <a href="/cities" class="back-link">← Back to Cities</a>
                </div>
                <header class="city-header">
                    <h2>${city}, ${state}</h2>
                </header>
                <div class="initiatives-list">
                    <h3>Local Mutual Aid Initiatives</h3>
                    <p class="help-text">Know of a mutual aid initiative in ${city}? 
                        <a href="mailto:contact@organize.directory">Contact us</a> to have it added.</p>
                </div>
            </div>
        </main>
    </div>
</body>
</html>`;
};

function createSlug(text) {
    return text.toLowerCase()
        .replace(/ /g, '-')
        .replace(/\//g, '-')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

async function cleanDirectory(dir) {
    try {
        await fs.rm(dir, { recursive: true, force: true });
        console.log(`Cleaned ${dir} directory`);
    } catch (error) {
        console.log(`No existing ${dir} directory to clean`);
    }
}

async function build() {
    console.log('Starting build process...');
    
    // Clean and recreate cities directory
    console.log('Cleaning cities directory...');
    await cleanDirectory('cities');
    await fs.mkdir('cities', { recursive: true });
    
    // Generate city pages
    console.log('Generating city pages...');
    let count = 0;
    const total = Object.values(citiesByState).flat().length;

    for (const [state, cities] of Object.entries(citiesByState)) {
        await Promise.all(cities.map(async city => {
            const citySlug = createSlug(city);
            const html = await template(city, state);
            await fs.writeFile(path.join('cities', `${citySlug}.html`), html);
            
            count++;
            if (count % 50 === 0 || count === total) {
                console.log(`Progress: ${count}/${total} cities processed`);
            }
        }));
    }

    console.log('Build completed successfully!');
}

build().catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
}); 