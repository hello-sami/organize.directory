import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all HTML files in the cities directory
const citiesDir = path.join(__dirname, "cities");
const cityFiles = fs
     .readdirSync(citiesDir)
     .filter((file) => file.endsWith(".html"));

console.log(`Found ${cityFiles.length} city HTML files`);

let modifiedCount = 0;

// Process each file
cityFiles.forEach((fileName) => {
     const filePath = path.join(citiesDir, fileName);
     let content = fs.readFileSync(filePath, "utf8");

     // Check if the file already has a subscribe link
     if (
          content.includes(
               '<a href="/subscribe" class="nav-link">Subscribe</a>'
          )
     ) {
          console.log(`${fileName} already has a subscribe link. Skipping.`);
          return;
     }

     // Add the subscribe link after the contact link
     const updatedContent = content.replace(
          /<a href="\/contact" class="nav-link">Contact<\/a>/,
          '<a href="/contact" class="nav-link">Contact</a>\n        <a href="/subscribe" class="nav-link">Subscribe</a>'
     );

     // Check if the content was actually modified
     if (content !== updatedContent) {
          fs.writeFileSync(filePath, updatedContent, "utf8");
          modifiedCount++;
          console.log(`Added subscribe link to ${fileName}`);
     } else {
          console.log(
               `Could not add subscribe link to ${fileName} - pattern not found`
          );
     }
});

console.log(
     `\nAdded subscribe link to ${modifiedCount} files out of ${cityFiles.length} total files`
);
