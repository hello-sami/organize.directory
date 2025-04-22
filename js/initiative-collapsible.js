// initiative-collapsible.js
// This script handles the collapsible functionality for initiative descriptions on mobile devices

document.addEventListener("DOMContentLoaded", function () {
     // Only apply this functionality on mobile devices
     const isMobile = window.innerWidth <= 768;

     if (isMobile) {
          const initiatives = document.querySelectorAll(".initiative");

          // For each initiative, make the description and external link collapsible
          initiatives.forEach((initiative) => {
               const originalLink = initiative.querySelector("a");
               const description = initiative.querySelector("p");

               if (originalLink && description) {
                    // Store the original href and text
                    const originalHref = originalLink.getAttribute("href");
                    const originalText = originalLink.textContent;

                    // Create a wrapper for the toggle functionality
                    const wrapper = document.createElement("div");
                    wrapper.className = "initiative-name-wrapper";

                    // Convert the original link to a toggle button
                    const toggleButton = document.createElement("button");
                    toggleButton.className = "initiative-name-toggle";
                    toggleButton.textContent = originalText;
                    toggleButton.setAttribute("aria-expanded", "false");
                    toggleButton.setAttribute(
                         "aria-controls",
                         "initiative-content-" +
                              Math.random().toString(36).substr(2, 9)
                    );

                    // Create a container for the hidden content
                    const hiddenContent = document.createElement("div");
                    hiddenContent.className =
                         "initiative-hidden-content collapsed";
                    hiddenContent.id =
                         toggleButton.getAttribute("aria-controls");

                    // Create a new link that will be just an icon button
                    const externalLink = document.createElement("a");
                    externalLink.href = originalHref;
                    externalLink.className = "initiative-arrow-link";
                    externalLink.innerHTML =
                         '<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="website-icon"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>';
                    externalLink.setAttribute("target", "_blank");
                    externalLink.setAttribute("rel", "noopener noreferrer");
                    externalLink.setAttribute(
                         "aria-label",
                         "Visit " + originalText + " website"
                    );

                    // Add the description and external link to the hidden content
                    hiddenContent.appendChild(description.cloneNode(true));

                    // Create a container for the arrow to control positioning
                    const linkContainer = document.createElement("div");
                    linkContainer.className = "arrow-link-container";
                    linkContainer.appendChild(externalLink);
                    hiddenContent.appendChild(linkContainer);

                    // Replace the original elements with our new structure
                    originalLink.parentNode.insertBefore(wrapper, originalLink);
                    wrapper.appendChild(toggleButton);
                    wrapper.appendChild(hiddenContent);

                    // Remove the original elements
                    originalLink.remove();
                    description.remove();

                    // Add click event to toggle hidden content visibility
                    toggleButton.addEventListener("click", function (e) {
                         e.preventDefault();
                         e.stopPropagation();

                         hiddenContent.classList.toggle("collapsed");
                         initiative.classList.toggle("expanded");

                         const isExpanded =
                              !hiddenContent.classList.contains("collapsed");
                         toggleButton.setAttribute(
                              "aria-expanded",
                              isExpanded.toString()
                         );

                         // Add or remove the active class to style the toggle button
                         toggleButton.classList.toggle("active", isExpanded);
                    });
               }
          });
     }
});
