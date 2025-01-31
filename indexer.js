import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directory to scan for HTML files
const contentDir = './';

// Function to clean up text
function cleanText(text) {
    if (!text) return '';
    return text
        .replace(/\s+/g, ' ')  // Replace multiple spaces with single space
        .replace(/[^\w\s-]/g, ' ')  // Remove special characters
        .trim();
}

// Function to get all HTML files recursively
function getAllHtmlFiles(dir) {
    let results = [];
    const items = fs.readdirSync(dir);

    for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            // Skip node_modules and other common directories to ignore
            if (item === 'node_modules' || item === '.git') continue;
            console.log(`Scanning directory: ${fullPath}`);
            results = results.concat(getAllHtmlFiles(fullPath));
        } else if (item.endsWith('.html')) {
            console.log(`Found HTML file: ${fullPath}`);
            results.push(fullPath);
        }
    }

    return results;
}

// Function to extract content from HTML file
async function processFile(filePath) {
    console.log(`Processing file: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf8');
    const $ = cheerio.load(content);
    
    // Remove script and style tags
    $('script').remove();
    $('style').remove();

    // Extract relevant content
    const title = $('title').text() || $('h1').first().text() || path.basename(filePath, '.html');
    const description = $('meta[name="description"]').attr('content') || '';
    const keywords = $('meta[name="keywords"]').attr('content') || '';
    
    // Get main content text
    const mainContent = $('main').text() || $('body').text();
    
    // Get headings for better search context
    const headings = $('h1, h2, h3').map((_, el) => $(el).text()).get();

    // Create relative URL
    const relativeUrl = filePath.replace(contentDir, '').replace(/\\/g, '/');

    const result = {
        title: cleanText(title),
        description: cleanText(description),
        keywords: cleanText(keywords),
        content: cleanText(mainContent),
        headings: headings.map(cleanText),
        url: relativeUrl,
        breadcrumb: relativeUrl.split('/').filter(p => p).map(p => p.replace('.html', ''))
    };

    console.log(`Processed ${filePath}:`);
    console.log(`- Title: ${result.title}`);
    console.log(`- URL: ${result.url}`);
    
    return result;
}

// Main indexing function
async function generateSearchIndex() {
    console.log('Starting search index generation...');
    console.log(`Working directory: ${process.cwd()}`);
    
    const searchData = {
        pages: []
    };

    try {
        // Get all HTML files recursively
        const files = getAllHtmlFiles(contentDir);
        console.log(`\nFound ${files.length} HTML files to index`);

        // Process each file
        for (const filePath of files) {
            try {
                const pageData = await processFile(filePath);
                searchData.pages.push(pageData);
            } catch (error) {
                console.error(`Error processing ${filePath}:`, error);
            }
        }

        // Write the search index
        const outputPath = './search-index.js';
        const content = `window.searchIndex = ${JSON.stringify(searchData, null, 2)};`;
        
        fs.writeFileSync(outputPath, content);
        console.log(`\nSearch index generated at ${outputPath}`);
        console.log(`Indexed ${searchData.pages.length} pages successfully`);
    } catch (error) {
        console.error('Error generating search index:', error);
        process.exit(1);
    }
}

// Run the indexer
console.log('Starting indexer...\n');
generateSearchIndex().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
}); 