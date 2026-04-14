/**
 * Mobile Optimizations Loader
 *
 * Conditionally loads mobile optimization scripts based on device capabilities
 * This reduces unnecessary code execution on desktop devices
 */
document.addEventListener("DOMContentLoaded", function () {
     const isMobile = window.innerWidth <= 768;
     const hasTouch = "ontouchstart" in window || navigator.maxTouchPoints > 0;

     // Load clickable initiatives on all devices when initiatives exist
     if (document.querySelector(".initiative")) {
          loadScript("/js/clickable-initiatives.js");
     }

     if (isMobile) {
          loadScript("/js/back-to-top.js");

          // Only load mobile TOC enhancements when a TOC is present
          if (document.querySelector(".toc")) {
               loadScript("/js/mobile-toc.js");
          }

          // Only load state-page script on state pages
          if (document.body.classList.contains("state-page")) {
               loadScript("/js/state-page-mobile.js");
          }

          addViewportHeightFix();
     }

     // Load sidebar swipe handler on touch devices
     if (hasTouch && document.querySelector(".sidebar")) {
          loadScript("/js/swipe-handler.js");
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

