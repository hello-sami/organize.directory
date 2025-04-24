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

          // Create mobile TOC toggle button
          const mobileTocToggle = document.createElement("button");
          mobileTocToggle.className = "mobile-toc-toggle";
          mobileTocToggle.textContent = "Jump to a section";
          mobileTocToggle.setAttribute("aria-expanded", "false");
          mobileTocToggle.setAttribute("aria-controls", "toc");

          // Insert toggle button before TOC
          tocContainer.insertBefore(mobileTocToggle, toc);

          // Add click event to toggle TOC visibility
          mobileTocToggle.addEventListener("click", function () {
               const isExpanded = this.getAttribute("aria-expanded") === "true";
               this.setAttribute("aria-expanded", !isExpanded);
               this.classList.toggle("open");
               toc.classList.toggle("open");

               // Update button text based on state
               if (!isExpanded) {
                    this.textContent = "Close section menu";
               } else {
                    this.textContent = "Jump to a section";
               }
          });

          // Close TOC when clicking anywhere else on the page (for mobile)
          document.addEventListener("click", function (e) {
               // Only apply this behavior on mobile
               if (window.innerWidth >= 1020) return;

               // If click is outside the TOC and the toggle button
               if (!toc.contains(e.target) && e.target !== mobileTocToggle) {
                    // And if the TOC is open
                    if (toc.classList.contains("open")) {
                         toc.classList.remove("open");
                         mobileTocToggle.classList.remove("open");
                         mobileTocToggle.setAttribute("aria-expanded", "false");
                         mobileTocToggle.textContent = "Jump to a section";
                    }
               }
          });

          // Make TOC links close the mobile TOC after clicking
          if (window.innerWidth < 1020) {
               document.querySelectorAll(".toc-link").forEach((link) => {
                    link.addEventListener("click", function () {
                         if (window.innerWidth < 1020) {
                              mobileTocToggle.classList.remove("open");
                              toc.classList.remove("open");
                              mobileTocToggle.setAttribute(
                                   "aria-expanded",
                                   "false"
                              );
                         }
                    });
               });
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

          // Keep track of the last known active section
          let lastActiveSection = null;

          // Helper function to update active TOC link
          function updateActiveTocLink(activeId) {
               if (!activeId || activeId === lastActiveSection) return;

               lastActiveSection = activeId;

               document.querySelectorAll(".toc-link").forEach((link) => {
                    const href = link.getAttribute("href").substring(1);

                    if (href === activeId) {
                         link.classList.add("active");
                    } else {
                         link.classList.remove("active");
                    }
               });
          }

          // Get all section IDs and positions for scroll-based detection
          const allSections = Array.from(sections)
               .map((section) => {
                    return {
                         id: section.id,
                         el: section,
                         top: section.offsetTop,
                         bottom: section.offsetTop + section.offsetHeight,
                         height: section.offsetHeight,
                    };
               })
               .sort((a, b) => a.top - b.top);

          // Improved scroll-based detection system
          let scrollTimeout = null;
          function handleScroll() {
               // Use requestAnimationFrame for better performance
               if (scrollTimeout) {
                    return;
               }

               scrollTimeout = window.requestAnimationFrame(() => {
                    scrollTimeout = null;

                    // Get current scroll position
                    const scrollPos = window.scrollY;
                    // Get viewport height and calculate various trigger points
                    const viewportHeight = window.innerHeight;
                    const scrollTop = scrollPos;
                    const scrollMid = scrollPos + viewportHeight * 0.4; // 40% from top instead of 50%
                    const scrollBottom = scrollPos + viewportHeight;

                    // Track active section and its visibility score
                    let activeSection = null;
                    let maxVisibility = -1;

                    // First pass: Calculate visibility for each section
                    for (const section of allSections) {
                         // Skip sections with zero height
                         if (section.height <= 0) continue;

                         // Calculate how much of the section is visible in viewport
                         const sectionTop = Math.max(section.top, scrollTop);
                         const sectionBottom = Math.min(
                              section.bottom,
                              scrollBottom
                         );
                         let visibleHeight = Math.max(
                              0,
                              sectionBottom - sectionTop
                         );

                         // For very short sections, give them a visibility boost
                         if (
                              section.height < viewportHeight * 0.5 &&
                              visibleHeight > 0
                         ) {
                              visibleHeight = Math.max(
                                   visibleHeight,
                                   section.height * 0.5
                              );
                         }

                         // Calculate visibility as percentage of section visible (0-1)
                         const visibilityScore = visibleHeight / section.height;

                         // If this section is more visible than previous best, make it active
                         if (visibilityScore > maxVisibility) {
                              maxVisibility = visibilityScore;
                              activeSection = section.id;
                         }
                    }

                    // Second pass: if no section has good visibility, use position heuristics
                    if (maxVisibility < 0.1) {
                         // Find which section contains our detection point
                         for (const section of allSections) {
                              if (
                                   scrollMid >= section.top &&
                                   scrollMid <= section.bottom
                              ) {
                                   activeSection = section.id;
                                   break;
                              }
                         }
                    }

                    // Fallback: if we still don't have an active section
                    if (!activeSection && allSections.length > 0) {
                         if (scrollTop < allSections[0].top) {
                              // We're above the first section
                              activeSection = allSections[0].id;
                         } else {
                              // Find the last section we've scrolled past
                              for (
                                   let i = allSections.length - 1;
                                   i >= 0;
                                   i--
                              ) {
                                   if (scrollTop >= allSections[i].top) {
                                        activeSection = allSections[i].id;
                                        break;
                                   }
                              }
                         }
                    }

                    // Update TOC if we have an active section
                    if (activeSection) {
                         updateActiveTocLink(activeSection);
                    }
               });
          }

          // Use passive scroll listener for better performance
          window.addEventListener("scroll", handleScroll, { passive: true });

          // Update section positions on window resize
          window.addEventListener(
               "resize",
               function () {
                    // Recalculate section positions
                    allSections.forEach((section) => {
                         section.top = section.el.offsetTop;
                         section.bottom =
                              section.el.offsetTop + section.el.offsetHeight;
                         section.height = section.el.offsetHeight;
                    });

                    // Force an update after resize
                    handleScroll();
               },
               { passive: true }
          );

          // Initialize by calling once
          handleScroll();

          // Update positions on resize
          window.addEventListener(
               "resize",
               function () {
                    calculatePositions();
                    updateTocPosition();

                    // Update mobile TOC event handlers on resize
                    if (window.innerWidth < 1020) {
                         document
                              .querySelectorAll(".toc-link")
                              .forEach((link) => {
                                   link.addEventListener("click", function () {
                                        mobileTocToggle.classList.remove(
                                             "open"
                                        );
                                        toc.classList.remove("open");
                                        mobileTocToggle.setAttribute(
                                             "aria-expanded",
                                             "false"
                                        );
                                   });
                              });
                    }
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
