import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Generate a timestamp for cache-busting
const timestamp = new Date().getTime();

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

     // Update the CSS link with a version parameter to bypass cache
     const updatedContent = content.replace(
          /<link rel="stylesheet" href="\/styles.css">/,
          `<link rel="stylesheet" href="/styles.css?v=${timestamp}">`
     );

     // Check if the content was actually modified
     if (content !== updatedContent) {
          fs.writeFileSync(filePath, updatedContent, "utf8");
          modifiedCount++;
          console.log(`Updated CSS link in ${fileName}`);
     } else {
          console.log(
               `Could not update CSS link in ${fileName} - pattern not found`
          );
     }
});

console.log(
     `\nUpdated CSS links in ${modifiedCount} files out of ${stateFiles.length} total files`
);

// Also update the cities list background on state pages directly
console.log("\nVerifying state page cities list styling...");

// Find the styles.css file
const stylesPath = path.join(__dirname, "styles.css");
let stylesContent = fs.readFileSync(stylesPath, "utf8");

// Double check that we're using the correct background color
if (stylesContent.includes("background: var(--bg-tint);")) {
     console.log("CSS already using correct background color var(--bg-tint)");
} else {
     // This should not happen as we already updated it, but just in case
     const updatedStyles = stylesContent.replace(
          /\.state-page \.cities-list \{[\s\S]*?background:[^;]*;/,
          ".state-page .cities-list {\n     display: grid;\n     grid-template-columns: repeat(4, 1fr);\n     gap: 1.5rem;\n     margin: 1.5rem 0;\n     background: var(--bg-tint);"
     );

     if (stylesContent !== updatedStyles) {
          fs.writeFileSync(stylesPath, updatedStyles, "utf8");
          console.log("Updated CSS file with correct background color");
     }
}

// Check if both --bg-tint and --card-bg values are correctly defined in the CSS
const bgTintMatch = stylesContent.match(/--bg-tint:\s*(#[0-9a-fA-F]{6});/);
const cardBgMatch = stylesContent.match(/--card-bg:\s*(#[0-9a-fA-F]{6});/);

if (bgTintMatch && cardBgMatch) {
     console.log(`--bg-tint color: ${bgTintMatch[1]}`);
     console.log(`--card-bg color: ${cardBgMatch[1]}`);
     console.log(
          `--bg-tint is ${bgTintMatch[1] === cardBgMatch[1] ? "the same as" : "different from"} --card-bg`
     );
} else {
     console.log("Could not find color variable definitions in the CSS");
}
