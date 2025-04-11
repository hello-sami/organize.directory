// Mobile menu functionality
document.addEventListener("DOMContentLoaded", function () {
     // Get sidebar element
     const sidebar = document.getElementById("sidebar");
     const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");

     // Always remove any existing button to avoid duplicates
     const existingButton = document.querySelector(".mobile-menu-button");
     if (existingButton) {
          existingButton.remove();
     }

     // Always create a new mobile menu button with correct styling
     const mobileMenuButton = document.createElement("button");
     mobileMenuButton.className = "mobile-menu-button";
     mobileMenuButton.setAttribute("aria-label", "Toggle navigation menu");
     mobileMenuButton.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
     `;
     document.body.insertBefore(mobileMenuButton, document.body.firstChild);

     // Create overlay if it doesn't exist
     let overlay = mobileMenuOverlay;
     if (!overlay) {
          overlay = document.createElement("div");
          overlay.className = "mobile-menu-overlay";
          document.body.insertBefore(overlay, document.body.firstChild);
     }

     // Add event listener to toggle sidebar
     if (sidebar) {
          mobileMenuButton.addEventListener("click", function () {
               sidebar.classList.toggle("active");
               document.body.classList.toggle("menu-open");
               overlay.classList.toggle("active");
          });

          // Close sidebar when clicking on the overlay
          overlay.addEventListener("click", function () {
               sidebar.classList.remove("active");
               document.body.classList.remove("menu-open");
               overlay.classList.remove("active");
          });

          // Close sidebar when clicking outside of it
          document.addEventListener("click", function (event) {
               if (
                    sidebar.classList.contains("active") &&
                    !sidebar.contains(event.target) &&
                    !mobileMenuButton.contains(event.target) &&
                    !overlay.contains(event.target)
               ) {
                    sidebar.classList.remove("active");
                    document.body.classList.remove("menu-open");
                    overlay.classList.remove("active");
               }
          });
     }

     // Add the necessary styles if they don't exist
     if (!document.getElementById("mobile-menu-styles")) {
          const styleEl = document.createElement("style");
          styleEl.id = "mobile-menu-styles";
          styleEl.textContent = `
               .mobile-menu-button {
                    display: none;
                    position: fixed;
                    top: 1rem;
                    left: 1rem;
                    z-index: 110;
                    background: #ffffff;
                    border: 2px solid #ffb3b3;
                    border-radius: 6px;
                    padding: 0.75rem;
                    cursor: pointer;
                    align-items: center;
                    justify-content: center;
               }
               
               .mobile-menu-button svg {
                    width: 24px;
                    height: 24px;
                    stroke: #800000;
               }
               
               .mobile-menu-overlay {
                    display: none;
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.5);
                    z-index: 90;
               }
               
               .mobile-menu-overlay.active {
                    display: block;
               }
               
               @media (max-width: 1020px) {
                    .mobile-menu-button {
                         display: flex;
                    }
               }
          `;
          document.head.appendChild(styleEl);
     }
});
