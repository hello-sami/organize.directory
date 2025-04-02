import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { JSDOM } from "jsdom";

// Get current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Function to count initiatives in a file
function countInitiatives(filePath) {
     try {
          const content = fs.readFileSync(filePath, "utf8");
          const dom = new JSDOM(content);
          const initiatives =
               dom.window.document.getElementsByClassName("initiative");
          return initiatives.length;
     } catch (error) {
          console.error(`Error reading file ${filePath}: ${error.message}`);
          return 0;
     }
}

// Function to count initiatives in a directory
function countInitiativesInDirectory(directoryPath, label) {
     try {
          if (!fs.existsSync(directoryPath)) {
               console.log(`Directory ${directoryPath} does not exist.`);
               return { files: [], totalCount: 0 };
          }

          const files = fs
               .readdirSync(directoryPath)
               .filter((file) => file.endsWith(".html"));

          let totalCount = 0;
          const counts = files
               .map((file) => {
                    const filePath = path.join(directoryPath, file);
                    const count = countInitiatives(filePath);
                    totalCount += count;
                    return { name: file.replace(".html", ""), count };
               })
               .sort((a, b) => b.count - a.count); // Sort by count in descending order

          return { files: counts, totalCount };
     } catch (error) {
          console.error(
               `Error processing directory ${directoryPath}: ${error.message}`
          );
          return { files: [], totalCount: 0 };
     }
}

// Directories to check
const directories = [
     { path: path.join(__dirname, "..", "cities"), label: "Cities" },
     { path: path.join(__dirname, "..", "topics"), label: "Topics" },
     { path: path.join(__dirname, "..", "states"), label: "States" },
];

// Process all directories
let grandTotal = 0;

for (const dir of directories) {
     console.log(`\n${dir.label} Initiative Counts:`);
     console.log("-------------------------");

     const { files, totalCount } = countInitiativesInDirectory(
          dir.path,
          dir.label
     );
     grandTotal += totalCount;

     // Print results
     files.forEach(({ name, count }) => {
          console.log(`${name.padEnd(20)}: ${count} initiatives`);
     });

     console.log("-------------------------");
     console.log(`Total ${dir.label} initiatives: ${totalCount}`);
}

console.log("\n=========================");
console.log(`Grand Total (all pages): ${grandTotal} initiatives`);
console.log("=========================");
