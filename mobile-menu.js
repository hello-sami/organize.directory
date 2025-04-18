// Mobile menu functionality
document.addEventListener("DOMContentLoaded", function () {
     // Get sidebar element after a short delay to ensure it's created
     setTimeout(() => {
          setupMobileMenu();
     }, 100);
});

function setupMobileMenu() {
     const sidebar = document.getElementById("sidebar");
     const mobileMenuOverlay = document.querySelector(".mobile-menu-overlay");
     const existingButton = document.querySelector(".mobile-menu-button");

     // Use existing mobile menu elements if present, otherwise create them
     let overlay = mobileMenuOverlay;
     let mobileMenuButton = existingButton;

     if (!mobileMenuButton) {
          // Create mobile menu button if it doesn't exist
          mobileMenuButton = document.createElement("button");
          mobileMenuButton.className = "mobile-menu-button";
          mobileMenuButton.setAttribute("aria-label", "Toggle navigation menu");
          mobileMenuButton.innerHTML = `
               <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
               </svg>
          `;
          document.body.insertBefore(
               mobileMenuButton,
               document.body.firstChild
          );
     }

     if (!overlay) {
          // Create overlay if it doesn't exist
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

               // Force logo visibility when sidebar is opened
               if (sidebar.classList.contains("active")) {
                    const logoImg = sidebar.querySelector(".site-logo");
                    if (logoImg) {
                         logoImg.classList.add("loaded");
                         logoImg.style.opacity = "1";
                         logoImg.style.visibility = "visible";
                    }
               }
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
                    top: 0.75rem;
                    left: 0.75rem;
                    z-index: 120;
                    background: rgba(255, 255, 255, 0.95);
                    border: 2px solid #ffb3b3;
                    border-radius: 6px;
                    padding: 0.75rem;
                    cursor: pointer;
                    align-items: center;
                    justify-content: center;
                    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
               }
               
               .mobile-menu-button svg {
                    width: 24px;
                    height: 24px;
                    stroke: #800000;
               }

               /* Mobile menu adjustments */
               @media (max-width: 1020px) {
                    /* Only adjust styles through classes, not direct style application */
                    .sidebar-header {
                         padding-top: 1.5rem; /* Reduced from 3.5rem for better spacing */
                    }
                    
                    /* Make sure the hamburger button stays visible above content */
                    .mobile-menu-button {
                         display: flex;
                         z-index: 999 !important;
                    }
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
}
