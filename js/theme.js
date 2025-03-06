// Theme management
function initializeThemeToggle() {
     // Only add the toggle if it doesn't exist
     if (document.querySelector(".theme-toggle")) {
          return;
     }

     const themeToggle = document.createElement("button");
     themeToggle.className = "theme-toggle";
     themeToggle.setAttribute("aria-label", "Toggle theme");

     // Add styles to position the button
     themeToggle.style.cssText = `
        position: fixed;
        bottom: 20px;
        right: 20px;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        background: var(--card-bg);
        border: 1px solid var(--border-color);
        color: var(--text-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0;
        z-index: 1000;
        transition: all 0.2s ease;
        box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    `;

     // Update theme and button icon
     const updateTheme = (theme) => {
          document.documentElement.setAttribute("data-theme", theme);
          localStorage.setItem("theme", theme);

          themeToggle.innerHTML =
               theme === "dark"
                    ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
               </svg>`
                    : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                   <circle cx="12" cy="12" r="5"></circle>
                   <line x1="12" y1="1" x2="12" y2="3"></line>
                   <line x1="12" y1="21" x2="12" y2="23"></line>
                   <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                   <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                   <line x1="1" y1="12" x2="3" y2="12"></line>
                   <line x1="21" y1="12" x2="23" y2="12"></line>
                   <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                   <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
               </svg>`;
     };

     // Toggle theme on click
     themeToggle.addEventListener("click", () => {
          const currentTheme =
               document.documentElement.getAttribute("data-theme") || "light";
          const newTheme = currentTheme === "dark" ? "light" : "dark";
          updateTheme(newTheme);
     });

     // Set initial button state based on current theme
     const currentTheme =
          document.documentElement.getAttribute("data-theme") || "light";
     updateTheme(currentTheme);

     // Add the toggle button to the body
     document.body.appendChild(themeToggle);
}

// Initialize theme toggle immediately if DOM is ready, otherwise wait for DOMContentLoaded
if (document.readyState === "loading") {
     document.addEventListener("DOMContentLoaded", initializeThemeToggle);
} else {
     initializeThemeToggle();
}

// Handle system theme changes
window
     .matchMedia("(prefers-color-scheme: dark)")
     .addEventListener("change", (e) => {
          // Only update if user hasn't manually set a theme
          if (!localStorage.getItem("theme")) {
               const newTheme = e.matches ? "dark" : "light";
               document.documentElement.setAttribute("data-theme", newTheme);
               localStorage.setItem("theme", newTheme);

               // Update the toggle button if it exists
               const themeToggle = document.querySelector(".theme-toggle");
               if (themeToggle) {
                    themeToggle.innerHTML = e.matches
                         ? `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                         <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
                     </svg>`
                         : `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                         <circle cx="12" cy="12" r="5"></circle>
                         <line x1="12" y1="1" x2="12" y2="3"></line>
                         <line x1="12" y1="21" x2="12" y2="23"></line>
                         <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
                         <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
                         <line x1="1" y1="12" x2="3" y2="12"></line>
                         <line x1="21" y1="12" x2="23" y2="12"></line>
                         <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
                         <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
                     </svg>`;
               }
          }
     });
