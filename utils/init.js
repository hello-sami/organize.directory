import { createSidebar } from '/components/sidebar.js';
import { createSearchHeader } from '/components/search-header.js';

// Initialize all common components
function initializeComponents(options = {}) {
    const {
        sidebarType = 'location', // Default sidebar type
        searchHeaderId = 'header' // Default header ID
    } = options;

    // Initialize sidebar
    const sidebarContainer = document.getElementById('sidebar-container') || document.getElementById('sidebar');
    if (sidebarContainer) {
        const sidebar = createSidebar(sidebarType);
        sidebarContainer.replaceWith(sidebar);
    }

    // Initialize search header
    const headerElement = document.getElementById(searchHeaderId);
    if (headerElement) {
        headerElement.replaceWith(createSearchHeader());
    }
}

// Export for use in pages
export { initializeComponents }; 