/**
 * Safari iOS-specific fixes to ensure proper mobile rendering
 * This script specifically targets layout and viewport issues on iOS Safari
 */

(function () {
     // Only execute on iOS Safari
     const ua = navigator.userAgent;
     const iOS = /iPad|iPhone|iPod/.test(ua);
     const webkit = /WebKit/.test(ua) && !/Chrome/.test(ua);

     if (!iOS || !webkit) return;

     // Force iOS Safari to respect the viewport width
     function fixViewport() {
          // Set body width to match window inner width
          document.body.style.width = window.innerWidth + "px";

          // Force content to be exactly viewport width
          const content = document.querySelector(".content");
          if (content) {
               content.style.width = window.innerWidth + "px";
               content.style.maxWidth = window.innerWidth + "px";
               content.style.boxSizing = "border-box";
          }

          // Force layout to be exactly viewport width
          const layout = document.querySelector(".layout");
          if (layout) {
               layout.style.width = window.innerWidth + "px";
               layout.style.maxWidth = window.innerWidth + "px";
               layout.style.boxSizing = "border-box";
          }

          // Fix any overflowing elements
          const checkForOverflow = () => {
               const viewportWidth = window.innerWidth;
               const allElements = document.querySelectorAll("*");

               allElements.forEach((el) => {
                    // Skip elements that shouldn't be checked (like SVGs)
                    if (el.tagName === "svg" || el.tagName === "path") return;

                    // Get the actual width including any overflow
                    const actualWidth = el.scrollWidth;

                    // If element is wider than viewport, fix it
                    if (
                         actualWidth > viewportWidth &&
                         window.getComputedStyle(el).position !== "fixed"
                    ) {
                         el.style.maxWidth = "100%";
                         el.style.width = "100%";
                         el.style.boxSizing = "border-box";
                    }
               });
          };

          // Perform initial check
          checkForOverflow();

          // Check again after images and other resources load
          window.addEventListener("load", checkForOverflow);
     }

     // Fix Safari's weird behavior with fixed position elements
     function fixFixedPositioning() {
          const fixedElements = document.querySelectorAll(
               ".sidebar, .mobile-menu-button"
          );

          fixedElements.forEach((el) => {
               // Add specific iOS fixes for fixed positioning
               el.style.webkitTransform = "translateZ(0)";
               el.style.transform = "translateZ(0)";
          });
     }

     // Fix Safari's text size adjustments
     function fixTextSizing() {
          // Force Safari to respect our font sizing
          document.documentElement.style.webkitTextSizeAdjust = "100%";
     }

     // Fix specific Safari layout issues with stat elements and buttons
     function fixSpecificElements() {
          // Fix initiative stats container
          const statsContainers = document.querySelectorAll(
               ".initiative-stats, .stats-container"
          );
          statsContainers.forEach((container) => {
               container.style.width = "100%";
               container.style.maxWidth = "100%";
               container.style.boxSizing = "border-box";
          });

          // Fix buttons container
          const buttonContainers = document.querySelectorAll(
               ".buttons-container, .find-groups-button"
          );
          buttonContainers.forEach((container) => {
               container.style.width = "100%";
               container.style.maxWidth = "100%";
               container.style.boxSizing = "border-box";
          });

          // Fix stat numbers that might be too large
          const statNumbers = document.querySelectorAll(".stat-number");
          statNumbers.forEach((stat) => {
               stat.style.maxWidth = "100%";
               stat.style.overflow = "hidden";
               stat.style.textOverflow = "ellipsis";
          });
     }

     // Forcefully resize the viewport to match device width
     function forceViewportResize() {
          // Create a temporary meta viewport tag
          const meta = document.createElement("meta");
          meta.name = "viewport";
          meta.content =
               "width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0";
          document.head.appendChild(meta);

          // Remove and reapply the original viewport settings
          setTimeout(() => {
               document.head.removeChild(meta);
               const originalMeta = document.querySelector(
                    'meta[name="viewport"]'
               );
               if (originalMeta) {
                    originalMeta.content =
                         "width=device-width, initial-scale=1.0, viewport-fit=cover";
               }
          }, 300);
     }

     // Execute all fixes
     fixViewport();
     fixFixedPositioning();
     fixTextSizing();
     fixSpecificElements();
     forceViewportResize();

     // Execute again after a short delay to ensure proper application
     setTimeout(() => {
          fixViewport();
          fixSpecificElements();
     }, 500);

     // Re-apply fixes on orientation change
     window.addEventListener("orientationchange", function () {
          // Wait for orientation change to complete
          setTimeout(function () {
               fixViewport();
               fixFixedPositioning();
               fixSpecificElements();
               forceViewportResize();
          }, 300);
     });

     // Re-apply fixes on resize
     let resizeTimeout;
     window.addEventListener("resize", function () {
          clearTimeout(resizeTimeout);
          resizeTimeout = setTimeout(function () {
               fixViewport();
               fixSpecificElements();
          }, 250);
     });
})();
