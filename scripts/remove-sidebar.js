const fs = require("fs").promises;
const path = require("path");

// Function to get all HTML files recursively
async function getHtmlFiles(dir) {
     const files = await fs.readdir(dir);
     const htmlFiles = [];

     for (const file of files) {
          const filePath = path.join(dir, file);
          const stat = await fs.stat(filePath);

          if (stat.isDirectory() && !file.startsWith(".")) {
               // Recursively search subdirectories, excluding hidden directories
               htmlFiles.push(...(await getHtmlFiles(filePath)));
          } else if (file.endsWith(".html")) {
               htmlFiles.push(filePath);
          }
     }

     return htmlFiles;
}

// Function to determine the active page from the file path
function getActivePage(filePath) {
     const relativePath = path.relative(process.cwd(), filePath);

     if (relativePath === "index.html") return "home";
     if (relativePath === "location.html") return "location";
     if (relativePath === "topics.html") return "topics";
     if (relativePath === "guides.html") return "guides";
     if (relativePath === "contact.html") return "contact";

     if (relativePath.startsWith("topics/")) return "topics";
     if (
          relativePath.startsWith("states/") ||
          relativePath.startsWith("cities/")
     )
          return "location";

     return "home"; // default
}

// Function to transform HTML content
function transformHtml(content, activePage) {
     // Remove the hard-coded sidebar
     content = content.replace(
          /<div id="sidebar"[\s\S]*?<\/div>\s*<main/m,
          "<main"
     );

     // Update or add the initialization script
     const initScript = `
    <!-- Initialize Components -->
    <script type="module">
        import { initializeSidebar } from '/components/sidebar.js';
        import { initializeComponents } from '/utils/init.js';

        // Initialize sidebar first
        initializeSidebar('${activePage}');

        // Initialize other components
        initializeComponents({});
    </script>`;

     // Replace existing initialization script or add before </head>
     if (content.includes("<!-- Initialize Components -->")) {
          content = content.replace(
               /<!-- Initialize Components -->[\s\S]*?<\/script>/m,
               initScript
          );
     } else {
          content = content.replace("</head>", `${initScript}\n</head>`);
     }

     return content;
}

// Main function
async function main() {
     try {
          const htmlFiles = await getHtmlFiles(".");

          for (const file of htmlFiles) {
               console.log(`Processing ${file}...`);

               const content = await fs.readFile(file, "utf8");
               const activePage = getActivePage(file);
               const transformedContent = transformHtml(content, activePage);

               await fs.writeFile(file, transformedContent);
               console.log(`✓ Updated ${file}`);
          }

          console.log("\nAll files have been updated successfully!");
     } catch (error) {
          console.error("Error:", error);
          process.exit(1);
     }
}

main();
