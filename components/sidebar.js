// Initial sidebar content to prevent flicker
const initialSidebar = `
    <div class="sidebar-header">
        <img src="./logo.png" alt="The Organize Directory Logo" class="site-logo"><h1><a href="./" class="home-link" style="text-decoration: none !important; color: inherit !important; background-color: transparent !important; margin: 0; padding: 0;">The Organize Directory</a></h1>
    </div>
    <nav>
        <a href="./" class="nav-link">Home</a>
        <div class="nav-group">
            <a href="./location" class="nav-group-title nav-link-group-header">Find a group</a>
            <a href="./location" class="nav-link nav-link-indented">by location</a>
            <a href="./topics" class="nav-link nav-link-indented">by topic</a>
        </div>
        <a href="./guides" class="nav-link">Guides</a>
        <a href="./contact" class="nav-link">Contact</a>
        <a href="./subscribe" class="nav-link">Subscribe</a>
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
        margin-top: 2rem;
        font-size: 0.9rem;
        padding: 0 1.5rem;
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

// Function to update active states
function updateActiveStates(sidebar, activePage) {
     if (!sidebar) return;

     console.log("Updating active state for page:", activePage);

     // Special case for homepage - ensure we treat it as 'home'
     if (!activePage || activePage === "" || activePage === "index") {
          activePage = "home";
     }

     // Remove all active classes first and reset styles
     sidebar
          .querySelectorAll(".nav-link, .nav-link-group-header")
          .forEach((link) => {
               link.classList.remove("active");
               link.style.backgroundColor = "";
               link.style.color = "";
               link.style.fontWeight = "";
               link.style.opacity = "";
          });

     // Reset all nav-group-title styles - ensure they're not highlighted by default
     sidebar.querySelectorAll(".nav-group-title").forEach((title) => {
          title.style.cssText = `
               background-color: transparent !important;
               color: inherit !important;
               font-weight: 600 !important;
               opacity: 1 !important;
          `;
     });

     // Force remove any potential styling on the header h1 elements with !important inline styles
     const sidebarHeader = sidebar.querySelector(".sidebar-header");
     if (sidebarHeader) {
          const headerH1 = sidebarHeader.querySelector("h1");
          if (headerH1) {
               headerH1.style.cssText =
                    "background-color: transparent !important;";
               const headerLink = headerH1.querySelector("a");
               if (headerLink) {
                    headerLink.style.cssText =
                         "background-color: transparent !important; color: inherit !important; " +
                         "font-weight: inherit !important; text-decoration: none !important; " +
                         "border-bottom: none !important; box-shadow: none !important;";
               }
          }
     }

     // Special handling for topics and location
     if (activePage === "topics") {
          const topicLink = sidebar.querySelector(
               'a[href="./topics"].nav-link-indented'
          );
          if (topicLink) {
               topicLink.classList.add("active");
               topicLink.style.backgroundColor = "var(--pure-white, #ffffff)";
               topicLink.style.color = "var(--primary-color, #a30000)";
               topicLink.style.fontWeight = "600";

               // Find the parent nav-group and reduce prominence of its title
               const navGroup = topicLink.closest(".nav-group");
               if (navGroup) {
                    const groupTitle =
                         navGroup.querySelector(".nav-group-title");
                    if (groupTitle) {
                         groupTitle.style.cssText = `
                              background-color: transparent !important;
                              color: inherit !important;
                              font-weight: 400 !important;
                              opacity: 0.7 !important;
                         `;
                    }
               }
          }
          return;
     }

     if (activePage === "location") {
          // Highlight both the "Find a group" header and the "by location" link
          const findGroupTitle = sidebar.querySelector(
               ".nav-link-group-header"
          );
          if (findGroupTitle) {
               findGroupTitle.classList.add("active");
               findGroupTitle.style.backgroundColor =
                    "var(--pure-white, #ffffff)";
               findGroupTitle.style.color = "var(--primary-color, #a30000)";
               findGroupTitle.style.fontWeight = "600";
          }

          const locationLink = sidebar.querySelector(
               'a[href="./location"].nav-link-indented'
          );
          if (locationLink) {
               locationLink.classList.add("active");
               locationLink.style.backgroundColor =
                    "var(--pure-white, #ffffff)";
               locationLink.style.color = "var(--primary-color, #a30000)";
               locationLink.style.fontWeight = "600";
          }
          return;
     }

     // For home page, ensure Find a group is definitely not highlighted
     if (activePage === "home") {
          // Set Home link as active
          const homeLink = sidebar.querySelector('a[href="./"]');
          if (homeLink) {
               homeLink.classList.add("active");
               homeLink.style.cssText = `
                    background-color: var(--pure-white, #ffffff) !important;
                    color: var(--primary-color, #a30000) !important;
                    font-weight: 600 !important;
               `;
          }

          // Ensure all nav-group-title elements are not highlighted
          sidebar.querySelectorAll(".nav-group-title").forEach((title) => {
               title.style.cssText = `
                    background-color: transparent !important;
                    color: inherit !important;
                    font-weight: 600 !important;
                    opacity: 1 !important;
               `;
          });

          return;
     }

     // For other pages, use the regular mapping
     const activeLinks = {
          guides: 'a[href="./guides"]',
          contact: 'a[href="./contact"]',
          subscribe: 'a[href="./subscribe"]',
     };

     const activeSelector = activeLinks[activePage];
     if (activeSelector) {
          const activeLink = sidebar.querySelector(activeSelector);
          if (activeLink) {
               activeLink.classList.add("active");
               activeLink.style.backgroundColor = "var(--pure-white, #ffffff)";
               activeLink.style.color = "var(--primary-color, #a30000)";
               activeLink.style.fontWeight = "600";
               console.log("Set active link for:", activeSelector);
          } else {
               console.log(
                    "Active link not found for selector:",
                    activeSelector
               );
          }
     } else {
          console.log("No active selector for page:", activePage);
     }
}

// Function to initialize the sidebar
export function initializeSidebar(activePage) {
     // Initialize critical styles first
     initializeCriticalStyles();

     // Get the existing sidebar
     const sidebar = document.getElementById("sidebar");
     if (!sidebar) {
          console.error("Sidebar element not found");
          return;
     }

     // Add direct inline style to h1 link to prevent underline
     const h1Link = sidebar.querySelector(".sidebar-header h1 a");
     if (h1Link) {
          h1Link.setAttribute(
               "style",
               "text-decoration: none !important; color: inherit !important; " +
                    "background-color: transparent !important; border-bottom: none !important;"
          );
     }

     // Update active states
     updateActiveStates(sidebar, activePage);

     // Add mobile menu button if it doesn't exist
     if (!document.querySelector(".mobile-menu-button")) {
          const menuButton = document.createElement("button");
          menuButton.className = "mobile-menu-button";
          menuButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
        `;
          document.body.insertBefore(menuButton, document.body.firstChild);

          // Add mobile menu functionality
          menuButton.addEventListener("click", () => {
               sidebar.classList.toggle("active");
               document.body.classList.toggle("menu-open");
          });
     }
}

// Function to handle relative paths in subdirectories
export function adjustPaths(sidebar, depth = 0) {
     // For static hosting, we keep the absolute paths
     return sidebar;
}
