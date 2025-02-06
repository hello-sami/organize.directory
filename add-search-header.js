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

// Add search header to HTML files
async function addSearchHeader(filePath) {
    try {
        let content = await readFile(filePath, 'utf8');
        
        // Check if search header is already added
        if (content.includes('class="search-container"')) {
            console.log(`✓ Search header already present in ${filePath}`);
            return;
        }

        // Find the main content element
        const mainContentStart = content.indexOf('<main class="content"');
        if (mainContentStart === -1) {
            console.log(`⚠️  Could not find main content in ${filePath}`);
            return;
        }

        // Add search header after main content opening tag
        const mainContentEnd = content.indexOf('>', mainContentStart) + 1;
        const searchHeader = `
            <header class="page-header">
                <div class="search-container">
                    <div class="search-input-wrapper">
                        <input 
                            type="text" 
                            id="searchInput" 
                            class="search-input" 
                            placeholder="Search mutual aid resources..."
                            aria-label="Search mutual aid resources"
                        >
                        <div id="searchResults" class="search-results" role="listbox"></div>
                    </div>
                </div>
            </header>`;
        
        // Add search initialization script before closing body tag
        const searchScript = `
    <!-- Initialize Search -->
    <script type="module">
        import { initializeSearch } from '/components/search-header.js';
        initializeSearch();
    </script>
</body>`;

        // Insert the search header and update the script
        const newContent = content.slice(0, mainContentEnd) + 
                          searchHeader + 
                          content.slice(mainContentEnd).replace('</body>', searchScript);

        await writeFile(filePath, newContent, 'utf8');
        console.log(`✓ Added search header to ${filePath}`);
    } catch (error) {
        console.error(`❌ Error processing ${filePath}:`, error);
    }
}

// Main function
async function main() {
    try {
        console.log('🚀 Starting search header addition process...\n');
        
        // Get all HTML files
        const htmlFiles = await getAllHtmlFiles('.');
        console.log(`📁 Found ${htmlFiles.length} HTML files\n`);
        
        // Process each file
        for (const file of htmlFiles) {
            await addSearchHeader(file);
        }
        
        console.log('\n✨ Process completed successfully');
    } catch (error) {
        console.error('\n❌ Process failed:', error);
        process.exit(1);
    }
}

// Run the script
main(); 