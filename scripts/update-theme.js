import { readFileSync, writeFileSync } from "fs";
import { glob } from "glob";

// The inline theme script to be added
const themeScript = `
<!-- Inline theme script to prevent FOUC -->
<script>
    (function () {
        function applyTheme() {
            try {
                const savedTheme = localStorage.getItem("theme");
                if (savedTheme) {
                    document.documentElement.setAttribute("data-theme", savedTheme);
                } else {
                    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
                    const theme = prefersDark ? "dark" : "light";
                    document.documentElement.setAttribute("data-theme", theme);
                    localStorage.setItem("theme", theme);
                }
            } catch (e) {
                document.documentElement.setAttribute("data-theme", "light");
            }
        }
        applyTheme();
        document.addEventListener("visibilitychange", function() {
            if (document.visibilityState === "visible") {
                applyTheme();
            }
        });
    })();
</script>
`;

// Find all HTML files
const files = await glob("**/*.html", {
     ignore: ["node_modules/**", "templates/**"],
});

files.forEach((file) => {
     try {
          let content = readFileSync(file, "utf8");

          // Skip if the file already has the inline theme script
          if (content.includes("Inline theme script to prevent FOUC")) {
               console.log(`Skipping ${file} - already has theme script`);
               return;
          }

          // Remove the old theme.js script reference if it exists
          content = content.replace(
               /\s*<script src="\/js\/theme\.js"><\/script>/g,
               ""
          );

          // Add the inline theme script after the viewport meta tag
          content = content.replace(
               /<meta name="viewport"[^>]*>/i,
               `$&\n${themeScript}`
          );

          // Add the theme.js script reference for the toggle button
          content = content.replace(
               /<link[^>]*stylesheet[^>]*>/i,
               `$&\n    <!-- Initialize theme toggle -->\n    <script src="/js/theme.js"></script>`
          );

          writeFileSync(file, content, "utf8");
          console.log(`Updated ${file}`);
     } catch (err) {
          console.error(`Error processing ${file}:`, err);
     }
});
