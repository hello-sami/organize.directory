// Clean HTML template for sidebar
const sidebarTemplate = `
    <div class="sidebar-header">
        <a href="/">
          <img src="/logo.png" alt="Organize Directory Logo" class="site-logo" 
               onload="this.classList.add('loaded'); this.style.opacity = '1';"
               onerror="console.error('Logo failed to load'); this.classList.add('loaded'); this.style.opacity = '1';">
        </a>
    </div>
    <nav>
        <a href="/" class="nav-link-base nav-link">Home</a>
        <a href="/location" class="nav-link-base nav-link parent-link">Find a group</a>
        <a href="/location" class="nav-link-base nav-link nav-link-indented location-link">Location</a>
        <a href="/topics" class="nav-link-base nav-link nav-link-indented topic-link">Topic</a>
        <a href="/guides" class="nav-link-base nav-link">Guides</a>
        <a href="/contact" class="nav-link-base nav-link">Contact</a>
        <a href="/subscribe" class="nav-link-base nav-link">Subscribe</a>
    </nav>
    <div class="sidebar-motto">
       don't despair, organize.
    </div>`;

// Track if the sidebar has been initialized - placed in global window object to prevent reinit
if (typeof window !== "undefined" && !window.sidebarInitialized) {
     window.sidebarInitialized = false;
}

/**
 * Main function to initialize the sidebar
 * @param {string} activePage - The current active page
 */
export function initializeSidebar(activePage) {
     if (typeof document === "undefined") return;

     // Check global sidebarInitialized flag to prevent double initialization
     if (window.sidebarInitialized) {
          // If already initialized, just set the active page
          setActivePage(activePage || getPageFromPath());
          return;
     }
     window.sidebarInitialized = true;

     // Preload the logo image to ensure consistent rendering
     preloadLogo(() => {
          // Insert sidebar if it doesn't exist
          if (!document.querySelector(".sidebar")) {
               createSidebar();
          }

          // Set active page
          setActivePage(activePage || getPageFromPath());

          // Setup mobile menu toggle
          setupMobileToggle();
     });
}

// Export this function for early detection
export function checkAndInitializeSidebar(activePage) {
     // Use this function for immediate initialization
     initializeSidebar(activePage);
}

/**
 * Preloads the logo image to ensure consistent sidebar header height
 * @param {Function} callback - Function to call when logo is loaded
 */
function preloadLogo(callback) {
     const img = new Image();
     img.onload = () => {
          // Ensure we have the image loaded before proceeding
          console.log("Logo preloaded successfully");
          setTimeout(callback, 100); // Short delay to ensure DOM updates
     };
     img.onerror = () => {
          // Log error but continue anyway
          console.error("Error loading logo");
          callback();
     };

     // Use absolute path for logo to avoid path issues
     img.src = "/logo.png";

     // Set a timeout to ensure we don't wait forever if image loading is slow
     // Increased back to 300ms for better reliability
     setTimeout(callback, 300);
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

     // Apply logo loading class explicitly
     const logoImg = sidebar.querySelector(".site-logo");
     if (logoImg) {
          // Force logo to show by using both methods
          logoImg.onload = function () {
               this.classList.add("loaded");
               this.style.opacity = "1";
          };

          // If logo is already loaded in DOM (cached)
          if (logoImg.complete) {
               logoImg.classList.add("loaded");
               logoImg.style.opacity = "1";
          }
     }

     // Standardize sidebar insertion - always use the placeholder approach
     const placeholder = document.getElementById("sidebar-placeholder");

     if (placeholder) {
          // Check for active page attribute
          const activePage = placeholder.getAttribute("data-active-page");
          if (activePage) {
               // Use requestAnimationFrame for better timing with browser rendering
               requestAnimationFrame(() => setActivePage(activePage));
          }
          placeholder.parentNode.replaceChild(sidebar, placeholder);
     } else {
          // If no placeholder exists, insert at the beginning of the layout
          const layout = document.querySelector(".layout");
          if (layout) {
               // Ensure sidebar is always the first child of layout
               layout.insertBefore(sidebar, layout.firstChild);
          } else {
               console.error("Layout element not found");
          }
     }

     // Force load the logo after sidebar insertion
     forceLogo();
}

/**
 * Force logo to be visible as a fallback
 */
function forceLogo() {
     // Give a small delay to let normal loading happen
     setTimeout(() => {
          const logoImg = document.querySelector(".site-logo");
          if (logoImg && !logoImg.classList.contains("loaded")) {
               console.log("Forcing logo visibility");
               logoImg.classList.add("loaded");
               logoImg.style.opacity = "1";
               logoImg.style.visibility = "visible";
          }
     }, 500);
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

// Initialize on DOMContentLoaded only if not already initialized
document.addEventListener("DOMContentLoaded", () => {
     if (!window.sidebarInitialized) {
          initializeSidebar();
     }
});

// Also initialize immediately if the document is already loaded
if (document.readyState !== "loading" && !window.sidebarInitialized) {
     initializeSidebar();
}
