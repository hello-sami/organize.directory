/**
 * Swipe Gesture Handler for Mobile
 *
 * Adds swipe right to open sidebar, swipe left to close.
 * TOC link smooth scrolling is handled by city-toc.js.
 */
document.addEventListener("DOMContentLoaded", function () {
     setupSwipeDetection();
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

