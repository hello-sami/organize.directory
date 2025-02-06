import { readFile, writeFile, readdir, stat } from 'fs/promises';
import { join } from 'path';

// Get all HTML files recursively
async function getAllHtmlFiles(dir) {
    let results = [];
    const list = await readdir(dir);
    
    for (const file of list) {
        const filePath = join(dir, file);
        const stats = await stat(filePath);
        
        if (stats.isDirectory() && !file.startsWith('.')) {
            results = results.concat(await getAllHtmlFiles(filePath));
        } else if (file.endsWith('.html')) {
            results.push(filePath);
        }
    }
    
    return results;
}

// Add mobile menu script to HTML files
async function addMobileMenu(filePath) {
    try {
        let content = await readFile(filePath, 'utf8');
        
        // Check if mobile menu is already added
        if (content.includes('mobile-menu.js')) {
            console.log(`✓ Mobile menu already present in ${filePath}`);
            return;
        }

        // Find the theme-init.js script tag
        const themeScriptIndex = content.indexOf('<script src="/theme-init.js"></script>');
        if (themeScriptIndex === -1) {
            console.log(`⚠️  Could not find theme-init.js in ${filePath}`);
            return;
        }

        // Add search-index.js and mobile-menu.js after theme-init.js
        const insertPosition = themeScriptIndex + '<script src="/theme-init.js"></script>'.length;
        const newContent = content.slice(0, insertPosition) + 
                          '\n    <script src="/search-index.js"></script>' +
                          '\n    <script src="/mobile-menu.js"></script>' +
                          content.slice(insertPosition);

        await writeFile(filePath, newContent, 'utf8');
        console.log(`✓ Added mobile menu to ${filePath}`);
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error);
    }
}

// Main function
async function main() {
    try {
        console.log('🚀 Starting mobile menu addition process...\n');
        
        // Get all HTML files
        const htmlFiles = await getAllHtmlFiles('.');
        console.log(`📁 Found ${htmlFiles.length} HTML files\n`);
        
        // Process each file
        for (const file of htmlFiles) {
            await addMobileMenu(file);
        }
        
        console.log('\n✨ Process completed successfully');
    } catch (error) {
        console.error('\n❌ Process failed:', error);
        process.exit(1);
    }
}

// Run the script
main(); 