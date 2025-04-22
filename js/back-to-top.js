/**
 * Back to Top Button for Mobile
 *
 * Adds a button that appears when the user scrolls down the page
 * and allows them to quickly return to the top of the page.
 */
document.addEventListener("DOMContentLoaded", function () {
     // Only run on mobile devices
     if (window.innerWidth <= 768) {
          createBackToTopButton();
     }
});

function createBackToTopButton() {
     // Create the button if it doesn't exist
     if (!document.querySelector(".back-to-top")) {
          const backToTopButton = document.createElement("button");
          backToTopButton.className = "back-to-top";
          backToTopButton.setAttribute("aria-label", "Back to top");
          backToTopButton.innerHTML = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        `;
          document.body.appendChild(backToTopButton);

          // Add click event
          backToTopButton.addEventListener("click", () => {
               // Smooth scroll to top
               window.scrollTo({
                    top: 0,
                    behavior: "smooth",
               });
          });

          // Show/hide button based on scroll position
          const scrollThreshold = 300; // Show after scrolling down 300px

          // Use passive event listener for better performance
          window.addEventListener(
               "scroll",
               () => {
                    if (window.scrollY > scrollThreshold) {
                         backToTopButton.classList.add("visible");
                    } else {
                         backToTopButton.classList.remove("visible");
                    }
               },
               { passive: true }
          );
     }
}
