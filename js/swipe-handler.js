/**
 * Swipe Gesture Handler for Mobile
 *
 * Adds swipe right to open sidebar, swipe left to close
 * Also implements swipe between sections on city pages
 */
document.addEventListener("DOMContentLoaded", function () {
     // Initialize swipe detection
     setupSwipeDetection();

     // Add support for smooth scrolling between sections (TOC navigation)
     setupSmoothScrolling();
});

function setupSwipeDetection() {
     let touchStartX = 0;
     let touchEndX = 0;
     const minSwipeDistance = 75; // Minimum distance for swipe to register

     // Get sidebar and overlay elements
     const sidebar = document.getElementById("sidebar");
     const overlay = document.querySelector(".mobile-menu-overlay");

     // Only proceed if we're on a touch device and the sidebar exists
     if (!sidebar || !("ontouchstart" in window)) return;

     document.addEventListener(
          "touchstart",
          (e) => {
               touchStartX = e.changedTouches[0].screenX;
          },
          { passive: true }
     );

     document.addEventListener(
          "touchend",
          (e) => {
               touchEndX = e.changedTouches[0].screenX;
               handleSwipe();
          },
          { passive: true }
     );

     function handleSwipe() {
          const distance = touchEndX - touchStartX;
          const isSwipeRight = distance > minSwipeDistance;
          const isSwipeLeft = distance < -minSwipeDistance;

          // Get current window width - important for edge detection
          const windowWidth = window.innerWidth;

          // Only trigger right swipe if we're starting near the left edge (first 20% of screen)
          const isNearLeftEdge = touchStartX < windowWidth * 0.2;

          // Only open sidebar with right swipes from left edge
          if (
               isSwipeRight &&
               isNearLeftEdge &&
               !sidebar.classList.contains("active")
          ) {
               sidebar.classList.add("active");
               document.body.classList.add("menu-open");
               if (overlay) overlay.classList.add("active");
          }

          // Close sidebar with left swipes when sidebar is open
          else if (isSwipeLeft && sidebar.classList.contains("active")) {
               sidebar.classList.remove("active");
               document.body.classList.remove("menu-open");
               if (overlay) overlay.classList.remove("active");
          }
     }
}

function setupSmoothScrolling() {
     // Smooth scroll for TOC links
     const tocLinks = document.querySelectorAll(".toc-link");

     tocLinks.forEach((link) => {
          link.addEventListener("click", function (e) {
               const href = this.getAttribute("href");

               // Only handle internal hash links
               if (href && href.startsWith("#")) {
                    e.preventDefault();

                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                         // Calculate position accounting for any fixed headers
                         const headerOffset = 80; // Adjust based on your fixed header height
                         const elementPosition =
                              targetElement.getBoundingClientRect().top;
                         const offsetPosition =
                              elementPosition +
                              window.pageYOffset -
                              headerOffset;

                         window.scrollTo({
                              top: offsetPosition,
                              behavior: "smooth",
                         });

                         // Update URL without scrolling
                         history.pushState(null, null, href);

                         // Close mobile TOC if it's open
                         const toc = document.querySelector(".toc");
                         const tocToggle =
                              document.querySelector(".mobile-toc-toggle");

                         if (
                              toc &&
                              toc.classList.contains("open") &&
                              tocToggle
                         ) {
                              toc.classList.remove("open");
                              tocToggle.classList.remove("open");
                         }
                    }
               }
          });
     });
}
