import { createSearchHeader } from "/components/search-header.js";

// Initialize all common components
function initializeComponents(options = {}) {
     const {
          searchHeaderId = "header", // Default header ID
     } = options;

     // Initialize search header
     const headerElement = document.getElementById(searchHeaderId);
     if (headerElement) {
          headerElement.replaceWith(createSearchHeader());
     }
}

// Export for use in pages
export { initializeComponents };
