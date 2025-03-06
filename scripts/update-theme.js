import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";

// Find all HTML files
const files = await glob("**/*.html", {
     ignore: ["node_modules/**", "templates/**"],
});

// Process each file
for (const file of files) {
     let content = readFileSync(file, "utf8");

     // Check if theme.js is already included
     if (!content.includes('src="/js/theme.js"')) {
          // Add theme.js before closing body tag
          content = content.replace(
               "</body>",
               '    <!-- Theme Toggle -->\n    <script src="/js/theme.js"></script>\n</body>'
          );

          // Write the updated content back
          writeFileSync(file, content, "utf8");
          console.log(`Added theme.js to ${file}`);
     } else {
          console.log(`theme.js already present in ${file}`);
     }
}
