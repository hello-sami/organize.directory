/**
 * City Page TOC Implementation
 *
 * This script provides a Table of Contents implementation for city pages
 * that automatically highlights the current section and supports smooth scrolling.
 * It also provides a fixed positioning for the TOC when scrolling down the page.
 */

document.addEventListener("DOMContentLoaded", function () {
     try {
          // Clean up existing debug elements
          document
               .querySelectorAll("#toc-status, #toc-debug-box")
               .forEach((el) => el.remove());

          // Get essential elements
          const toc = document.getElementById("toc");
          const tocContainer = document.querySelector(".toc-container");
          const contentWrapper = document.querySelector(".content-wrapper");
          const sections = document.querySelectorAll(".city-section");

          // Exit if required elements don't exist
          if (
               !toc ||
               !tocContainer ||
               !contentWrapper ||
               sections.length === 0
          ) {
               console.error("Could not find required elements", {
                    toc: !!toc,
                    tocContainer: !!tocContainer,
                    contentWrapper: !!contentWrapper,
                    sections: sections.length,
               });
               return;
          }

          // Initialize TOC position variables
          let initialTocTop = 0;
          let rightOffset = 0;

          // Calculate initial positions relative to stable reference points
          function calculatePositions() {
               const tocRect = tocContainer.getBoundingClientRect();
               const wrapperRect = contentWrapper.getBoundingClientRect();

               initialTocTop = tocRect.top + window.pageYOffset;
               rightOffset =
                    window.innerWidth -
                    wrapperRect.right +
                    parseFloat(getComputedStyle(contentWrapper).paddingRight);
          }

          // Position the TOC based on scroll
          function updateTocPosition() {
               const scrollY =
                    window.pageYOffset || document.documentElement.scrollTop;

               // Skip for mobile view
               if (window.innerWidth < 1020) {
                    toc.classList.remove("toc-fixed");
                    toc.style.right = "";
                    return;
               }

               // Fixed threshold
               const threshold = initialTocTop - 20;

               if (scrollY > threshold) {
                    // Switch to fixed positioning
                    toc.classList.add("toc-fixed");
                    toc.style.right = rightOffset + "px";
               } else {
                    // Revert to normal position
                    toc.classList.remove("toc-fixed");
                    toc.style.right = "";
               }
          }

          // Smooth scroll for TOC links
          document.querySelectorAll(".toc-link").forEach((link) => {
               link.addEventListener("click", function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute("href").substring(1);
                    const targetElement = document.getElementById(targetId);

                    if (targetElement) {
                         // Update active states
                         document
                              .querySelectorAll(".toc-link")
                              .forEach((l) => l.classList.remove("active"));
                         this.classList.add("active");

                         // Smooth scroll
                         const offset = 50;
                         const targetPosition =
                              targetElement.getBoundingClientRect().top +
                              window.pageYOffset -
                              offset;

                         window.scrollTo({
                              top: targetPosition,
                              behavior: "smooth",
                         });

                         // Update URL without scrolling
                         history.pushState(null, null, `#${targetId}`);
                    }
               });
          });

          // Set up an intersection observer to track active sections
          const observerOptions = {
               rootMargin: "-5% 0px -70% 0px",
               threshold: [0, 0.1, 0.5],
          };

          const observer = new IntersectionObserver((entries) => {
               entries.forEach((entry) => {
                    if (entry.isIntersecting && entry.intersectionRatio > 0.1) {
                         const activeId = entry.target.getAttribute("id");

                         // Update active link in TOC
                         document
                              .querySelectorAll(".toc-link")
                              .forEach((link) => {
                                   const href = link
                                        .getAttribute("href")
                                        .substring(1);

                                   if (href === activeId) {
                                        link.classList.add("active");
                                   } else {
                                        link.classList.remove("active");
                                   }
                              });
                    }
               });
          }, observerOptions);

          // Observe all sections
          sections.forEach((section) => {
               observer.observe(section);
          });

          // Update positions on resize
          window.addEventListener(
               "resize",
               function () {
                    calculatePositions();
                    updateTocPosition();
               },
               { passive: true }
          );

          // Update TOC on scroll
          window.addEventListener("scroll", updateTocPosition, {
               passive: true,
          });

          // Initialize
          calculatePositions();
          updateTocPosition();
     } catch (err) {
          console.error("TOC Error:", err);
     }
});
