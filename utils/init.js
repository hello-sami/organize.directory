// Initialize all common components
function initializeComponents(options = {}) {
     // Search functionality has been removed as it's not ready yet
     // No-op function kept for backward compatibility

     // Check if the page has initiatives and load the collapsible script if needed
     if (document.querySelector(".initiative")) {
          // Load initiative collapsible script if it hasn't been loaded yet
          if (
               !document.querySelector(
                    'script[src="/js/initiative-collapsible.js"]'
               )
          ) {
               const script = document.createElement("script");
               script.src = "/js/initiative-collapsible.js";
               document.body.appendChild(script);
          }
     }
}

// Export for use in pages
export { initializeComponents };
