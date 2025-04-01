/**
 * Sidebar initialization and management
 */
export function initializeSidebar(activePage = null) {
     // Get the sidebar element
     const sidebar = document.getElementById("sidebar");
     if (!sidebar) return;

     // Highlight active page if specified
     if (activePage) {
          const activeLink = sidebar.querySelector(`a[href="/${activePage}"]`);
          if (activeLink) {
               activeLink.classList.add("active");
               activeLink.setAttribute("aria-current", "page");
          }
     }

     // Mobile sidebar toggle
     const menuToggle = document.getElementById("menu-toggle");
     if (menuToggle) {
          menuToggle.addEventListener("click", () => {
               sidebar.classList.toggle("sidebar-open");
               document.body.classList.toggle("sidebar-active");
          });
     }
}
