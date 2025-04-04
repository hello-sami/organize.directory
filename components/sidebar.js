// Initial sidebar content to prevent flicker
const initialSidebar = `
    <div class="sidebar-header">
        <img src="/logo.png" alt="The Organize Directory Logo" class="site-logo"><h1><a href="/" class="home-link" style="text-decoration: none !important; color: inherit !important; background-color: transparent !important; margin: 0; padding: 0;">The Organize Directory</a></h1>
    </div>
    <nav>
        <a href="/" class="nav-link">Home</a>
        <div class="nav-group">
            <a href="/location" class="nav-group-title nav-link-group-header">Find a group</a>
            <a href="/location" class="nav-link nav-link-indented">by location</a>
            <a href="/topics" class="nav-link nav-link-indented">by topic</a>
        </div>
        <a href="/guides" class="nav-link">Guides</a>
        <a href="/contact" class="nav-link">Contact</a>
        <a href="/subscribe" class="nav-link">Subscribe</a>
    </nav>
    <div class="sidebar-motto">
     Fascism is here. Don't despair, organize.
    </div>`;

// Function to insert sidebar HTML
function insertSidebar() {
     const sidebarContainer = document.createElement("div");
     sidebarContainer.id = "sidebar";
     sidebarContainer.className = "sidebar";
     sidebarContainer.setAttribute("aria-label", "Main navigation");
     sidebarContainer.innerHTML = initialSidebar;

     // Insert at the start of .layout
     const layout = document.querySelector(".layout");
     if (layout) {
          layout.insertBefore(sidebarContainer, layout.firstChild);
     } else {
          console.error("Layout element not found");
     }
}

// Critical styles that must be inlined in the head
const criticalStyles = `
    .sidebar {
        opacity: 1 !important;
        visibility: visible !important;
        background: var(--sidebar-bg, #FDF2F8);
        width: var(--sidebar-width, 280px) !important;
        height: 100vh;
        position: fixed;
        padding: 2rem 0;
        box-sizing: border-box;
        overflow-y: auto;
        z-index: 100;
    }
    .site-logo {
        display: block;
        width: 60px;
        height: 60px;
        margin: 0;
    }
    .sidebar-header {
        background-color: transparent;
        display: flex;
        flex-direction: row;
        align-items: center;
        justify-content: flex-start;
        padding: 0 1.5rem;
        margin-bottom: 1.5rem;
        gap: 0;
    }
    .sidebar-header h1 {
        margin: 0;
        padding: 0;
        padding-left: 0.2rem;
        text-align: left;
        font-size: 1.6rem;
        background-color: transparent !important;
    }
    .sidebar-header h1 a, 
    .sidebar-header h1 a:link,
    .sidebar-header h1 a:visited,
    .sidebar-header h1 a:hover,
    .sidebar-header h1 a:active,
    .home-link {
        color: inherit !important;
        text-decoration: none !important;
        background-color: transparent !important;
        font-weight: inherit !important;
        border-bottom: none !important;
        box-shadow: none !important;
        outline: none !important;
    }
    .sidebar h1 {
        margin: 0 0 0rem 0;
        font-size: 1.5rem;
        padding: 0 0rem;
    }
    .sidebar nav {
        margin-bottom: 2rem;
    }
    .sidebar .nav-link {
        display: block;
        padding: 0.75rem 1.5rem;
        color: inherit;
        text-decoration: none;
        border-top: 1px solid var(--border-color, #ffb3b3);
        border-bottom: 1px solid var(--border-color, #ffb3b3);
    }
    .sidebar .nav-group-title {
        display: block;
        font-weight: 600;
        margin: 0;
        padding: 0.75rem 1.5rem;
        border-top: 1px solid var(--border-color, #ffb3b3);
        border-bottom: 1px solid var(--border-color, #ffb3b3);
        margin-top: -1px;
        margin-bottom: -1px;
    }
    .sidebar .nav-link-group-header {
        cursor: pointer;
        color: inherit;
        text-decoration: none;
    }
    .sidebar .nav-link-group-header:hover {
        text-decoration: none;
        background-color: var(--bg-tint, #f5f5f5);
    }
    .sidebar .nav-link-indented {
        padding-left: 2.5rem;
    }
    .sidebar .nav-link.active {
        background-color: var(--pure-white, #ffffff);
        color: var(--primary-color, #a30000);
        font-weight: 600;
    }
    .sidebar .nav-link-indented.active + .nav-group-title,
    .sidebar .nav-link-indented.active ~ .nav-group-title,
    .sidebar .nav-link-indented.active + .nav-link-group-header,
    .sidebar .nav-link-indented.active ~ .nav-link-group-header {
        background-color: inherit;
        color: inherit;
        font-weight: normal;
        opacity: 0.7;
    }
    .sidebar .nav-link-group-header.active {
        background-color: var(--pure-white, #ffffff);
        color: var(--primary-color, #a30000);
        font-weight: 600;
    }
    .sidebar .sidebar-motto {
        font-style: italic;
        font-size: 0.9rem;
        padding: 0 1.5rem;
        margin-top: auto;
        padding-bottom: 2rem;
    }
    /* Add spacing rule to ensure content doesn't overlap with sidebar */
    .content {
        margin-left: calc(var(--sidebar-width, 280px) + 4rem) !important;
    }
    /* Mobile styles */
    @media (max-width: 1020px) {
        .content {
            margin-left: 0 !important;
        }
        .sidebar {
            transform: translateX(-100%);
            transition: transform 0.3s ease;
        }
        .sidebar.active {
            transform: translateX(0);
            box-shadow: 5px 0 15px rgba(0, 0, 0, 0.1);
        }
    }
`;

