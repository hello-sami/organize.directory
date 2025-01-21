// Sidebar component
export function createSidebar(activePage) {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    
    sidebar.innerHTML = `
        <h1><a href="/" class="home-link">organize.directory</a></h1>
        <nav>
            <a href="/" id="homeLink" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
            <a href="/location" id="locationLink" class="nav-link ${activePage === 'location' ? 'active' : ''}">Locations</a>
            <a href="/issues" id="issuesLink" class="nav-link ${activePage === 'issues' ? 'active' : ''}">Issues</a>
            <a href="/resources" id="resourcesLink" class="nav-link ${activePage === 'resources' ? 'active' : ''}">Resources</a>
            <a href="/about" id="aboutLink" class="nav-link ${activePage === 'about' ? 'active' : ''}">About</a>
        </nav>
    `;
    
    return sidebar;
}

// Function to handle relative paths in subdirectories
export function adjustPaths(sidebar, depth = 0) {
    // For static hosting, we keep the absolute paths
    return sidebar;
} 