// Create and return the search header element
export function createSearchHeader() {
     const header = document.createElement("header");
     header.id = "header";
     header.className = "search-header";

     // Create search container
     const searchContainer = document.createElement("div");
     searchContainer.className = "search-container";

     // Create search input
     const searchInput = document.createElement("input");
     searchInput.type = "text";
     searchInput.id = "search-input";
     searchInput.className = "search-input";
     searchInput.placeholder = "Search for mutual aid resources...";
     searchInput.setAttribute("aria-label", "Search for mutual aid resources");

     // Create search button
     const searchButton = document.createElement("button");
     searchButton.className = "search-button";
     searchButton.type = "button";
     searchButton.setAttribute("aria-label", "Search");

     // Add icon to search button
     const searchIcon = document.createElement("i");
     searchIcon.className = "fas fa-search";
     searchButton.appendChild(searchIcon);

     // Assemble search container
     searchContainer.appendChild(searchInput);
     searchContainer.appendChild(searchButton);

     // Add search container to header
     header.appendChild(searchContainer);

     // Add event listener for search functionality
     searchButton.addEventListener("click", performSearch);
     searchInput.addEventListener("keypress", function (e) {
          if (e.key === "Enter") {
               performSearch();
          }
     });

     return header;
}

// Function to handle the search
function performSearch() {
     const searchInput = document.getElementById("search-input");
     const query = searchInput.value.trim();

     if (query) {
          // Redirect to search page with query parameter
          window.location.href = `/search/?q=${encodeURIComponent(query)}`;
     }
}
