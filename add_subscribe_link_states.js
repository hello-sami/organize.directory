import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all HTML files in the states directory
const statesDir = path.join(__dirname, "states");
const stateFiles = fs
     .readdirSync(statesDir)
     .filter((file) => file.endsWith(".html"));

console.log(`Found ${stateFiles.length} state HTML files`);

let modifiedCount = 0;

// Process each file
stateFiles.forEach((fileName) => {
     const filePath = path.join(statesDir, fileName);
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
          '<a href="/contact" class="nav-link">Contact</a>\n                <a href="/subscribe" class="nav-link">Subscribe</a>'
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
     `\nAdded subscribe link to ${modifiedCount} files out of ${stateFiles.length} total files`
);
