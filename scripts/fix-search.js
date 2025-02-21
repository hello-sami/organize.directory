import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The correct initialization script with crossorigin attributes
const correctInitScript = `    <!-- Initialize components -->
    <script type="module" crossorigin="use-credentials">
        import { initializeComponents } from '/init.js';
        initializeComponents({
            sidebarType: 'SIDEBAR_TYPE',
            searchHeaderId: 'header'
        });
    </script>
</body>`;

// The correct head scripts
const correctHeadScripts = `    <script src="/theme-init.js"></script>
    <!-- Critical Scripts -->
    <script type="module">
        import { createSidebar } from '/components/sidebar.js';
        // Initialize sidebar as soon as possible
        const sidebarElement = document.getElementById('sidebar');
        if (sidebarElement) {
            sidebarElement.replaceWith(createSidebar('SIDEBAR_TYPE'));
        }
    </script>
</head>`;

const scriptRegex = /<script type="module"([^>]*)>/g;
const correctScriptTag = '<script type="module"$1>';

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

function getSidebarType(filePath) {
    if (filePath.includes('/states/') || filePath.includes('/cities/')) {
        return 'location';
    } else if (filePath.includes('/issues/')) {
        return 'issue';
    } else if (filePath === 'index.html') {
        return 'home';
    }
    return 'location'; // default
}

async function fixFile(filePath) {
    try {
        let content = await fs.promises.readFile(filePath, 'utf8');
        const sidebarType = getSidebarType(filePath);
        
        // Fix head scripts
        content = content.replace(
            /(<script src="\/theme-init\.js"[^>]*><\/script>[\s\S]*?<\/head>)/g,
            correctHeadScripts.replace('SIDEBAR_TYPE', sidebarType)
        );
        
        // Remove old search initialization scripts
        content = content.replace(/\s*<script type="module">\s*import { initializeSearch } from '\/components\/search-header\.js';\s*initializeSearch\(\);\s*<\/script>/g, '');
        
        // Remove all existing component initialization scripts
        content = content.replace(/\s*<!-- Initialize components -->[\s\S]*?<script type="module">[\s\S]*?initializeComponents\({[\s\S]*?\}\);\s*<\/script>/g, '');
        
        // Remove old core scripts block if it exists
        content = content.replace(/\s*<!-- Core Scripts -->[\s\S]*?(?=<\/body>)/, '');
        
        // Add single correct initialization script
        const initScript = correctInitScript.replace('SIDEBAR_TYPE', sidebarType);
        content = content.replace(/<\/body>/, initScript);
        
        // Ensure only one header element exists and it's in the right place
        content = content.replace(/<header[^>]*>.*?<\/header>/gs, ''); // Remove any existing headers
        content = content.replace(/<main[^>]*>/, match => 
            match + '\n            <header id="header" class="page-header"></header>'
        );
        
        // Add crossorigin attributes to all module scripts
        content = content.replace(
            scriptRegex,
            correctScriptTag
        );
        
        // Ensure proper script loading order
        content = content.replace(
            /<script src="\/script\.js"([^>]*)>/g,
            '<script src="/script.js" defer$1>'
        );
        
        await fs.promises.writeFile(filePath, content);
        console.log(`Fixed ${filePath}`);
    } catch (error) {
        console.error(`Error fixing ${filePath}:`, error);
    }
}

async function main() {
    const directories = ['cities', 'states', 'issues'];
    const rootFiles = ['index.html', 'about.html'];
    
    // Fix directory files
    for (const dir of directories) {
        const htmlFiles = await getAllHtmlFiles(dir);
        console.log(`Found ${htmlFiles.length} HTML files in ${dir}/`);
        
        for (const file of htmlFiles) {
            await fixFile(file);
        }
    }
    
    // Fix root files
    for (const file of rootFiles) {
        if (fs.existsSync(file)) {
            await fixFile(file);
        }
    }
}

main().catch(console.error); 