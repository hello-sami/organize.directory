import fs from "fs";
import path from "path";
import { glob } from "glob";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// The new sidebar styles to add
const sidebarStyles = `
    <style>
        /* Hide sidebar until ready */
        #sidebar:not(.ready) {
            visibility: hidden;
        }

        #sidebar.ready {
            visibility: visible;
        }
    </style>
`;

// The new sidebar initialization script
const sidebarScript = `
    <script type="module">
        import { createSidebar } from '/components/sidebar.js';
        // Initialize sidebar as soon as possible
        window.addEventListener('DOMContentLoaded', () => {
            const sidebarElement = document.getElementById('sidebar');
            if (sidebarElement) {
                const newSidebar = createSidebar('location');
                newSidebar.classList.add('ready');
                sidebarElement.replaceWith(newSidebar);
            }
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

          // Check if the file already has the new styles
          if (!content.includes("#sidebar:not(.ready)")) {
               // Add styles before the first </head>
               content = content.replace(
                    "</head>",
                    `${sidebarStyles}\n</head>`
               );
          }

          // Remove any existing sidebar initialization scripts
          content = content.replace(
               /<script type="module">\s*import\s*{\s*createSidebar\s*}\s*from\s*['"]\/components\/sidebar\.js['"];\s*(?:\/\/[^\n]*\n)*\s*(?:const|let|var)?\s*sidebarElement[^<]*<\/script>/g,
               ""
          );

          // Add the new initialization script before </head>
          content = content.replace("</head>", `${sidebarScript}\n</head>`);

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
