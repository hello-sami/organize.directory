// Initial sidebar content to prevent flicker
const initialSidebar = `
    <div class="sidebar-header">
        <a href="/">
          <img src="/logo.png" alt="Organize Directory Logo" class="site-logo">
        </a>
    </div>
    <nav>
        <a href="/" class="nav-link nav-link-base">HOME</a>
        <a href="/location" class="nav-link nav-link-base">FIND A GROUP</a>
        <a href="/location" class="nav-link nav-link-indented nav-link-base">BY LOCATION</a>
        <a href="/topics" class="nav-link nav-link-indented nav-link-base">BY TOPIC</a>
        <a href="/guides" class="nav-link nav-link-base">GUIDES</a>
        <a href="/contact" class="nav-link nav-link-base">CONTACT</a>
        <a href="/subscribe" class="nav-link nav-link-base">SUBSCRIBE</a>
    </nav>
    <div class="sidebar-motto">
       DON'T DESPAIR, ORGANIZE.
    </div>`;

/**
 * Inserts the sidebar into the document
 */
function insertSidebar() {
     // Create sidebar container
     const sidebarContainer = document.createElement("div");
     sidebarContainer.className = "sidebar";
     sidebarContainer.id = "sidebar";
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
 * Remove inline styles added by outside scripts
 * This helps ensure our CSS takes precedence
 */
function cleanupInlineStyles() {
     // Find logo element and ensure no inline styles
     const logo = document.querySelector(".sidebar-header .site-logo");
     if (logo) {
          logo.removeAttribute("style");
     }

     // Find logo link and ensure no inline styles
     const logoLink = document.querySelector(".sidebar-header a");
     if (logoLink) {
          logoLink.removeAttribute("style");
     }
}

/**
 * Handle mobile sidebar toggle functionality
 */
function setupMobileToggle() {
     // Simplified mobile menu handling
     const toggleElements = document.querySelectorAll(
          ".mobile-menu-button, .mobile-menu-overlay, #menu-toggle"
     );

     toggleElements.forEach((element) => {
          if (!element) return;

          element.addEventListener("click", () => {
               const sidebar = document.querySelector(".sidebar");
               if (!sidebar) return;

               // Toggle all classes that might be used by different implementations
               sidebar.classList.toggle("active");
               sidebar.classList.toggle("sidebar-open");

               // Toggle body classes
               document.body.classList.toggle("menu-open");
               document.body.classList.toggle("sidebar-active");

               // Toggle overlay if it exists
               const overlay = document.querySelector(".mobile-menu-overlay");
               if (overlay) {
                    overlay.classList.toggle("active");
               }
          });
     });
}

/**
 * Main function to initialize the sidebar
 * @param {string} activePage - The current active page
 */
export function initializeSidebar(activePage) {
     if (typeof document === "undefined") return;

     // Insert sidebar if it doesn't exist
     let sidebar = document.querySelector(".sidebar");
     if (!sidebar) {
          insertSidebar();
          sidebar = document.querySelector(".sidebar");
     }

     // Clean up any inline styles
     cleanupInlineStyles();

     // Handle active page detection based on path or passed parameter
     const currentPath = window.location.pathname;

     // Special page detection for state and city pages
     const stateRegex =
          /\/(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new-hampshire|new-jersey|new-mexico|new-york|north-carolina|north-dakota|ohio|oklahoma|oregon|pennsylvania|rhode-island|south-carolina|south-dakota|tennessee|texas|utah|vermont|virginia|washington|west-virginia|wisconsin|wyoming)/;
     const isStatePage = stateRegex.test(currentPath);
     const isCityPage = currentPath.includes("/cities/");

     // Override active page for state and city pages
     if (isStatePage || isCityPage) {
          activePage = "location";
     }

     // If activePage is empty or undefined, try to determine from path
     if (!activePage) {
          const pathParts = currentPath.split("/").filter(Boolean);
          activePage = pathParts.length > 0 ? pathParts[0] : "home";
     }

     // Remove ALL active classes first
     if (sidebar) {
          sidebar.querySelectorAll("a").forEach((link) => {
               link.classList.remove("active");
               link.removeAttribute("style");
               link.removeAttribute("aria-current");
          });
     }

     // Map of special cases for active link selection
     const specialCases = {
          home: 'a[href="/"].nav-link-base',
          index: 'a[href="/"].nav-link-base',
          "": 'a[href="/"].nav-link-base',
          location: 'a[href="/location"].nav-link-indented',
          topics: 'a[href="/topics"].nav-link-indented',
     };

     // Apply active state to the correct link
     const selector =
          specialCases[activePage] || `a[href="/${activePage}"].nav-link-base`;
     const activeLink = sidebar.querySelector(selector);

     if (activeLink) {
          activeLink.classList.add("active");
          activeLink.setAttribute("aria-current", "page");
     }

     // Add class to the body indicating current page
     document.body.className = document.body.className.replace(
          /\bpage-\S+/g,
          ""
     );
     document.body.classList.add(`page-${activePage}`);

     // Add additional class for state or city pages
     if (isStatePage) {
          const state = currentPath.split("/")[1];
          document.body.classList.add(`page-states-${state}`);
     } else if (isCityPage) {
          const city = currentPath.split("/")[2];
          document.body.classList.add(`page-cities-${city}`);
     }

     // Setup mobile menu toggle
     setupMobileToggle();
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
