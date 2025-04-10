/**
 * Font Awesome Loader
 * A script to load Font Awesome icons with fallback mechanisms
 * v1.0.3
 */

(function () {
     "use strict";

     // Track loading status
     let iconsLoaded = false;

     // Main function to load icons
     function loadIcons() {
          // Skip if icons are already loaded
          if (iconsLoaded) return;

          console.log("[Font Awesome Loader] Starting icon load...");

          // Create link to load the CSS
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.id = "font-awesome-css";
          link.href = "/css/fa-subset.css?v=1.0.1";

          // Set loading event handlers
          link.onload = function () {
               console.log(
                    "[Font Awesome Loader] Successfully loaded local Font Awesome subset"
               );
               iconsLoaded = true;
               applyStyles();

               // Still check to make sure icons are visible
               setTimeout(checkIconDisplay, 500);
          };

          link.onerror = function () {
               console.error(
                    "[Font Awesome Loader] Failed to load Font Awesome!"
               );
               applyFallbackIcons();
          };

          // Add to document
          document.head.appendChild(link);
     }

     // Apply additional styles to ensure icons are visible
     function applyStyles() {
          const style = document.createElement("style");
          style.textContent = `
      .topic-icon {
        display: inline-block !important;
        min-width: 2rem !important;
        min-height: 2rem !important;
        font-size: 2rem !important;
        visibility: visible !important;
        color: var(--primary-color, #a30000) !important;
        text-align: center;
      }
    `;
          document.head.appendChild(style);
     }

     // Apply emergency fallback for icons
     function applyFallbackIcons() {
          console.log("[Font Awesome Loader] Applying fallback icons...");

          // Add fallback class to all icons
          document.querySelectorAll(".fas.topic-icon").forEach((icon) => {
               icon.classList.add("icon-failed");
          });

          // Add emergency CSS
          const style = document.createElement("style");
          style.textContent = `
      .topic-icon.icon-failed:before {
        content: "•";
        font-family: sans-serif !important;
        color: var(--primary-color, #a30000) !important;
        font-size: 2rem !important;
      }
    `;
          document.head.appendChild(style);
     }

     // Check if icons are actually displaying correctly
     function checkIconDisplay() {
          let foundInvisibleIcons = false;

          document.querySelectorAll(".fas.topic-icon").forEach((icon) => {
               // Check if the icon has dimensions and is visible
               const rect = icon.getBoundingClientRect();
               const computedStyle = window.getComputedStyle(icon);

               // An icon might have zero height or width if it's not rendering properly
               if (
                    rect.width === 0 ||
                    rect.height === 0 ||
                    computedStyle.visibility === "hidden" ||
                    computedStyle.display === "none"
               ) {
                    console.warn(
                         "[Font Awesome Loader] Found invisible icon:",
                         icon
                    );
                    icon.classList.add("icon-failed");
                    foundInvisibleIcons = true;
               }
          });

          if (foundInvisibleIcons) {
               console.log(
                    "[Font Awesome Loader] Applying fallback for invisible icons"
               );
          }
     }

     // Initialize when page loads
     if (document.readyState === "complete") {
          loadIcons();
     } else {
          window.addEventListener("load", loadIcons);
     }

     // Export functions for global access
     window.faLoader = {
          load: loadIcons,
          checkDisplay: checkIconDisplay,
          applyFallback: applyFallbackIcons,
     };
})();
