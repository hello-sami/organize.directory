import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The script block we want to move to the head
const sidebarScript = `    <!-- Critical Scripts -->
    <script src="/theme-init.js"></script>
    <script type="module">
        import { createSidebar } from '/components/sidebar.js';
        // Initialize sidebar as soon as possible
        const sidebarElement = document.getElementById('sidebar');
        if (sidebarElement) {
            sidebarElement.replaceWith(createSidebar('location'));
        }
    </script>
</head>`;

// The updated script tags for the bottom of the file
const updatedBottomScripts = `    <!-- Core Scripts -->
    <script src="/script.js" type="module" async></script>
    <script src="/search-index.js" type="module" async></script>
    <script src="/mobile-menu.js" defer></script>
    <script src="/theme.js" type="module" async></script>
    <script src="/js/posts.js" type="module" async></script>
    <script src="/js/search-init.js" defer></script>
    <script src="/js/analytics.js" type="module" async></script>
</body>`;

async function getAllHtmlFiles(dir) {
    const files = await fs.promises.readdir(dir);
    const htmlFiles = [];
    
    for (const file of files) {
        const filePath = path.join(dir, file);
        const stat = await fs.promises.stat(filePath);
        
        if (stat.isDirectory()) {
            const subDirFiles = await getAllHtmlFiles(filePath);
            htmlFiles.push(...subDirFiles);
        } else if (path.extname(file) === '.html') {
            htmlFiles.push(filePath);
        }
    }
    
    return htmlFiles;
}

async function updateFile(filePath) {
    try {
        let content = await fs.promises.readFile(filePath, 'utf8');
        
        // Remove old sidebar script if it exists
        content = content.replace(/\s*<script type="module">\s*import { createSidebar } from '\/components\/sidebar\.js';\s*document\.addEventListener\('DOMContentLoaded', \(\) => {\s*document\.getElementById\('sidebar'\)\.replaceWith\(createSidebar\([^)]+\)\);\s*}\);\s*<\/script>/g, '');
        
        // Add new sidebar script to head
        content = content.replace('</head>', sidebarScript);
        
        // Update bottom scripts
        content = content.replace(/\s*<!-- Core Scripts -->[\s\S]*?<\/body>/, '\n' + updatedBottomScripts);
        
        await fs.promises.writeFile(filePath, content);
        console.log(`Updated ${filePath}`);
    } catch (error) {
        console.error(`Error updating ${filePath}:`, error);
    }
}

async function main() {
    const directories = ['cities', 'states'];
    
    for (const dir of directories) {
        const htmlFiles = await getAllHtmlFiles(dir);
        console.log(`Found ${htmlFiles.length} HTML files in ${dir}/`);
        
        for (const file of htmlFiles) {
            await updateFile(file);
        }
    }
}

main().catch(console.error); 