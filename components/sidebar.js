// Sidebar component
export function createSidebar(activePage) {
     const sidebar = document.createElement("aside");
     sidebar.className = "sidebar";

     sidebar.innerHTML = `
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
    `;

     return sidebar;
}

// Function to handle relative paths in subdirectories
export function adjustPaths(sidebar, depth = 0) {
     // For static hosting, we keep the absolute paths
     return sidebar;
}
