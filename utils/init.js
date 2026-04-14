// Initialize common page components.
// initiative-collapsible handles its own mobile guard internally.
export function initializeComponents(options = {}) {
     if (document.querySelector(".initiative")) {
          import("/js/initiative-collapsible.js");
     }
}
