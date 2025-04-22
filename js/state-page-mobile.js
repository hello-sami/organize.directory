/**
 * State Page Mobile Enhancements
 *
 * Adds mobile-specific enhancements to state pages:
 * - Improved touch interactions
 * - Lazy loading city sections
 * - Better loading performance
 */
document.addEventListener("DOMContentLoaded", function () {
     // Only run on mobile devices and state pages
     if (window.innerWidth <= 768 && document.querySelector(".state-page")) {
          enhanceStatePage();
     }
});

function enhanceStatePage() {
     // Find all city/region links
     const cityLinks = document.querySelectorAll(
          ".state-page .city-links-container a, .state-page .city-links-container .city-link"
     );

     if (!cityLinks.length) return;

     // Add enhanced touch feedback
     cityLinks.forEach((link) => {
          // Track touch start for better visual feedback
          link.addEventListener(
               "touchstart",
               function () {
                    this.classList.add("touch-active");
               },
               { passive: true }
          );

          link.addEventListener(
               "touchend",
               function () {
                    this.classList.remove("touch-active");
               },
               { passive: true }
          );

          // Add subtle tap animation
          link.addEventListener("click", function () {
               this.classList.add("clicked");

               // Remove animation class after animation completes
               setTimeout(() => {
                    this.classList.remove("clicked");
               }, 300);
          });
     });

     // Add fastclick to links to remove 300ms delay on mobile
     removeTouchDelay(cityLinks);

     // Optimize loading of city links
     lazyLoadCitySections();

     // Add swipe navigation between sections
     addSwipeNavigation();
}

/**
 * Add styles for touch feedback
 */
function addMobileStyles() {
     if (document.getElementById("state-page-mobile-styles")) return;

     const styleEl = document.createElement("style");
     styleEl.id = "state-page-mobile-styles";
     styleEl.innerHTML = `
        .state-page .city-links-container a.touch-active,
        .state-page .city-links-container .city-link.touch-active {
            background-color: var(--bg-medium);
            transform: translateY(1px);
        }
        
        .state-page .city-links-container a.clicked::after,
        .state-page .city-links-container .city-link.clicked::after {
            animation: arrowPulse 0.3s ease-in-out;
        }
        
        @keyframes arrowPulse {
            0% { transform: translateX(0); opacity: 0.6; }
            50% { transform: translateX(5px); opacity: 1; }
            100% { transform: translateX(0); opacity: 0.6; }
        }
        
        .state-page .city-links-container {
            opacity: 0;
            transform: translateY(10px);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        
        .state-page .city-links-container.loaded {
            opacity: 1;
            transform: translateY(0);
        }
    `;

     document.head.appendChild(styleEl);
}

/**
 * Remove 300ms touch delay on mobile browsers
 */
function removeTouchDelay(elements) {
     elements.forEach((el) => {
          el.addEventListener("touchend", function (e) {
               // Prevent default behavior so ghost click doesn't happen
               e.preventDefault();

               // Navigate to link directly
               const href = this.getAttribute("href");
               if (href) {
                    window.location.href = href;
               }
          });
     });
}

/**
 * Lazy load city sections as user scrolls
 */
function lazyLoadCitySections() {
     // Add our custom styles
     addMobileStyles();

     const citySections = document.querySelectorAll(".cities-list");

     if (!citySections.length) return;

     // Setup intersection observer
     const observerOptions = {
          root: null,
          rootMargin: "50px",
          threshold: 0.1,
     };

     const sectionObserver = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
               if (entry.isIntersecting) {
                    const section = entry.target;
                    const linksContainer = section.querySelector(
                         ".city-links-container"
                    );

                    if (
                         linksContainer &&
                         !linksContainer.classList.contains("loaded")
                    ) {
                         // Add loaded class with animation
                         setTimeout(() => {
                              linksContainer.classList.add("loaded");
                         }, 100);
                    }

                    // Unobserve after loading
                    sectionObserver.unobserve(section);
               }
          });
     }, observerOptions);

     // Observe each city section
     citySections.forEach((section) => {
          sectionObserver.observe(section);
     });
}

/**
 * Add swipe navigation between sections
 */
function addSwipeNavigation() {
     const sections = document.querySelectorAll(".cities-list");
     if (sections.length <= 1) return;

     let touchStartY = 0;
     let touchEndY = 0;
     const minSwipeDistance = 80;

     // Find the index of the section in view
     function findVisibleSectionIndex() {
          const viewportMiddle = window.innerHeight / 2;

          for (let i = 0; i < sections.length; i++) {
               const rect = sections[i].getBoundingClientRect();
               if (
                    rect.top <= viewportMiddle &&
                    rect.bottom >= viewportMiddle
               ) {
                    return i;
               }
          }

          return 0;
     }

     // Scroll to the next or previous section
     function navigateSection(direction) {
          const currentIndex = findVisibleSectionIndex();
          let targetIndex = currentIndex + direction;

          // Clamp to valid range
          targetIndex = Math.max(0, Math.min(sections.length - 1, targetIndex));

          if (targetIndex !== currentIndex) {
               sections[targetIndex].scrollIntoView({
                    behavior: "smooth",
                    block: "start",
               });
          }
     }

     // Setup touch handlers
     document.addEventListener(
          "touchstart",
          (e) => {
               touchStartY = e.touches[0].clientY;
          },
          { passive: true }
     );

     document.addEventListener(
          "touchend",
          (e) => {
               touchEndY = e.changedTouches[0].clientY;
               const distance = touchEndY - touchStartY;

               // Detect vertical swipe - only if it's a substantial movement
               if (Math.abs(distance) >= minSwipeDistance) {
                    if (distance > 0) {
                         // Swipe down - go to previous section
                         navigateSection(-1);
                    } else {
                         // Swipe up - go to next section
                         navigateSection(1);
                    }
               }
          },
          { passive: true }
     );
}
