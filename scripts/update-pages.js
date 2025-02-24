import { glob } from "glob";
import { readFileSync, writeFileSync } from "fs";

const updateHtmlFile = (filePath) => {
     let content = readFileSync(filePath, "utf8");

     // Remove any existing sidebar HTML structure and text content
     content = content.replace(
          /<h1><a[^>]*>The Organize Directory<\/a>[\s\S]*?<\/div>/g,
          ""
     );
     content = content.replace(/<aside[^>]*>[\s\S]*?<\/aside>/g, "");

     // Remove any plaintext sidebar content between layout and main content
     content = content.replace(
          /<div class="layout">\s*([^<]*(?:<(?!main|div)[^>]*>[^<]*)*)<(main|div)/g,
          '<div class="layout">\n        <$2'
     );

     // Clean up any empty script tags and comments
     content = content.replace(/<!--\s*Initialize Sidebar\s*-->\s*\n?\s*/g, "");
     content = content.replace(
          /<!--\s*Initialize other components\s*-->\s*\n?\s*/g,
          ""
     );
     content = content.replace(
          /<!--\s*Theme and Components\s*-->\s*\n?\s*/g,
          ""
     );
     content = content.replace(
          /<!--\s*Initialize components\s*-->\s*\n?\s*/g,
          ""
     );
     content = content.replace(/<!--\s*Scripts\s*-->\s*\n?\s*/g, "");
     content = content.replace(/<!--\s*Initialize Search\s*-->\s*\n?\s*/g, "");

     // Remove all existing initialization scripts
     content = content.replace(
          /<script type="module">\s*import\s*{\s*[^}]*}\s*from\s*['"][^'"]*['"];\s*[^<]*<\/script>\s*\n?/g,
          ""
     );

     // Add initialization scripts to head
     const initScripts = `
    <!-- Initialize Components -->
    <script type="module">
        import { initializeSidebar } from '/components/sidebar.js';
        import { initializeComponents } from '/utils/init.js';
        
        document.addEventListener('DOMContentLoaded', () => {
            // Initialize sidebar first
            initializeSidebar('${filePath.includes("/topics/") ? "topic" : "location"}');
            
            // Initialize other components
            initializeComponents({
                searchHeaderId: 'header'
            });
        });
    </script>`;

     // Add the init scripts before </head>
     content = content.replace("</head>", `${initScripts}\n</head>`);

     // Ensure proper layout structure
     if (!content.includes('<div class="layout">')) {
          content = content.replace(
               /<body[^>]*>/,
               '$&\n    <div class="layout">'
          );
          content = content.replace("</body>", "    </div>\n</body>");
     }

     // Add the empty sidebar div if it doesn't exist
     if (!content.includes('id="sidebar"')) {
          content = content.replace(
               /<div class="layout">\s*/,
               `<div class="layout">\n        <div id="sidebar" class="sidebar" aria-label="Main navigation"></div>\n`
          );
     }

     writeFileSync(filePath, content, "utf8");
     console.log(`Updated ${filePath}`);
};

const main = async () => {
     try {
          const files = await glob("**/*.html");
          console.log(`Found ${files.length} HTML files to update`);

          for (const file of files) {
               updateHtmlFile(file);
          }

          console.log("All files updated successfully");
     } catch (error) {
          console.error("Error updating files:", error);
          process.exit(1);
     }
};

main();
