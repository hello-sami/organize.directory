// Initial sidebar content to prevent flicker
const initialSidebar = `
    <div class="sidebar-header">
        <img src="/logo.png" alt="The Organize Directory Logo" class="site-logo">
        <h1><a href="/" class="home-link">The Organize Directory</a></h1>
    </div>
    <nav>
        <a href="/" class="nav-link nav-link-base">Home</a>
        <div class="nav-group">
            <a href="/location" class="nav-group-title nav-link-group-header nav-link-base">Find a group</a>
            <a href="/location" class="nav-link nav-link-indented nav-link-base">by location</a>
            <a href="/topics" class="nav-link nav-link-indented nav-link-base">by topic</a>
        </div>
        <a href="/guides" class="nav-link nav-link-base">Guides</a>
        <a href="/contact" class="nav-link nav-link-base">Contact</a>
        <a href="/subscribe" class="nav-link nav-link-base">Subscribe</a>
    </nav>
    <div class="sidebar-motto">
       Don't despair, organize.
    </div>`;

/**
 * Inserts the sidebar into the document
 */
function insertSidebar() {
     // Create sidebar container
     const sidebarContainer = document.createElement("div");
     sidebarContainer.id = "sidebar";
     sidebarContainer.className = "sidebar";
     sidebarContainer.setAttribute("aria-label", "Main navigation");
     sidebarContainer.innerHTML = initialSidebar;

     // First try to find a sidebar placeholder
     const placeholder = document.getElementById("sidebar-placeholder");
     if (placeholder) {
          // Replace the placeholder with our sidebar
          placeholder.parentNode.replaceChild(sidebarContainer, placeholder);
          return;
     }

     // If no placeholder, insert at the start of .layout
     const layout = document.querySelector(".layout");
     if (layout) {
          layout.insertBefore(sidebarContainer, layout.firstChild);
     } else {
          console.error("Layout element not found");
     }
}

/**
 * Loads the sidebar.css file
 */
function loadSidebarStyles() {
     // Only load if not already loaded
     if (!document.querySelector('link[href*="sidebar.css"]')) {
          const linkElement = document.createElement("link");
          linkElement.rel = "stylesheet";
          linkElement.href = "/css/sidebar.css";
          document.head.appendChild(linkElement);
     }
}

/**
 * Remove inline styles added by outside scripts
 * This helps ensure our sidebar.css takes precedence
 */
function cleanupInlineStyles() {
     // Find elements that might have inline styles
     const headerH1 = document.querySelector(".sidebar-header h1");
     if (headerH1) {
          // Remove inline styles and add our CSS class instead
          headerH1.removeAttribute("style");
          headerH1.classList.add("clean-sidebar-title");

          const link = headerH1.querySelector("a");
          if (link) {
               link.removeAttribute("style");
               link.classList.add("clean-sidebar-link");
          }
     }
}

/**
 * Main function to initialize the sidebar
 * @param {string} activePage - The current active page
 */
export function initializeSidebar(activePage) {
     if (typeof document === "undefined") return;

     // Load sidebar styles first
     loadSidebarStyles();

     // Insert sidebar if it doesn't exist
     let sidebar = document.getElementById("sidebar");
     if (!sidebar) {
          insertSidebar();
          sidebar = document.getElementById("sidebar");
     }

     // Clean up any inline styles
     cleanupInlineStyles();

     // Handle active page detection
     const currentPath = window.location.pathname;
     const stateRegex =
          /\/(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new-hampshire|new-jersey|new-mexico|new-york|north-carolina|north-dakota|ohio|oklahoma|oregon|pennsylvania|rhode-island|south-carolina|south-dakota|tennessee|texas|utah|vermont|virginia|washington|west-virginia|wisconsin|wyoming)/;

     const isStatePage = stateRegex.test(currentPath);
     const isCityPage = currentPath.includes("/cities/");

     // If this is a city or state page, override the activePage to 'location'
     if (isStatePage || isCityPage) {
          activePage = "location";
     }

     // Remove ALL active classes first
     if (sidebar) {
          const allLinks = sidebar.querySelectorAll("a");
          allLinks.forEach((link) => {
               link.classList.remove("active");
               // Remove any inline styles that might have been added
               link.removeAttribute("style");
          });
     }

     // Apply correct active state based on the current page
     if (activePage === "home" || activePage === "index" || activePage === "") {
          // Only highlight Home on the homepage
          const homeLink = sidebar.querySelector('a[href="/"].nav-link');
          if (homeLink) {
               homeLink.classList.add("active");
          }
     } else if (activePage === "location") {
          // On location page, highlight the location link
          const locationLink = sidebar.querySelector(
               'a[href="/location"].nav-link-indented'
          );
          if (locationLink) {
               locationLink.classList.add("active");
          }
     } else if (activePage === "topics") {
          // On topics page, highlight the topics link
          const topicsLink = sidebar.querySelector(
               'a[href="/topics"].nav-link-indented'
          );
          if (topicsLink) {
               topicsLink.classList.add("active");
          }
     } else if (activePage === "subscribe") {
          // Special handling for subscribe page
          const subscribeLink = sidebar.querySelector(
               'a[href="/subscribe"].nav-link'
          );
          if (subscribeLink) {
               subscribeLink.classList.add("active");
          }
     } else {
          // For other pages, find and highlight the corresponding link
          const activeLink = sidebar.querySelector(
               `a[href="/${activePage}"].nav-link`
          );
          if (activeLink) {
               activeLink.classList.add("active");
          }
     }

     // Add class to the body indicating current page
     document.body.className = document.body.className.replace(
          /\bpage-\S+/g,
          ""
     );
     document.body.classList.add(`page-${activePage}`);

     // If this is a city or state page, add additional class
     if (isStatePage) {
          document.body.classList.add(
               "page-states-" + currentPath.split("/")[1]
          );
     } else if (isCityPage) {
          document.body.classList.add(
               "page-cities-" + currentPath.split("/")[2]
          );
     }

     // Add event listener for mobile menu toggle
     document
          .querySelectorAll(".mobile-menu-button, .mobile-menu-overlay")
          .forEach((element) => {
               if (element) {
                    element.addEventListener("click", () => {
                         if (sidebar) {
                              sidebar.classList.toggle("active");
                              const overlay = document.querySelector(
                                   ".mobile-menu-overlay"
                              );
                              if (overlay) {
                                   overlay.classList.toggle("active");
                              }
                              document.body.classList.toggle("menu-open");
                         }
                    });
               }
          });

     // Remove any preload links for posts.json that might be causing issues
     const preloadLinks = document.querySelectorAll('link[rel="preload"]');
     preloadLinks.forEach((link) => {
          if (link.href && link.href.includes("posts.json")) {
               link.parentNode.removeChild(link);
          }
     });
}

/**
 * Helper function to adjust paths based on directory depth
 * @param {HTMLElement} sidebar - The sidebar element
 * @param {number} depth - Directory depth
 */
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
