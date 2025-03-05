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

// Add styles immediately to prevent FOUC (Flash of Unstyled Content)
const sidebarStyles = `
    <style id="sidebar-styles">
        .sidebar {
            opacity: 1;
            visibility: visible;
            transition: opacity 0.2s ease-in-out;
        }
        .sidebar.loading {
            opacity: 0.8;
            visibility: visible;
        }
        .sidebar.loaded {
            opacity: 1;
            visibility: visible;
        }
    </style>
`;

// Immediately initialize sidebar and styles if possible
if (typeof document !== "undefined") {
     // Add styles first
     if (!document.getElementById("sidebar-styles")) {
          document.head.insertAdjacentHTML("beforeend", sidebarStyles);
     }

     // Initialize content
     const sidebar = document.getElementById("sidebar");
     if (sidebar && !sidebar.querySelector("nav")) {
          sidebar.innerHTML = initialSidebar;
     }
}

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
     // Get the sidebar element
     const sidebar = document.getElementById("sidebar");
     if (!sidebar) {
          console.error("Sidebar element not found");
          return;
     }

     // Ensure styles are present
     if (!document.getElementById("sidebar-styles")) {
          document.head.insertAdjacentHTML("beforeend", sidebarStyles);
     }

     // Update content and active states immediately
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
