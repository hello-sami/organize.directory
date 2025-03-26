// Mobile menu functionality
document.addEventListener("DOMContentLoaded", function () {
     // Get sidebar element
     const sidebar = document.getElementById("sidebar");

     // Get or create mobile menu button
     let mobileMenuButton = document.querySelector(".mobile-menu-button");

     if (!mobileMenuButton && sidebar) {
          // Create the button if it doesn't exist
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

     // Add event listener to toggle sidebar
     if (mobileMenuButton && sidebar) {
          mobileMenuButton.addEventListener("click", function () {
               sidebar.classList.toggle("active");
               document.body.classList.toggle("menu-open");
          });

          // Close sidebar when clicking outside of it
          document.addEventListener("click", function (event) {
               if (
                    sidebar.classList.contains("active") &&
                    !sidebar.contains(event.target) &&
                    !mobileMenuButton.contains(event.target)
               ) {
                    sidebar.classList.remove("active");
                    document.body.classList.remove("menu-open");
               }
          });
     }
});
