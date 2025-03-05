// Initial sidebar content to prevent flicker
const initialSidebar = `
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
    </div>`;

// Critical styles that must be inlined in the head
const criticalStyles = `
    .sidebar {
        opacity: 1 !important;
        visibility: visible !important;
        background: var(--sidebar-bg, #FDF2F8);
        width: 250px;
        height: 100vh;
        position: fixed;
        padding: 2rem;
        box-sizing: border-box;
        overflow-y: auto;
        z-index: 100;
    }
    .sidebar h1 {
        margin: 0 0 2rem 0;
        font-size: 1.5rem;
    }
    .sidebar nav {
        margin-bottom: 2rem;
    }
    .sidebar .nav-link {
        display: block;
        padding: 0.5rem 0;
        color: inherit;
        text-decoration: none;
    }
    .sidebar .nav-group-title {
        display: block;
        font-weight: 600;
        margin: 0.5rem 0;
    }
    .sidebar .nav-link-indented {
        padding-left: 1rem;
    }
    .sidebar .sidebar-motto {
        font-style: italic;
        margin-top: 2rem;
        font-size: 0.9rem;
    }
`;

// Immediately initialize sidebar and styles
(function () {
     if (typeof document !== "undefined") {
          // Add critical styles to head
          const styleEl = document.createElement("style");
          styleEl.textContent = criticalStyles;
          document.head.insertBefore(styleEl, document.head.firstChild);

          // Initialize content immediately
          const sidebar = document.getElementById("sidebar");
          if (sidebar && !sidebar.querySelector("nav")) {
               sidebar.innerHTML = initialSidebar;
          }
     }
})();

// Sidebar component
export function createSidebar(activePage) {
     return `
        <h1><a href="/" class="home-link">The Organize Directory</a></h1>
        <nav>
            <a href="/" class="nav-link ${activePage === "home" ? "active" : ""}">Home</a>
            <div class="nav-group">
                <span class="nav-group-title">Find a group</span>
                <a href="/location" class="nav-link nav-link-indented ${activePage === "location" ? "active" : ""}">by location</a>
                <a href="/topics" class="nav-link nav-link-indented ${activePage === "topics" ? "active" : ""}">by topic</a>
            </div>
            <a href="/guides" class="nav-link ${activePage === "guides" ? "active" : ""}">Guides</a>
            <a href="/contact" class="nav-link ${activePage === "contact" ? "active" : ""}">Contact</a>
        </nav>
        <div class="sidebar-motto">
            Solidarity not charity.<br>
            Awareness into action.
        </div>`;
}

// Function to initialize the sidebar
export function initializeSidebar(activePage) {
     const sidebar = document.getElementById("sidebar");
     if (!sidebar) {
          console.error("Sidebar element not found");
          return;
     }

     // Only update if we need to change active states
     const newContent = createSidebar(activePage);
     if (sidebar.innerHTML !== newContent) {
          sidebar.innerHTML = newContent;
     }

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
