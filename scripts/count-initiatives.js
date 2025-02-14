import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { JSDOM } from 'jsdom';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to count initiatives in a file
function countInitiatives(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const dom = new JSDOM(content);
    const initiatives = dom.window.document.getElementsByClassName('initiative');
    return initiatives.length;
}

// Get all city HTML files
const citiesDir = path.join(__dirname, '..', 'cities');
const cityFiles = fs.readdirSync(citiesDir)
    .filter(file => file.endsWith('.html'));

// Count initiatives for each city
console.log('Initiative counts by city:');
console.log('-------------------------');

let totalInitiatives = 0;
const counts = cityFiles.map(file => {
    const filePath = path.join(citiesDir, file);
    const count = countInitiatives(filePath);
    totalInitiatives += count;
    return { city: file.replace('.html', ''), count };
}).sort((a, b) => b.count - a.count); // Sort by count in descending order

// Print results
counts.forEach(({ city, count }) => {
    console.log(`${city.padEnd(20)}: ${count} initiatives`);
});

console.log('-------------------------');
console.log(`Total initiatives: ${totalInitiatives}`); 