// Function to initialize critical styles
function initializeCriticalStyles() {
     if (typeof document !== "undefined") {
          // Add critical styles to head if not already present
          if (!document.querySelector("#sidebar-critical-styles")) {
               const styleEl = document.createElement("style");
               styleEl.id = "sidebar-critical-styles";
               styleEl.textContent = criticalStyles;
               document.head.insertBefore(styleEl, document.head.firstChild);
          }
     }
}

// Main function to initialize the sidebar
export function initializeSidebar(activePage) {
     if (typeof document === "undefined") return;

     console.log("Initializing sidebar for page:", activePage);

     // Initialize critical styles first
     initializeCriticalStyles();

     // If sidebar doesn't exist, insert it
     let sidebar = document.getElementById("sidebar");
     if (!sidebar) {
          insertSidebar();
          sidebar = document.getElementById("sidebar");
     }

     // SIMPLER AUTOMATIC DETECTION - Check URL for city or state pages
     const currentPath = window.location.pathname;
     // If this is a city or state page, override the activePage to 'location'
     if (
          currentPath.match(
               /\/(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new-hampshire|new-jersey|new-mexico|new-york|north-carolina|north-dakota|ohio|oklahoma|oregon|pennsylvania|rhode-island|south-carolina|south-dakota|tennessee|texas|utah|vermont|virginia|washington|west-virginia|wisconsin|wyoming)/
          ) ||
          currentPath.includes("/cities/")
     ) {
          activePage = "location";
          console.log(
               "Detected city/state page, setting active page to: location"
          );
     }

     // Remove ALL active classes first (simpler approach)
     const allLinks = sidebar.querySelectorAll("a");
     allLinks.forEach((link) => {
          link.classList.remove("active");
          // Also reset any inline styles that might be causing background colors
          link.style.backgroundColor = "";
          link.style.color = "";
          link.style.fontWeight = "";
     });

     // Apply correct active state based on the current page
     if (activePage === "home" || activePage === "index" || activePage === "") {
          // Only highlight Home on the homepage
          const homeLink = sidebar.querySelector('a[href="/"].nav-link');
          if (homeLink) {
               homeLink.classList.add("active");
               console.log("Home page - activated home link");
          }
     } else if (activePage === "location") {
          // On location page, highlight the location link
          const locationLink = sidebar.querySelector(
               'a[href="/location"].nav-link-indented'
          );
          if (locationLink) {
               locationLink.classList.add("active");
               console.log("Location page - activated location link");
          }
     } else if (activePage === "topics") {
          // On topics page, highlight the topics link
          const topicsLink = sidebar.querySelector(
               'a[href="/topics"].nav-link-indented'
          );
          if (topicsLink) {
               topicsLink.classList.add("active");
               console.log("Topics page - activated topics link");
          }
     } else if (activePage === "subscribe") {
          // Special handling for subscribe page
          const subscribeLink = sidebar.querySelector(
               'a[href="/subscribe"].nav-link'
          );
          if (subscribeLink) {
               subscribeLink.classList.add("active");
               console.log("Subscribe page - activated subscribe link");
          }
     } else {
          // For other pages, find and highlight the corresponding link
          const activeLink = sidebar.querySelector(
               `a[href="/${activePage}"].nav-link`
          );
          if (activeLink) {
               activeLink.classList.add("active");
               console.log(`Activated ${activePage} link`);
          }
     }

     // Add class to the body indicating current page
     document.body.className = document.body.className.replace(
          /\bpage-\S+/g,
          ""
     );
     document.body.classList.add(`page-${activePage}`);

     // If this is a city or state page, add additional class
     if (
          currentPath.match(
               /\/(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new-hampshire|new-jersey|new-mexico|new-york|north-carolina|north-dakota|ohio|oklahoma|oregon|pennsylvania|rhode-island|south-carolina|south-dakota|tennessee|texas|utah|vermont|virginia|washington|west-virginia|wisconsin|wyoming)/
          )
     ) {
          document.body.classList.add(
               "page-states-" + currentPath.split("/")[1]
          );
     } else if (currentPath.includes("/cities/")) {
          document.body.classList.add(
               "page-cities-" + currentPath.split("/")[2]
          );
     }

     // Add event listener for mobile menu toggle
     document
          .querySelectorAll(".mobile-menu-button, .mobile-menu-overlay")
          .forEach((element) => {
               element.addEventListener("click", () => {
                    sidebar.classList.toggle("active");
                    const overlay = document.querySelector(
                         ".mobile-menu-overlay"
                    );
                    if (overlay) {
                         overlay.classList.toggle("active");
                    }
                    document.body.classList.toggle("menu-open");
               });
          });

     // Remove any preload links for posts.json that might be causing issues
     const preloadLinks = document.querySelectorAll('link[rel="preload"]');
     preloadLinks.forEach((link) => {
          if (link.href && link.href.includes("posts.json")) {
               link.parentNode.removeChild(link);
          }
     });
}

// Helper function to adjust paths based on directory depth
export function adjustPaths(sidebar, depth = 0) {
     if (!sidebar) return;

     // Base path prefix
     let prefix = "./";
     for (let i = 0; i < depth; i++) {
          prefix += "../";
     }

     // Update all links with the correct prefix
     sidebar.querySelectorAll("a").forEach((link) => {
          // Skip links that are already absolute
          if (
               link.getAttribute("href") &&
               !link.getAttribute("href").startsWith("http") &&
               !link.getAttribute("href").startsWith("#") &&
               !link.getAttribute("href").startsWith("/")
          ) {
               // Extract the relative part (after ./)
               const href = link.getAttribute("href");
               if (href.startsWith("./")) {
                    const relativePath = href.substring(2);
                    link.setAttribute("href", prefix + relativePath);
               }
          }
     });

     // Update logo src
     const logo = sidebar.querySelector(".site-logo");
     if (
          logo &&
          logo.getAttribute("src") &&
          logo.getAttribute("src").startsWith("./")
     ) {
          const src = logo.getAttribute("src");
          const relativePath = src.substring(2);
          logo.setAttribute("src", prefix + relativePath);
     }
}
