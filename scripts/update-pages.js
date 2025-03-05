import { readFileSync, writeFileSync } from "fs";
import { join } from "path";
import { glob } from "glob";

// Critical sidebar initialization code to insert
const criticalSidebarInit = `
    <!-- Initialize Components -->
    <script type="module">
        import { initializeSidebar } from '/components/sidebar.js';
        import { initializeComponents } from '/utils/init.js';

        // Initialize sidebar first
        initializeSidebar('$PAGE_TYPE');

        // Initialize other components
        initializeComponents({
            searchHeaderId: 'header'
        });
    </script>
</head>

<body>
    <div class="layout">
        <div id="sidebar" class="sidebar" aria-label="Main navigation">
            <h1><a href="/" class="home-link">The Organize Directory</a></h1>
            <nav>
                <a href="/" class="nav-link">Home</a>
                <div class="nav-group">
                    <span class="nav-group-title">Find a group</span>
                    <a href="/location" class="nav-link nav-link-indented">by location</a>
                    <a href="/topics" class="nav-link nav-link-indented">by topic</a>
                </div>
                <a href="/guides" class="nav-link">Guides</a>
                <a href="/contact" class="nav-link">Contact</a>
            </nav>
            <div class="sidebar-motto">
                Solidarity not charity.<br>
                Awareness into action.
            </div>
        </div>
`;

// Function to determine page type from file path
function getPageType(filePath) {
     if (filePath.includes("topics/")) return "topics";
     if (filePath.includes("guides")) return "guides";
     if (filePath.includes("contact")) return "contact";
     if (
          filePath.includes("location") ||
          filePath.includes("cities/") ||
          filePath.includes("states/")
     )
          return "location";
     return "home";
}

// Function to update a single HTML file
function updateHtmlFile(filePath) {
     let content = readFileSync(filePath, "utf8");

     // Find the position to insert the critical sidebar init
     // Look for common meta tags that appear in the head
     const insertAfterPatterns = [
          '<script src="/js/theme-init.js',
          '<link href="https://fonts.googleapis.com',
          '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
          "<head>",
     ];

     let insertPosition = -1;
     for (const pattern of insertAfterPatterns) {
          const pos = content.indexOf(pattern);
          if (pos !== -1) {
               insertPosition = content.indexOf("\n", pos) + 1;
               break;
          }
     }

     if (insertPosition === -1) {
          console.error(`Could not find insertion point in ${filePath}`);
          return;
     }

     // Remove any existing initialization scripts and malformed tags
     content = content.replace(
          /<!-- Initialize Components -->[\s\S]*?<\/script>\s*/g,
          ""
     );
     content = content.replace(
          /<!-- Critical modules -->[\s\S]*?<\/script>\s*/g,
          ""
     );
     content = content.replace(/<d[\s\S]*?iv id="sidebar"[\s\S]*?<\/div>/g, "");
     content = content.replace(/<div id="sidebar"[\s\S]*?<\/div>/g, "");
     content = content.replace(
          /<\/head>[\s\S]*?<body>[\s\S]*?<div class="layout">/g,
          ""
     );

     // Get the page type
     const pageType = getPageType(filePath);

     // Insert the critical sidebar initialization
     const newContent =
          content.slice(0, insertPosition) +
          criticalSidebarInit.replace("$PAGE_TYPE", pageType) +
          content.slice(insertPosition);

     writeFileSync(filePath, newContent);
     console.log(`Updated ${filePath}`);
}

// Find and update all HTML files in states and cities directories
async function updateAllPages() {
     const files = await glob("**/*.html", {
          ignore: ["node_modules/**", "dist/**"],
     });

     for (const file of files) {
          updateHtmlFile(file);
     }
}

updateAllPages().catch(console.error);

console.log("Finished updating HTML files");
