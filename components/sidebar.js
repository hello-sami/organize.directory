// Clean HTML template for sidebar
const sidebarTemplate = `
    <div class="sidebar-header">
        <a href="/">
          <img src="/logo.svg" alt="Organize Directory Logo" class="site-logo loaded" 
               style="opacity: 1; visibility: visible;"
               onerror="console.error('Logo failed to load');">
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
    
    <div class="sidebar-footer" style="position: fixed !important; bottom: 0 !important; left: 0 !important; width: var(--sidebar-width, 280px) !important; text-align: center !important; padding: 1.5rem 0 !important; background-color: #ffd4d4 !important; z-index: 101 !important;">
        <div class="social-links" style="display: flex !important; justify-content: center !important; align-items: center !important; gap: 2rem !important;">
            <a href="/subscribe" class="social-link" style="display: flex !important; align-items: center !important; justify-content: center !important;" title="Subscribe to updates">
                <img src="/icons/email.svg" alt="Subscribe" class="social-icon" style="width: 24px !important; height: 20px !important;">
            </a>
            <a href="https://discord.gg/your-discord-invite" class="social-link" style="display: flex !important; align-items: center !important; justify-content: center !important;" title="Join our Discord community">
                <img src="/icons/discord.svg" alt="Discord" class="social-icon" style="width: 24px !important; height: 20px !important; margin-bottom: 1px !important;">
            </a>
        </div>
    </div>
`;

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

     // Insert sidebar if it doesn't exist
     if (!document.querySelector(".sidebar")) {
          createSidebar();
     }

     // Set active page
     setActivePage(activePage || getPageFromPath());

     // Setup mobile menu toggle
     setupMobileToggle();
}

// Export this function for early detection
export function checkAndInitializeSidebar(activePage) {
     // Use this function for immediate initialization
     initializeSidebar(activePage);
}

/**
 * Creates and inserts the sidebar
 */
function createSidebar() {
     const sidebar = document.createElement("div");
     sidebar.className = "sidebar";
     sidebar.id = "sidebar";
     sidebar.setAttribute("aria-label", "Main navigation");
     // Add inline style to ensure padding at the bottom
     sidebar.style.paddingBottom = "100px";
     sidebar.innerHTML = sidebarTemplate;

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
     // Log for debugging
     console.log("Setting up mobile toggle in sidebar.js");

     const mobileMenuButtons = document.querySelectorAll(
          ".mobile-menu-button, #menu-toggle"
     );
     const overlay = document.querySelector(".mobile-menu-overlay");
     const sidebar = document.querySelector(".sidebar");

     console.log("Mobile menu buttons found:", mobileMenuButtons.length);
     console.log("Overlay found:", !!overlay);
     console.log("Sidebar found:", !!sidebar);

     // Make sure all required elements exist
     if (!sidebar) {
          console.error("Sidebar element not found");
          return;
     }

     // Setup button click handlers
     mobileMenuButtons.forEach((button) => {
          if (!button) return;

          // Remove existing event listeners by cloning
          const newButton = button.cloneNode(true);
          if (button.parentNode) {
               button.parentNode.replaceChild(newButton, button);
          }

          newButton.addEventListener("click", (e) => {
               e.preventDefault();
               e.stopPropagation();
               console.log("Mobile menu button clicked in sidebar.js");

               sidebar.classList.toggle("active");
               document.body.classList.toggle("menu-open");

               if (overlay) {
                    overlay.classList.toggle("active");
               }

               // Ensure the logo is visible when menu is open
               const logoImg = sidebar.querySelector(".site-logo");
               if (logoImg && sidebar.classList.contains("active")) {
                    logoImg.classList.add("loaded");
                    logoImg.style.opacity = "1";
                    logoImg.style.visibility = "visible";
               }
          });
     });

     // Setup overlay click handler
     if (overlay) {
          // Remove existing event listeners by cloning
          const newOverlay = overlay.cloneNode(true);
          overlay.parentNode.replaceChild(newOverlay, overlay);

          newOverlay.addEventListener("click", () => {
               sidebar.classList.remove("active");
               document.body.classList.remove("menu-open");
               newOverlay.classList.remove("active");
          });
     }
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

     // Add extra code to ensure footer positioning
     ensureSidebarFooterPosition();
});

// Also initialize immediately if the document is already loaded
if (document.readyState !== "loading" && !window.sidebarInitialized) {
     initializeSidebar();
     // Also ensure footer positioning
     ensureSidebarFooterPosition();
}

/**
 * Function to ensure the sidebar footer is positioned correctly
 */
function ensureSidebarFooterPosition() {
     setTimeout(() => {
          const footer = document.querySelector(".sidebar-footer");
          if (footer) {
               // Force the footer to be positioned correctly
               Object.assign(footer.style, {
                    position: "fixed",
                    bottom: "0",
                    left: "0",
                    width: "var(--sidebar-width, 280px)",
                    textAlign: "center",
                    padding: "1.5rem 0",
                    backgroundColor: "#ffd4d4",
                    zIndex: "101",
                    borderRight: "1px solid #ffb3b3",
               });

               // Ensure social links are centered
               const socialLinks = footer.querySelector(".social-links");
               if (socialLinks) {
                    Object.assign(socialLinks.style, {
                         display: "flex",
                         justifyContent: "center",
                         alignItems: "center",
                         gap: "2rem",
                    });
               }

               // No need to set color since we're using images now
          }
     }, 100); // Small delay to ensure DOM is fully processed
}
