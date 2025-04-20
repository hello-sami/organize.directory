/**
 * Script to update all HTML files in the website to use local fonts.css
 *
 * This script:
 * 1. Recursively finds all HTML files
 * 2. Removes Google Fonts references
 * 3. Adds a reference to the local fonts.css if missing
 *
 * Run with: node scripts/update-fonts.js
 */

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES Module equivalents for __dirname and __filename
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Promisify fs functions
const readDir = (dir) => fs.promises.readdir(dir);
const stat = (path) => fs.promises.stat(path);
const readFile = (path, options) => fs.promises.readFile(path, options);
const writeFile = (path, data, options) =>
     fs.promises.writeFile(path, data, options);

// Base directory - one level up from the script location
const baseDirectory = path.resolve(__dirname, "..");

// Counter to track changes
let filesProcessed = 0;
let filesModified = 0;
let filesSkipped = 0;

/**
 * Recursively find all HTML files in a directory
 */
async function findHtmlFiles(directory) {
     const files = await readDir(directory);
     let htmlFiles = [];

     for (const file of files) {
          // Skip node_modules, .git, etc.
          if (file.startsWith(".") || file === "node_modules") {
               continue;
          }

          const filePath = path.join(directory, file);
          const stats = await stat(filePath);

          if (stats.isDirectory()) {
               // Recursively search subdirectories
               const subDirHtmlFiles = await findHtmlFiles(filePath);
               htmlFiles = [...htmlFiles, ...subDirHtmlFiles];
          } else if (file.endsWith(".html")) {
               // Found an HTML file
               htmlFiles.push(filePath);
          }
     }

     return htmlFiles;
}

/**
 * Update a single HTML file
 */
async function updateHtmlFile(filePath) {
     console.log(`Processing: ${filePath}`);
     filesProcessed++;

     try {
          // Read file content
          const content = await readFile(filePath, "utf8");

          // Check if fonts.css is already included
          if (content.includes('href="/fonts/fonts.css"')) {
               console.log(`  - Already has fonts.css: ${filePath}`);
               filesSkipped++;
               return;
          }

          // Two possible replacements:

          // 1. Replace Google Fonts link with fonts.css
          const googleFontsPattern =
               /<link[^>]*href=["']https:\/\/fonts\.googleapis\.com[^>]*>/g;
          let newContent = content;

          if (googleFontsPattern.test(content)) {
               // If Google Fonts link exists, replace it
               newContent = content.replace(
                    googleFontsPattern,
                    '<link rel="stylesheet" href="/fonts/fonts.css">'
               );
          } else {
               // 2. Add the fonts.css link before the styles.css link
               const stylesPattern =
                    /<link[^>]*href=["'][^"']*styles\.css[^>]*>/;

               if (stylesPattern.test(newContent)) {
                    newContent = newContent.replace(
                         stylesPattern,
                         '<link rel="stylesheet" href="/fonts/fonts.css">\n  $&'
                    );
               } else {
                    // Fallback: try to insert after the last <link> tag in <head>
                    const headEndPattern = /<\/head>/;
                    newContent = newContent.replace(
                         headEndPattern,
                         '  <link rel="stylesheet" href="/fonts/fonts.css">\n</head>'
                    );
               }
          }

          // Only write file if content was changed
          if (newContent !== content) {
               await writeFile(filePath, newContent, "utf8");
               console.log(`  - Updated: ${filePath}`);
               filesModified++;
          } else {
               console.log(`  - No changes needed: ${filePath}`);
               filesSkipped++;
          }
     } catch (error) {
          console.error(`  - Error processing ${filePath}:`, error);
          filesSkipped++;
     }
}

/**
 * Main function to run the script
 */
async function main() {
     console.log("Starting font update script...");

     try {
          // Find all HTML files
          const htmlFiles = await findHtmlFiles(baseDirectory);
          console.log(`Found ${htmlFiles.length} HTML files`);

          // Process each file
          for (const file of htmlFiles) {
               await updateHtmlFile(file);
          }

          // Report results
          console.log("\nSummary:");
          console.log(`Total files processed: ${filesProcessed}`);
          console.log(`Files modified: ${filesModified}`);
          console.log(`Files skipped: ${filesSkipped}`);
          console.log("Complete!");
     } catch (error) {
          console.error("Error:", error);
     }
}

// Run the script
main().catch(console.error);
