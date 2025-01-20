import fs from 'fs/promises';
import path from 'path';
import { initiatives, citiesByState } from './data.js';

// Social media icons as SVG
const socialIcons = {
    twitter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
    facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`
};

const template = async (city, state, initiatives) => {
    // Read the base template
    const baseTemplate = await fs.readFile('index.html', 'utf-8');
    
    // Find initiatives for this city - using more flexible matching
    const cityInitiatives = initiatives.filter(initiative => {
        const locationLower = initiative.location.toLowerCase();
        const cityLower = city.toLowerCase();
        const stateLower = state.toLowerCase();
        
        return initiative.scope === "local" && (
            locationLower.includes(cityLower) ||
            locationLower.includes(`${cityLower}, ${stateLower}`) ||
            locationLower.includes(`${state}, ${city}`)
        );
    });

    // Generate initiative cards with more details
    const initiativesHtml = cityInitiatives.length > 0 
        ? `<div class="initiatives-grid">
            ${cityInitiatives.map(initiative => `
                <div class="initiative-card">
                    <h3>${initiative.name}</h3>
                    <p class="initiative-description">${initiative.description}</p>
                    
                    <div class="initiative-topics">
                        ${initiative.topics.map(topic => 
                            `<span class="topic-tag">${topic}</span>`
                        ).join('')}
                    </div>
                    
                    <div class="initiative-meta">
                        <div class="initiative-location">
                            <span class="meta-label">📍 Location:</span>
                            <span>${initiative.location}</span>
                        </div>
                        ${initiative.scope ? `
                            <div class="initiative-scope">
                                <span class="meta-label">🌐 Scope:</span>
                                <span>${initiative.scope}</span>
                            </div>
                        ` : ''}
                    </div>

                    <div class="initiative-links">
                        ${initiative.website ? 
                            `<a href="${initiative.website}" target="_blank" class="website-link">
                                <span>Visit Website</span>
                            </a>` : ''
                        }
                        ${initiative.contact ? 
                            `<a href="mailto:${initiative.contact}" class="contact-link">
                                <span>Contact</span>
                            </a>` : ''
                        }
                    </div>

                    ${initiative.social ? `
                        <div class="social-links">
                            ${initiative.social.twitter ? 
                                `<a href="https://twitter.com/${initiative.social.twitter}" target="_blank" class="social-link twitter">
                                    ${socialIcons.twitter}
                                </a>` : ''
                            }
                            ${initiative.social.instagram ? 
                                `<a href="https://instagram.com/${initiative.social.instagram}" target="_blank" class="social-link instagram">
                                    ${socialIcons.instagram}
                                </a>` : ''
                            }
                            ${initiative.social.facebook ? 
                                `<a href="https://facebook.com/${initiative.social.facebook}" target="_blank" class="social-link facebook">
                                    ${socialIcons.facebook}
                                </a>` : ''
                            }
                        </div>
                    ` : ''}
                </div>
            `).join('')}
        </div>`
        : `<div class="no-initiatives">
            <p>No mutual aid initiatives found in ${city} yet.</p>
            <p class="help-text">Know of an initiative that should be listed here? 
               <a href="mailto:contact@organize.directory">Contact us</a> to have it added.</p>
           </div>`;

    // Fix paths and remove base tag
    let modifiedTemplate = baseTemplate
        .replace('<head><base href="/">', '<head>')
        .replace(/<link rel="stylesheet" href="styles\.css">/, '<link rel="stylesheet" href="./styles.css">')
        .replace(/<script type="module" src="script\.js">/, '<script type="module" src="./script.js">')
        .replace(/<script type="module" src="data\.js">/, '<script type="module" src="./data.js">')
        .replace(/<a href="\/" class="back-link">/, '<a href="./index.html" class="back-link">')
        .replace(/<div class="search-container">[\s\S]*?<\/div>/, 
            `<div class="search-container">
                <div class="city-page">
                    <div class="breadcrumb">
                        <a href="./index.html" class="back-link">← Back to Cities</a>
                    </div>
                    <header class="city-header">
                        <h2>${city}, ${state}</h2>
                        <p class="initiative-count">
                            ${cityInitiatives.length} initiative${cityInitiatives.length !== 1 ? 's' : ''} found
                        </p>
                    </header>
                    ${initiativesHtml}
                </div>
            </div>`);

    // Hide the about content
    modifiedTemplate = modifiedTemplate.replace(
        /<div id="aboutContent".*?style=".*?"/,
        '<div id="aboutContent" style="display: none;"'
    );

    // Update title and add meta tags
    modifiedTemplate = modifiedTemplate.replace(
        /<title>.*?<\/title>/,
        `<title>Mutual Aid Directory - ${city}, ${state}</title>
        <meta name="description" content="Find mutual aid initiatives and community support in ${city}, ${state}. ${cityInitiatives.length} local initiatives available.">
        <meta property="og:title" content="Mutual Aid Directory - ${city}, ${state}">
        <meta property="og:description" content="Find mutual aid initiatives and community support in ${city}, ${state}. ${cityInitiatives.length} local initiatives available.">
        <meta property="og:type" content="website">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">`
    );

    return modifiedTemplate;
};

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
    
    // Clean dist directory completely
    console.log('Cleaning dist directory...');
    await cleanDirectory('dist');
    
    // Create fresh dist directory
    console.log('Creating dist directory...');
    await fs.mkdir('dist', { recursive: true });
    
    // Copy only specific static assets
    console.log('Copying static assets...');
    await fs.copyFile('styles.css', path.join('dist', 'styles.css'));
    await fs.copyFile('script.js', path.join('dist', 'script.js'));
    await fs.copyFile('data.js', path.join('dist', 'data.js'));
    await fs.copyFile('index.html', path.join('dist', 'index.html'));

    // Generate city pages with flat structure
    console.log('Generating city pages...');
    let count = 0;
    const total = Object.values(citiesByState).flat().length;

    for (const [state, cities] of Object.entries(citiesByState)) {
        await Promise.all(cities.map(async city => {
            // Create a clean slug for the filename
            const citySlug = city.toLowerCase()
                .replace(/ /g, '-')
                .replace(/\//g, '-')
                .replace(/\s+/g, '-');
            
            // Generate HTML and write directly to dist/[slug].html
            const html = await template(city, state, initiatives);
            await fs.writeFile(path.join('dist', `${citySlug}.html`), html);
            
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