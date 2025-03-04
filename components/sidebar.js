// Sidebar component
export function createSidebar(activePage) {
     return `
        <style>
            .sidebar {
                opacity: 1;
                transition: opacity 0.2s ease-in-out;
            }
            .sidebar.loading {
                opacity: 0;
            }
            .sidebar.loaded {
                opacity: 1;
            }
        </style>
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
     // Create a promise that resolves when the DOM is ready
     const domReady =
          document.readyState === "loading"
               ? new Promise((resolve) =>
                      document.addEventListener("DOMContentLoaded", resolve)
                 )
               : Promise.resolve();

     // Initialize content and mobile menu
     domReady.then(() => {
          try {
               // Get the sidebar element
               const sidebar = document.getElementById("sidebar");
               if (!sidebar) {
                    console.error("Sidebar element not found");
                    return;
               }

               // Add loading state
               sidebar.classList.add("loading");

               // Initialize content only once if it's empty
               if (!sidebar.querySelector("nav")) {
                    // Create a document fragment for better performance
                    const temp = document.createElement("div");
                    temp.innerHTML = createSidebar(activePage);

                    // Use requestAnimationFrame to batch DOM updates
                    requestAnimationFrame(() => {
                         // Store scroll position
                         const scrollPos = window.scrollY;

                         sidebar.innerHTML = temp.innerHTML;

                         // Restore scroll position
                         window.scrollTo(0, scrollPos);

                         // Remove loading state after a brief delay to ensure smooth transition
                         setTimeout(() => {
                              sidebar.classList.remove("loading");
                              sidebar.classList.add("loaded");
                         }, 50);

                         // Add mobile menu button if it doesn't exist
                         if (!document.querySelector(".mobile-menu-button")) {
                              const menuButton =
                                   document.createElement("button");
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
                    });
               } else {
                    // Just update the active states without modifying the content
                    const links = sidebar.querySelectorAll(".nav-link");
                    requestAnimationFrame(() => {
                         links.forEach((link) => {
                              const href = link.getAttribute("href");
                              const isHome =
                                   href === "/" && activePage === "home";
                              const isCurrentPage =
                                   href.slice(1) === activePage;

                              // Only toggle class if needed
                              if (isHome || isCurrentPage) {
                                   link.classList.add("active");
                              } else {
                                   link.classList.remove("active");
                              }
                         });

                         // Remove loading state
                         sidebar.classList.remove("loading");
                         sidebar.classList.add("loaded");
                    });
               }
          } catch (error) {
               console.error("Error initializing sidebar:", error);
               // Remove loading state in case of error
               const sidebar = document.getElementById("sidebar");
               if (sidebar) {
                    sidebar.classList.remove("loading");
               }
          }
     });
}

// Function to handle relative paths in subdirectories
export function adjustPaths(sidebar, depth = 0) {
     // For static hosting, we keep the absolute paths
     return sidebar;
}
