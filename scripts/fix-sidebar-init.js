import fs from "fs";
import path from "path";
import { glob } from "glob";

// Find all city HTML files
const cityFiles = await glob("cities/**/*.html");

const preconnectLinks = `
    <!-- Preconnect to Google Fonts -->
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>`;

const desiredInitBlock = `
    <!-- Initialize components -->
    <script type="module">
      import { createSidebar } from "/components/sidebar.js";
      import { initializeComponents } from "/utils/init.js";

      document.addEventListener('DOMContentLoaded', () => {
        document.getElementById("sidebar").replaceWith(createSidebar("location"));

        initializeComponents({
          sidebarType: "location",
          searchHeaderId: "header",
        });
      });
    </script>
    <script src="/theme.js" type="module"></script>`;

for (const file of cityFiles) {
  console.log(`Processing ${file}...`);
  let content = fs.readFileSync(file, "utf8");

  // Remove any early sidebar initialization from head
  content = content.replace(
    /<!-- Critical Scripts -->\s*<script type="module">[\s\S]*?createSidebar[^<]*<\/script>/,
    ""
  );

  // Remove any standalone theme.js script tags
  content = content.replace(
    /<script src="\/theme\.js"[^>]*><\/script>\s*/g,
    ""
  );

  // Remove any existing component initialization blocks
  content = content.replace(
    /<!-- Initialize components -->[\s\S]*?<script type="module">[\s\S]*?<\/script>/g,
    ""
  );

  // Remove any remaining sidebar initialization
  content = content.replace(
    /<script type="module">[\s\S]*?createSidebar[\s\S]*?<\/script>/g,
    ""
  );

  // Add preconnect links before the Google Fonts stylesheet
  content = content.replace(
    /<link\s+href="https:\/\/fonts\.googleapis\.com/,
    `${preconnectLinks}\n    <link href="https://fonts.googleapis.com`
  );

  // Insert our desired initialization block before the closing body tag
  content = content.replace(/<\/body>/, `${desiredInitBlock}\n  </body>`);

  // Clean up any multiple newlines
  content = content.replace(/\n\s*\n\s*\n/g, "\n\n");

  fs.writeFileSync(file, content);
  console.log(`Finished processing ${file}`);
}
