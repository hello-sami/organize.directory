// Clean HTML template for sidebar
const sidebarTemplate = `
    <div class="sidebar-header">
        <a href="/">
          <img src="/logo.png" alt="Organize Directory Logo" class="site-logo">
        </a>
    </div>
    <nav>
        <a href="/" class="nav-link nav-link-base">HOME</a>
        <a href="/location" class="nav-link nav-link-base parent-link">FIND A GROUP</a>
        <a href="/location" class="nav-link nav-link-indented location-link">BY LOCATION</a>
        <a href="/topics" class="nav-link nav-link-indented topic-link">BY TOPIC</a>
        <a href="/guides" class="nav-link nav-link-base">GUIDES</a>
        <a href="/contact" class="nav-link nav-link-base">CONTACT</a>
        <a href="/subscribe" class="nav-link nav-link-base">SUBSCRIBE</a>
    </nav>
    <div class="sidebar-motto">
       DON'T DESPAIR, ORGANIZE.
    </div>`;

/**
 * Main function to initialize the sidebar
 * @param {string} activePage - The current active page
 */
export function initializeSidebar(activePage) {
     if (typeof document === "undefined") return;

     // Insert sidebar if it doesn't exist
     if (!document.querySelector(".sidebar")) {
          createSidebar();
     }

     // Set active page
     setActivePage(activePage || getPageFromPath());

     // Setup mobile menu toggle
     setupMobileToggle();
}

/**
 * Creates and inserts the sidebar
 */
function createSidebar() {
     const sidebar = document.createElement("div");
     sidebar.className = "sidebar";
     sidebar.id = "sidebar";
     sidebar.setAttribute("aria-label", "Main navigation");
     sidebar.innerHTML = sidebarTemplate;

     const placeholder = document.getElementById("sidebar-placeholder");
     if (placeholder) {
          placeholder.parentNode.replaceChild(sidebar, placeholder);
     } else {
          const layout = document.querySelector(".layout");
          if (layout) {
               layout.insertBefore(sidebar, layout.firstChild);
          } else {
               console.error("Layout element not found");
          }
     }
}

/**
 * Determines the active page from the current URL path
 */
function getPageFromPath() {
     const currentPath = window.location.pathname;

     // Check for state and city pages
     const stateRegex =
          /\/(alabama|alaska|arizona|arkansas|california|colorado|connecticut|delaware|florida|georgia|hawaii|idaho|illinois|indiana|iowa|kansas|kentucky|louisiana|maine|maryland|massachusetts|michigan|minnesota|mississippi|missouri|montana|nebraska|nevada|new-hampshire|new-jersey|new-mexico|new-york|north-carolina|north-dakota|ohio|oklahoma|oregon|pennsylvania|rhode-island|south-carolina|south-dakota|tennessee|texas|utah|vermont|virginia|washington|west-virginia|wisconsin|wyoming)/;

     if (stateRegex.test(currentPath) || currentPath.includes("/cities/")) {
          return "location";
     }

     // Get the first path segment
     const pathParts = currentPath.split("/").filter(Boolean);
     return pathParts.length > 0 ? pathParts[0] : "home";
}

/**
 * Sets the active page in the sidebar and body classes
 */
function setActivePage(activePage) {
     const sidebar = document.querySelector(".sidebar");
     if (!sidebar) return;

     // Remove all active classes
     sidebar.querySelectorAll("a").forEach((link) => {
          link.classList.remove("active");
          link.removeAttribute("aria-current");
     });

     // Map special cases for active link selection
     const specialCases = {
          home: 'a[href="/"].nav-link-base',
          index: 'a[href="/"].nav-link-base',
          "": 'a[href="/"].nav-link-base',
          location: "a.location-link", // Updated to only select the "BY LOCATION" link
          topics: "a.topic-link", // Updated to use the new class for topic links
     };

     // Apply active state
     const selector =
          specialCases[activePage] || `a[href="/${activePage}"].nav-link-base`;
     const activeLink = sidebar.querySelector(selector);

     if (activeLink) {
          activeLink.classList.add("active");
          activeLink.setAttribute("aria-current", "page");
     }

     // Update body classes
     document.body.className = document.body.className.replace(
          /\bpage-\S+/g,
          ""
     );
     document.body.classList.add(`page-${activePage}`);

     // Add state/city specific classes
     const currentPath = window.location.pathname;
     if (activePage === "location") {
          const pathParts = currentPath.split("/").filter(Boolean);
          if (pathParts.length > 1) {
               if (currentPath.includes("/cities/")) {
                    document.body.classList.add(`page-cities-${pathParts[2]}`);
               } else {
                    document.body.classList.add(`page-states-${pathParts[1]}`);
               }
          }
     }
}

/**
 * Sets up mobile sidebar toggle functionality
 */
function setupMobileToggle() {
     document
          .querySelectorAll(
               ".mobile-menu-button, .mobile-menu-overlay, #menu-toggle"
          )
          .forEach((element) => {
               if (!element) return;

               element.addEventListener("click", () => {
                    const sidebar = document.querySelector(".sidebar");
                    if (!sidebar) return;

                    sidebar.classList.toggle("active");
                    sidebar.classList.toggle("sidebar-open");
                    document.body.classList.toggle("menu-open");
                    document.body.classList.toggle("sidebar-active");

                    const overlay = document.querySelector(
                         ".mobile-menu-overlay"
                    );
                    if (overlay) overlay.classList.toggle("active");
               });
          });
}

/**
 * Helper function to adjust paths based on directory depth
 * @param {HTMLElement} sidebar - The sidebar element
 * @param {number} depth - Directory depth
 */
export function adjustPaths(sidebar, depth = 0) {
     if (!sidebar) return;

     const prefix = "./".padEnd(depth + 2, "../");

     // Update relative links
     sidebar.querySelectorAll("a").forEach((link) => {
          const href = link.getAttribute("href");
          if (
               href &&
               !href.startsWith("http") &&
               !href.startsWith("#") &&
               !href.startsWith("/") &&
               href.startsWith("./")
          ) {
               link.setAttribute("href", prefix + href.substring(2));
          }
     });

     // Update logo src if needed
     const logo = sidebar.querySelector(".site-logo");
     if (
          logo &&
          logo.getAttribute("src") &&
          logo.getAttribute("src").startsWith("./")
     ) {
          logo.setAttribute(
               "src",
               prefix + logo.getAttribute("src").substring(2)
          );
     }
}

/**
 * Initialize sidebar as early as possible
 */
export function checkAndInitializeSidebar(activePage) {
     if (
          document.readyState === "interactive" ||
          document.readyState === "complete"
     ) {
          initializeSidebar(activePage);
     } else {
          document.addEventListener("DOMContentLoaded", () =>
               initializeSidebar(activePage)
          );
     }

     // Fallback initialization
     window.setTimeout(() => {
          if (!document.querySelector(".sidebar")) {
               initializeSidebar(activePage);
          }
     }, 500);
}
