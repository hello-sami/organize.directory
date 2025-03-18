import {
     readFileSync,
     writeFileSync,
     readdirSync,
     statSync,
     existsSync,
     unlinkSync,
} from "fs";
import { join } from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Function to walk through directory recursively
function walkDir(dir, callback) {
     readdirSync(dir).forEach((f) => {
          let dirPath = join(dir, f);
          let isDirectory = statSync(dirPath).isDirectory();
          isDirectory ? walkDir(dirPath, callback) : callback(join(dir, f));
     });
}

// Function to remove theme and search related code from HTML files
function removeCode(filePath) {
     if (!filePath.endsWith(".html")) return;

     console.log(`Processing ${filePath}...`);
     let content = readFileSync(filePath, "utf8");

     // Remove critical theme script at top
     content = content.replace(
          /<!-- Critical theme script - keep at top -->[\s\S]*?<\/script>/g,
          ""
     );

     // Remove theme management section
     content = content.replace(
          /<!-- Theme Management -->[\s\S]*?<\/script>/g,
          ""
     );

     // Remove theme meta tags
     content = content.replace(/<meta[^>]*theme-color[^>]*>/g, "");

     // Remove theme preload
     content = content.replace(/<link[^>]*href="[^"]*theme\.js"[^>]*>/g, "");

     // Remove inline theme script
     content = content.replace(
          /<!-- Inline theme script to prevent FOUC -->[\s\S]*?<\/script>/g,
          ""
     );

     // Remove theme.js and theme-init.js script imports
     content = content.replace(
          /<script[^>]*src="[^"]*\/(?:theme|theme-init)\.js"[^>]*><\/script>\s*/g,
          ""
     );

     // Remove search-related scripts
     content = content.replace(
          /<script[^>]*src="[^"]*\/(?:search|search-init|search-header|search-index)\.js"[^>]*><\/script>\s*/g,
          ""
     );

     // Remove search container elements
     content = content.replace(
          /<div[^>]*id="searchContainer"[^>]*>.*?<\/div>/gs,
          ""
     );

     // Remove search initialization code
     content = content.replace(
          /<!-- Initialize search -->[\s\S]*?<script[^>]*>[\s\S]*?initializeSearch\([^)]*\);[\s\S]*?<\/script>/g,
          ""
     );

     // Remove search input and results elements
     content = content.replace(
          /<div[^>]*class="search-container"[^>]*>[\s\S]*?<\/div>/gs,
          ""
     );
     content = content.replace(
          /<input[^>]*id="searchInput"[^>]*>[\s\S]*?(?=<\/div>)/g,
          ""
     );
     content = content.replace(
          /<div[^>]*id="searchResults"[^>]*>[\s\S]*?<\/div>/gs,
          ""
     );

     // Remove search-related script blocks
     content = content.replace(
          /<script[^>]*>[\s\S]*?searchInput[\s\S]*?<\/script>/gs,
          ""
     );
     content = content.replace(
          /<script[^>]*>[\s\S]*?initializeSearch[\s\S]*?<\/script>/gs,
          ""
     );

     // Remove searchHeaderId configuration
     content = content.replace(/searchHeaderId:\s*'[^']*',?\s*/g, "");

     // Remove mobile search elements
     content = content.replace(
          /<div[^>]*class="mobile-search"[^>]*>[\s\S]*?<\/div>/gs,
          ""
     );

     // Remove any data-theme attributes
     content = content.replace(/\s*data-theme="[^"]*"/g, "");

     // Remove theme initialization comments
     content = content.replace(/<!-- Initialize theme toggle -->\s*/g, "");
     content = content.replace(/<!-- Theme -->\s*/g, "");
     content = content.replace(
          /<!-- Theme Toggle Script - Load early -->\s*/g,
          ""
     );

     // Clean up any double newlines created by removals
     content = content.replace(/\n{3,}/g, "\n\n");

     writeFileSync(filePath, content);
     console.log(`Processed ${filePath}`);
}

// Function to remove theme and search related files
function removeFiles() {
     const filesToRemove = [
          // Theme files
          "js/theme.js",
          "js/theme-init.js",
          "theme.js",
          // Search files
          "js/search.js",
          "js/search-init.js",
          "components/search-header.js",
          "search/index.js",
          "search/search-index.js",
          "search-index.js",
          "js/states/states.js",
          "scripts/mobile-menu.js",
     ];

     filesToRemove.forEach((file) => {
          const filePath = join(process.cwd(), file);
          if (existsSync(filePath)) {
               unlinkSync(filePath);
               console.log(`Removed ${file}`);
          }
     });
}

// Function to update CSS file
function updateCSS(filePath) {
     if (!filePath.endsWith("styles.css")) return;

     console.log(`Processing ${filePath}...`);
     let content = readFileSync(filePath, "utf8");

     // Remove search-related CSS
     content = content.replace(
          /\/\* Search Components \*\/[\s\S]*?(?=\/\* Theme Toggle \*\/|\/\* Mobile Menu \*\/)/g,
          ""
     );

     // Remove theme toggle CSS
     content = content.replace(
          /\/\* Theme Toggle \*\/[\s\S]*?(?=\/\* Mobile Menu \*\/)/g,
          ""
     );

     // Remove mobile search CSS
     content = content.replace(
          /\.mobile-search[\s\S]*?(?=\/\* Topic Cards \*\/)/g,
          ""
     );

     // Remove theme variables section
     content = content.replace(
          /\/\* Theme Variables \*\/[\s\S]*?\/\* Light theme \*\/\s*/g,
          ""
     );

     // Remove search input styles
     content = content.replace(/\.search-input\s*{[\s\S]*?}/g, "");

     // Clean up any double newlines
     content = content.replace(/\n{3,}/g, "\n\n");

     writeFileSync(filePath, content);
     console.log(`Updated CSS in ${filePath}`);
}

// Main execution
console.log("Starting theme and search removal process...");

// Get the project root directory (two levels up from scripts folder)
const projectRoot = join(__dirname, "..");

// Process all HTML files
walkDir(projectRoot, removeCode);

// Process CSS files
walkDir(projectRoot, updateCSS);

// Remove theme and search related files
removeFiles();

console.log("Theme and search removal complete!");
