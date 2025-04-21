/**
 * Table of Contents (TOC) Module
 *
 * A reusable module for creating and managing a table of contents
 * that highlights the current section and supports smooth scrolling.
 */

/**
 * Initialize the Table of Contents
 * @param {Object} options - Configuration options
 * @param {boolean} options.debug - Whether to show debug information
 * @param {string} options.tocContainerSelector - Selector for the TOC container
 * @param {string} options.tocSelector - Selector for the TOC element
 * @param {string} options.sectionSelector - Selector for the sections to include in the TOC
 * @param {number} options.scrollOffset - Offset from the top when scrolling to sections
 */
function initTOC(options = {}) {
     // Default options
     const config = {
          debug: false,
          tocContainerSelector: ".toc-container",
          tocSelector: ".toc",
          sectionSelector: "[data-toc-section]",
          scrollOffset: 20,
          ...options,
     };

     // DOM elements
     const tocContainer = document.querySelector(config.tocContainerSelector);
     const toc = document.querySelector(config.tocSelector);
     const sections = document.querySelectorAll(config.sectionSelector);

     // Exit if no TOC or sections are found
     if (!tocContainer || !toc || sections.length === 0) {
          console.warn("TOC initialization failed: Missing elements");
          return;
     }

     // Create status indicator for debugging
     let statusElement = document.querySelector(".toc-status");
     if (!statusElement) {
          statusElement = document.createElement("div");
          statusElement.className = "toc-status";
          tocContainer.appendChild(statusElement);
     }

     // Show debug info if enabled
     if (config.debug) {
          statusElement.classList.add("visible");
          console.log("TOC Debug Mode: Enabled");
          console.log("Found", sections.length, "sections for TOC");
     }

     // Save initial position
     const initialTopOffset = tocContainer.offsetTop;
     const initialContainerHeight = tocContainer.offsetHeight;

     // Log initial position if debug is enabled
     if (config.debug) {
          console.log(`TOC initial position: offsetTop: ${initialTopOffset}`);
          statusElement.textContent = `Normal | Top: ${initialTopOffset}px`;
     }

     /**
      * Update TOC position on scroll
      */
     function updateTOCPosition() {
          const scrollY = window.scrollY;
          const windowWidth = window.innerWidth;
          const sidebarWidth = document.querySelector(".sidebar")
               ? document.querySelector(".sidebar").offsetWidth
               : 0;

          // Don't apply fixed positioning on mobile
          if (windowWidth <= 767) {
               toc.classList.remove("fixed");
               if (config.debug) {
                    statusElement.textContent = "Mobile view: static position";
               }
               return;
          }

          if (scrollY > initialTopOffset) {
               toc.classList.add("fixed");

               if (config.debug) {
                    statusElement.textContent = `Fixed | ScrollY: ${scrollY}px | Top: ${initialTopOffset}px`;
               }
          } else {
               toc.classList.remove("fixed");

               if (config.debug) {
                    statusElement.textContent = `Normal | ScrollY: ${scrollY}px | Top: ${initialTopOffset}px`;
               }
          }
     }

     /**
      * Update active TOC link based on scroll position
      */
     function updateActiveLink() {
          // Calculate current scroll position with offset
          const scrollPosition = window.scrollY + config.scrollOffset + 50;

          // Find the current section
          let currentSection = null;

          sections.forEach((section) => {
               const sectionTop = section.offsetTop;
               const sectionHeight = section.offsetHeight;

               if (
                    scrollPosition >= sectionTop &&
                    scrollPosition <= sectionTop + sectionHeight
               ) {
                    currentSection = section;
               }
          });

          // Update active class
          if (currentSection) {
               const sectionId =
                    currentSection.getAttribute("data-toc-section");

               // Remove active class from all links
               document.querySelectorAll(".toc-link").forEach((link) => {
                    link.classList.remove("active");
               });

               // Add active class to current section link
               const activeLink = document.querySelector(
                    `.toc-link[data-target="${sectionId}"]`
               );
               if (activeLink) {
                    activeLink.classList.add("active");
               }
          }
     }

     /**
      * Handle click on TOC link
      * @param {Event} e - Click event
      */
     function handleTOCLinkClick(e) {
          const link = e.target.closest(".toc-link");
          if (!link) return;

          e.preventDefault();

          const targetId = link.getAttribute("data-target");
          const targetSection = document.querySelector(
               `[data-toc-section="${targetId}"]`
          );

          if (targetSection) {
               const topOffset = targetSection.offsetTop - config.scrollOffset;

               window.scrollTo({
                    top: topOffset,
                    behavior: "smooth",
               });
          }
     }

     // Add event listeners
     window.addEventListener("scroll", () => {
          updateTOCPosition();
          updateActiveLink();
     });

     window.addEventListener("resize", updateTOCPosition);

     toc.addEventListener("click", handleTOCLinkClick);

     // Initial updates
     updateTOCPosition();
     updateActiveLink();

     return {
          update: function () {
               updateTOCPosition();
               updateActiveLink();
          },
     };
}

// Export the function
if (typeof module !== "undefined" && module.exports) {
     module.exports = { initTOC };
} else {
     window.initTOC = initTOC;
}
