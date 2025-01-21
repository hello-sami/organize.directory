import fs from 'fs/promises';
import path from 'path';
import { citiesByState } from './data.js';
import * as cheerio from 'cheerio';

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

async function readTemplate(templatePath) {
    try {
        const template = await fs.readFile(templatePath, 'utf-8');
        return template;
    } catch (error) {
        console.error(`Error reading template: ${error}`);
        return null;
    }
}

async function processHtmlFiles(directory) {
    try {
        const files = await fs.readdir(directory);
        const headTemplate = await readTemplate('./templates/head.html');
        
        for (const file of files) {
            if (file.endsWith('.html')) {
                const filePath = path.join(directory, file);
                const content = await fs.readFile(filePath, 'utf-8');
                const $ = cheerio.load(content);
                
                // Store existing title and meta tags
                const title = $('title').text();
                const metaTags = $('meta').toArray().map(el => $.html(el));
                const mainContent = $('.initiatives-list').html(); // Preserve main content
                
                // Replace head content with template while preserving title and meta
                $('head').html(headTemplate);
                
                // Restore title and meta tags
                metaTags.forEach(tag => {
                    if (!tag.includes('charset') && !tag.includes('viewport')) {
                        $('head').append(tag);
                    }
                });
                $('head').append(`<title>${title}</title>`);
                
                // Update sidebar structure if needed
                if (!$('#sidebar-container').length) {
                    $('.sidebar').replaceWith('<div id="sidebar-container"></div>');
                }
                
                // Restore main content
                if (mainContent) {
                    $('.initiatives-list').html(mainContent);
                }
                
                // Add sidebar scripts if missing
                if (!$('script[src="/components/sidebar.js"]').length) {
                    $('body').append(`
                        <script type="module">
                            import { createSidebar } from '/components/sidebar.js';
                            const sidebarContainer = document.getElementById('sidebar-container');
                            const sidebar = createSidebar('cities');
                            sidebarContainer.replaceWith(sidebar);
                        </script>
                        <script src="/theme.js" type="module"></script>
                    `);
                }
                
                // Remove data-theme attribute from html tag
                $('html').removeAttr('data-theme');
                
                // Write the updated content back to file
                await fs.writeFile(filePath, $.html());
                console.log(`Processed ${file}`);
            }
        }
    } catch (error) {
        console.error(`Error processing directory: ${error}`);
    }
}

async function build() {
    console.log('Starting build process...');
    await processHtmlFiles('./cities');
    await processHtmlFiles('./issues');
    console.log('Build completed successfully!');
}

build().catch(error => {
    console.error('Build failed:', error);
    process.exit(1);
}); 