/**
 * Mobile TOC Enhancements
 *
 * Improves the Table of Contents experience on mobile devices:
 * - Better touch interactions for TOC links
 * - Automatic highlighting of current section in TOC
 * - Close TOC after selection on mobile
 */
document.addEventListener("DOMContentLoaded", function () {
     // Only run on mobile devices
     if (window.innerWidth <= 1020) {
          enhanceMobileToc();
     }
});

function enhanceMobileToc() {
     const toc = document.querySelector(".toc");
     const tocToggle = document.querySelector(".mobile-toc-toggle");

     // If no TOC found, exit early
     if (!toc) return;

     // 1. Create toggle button if it doesn't exist
     if (!tocToggle) {
          const newTocToggle = document.createElement("button");
          newTocToggle.className = "mobile-toc-toggle";
          newTocToggle.textContent = "Jump to Section";

          // Insert the toggle before the TOC
          toc.parentNode.insertBefore(newTocToggle, toc);

          // Add toggle functionality
          newTocToggle.addEventListener("click", function () {
               this.classList.toggle("open");
               toc.classList.toggle("open");
          });
     }

     // 2. Track scroll position and highlight current section in TOC
     const sections = document.querySelectorAll(".city-section, section[id]");
     const tocLinks = document.querySelectorAll(".toc-link");

     if (sections.length === 0 || tocLinks.length === 0) return;

     // Add intersection observer to highlight current section in TOC
     const observerOptions = {
          root: null,
          rootMargin: "-80px 0px -20% 0px",
          threshold: 0,
     };

     const handleIntersection = (entries) => {
          entries.forEach((entry) => {
               if (entry.isIntersecting) {
                    // Remove active class from all links
                    tocLinks.forEach((link) => link.classList.remove("active"));

                    // Find the corresponding TOC link and add active class
                    const id = entry.target.getAttribute("id");
                    if (id) {
                         const correspondingLink = document.querySelector(
                              `.toc-link[href="#${id}"]`
                         );
                         if (correspondingLink) {
                              correspondingLink.classList.add("active");
                         }
                    }
               }
          });
     };

     const observer = new IntersectionObserver(
          handleIntersection,
          observerOptions
     );

     // Observe all sections
     sections.forEach((section) => observer.observe(section));

     // 3. Add scroll into view for TOC links with enhanced touch experience
     tocLinks.forEach((link) => {
          // Add bigger touch target
          link.style.padding = "12px 16px";
          link.style.margin = "2px 0";

          // Add close TOC when link clicked
          link.addEventListener("click", function (e) {
               // Close the TOC
               if (tocToggle) {
                    tocToggle.classList.remove("open");
                    toc.classList.remove("open");
               }

               // Remember to check if this link is already being processed by main site JS
               const href = this.getAttribute("href");
               if (href && href.startsWith("#")) {
                    const targetId = href.substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement && !window.processingTocClick) {
                         e.preventDefault();
                         window.processingTocClick = true;

                         // Better scroll positioning for mobile
                         const headerOffset = 120; // Account for any fixed headers
                         const elementPosition =
                              targetElement.getBoundingClientRect().top;
                         const offsetPosition =
                              elementPosition +
                              window.pageYOffset -
                              headerOffset;

                         // Smooth scroll
                         window.scrollTo({
                              top: offsetPosition,
                              behavior: "smooth",
                         });

                         // Update URL without scrolling
                         history.pushState(null, null, href);

                         // Reset processing flag
                         setTimeout(() => {
                              window.processingTocClick = false;
                         }, 100);
                    }
               }
          });
     });

     // 4. Make swiping close the TOC
     let touchStartX = 0;
     let touchEndX = 0;

     toc.addEventListener(
          "touchstart",
          (e) => {
               touchStartX = e.changedTouches[0].screenX;
          },
          { passive: true }
     );

     toc.addEventListener(
          "touchend",
          (e) => {
               touchEndX = e.changedTouches[0].screenX;
               handleSwipe();
          },
          { passive: true }
     );

     function handleSwipe() {
          // If swiping left, close the TOC
          if (touchEndX < touchStartX - 50) {
               if (tocToggle) {
                    tocToggle.classList.remove("open");
                    toc.classList.remove("open");
               }
          }
     }
}
