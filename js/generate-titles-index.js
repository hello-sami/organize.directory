// This script is used to generate a comprehensive JSON index of all page titles
// It can be run with Node.js to create a static index file
// This is more efficient than dynamically parsing titles on each page load

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";

// Get directory name using ES modules syntax
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, "..");

// Arrays to hold indexed items
const states = [];
const cities = [];
const topics = [];

// Function to extract title from HTML file
async function extractTitleFromFile(filePath, type) {
     try {
          const content = fs.readFileSync(filePath, "utf8");
          const dom = new JSDOM(content);
          const titleElement = dom.window.document.querySelector("title");

          if (titleElement) {
               // Extract the title text, typically in format "Title - Site Name"
               let title = titleElement.textContent.trim();

               // Remove site suffix if present
               if (title.includes(" - ")) {
                    title = title.split(" - ")[0].trim();
               }

               // Remove "Mutual Aid Networks" suffix if present
               if (title.includes(" Mutual Aid Networks")) {
                    title = title.replace(" Mutual Aid Networks", "").trim();
               }

               // Calculate the relative URL path
               const relativePath =
                    "/" + path.relative(rootDir, filePath).replace(/\\/g, "/");

               return {
                    title: title,
                    url: relativePath,
                    type: type,
               };
          }
          return null;
     } catch (error) {
          console.error(`Error processing ${filePath}:`, error.message);
          return null;
     }
}

// Process all files in a directory
async function processDirectory(dirPath, type) {
     try {
          const files = fs.readdirSync(dirPath);
          const results = [];

          for (const file of files) {
               if (file.endsWith(".html")) {
                    const filePath = path.join(dirPath, file);
                    const titleData = await extractTitleFromFile(
                         filePath,
                         type
                    );
                    if (titleData) {
                         results.push(titleData);
                    }
               }
          }

          return results;
     } catch (error) {
          console.error(
               `Error processing directory ${dirPath}:`,
               error.message
          );
          return [];
     }
}

// Main function to generate the index
async function generateTitleIndex() {
     console.log("Generating title index...");

     // Process states directory
     const statesDir = path.join(rootDir, "states");
     if (fs.existsSync(statesDir)) {
          const stateItems = await processDirectory(statesDir, "state");
          states.push(...stateItems);
          console.log(`Processed ${stateItems.length} state pages`);
     }

     // Process cities directory
     const citiesDir = path.join(rootDir, "cities");
     if (fs.existsSync(citiesDir)) {
          const cityItems = await processDirectory(citiesDir, "city");
          cities.push(...cityItems);
          console.log(`Processed ${cityItems.length} city pages`);
     }

     // Process topics directory
     const topicsDir = path.join(rootDir, "topics");
     if (fs.existsSync(topicsDir)) {
          const topicItems = await processDirectory(topicsDir, "topic");
          topics.push(...topicItems);
          console.log(`Processed ${topicItems.length} topic pages`);
     }

     // Combine all titles
     const allTitles = [...states, ...cities, ...topics];

     // Write to JSON file
     const outputPath = path.join(rootDir, "js", "title-index.json");
     fs.writeFileSync(outputPath, JSON.stringify(allTitles, null, 2));

     console.log(
          `Title index generated with ${allTitles.length} entries at ${outputPath}`
     );
}

// Run the generator
generateTitleIndex().catch((error) => {
     console.error("Error generating title index:", error);
});
