import fs from 'fs/promises';
import path from 'path';
import { initiatives, citiesByState } from './data.js';

const template = async (city, state, initiatives) => {
    // Read the base template
    const baseTemplate = await fs.readFile('index.html', 'utf-8');
    
    const cityInitiatives = initiatives.filter(initiative => 
        initiative.scope === "local" && 
        initiative.location.toLowerCase().includes(city.toLowerCase())
    );

    const initiativesHtml = cityInitiatives.length > 0 
        ? cityInitiatives.map(initiative => `
            <div class="initiative-card">
                <h3>${initiative.name}</h3>
                <p>${initiative.description}</p>
                <div class="initiative-links">
                    ${initiative.website ? `<a href="${initiative.website}" target="_blank">Website</a>` : ''}
                    ${initiative.contact ? `<a href="mailto:${initiative.contact}">Contact</a>` : ''}
                </div>
                <div class="initiative-topics">
                    ${initiative.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                </div>
            </div>
        `).join('')
        : `<p>No mutual aid initiatives found in ${city} yet. Want to add one? Contact us!</p>`;

    // Find the content area between the search-container div
    const searchContainerRegex = /<div class="search-container">[\s\S]*?<\/div>/;
    
    // Fix paths to be relative to root and update the content
    let modifiedTemplate = baseTemplate
        .replace(/href="styles\.css"/g, 'href="/styles.css"')
        .replace(/src="script\.js"/g, 'src="/script.js"')
        .replace(/src="data\.js"/g, 'src="/data.js"')
        .replace(searchContainerRegex, 
            `<div class="search-container">
                <div class="city-page">
                    <div class="breadcrumb">
                        <a href="/" class="back-link">← Back to Cities</a>
                    </div>
                    <h2>${city}, ${state}</h2>
                    <div class="city-initiatives">
                        ${initiativesHtml}
                    </div>
                </div>
            </div>`);

    // Hide the about content
    modifiedTemplate = modifiedTemplate.replace(
        /<div id="aboutContent".*?style=".*?"/,
        '<div id="aboutContent" style="display: none;"'
    );

    return modifiedTemplate;
};

async function build() {
    // Create dist directory
    await fs.mkdir('dist', { recursive: true });
    
    // Copy static assets
    await fs.copyFile('styles.css', 'dist/styles.css');
    await fs.copyFile('script.js', 'dist/script.js');
    await fs.copyFile('data.js', 'dist/data.js');
    await fs.copyFile('index.html', 'dist/index.html');
    await fs.copyFile('serve.json', 'dist/serve.json');

    // Generate city pages
    for (const [state, cities] of Object.entries(citiesByState)) {
        for (const city of cities) {
            const citySlug = city.toLowerCase().replace(/ /g, '-')
                                            .replace(/\//g, '-')
                                            .replace(/\s+/g, '-');
            
            // Write directly to the dist directory with .html extension
            const html = await template(city, state, initiatives);
            await fs.writeFile(path.join('dist', `${citySlug}.html`), html);
        }
    }

    console.log('Build completed successfully!');
}

build().catch(console.error); 