import fs from 'fs';
import { citiesByState } from './data.js';

const stateTemplate = fs.readFileSync('./states/alaska.html', 'utf8');

// Create states directory if it doesn't exist
if (!fs.existsSync('./states')) {
    fs.mkdirSync('./states');
}

// Generate pages for each state
Object.keys(citiesByState).forEach(state => {
    const stateSlug = state.toLowerCase().replace(/\s+/g, '-');
    const cities = citiesByState[state];
    
    let cityLinks = cities.map(city => {
        const citySlug = city.toLowerCase()
            .replace(/\s*\/\s*/g, '-')
            .replace(/\s+/g, '-');
        return `<li><a href="/cities/${citySlug}">${city}</a></li>`;
    }).join('\n                            ');

    let statePage = stateTemplate
        // Replace state name in various places
        .replace(/Alaska Statewide Initiatives/g, `${state} Statewide Initiatives`)
        .replace(/Statewide Initiatives in Alaska/g, `Statewide Initiatives in ${state}`)
        .replace(/mutual aid networks and community support initiatives in Alaska/g, 
                `mutual aid networks and community support initiatives in ${state}`)
        .replace(/statewide mutual aid initiative in Alaska/g, 
                `statewide mutual aid initiative in ${state}`)
        // Replace city list
        .replace(/<ul>\s*<li><a href="\/cities\/.*?<\/a><\/li>\s*<\/ul>/s,
                `<ul>\n                            ${cityLinks}\n                        </ul>`);

    fs.writeFileSync(`./states/${stateSlug}.html`, statePage);
});

console.log('State pages generated successfully!'); 