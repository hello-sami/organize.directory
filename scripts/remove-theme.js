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

// Function to remove theme-related code from HTML files
function removeThemeCode(filePath) {
     if (!filePath.endsWith(".html")) return;

     console.log(`Processing ${filePath}...`);
     let content = readFileSync(filePath, "utf8");

     // Remove inline theme script
     content = content.replace(
          /<!-- Inline theme script to prevent FOUC -->[\s\S]*?<\/script>/g,
          ""
     );

     // Remove theme.js script import
     content = content.replace(
          /<script src="\/js\/theme\.js"><\/script>\s*/g,
          ""
     );
     content = content.replace(
          /<script src="\.\.\/js\/theme\.js"><\/script>\s*/g,
          ""
     );

     // Remove theme-init.js script import
     content = content.replace(
          /<script src="\/js\/theme-init\.js"><\/script>\s*/g,
          ""
     );
     content = content.replace(
          /<script src="\.\.\/js\/theme-init\.js"><\/script>\s*/g,
          ""
     );

     // Remove any data-theme attributes
     content = content.replace(/\s*data-theme="[^"]*"/g, "");

     // Clean up any double newlines created by our removals
     content = content.replace(/\n\s*\n\s*\n/g, "\n\n");

     writeFileSync(filePath, content);
     console.log(`Processed ${filePath}`);
}

// Function to remove theme-related files
function removeThemeFiles() {
     const filesToRemove = ["js/theme.js", "js/theme-init.js"];

     filesToRemove.forEach((file) => {
          const filePath = join(process.cwd(), file);
          if (existsSync(filePath)) {
               unlinkSync(filePath);
               console.log(`Removed ${file}`);
          }
     });
}

// Main execution
console.log("Starting theme removal process...");

// Get the project root directory (two levels up from scripts folder)
const projectRoot = join(__dirname, "..");

// Process all HTML files
walkDir(projectRoot, removeThemeCode);

// Remove theme-related files
removeThemeFiles();

console.log("Theme removal complete!");
