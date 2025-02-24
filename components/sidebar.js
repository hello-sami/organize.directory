// Sidebar component
export function createSidebar(activePage) {
     // Create the content but don't return it directly
     const content = `
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

     return content;
}

// Function to initialize the sidebar
export function initializeSidebar(activePage) {
     // Get the sidebar element immediately
     const sidebar = document.getElementById("sidebar");
     if (!sidebar) {
          console.error("Sidebar element not found");
          return;
     }

     const initContent = () => {
          try {
               // Only initialize content if sidebar is empty
               if (!sidebar.querySelector("nav")) {
                    sidebar.innerHTML = createSidebar(activePage);
                    sidebar.classList.add("ready");
               } else {
                    // Just update the active states
                    const links = sidebar.querySelectorAll(".nav-link");
                    links.forEach((link) => {
                         link.classList.remove("active");
                         if (
                              (link.getAttribute("href") === "/" &&
                                   activePage === "home") ||
                              link.getAttribute("href").slice(1) === activePage
                         ) {
                              link.classList.add("active");
                         }
                    });
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
                    document.body.insertBefore(
                         menuButton,
                         document.body.firstChild
                    );

                    // Add mobile menu functionality
                    menuButton.addEventListener("click", () => {
                         sidebar.classList.toggle("active");
                         document.body.classList.toggle("menu-open");
                    });
               }
          } catch (error) {
               console.error("Error initializing sidebar:", error);
          }
     };

     // Initialize when DOM is ready
     if (document.readyState === "loading") {
          document.addEventListener("DOMContentLoaded", initContent);
     } else {
          initContent();
     }
}

// Function to handle relative paths in subdirectories
export function adjustPaths(sidebar, depth = 0) {
     // For static hosting, we keep the absolute paths
     return sidebar;
}
