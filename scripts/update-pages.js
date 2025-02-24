import fs from "fs";
import path from "path";
import { glob } from "glob";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The pre-rendered sidebar HTML
const sidebarHTML = `
        <aside id="sidebar" aria-label="Main navigation">
            <h1><a href="/" class="home-link">The Organize Directory</a></h1>
            <nav>
                <a href="/" class="nav-link">Home</a>
                <div class="nav-group">
                    <span class="nav-group-title">Find a group</span>
                    <a href="/location" class="nav-link nav-link-indented">by location</a>
                    <a href="/topics" class="nav-link nav-link-indented">by topic</a>
                </div>
                <a href="/guides" class="nav-link">Guides</a>
                <a href="/contact" class="nav-link">Contact</a>
            </nav>
            <div class="sidebar-motto">
                Solidarity not charity.<br>
                Awareness into action.
            </div>
        </aside>
`;

// The new sidebar initialization script
const sidebarScript = `
    <script type="module">
        import { initializeSidebar } from '/components/sidebar.js';
        window.addEventListener('DOMContentLoaded', () => {
            initializeSidebar('location');
        });
    </script>
`;

// The updated script tags for the bottom of the file
const updatedBottomScripts = `    <!-- Core Scripts -->
    <script src="/js/script.js" type="module" async></script>
    <script src="/search-index.js" type="module" async></script>
    <script src="/mobile-menu.js" defer></script>
    <script src="/theme.js" type="module" async></script>
    <script src="/js/posts.js" type="module" async></script>
    <script src="/js/search-init.js" defer></script>
    <script src="/js/analytics.js" type="module" async></script>
</body>`;

// Function to update a single file
async function updateFile(filePath) {
     try {
          let content = await fs.promises.readFile(filePath, "utf8");

          // Remove any existing sidebar styles
          content = content.replace(
               /<style>[^<]*#sidebar:not\(\.ready\)[^<]*<\/style>/g,
               ""
          );

          // Remove any existing sidebar initialization scripts
          content = content.replace(
               /<script type="module">\s*import\s*{\s*createSidebar\s*}\s*from\s*['"]\/components\/sidebar\.js['"];\s*(?:\/\/[^\n]*\n)*\s*(?:const|let|var)?\s*sidebarElement[^<]*<\/script>/g,
               ""
          );

          // Add the new initialization script before </head>
          content = content.replace("</head>", `${sidebarScript}\n</head>`);

          // Replace empty sidebar with pre-rendered structure
          content = content.replace(
               /<aside id="sidebar"[^>]*>\s*<\/aside>/,
               sidebarHTML
          );

          // Update bottom scripts
          content = content.replace(
               /\s*<!-- Core Scripts -->[\s\S]*?<\/body>/,
               "\n" + updatedBottomScripts
          );

          await fs.promises.writeFile(filePath, content);
          console.log(`Updated ${filePath}`);
     } catch (error) {
          console.error(`Error updating ${filePath}:`, error);
     }
}

// Main function to process all HTML files
async function main() {
     try {
          // Find all HTML files in the project
          const files = await glob("**/*.html", {
               ignore: ["node_modules/**", "dist/**", "build/**"],
          });

          // Update each file
          await Promise.all(files.map(updateFile));

          console.log("All files updated successfully");
     } catch (error) {
          console.error("Error processing files:", error);
     }
}

main();
