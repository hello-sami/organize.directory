/**
 * Mobile Optimizations Loader
 *
 * Conditionally loads mobile optimization scripts based on device capabilities
 * This reduces unnecessary code execution on desktop devices
 */
document.addEventListener("DOMContentLoaded", function () {
     // Detect if we're on mobile
     const isMobile = window.innerWidth <= 768;
     const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

     // Load the appropriate scripts based on device type
     if (isMobile) {
          // Scripts for all mobile devices
          loadScript("/js/back-to-top.js");

          // If we're on a city page with TOC
          if (document.querySelector(".toc")) {
               loadScript("/js/mobile-toc.js");
          }

          // If we're on a state page
          if (document.querySelector(".state-page")) {
               loadScript("/js/state-page-mobile.js");
          }
     }

     // If device has touch capability (including tablets), load swipe handler
     if (hasTouch) {
          loadScript("/js/swipe-handler.js");
     }

     // Add viewport height fix for mobile browsers
     if (isMobile) {
          addViewportHeightFix();
     }

     // Setup form optimizations for mobile devices
     if (isMobile && document.querySelector("form")) {
          optimizeMobileForms();
     }
});

/**
 * Dynamically load a script
 */
function loadScript(src) {
     const script = document.createElement("script");
     script.src = src;
     script.async = true;
     document.body.appendChild(script);
}

/**
 * Fix for viewport height in mobile browsers
 * This addresses the iOS Safari viewport height issue
 */
function addViewportHeightFix() {
     // Fix for iOS viewport height issues
     const setVH = () => {
          let vh = window.innerHeight * 0.01;
          document.documentElement.style.setProperty("--vh", `${vh}px`);
     };

     // Set initial value
     setVH();

     // Update on resize and orientation change
     window.addEventListener("resize", setVH, { passive: true });
     window.addEventListener("orientationchange", setVH, { passive: true });
}

/**
 * Mobile form optimizations
 */
function optimizeMobileForms() {
     // Find all form elements
     const forms = document.querySelectorAll("form");

     forms.forEach((form) => {
          // Find all input fields
          const inputs = form.querySelectorAll("input, select, textarea");

          inputs.forEach((input) => {
               // Ensure proper mobile keyboard types
               if (input.type === "email") {
                    input.setAttribute("inputmode", "email");
                    input.setAttribute("autocomplete", "email");
               } else if (input.type === "tel") {
                    input.setAttribute("inputmode", "tel");
                    input.setAttribute("autocomplete", "tel");
               } else if (input.type === "search") {
                    input.setAttribute("inputmode", "search");
               } else if (input.type === "url") {
                    input.setAttribute("inputmode", "url");
                    input.setAttribute("autocomplete", "url");
               } else if (input.type === "number") {
                    input.setAttribute("inputmode", "numeric");
               }

               // Add autocomplete where appropriate
               if (input.name.includes("name")) {
                    input.setAttribute("autocomplete", "name");
               }

               // Improve form label association
               const id = input.getAttribute("id");
               if (id) {
                    const label = form.querySelector(`label[for="${id}"]`);
                    if (!label) {
                         // Find closest label and associate it
                         const closestLabel =
                              input.closest("label") ||
                              input.previousElementSibling;
                         if (closestLabel && closestLabel.tagName === "LABEL") {
                              closestLabel.setAttribute("for", id);
                         }
                    }
               }
          });
     });
}
