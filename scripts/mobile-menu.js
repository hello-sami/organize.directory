// Mobile menu functionality
import { Search } from "./search/index.js";

document.addEventListener("DOMContentLoaded", () => {
  const sidebar = document.querySelector("aside");
  const MOBILE_BREAKPOINT = 1020; // Match this with CSS breakpoint

  // Create mobile menu button
  const mobileMenuButton = document.createElement("button");
  mobileMenuButton.className = "mobile-menu-button";
  mobileMenuButton.setAttribute("aria-label", "Toggle menu");
  mobileMenuButton.setAttribute("aria-expanded", "false");
  mobileMenuButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    `;

  // Create overlay
  const overlay = document.createElement("div");
  overlay.className = "mobile-menu-overlay";

  // Create mobile search
  const mobileSearch = document.createElement("div");
  mobileSearch.className = "mobile-search";
  mobileSearch.innerHTML = `
        <form class="search-form">
            <input type="search" 
                   id="mobileSearchInput"
                   class="search-input" 
                   placeholder="Search locations..." 
                   aria-label="Search locations"
                   autocomplete="off">
            <div id="mobileSearchResults" class="search-results" role="listbox"></div>
        </form>
    `;

  // Insert elements
  sidebar.insertBefore(mobileSearch, sidebar.firstChild);
  document.body.insertBefore(mobileMenuButton, document.body.firstChild);
  document.body.insertBefore(overlay, document.body.firstChild);

  // Initialize search functionality
  const searchForm = mobileSearch.querySelector(".search-form");
  const searchInput = mobileSearch.querySelector(".search-input");
  const searchResults = mobileSearch.querySelector(".search-results");

  // Initialize search instance
  const search = new Search({
    searchInputId: "mobileSearchInput",
    resultsContainerId: "mobileSearchResults",
    type: "initiatives",
    subtype: "city",
    maxResults: 5,
    debounceMs: 150, // Reduced debounce time for more responsive feel
  });

  // Toggle menu and overlay
  function toggleMenu() {
    const isOpen = sidebar.classList.contains("active");
    sidebar.classList.toggle("active");
    overlay.classList.toggle("active");
    mobileMenuButton.setAttribute("aria-expanded", !isOpen);
    document.body.style.overflow = !isOpen ? "hidden" : "";

    if (!isOpen) {
      setTimeout(() => {
        searchInput.focus();
      }, 300);
    }
  }

  // Close menu
  function closeMenu() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
    mobileMenuButton.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
    searchInput.value = "";
    searchResults.style.display = "none";
  }

  mobileMenuButton.addEventListener("click", (e) => {
    e.stopPropagation();
    toggleMenu();
  });

  // Close menu when clicking overlay
  overlay.addEventListener("click", closeMenu);

  // Close menu when pressing escape key
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (searchResults.style.display === "block") {
        searchResults.style.display = "none";
      } else if (sidebar.classList.contains("active")) {
        closeMenu();
      }
    }
  });

  // Handle resize events
  let resizeTimer;
  window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (window.innerWidth > MOBILE_BREAKPOINT) {
        closeMenu();
      }
    }, 250);
  });
});
