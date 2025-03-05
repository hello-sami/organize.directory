import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { glob } from "glob";

// Critical sidebar initialization code to insert
const criticalSidebarInit = `
    <!-- Critical modules -->
    <script type="module">
        import { initializeSidebar } from '/components/sidebar.js';
        window.initializeSidebar = initializeSidebar;
    </script>
`;

// Function to update a single HTML file
function updateHtmlFile(filePath) {
     let content = readFileSync(filePath, "utf8");

     // Skip if already has the critical modules section
     if (content.includes("<!-- Critical modules -->")) {
          console.log(`Skipping ${filePath} - already updated`);
          return;
     }

     // Find the position to insert the critical sidebar init
     // Look for common meta tags that appear in the head
     const insertAfterPatterns = [
          '<meta property="og:type" content="website">',
          '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
          "<!-- Google Analytics -->",
     ];

     let insertPosition = -1;
     for (const pattern of insertAfterPatterns) {
          const pos = content.indexOf(pattern);
          if (pos !== -1) {
               insertPosition = content.indexOf("\n", pos) + 1;
               break;
          }
     }

     if (insertPosition === -1) {
          console.error(`Could not find insertion point in ${filePath}`);
          return;
     }

     // Insert the critical sidebar initialization
     const newContent =
          content.slice(0, insertPosition) +
          criticalSidebarInit +
          content.slice(insertPosition);

     // Update initializeSidebar call if it exists
     const updatedContent = newContent
          .replace(
               /import\s*{\s*initializeSidebar\s*}\s*from\s*['"]\/components\/sidebar\.js['"];?\s*\n/g,
               ""
          )
          .replace(
               /initializeSidebar\(['"]([^'"]+)['"]\)/g,
               "window.initializeSidebar('$1')"
          );

     // Write the updated content back to the file
     writeFileSync(filePath, updatedContent);
     console.log(`Updated ${filePath}`);
}

// Find all HTML files in the project
const htmlFiles = await glob("**/*.html", {
     ignore: ["node_modules/**", "dist/**"],
});

// Update each HTML file
htmlFiles.forEach((file) => {
     const filePath = join(process.cwd(), file);
     updateHtmlFile(filePath);
});

console.log("Finished updating HTML files");
