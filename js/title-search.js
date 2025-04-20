// Title Search Functionality
document.addEventListener("DOMContentLoaded", function () {
     initTitleSearch();
});

// Title search index - will hold all searchable titles
let titleIndex = [];

// Initialize the title search functionality
function initTitleSearch() {
     // Setup the search UI
     setupSearchUI();

     // Load the search index
     loadSearchIndex().then(() => {
          console.log(`Search index loaded with ${titleIndex.length} entries`);
     });
}

// Setup the search UI elements
function setupSearchUI() {
     // Check if we're on the location page or homepage
     const isLocationPage = document.body.classList.contains("location-page");
     const targetContainer = isLocationPage
          ? document.getElementById("location-search-section")
          : document.querySelector(".homepage-content");

     // Only proceed if we found a valid container
     if (!targetContainer) {
          console.warn("Title search container target not found");
          return;
     }

     // Only create if the search container doesn't already exist
     if (!document.getElementById("title-search-container")) {
          // Create search container
          const searchContainer = document.createElement("div");
          searchContainer.id = "title-search-container";
          searchContainer.className = "title-search-container";

          // Create search input
          const searchInput = document.createElement("input");
          searchInput.type = "text";
          searchInput.id = "title-search-input";
          searchInput.className = "title-search-input";

          // Set appropriate placeholder based on page type
          searchInput.placeholder = isLocationPage
               ? "Search states, cities..."
               : "Search states, cities, regions...";

          searchInput.setAttribute(
               "aria-label",
               "Search states, cities, regions"
          );

          // Create search results container
          const searchResults = document.createElement("div");
          searchResults.id = "title-search-results";
          searchResults.className = "title-search-results";

          // Add elements to container
          searchContainer.appendChild(searchInput);
          searchContainer.appendChild(searchResults);

          // Add search container to the page
          if (isLocationPage) {
               // For location page, replace the existing search section
               targetContainer.appendChild(searchContainer);
          } else {
               // For homepage, insert at the beginning
               targetContainer.insertBefore(
                    searchContainer,
                    targetContainer.firstChild
               );
          }

          // Add event listener for input
          searchInput.addEventListener(
               "input",
               debounce(handleSearchInput, 300)
          );

          // Close results when clicking outside
          document.addEventListener("click", function (event) {
               if (!searchContainer.contains(event.target)) {
                    searchResults.style.display = "none";
               }
          });
     }

     // Add search styles
     addSearchStyles();
}

// Load the title index from the JSON file
async function loadSearchIndex() {
     try {
          // Try to load the generated JSON index
          const response = await fetch("/js/title-index.json");

          // If the file exists and the response is OK, use it
          if (response.ok) {
               titleIndex = await response.json();
               return;
          }

          // Otherwise fall back to static hardcoded lists
          console.warn(
               "Title index JSON not found, falling back to static data"
          );
          titleIndex = [
               ...(await getFallbackStatesIndex()),
               ...(await getFallbackCitiesIndex()),
          ];
     } catch (error) {
          console.error("Error loading search index:", error);
          // Fall back to static hardcoded lists
          titleIndex = [
               ...(await getFallbackStatesIndex()),
               ...(await getFallbackCitiesIndex()),
          ];
     }
}

// Fallback states index if JSON file is not available
async function getFallbackStatesIndex() {
     const statesList = [
          { title: "Alabama", url: "/states/alabama.html" },
          { title: "Alaska", url: "/states/alaska.html" },
          { title: "Arizona", url: "/states/arizona.html" },
          { title: "Arkansas", url: "/states/arkansas.html" },
          { title: "California", url: "/states/california.html" },
          { title: "Colorado", url: "/states/colorado.html" },
          { title: "Connecticut", url: "/states/connecticut.html" },
          { title: "Delaware", url: "/states/delaware.html" },
          {
               title: "District of Columbia",
               url: "/states/district-of-columbia.html",
          },
          { title: "Florida", url: "/states/florida.html" },
          { title: "Georgia", url: "/states/georgia.html" },
          { title: "Hawaii", url: "/states/hawaii.html" },
          { title: "Idaho", url: "/states/idaho.html" },
          { title: "Illinois", url: "/states/illinois.html" },
          { title: "Indiana", url: "/states/indiana.html" },
          { title: "Iowa", url: "/states/iowa.html" },
          { title: "Kansas", url: "/states/kansas.html" },
          { title: "Kentucky", url: "/states/kentucky.html" },
          { title: "Louisiana", url: "/states/louisiana.html" },
          { title: "Maine", url: "/states/maine.html" },
          { title: "Maryland", url: "/states/maryland.html" },
          { title: "Massachusetts", url: "/states/massachusetts.html" },
          { title: "Michigan", url: "/states/michigan.html" },
          { title: "Minnesota", url: "/states/minnesota.html" },
          { title: "Mississippi", url: "/states/mississippi.html" },
          { title: "Missouri", url: "/states/missouri.html" },
          { title: "Montana", url: "/states/montana.html" },
          { title: "Nebraska", url: "/states/nebraska.html" },
          { title: "Nevada", url: "/states/nevada.html" },
          { title: "New Hampshire", url: "/states/new-hampshire.html" },
          { title: "New Jersey", url: "/states/new-jersey.html" },
          { title: "New Mexico", url: "/states/new-mexico.html" },
          { title: "New York", url: "/states/new-york.html" },
          { title: "North Carolina", url: "/states/north-carolina.html" },
          { title: "North Dakota", url: "/states/north-dakota.html" },
          { title: "Ohio", url: "/states/ohio.html" },
          { title: "Oklahoma", url: "/states/oklahoma.html" },
          { title: "Oregon", url: "/states/oregon.html" },
          { title: "Pennsylvania", url: "/states/pennsylvania.html" },
          { title: "Rhode Island", url: "/states/rhode-island.html" },
          { title: "South Carolina", url: "/states/south-carolina.html" },
          { title: "South Dakota", url: "/states/south-dakota.html" },
          { title: "Tennessee", url: "/states/tennessee.html" },
          { title: "Texas", url: "/states/texas.html" },
          { title: "Utah", url: "/states/utah.html" },
          { title: "Vermont", url: "/states/vermont.html" },
          { title: "Virginia", url: "/states/virginia.html" },
          { title: "Washington", url: "/states/washington.html" },
          { title: "West Virginia", url: "/states/west-virginia.html" },
          { title: "Wisconsin", url: "/states/wisconsin.html" },
          { title: "Wyoming", url: "/states/wyoming.html" },
          { title: "US Territories", url: "/states/territories.html" },
     ];
     return statesList.map((state) => {
          return {
               title: state.title,
               url: state.url,
               type: "state",
          };
     });
}

// Fallback cities index if JSON file is not available
async function getFallbackCitiesIndex() {
     // This is a sample of cities - in a production environment, you would dynamically generate this
     // from the server or create a comprehensive static list
     const citiesList = [
          { title: "New York City", url: "/cities/nyc.html" },
          { title: "Los Angeles", url: "/cities/los-angeles.html" },
          { title: "San Francisco", url: "/cities/san-francisco.html" },
          { title: "Washington DC", url: "/cities/washington-dc.html" },
          { title: "Manhattan", url: "/cities/manhattan.html" },
          { title: "Brooklyn", url: "/cities/brooklyn.html" },
          { title: "Bronx", url: "/cities/bronx.html" },
          { title: "Queens", url: "/cities/queens.html" },
          { title: "Staten Island", url: "/cities/staten-island.html" },
          { title: "SF Bay Area", url: "/cities/sf-bay-area.html" },
          { title: "East Bay", url: "/cities/east-bay.html" },
          { title: "Portland", url: "/cities/portland.html" },
          { title: "Phoenix", url: "/cities/phoenix.html" },
          { title: "Omaha", url: "/cities/omaha-council-bluffs.html" },
          { title: "Birmingham", url: "/cities/birmingham.html" },
          { title: "Orlando", url: "/cities/orlando.html" },
          { title: "Spokane", url: "/cities/spokane.html" },
          { title: "Grand Rapids", url: "/cities/grand-rapids.html" },
          { title: "Burlington", url: "/cities/burlington.html" },
          { title: "Des Moines", url: "/cities/des-moines.html" },
     ];

     return citiesList.map((city) => {
          return {
               title: city.title,
               url: city.url,
               type: "city",
          };
     });
}

// Handle search input
function handleSearchInput(event) {
     const query = event.target.value.trim().toLowerCase();
     const resultsContainer = document.getElementById("title-search-results");
     const isLocationPage = document.body.classList.contains("location-page");

     // Clear results if query is empty
     if (query.length === 0) {
          resultsContainer.style.display = "none";
          return;
     }

     // Filter titles based on query
     const results = titleIndex
          .filter((item) => item.title.toLowerCase().includes(query))
          .slice(0, 10); // Limit to 10 results for performance

     // Display results
     if (results.length > 0) {
          resultsContainer.innerHTML = "";
          results.forEach((result) => {
               const resultItem = document.createElement("a");
               resultItem.href = result.url;
               resultItem.className = "title-search-result";
               resultItem.innerHTML = `
                <div class="result-title">${highlightMatch(result.title, query)}</div>
                <div class="result-type">${result.type.charAt(0).toUpperCase() + result.type.slice(1)}</div>
            `;
               resultsContainer.appendChild(resultItem);
          });
          resultsContainer.style.display = "block";
     } else {
          resultsContainer.innerHTML =
               '<div class="no-results">No matches found</div>';
          resultsContainer.style.display = "block";
     }
}

// Highlight the matching portion of text
function highlightMatch(text, query) {
     const regex = new RegExp(`(${query})`, "gi");
     return text.replace(regex, '<span class="highlight">$1</span>');
}

// Debounce function to prevent excessive processing during typing
function debounce(func, delay) {
     let timeout;
     return function () {
          const context = this;
          const args = arguments;
          clearTimeout(timeout);
          timeout = setTimeout(() => func.apply(context, args), delay);
     };
}

// Add the necessary styles for the search UI
function addSearchStyles() {
     if (!document.getElementById("title-search-styles")) {
          const styleEl = document.createElement("style");
          styleEl.id = "title-search-styles";
          styleEl.textContent = `
            /* Base styles for all pages */
            .title-search-container {
                position: relative;
                max-width: 800px;
            }
            
            /* Homepage-specific styles */
            body.page-home .title-search-container {
                margin: 0 auto 1.5rem;
            }
            
            body.page-home .title-search-wrapper {
                margin-bottom: 1.5rem;
            }
            
            /* Location page - now using standard state-page styles */
            /* We only need to add styles for elements unique to this page */
            
            .separator-text {
                text-align: left;
                font-size: 1rem;
                margin: 0.75rem 0 1.25rem;
                color: #777;
                position: relative;
            }
            
            /* Add extra space between heading and search bar */
            body.location-page h1 {
                margin-bottom: 2rem;
            }
            
            /* Remove the horizontal lines from the separator since it's now left-aligned */
            .separator-text:before,
            .separator-text:after {
                display: none;
            }
            
            /* State links styling */
            body.location-page .state-link {
                display: block;
                padding: 0.5rem 0;
                border-bottom: 1px solid #eee;
            }
            
            body.location-page .state-link:last-child {
                border-bottom: none;
            }
            
            /* Mobile styles */
            @media (max-width: 480px) {
                body.location-page h1 {
                    margin-bottom: 1.5rem;
                }
                
                .separator-text {
                    margin: 0.75rem 0 1rem;
                }
            }
            
            /* Shared styles for all pages */
            .title-search-input {
                width: 100%;
                padding: 12px 16px;
                font-size: 1rem;
                border: 2px solid #c82525;
                border-radius: 8px;
                box-shadow: 0 2px 6px rgba(200, 37, 37, 0.1);
                transition: all 0.2s ease;
            }
            
            .title-search-input:focus {
                outline: none;
                box-shadow: 0 2px 10px rgba(200, 37, 37, 0.2);
                border-color: #e02e2e;
            }
            
            .title-search-results {
                position: absolute;
                top: 100%;
                left: 0;
                right: 0;
                background: white;
                border: 1px solid #ddd;
                border-radius: 0 0 8px 8px;
                box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
                z-index: 100;
                max-height: 400px;
                overflow-y: auto;
                display: none;
            }
            
            .title-search-result {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 16px;
                border-bottom: 1px solid #eee;
                color: #333;
                text-decoration: none;
                transition: background-color 0.2s ease;
            }
            
            .title-search-result:hover {
                background-color: #f9f0f0;
            }
            
            .title-search-result:last-child {
                border-bottom: none;
            }
            
            .result-title {
                font-weight: 500;
            }
            
            .result-type {
                font-size: 0.85rem;
                color: #777;
                background: #f5f5f5;
                padding: 3px 8px;
                border-radius: 4px;
            }
            
            .highlight {
                background-color: #ffebeb;
                font-weight: bold;
                color: #c82525;
            }
            
            .no-results {
                padding: 12px 16px;
                color: #666;
                text-align: center;
                font-style: italic;
            }
            
            /* Add specific styles for location page */
            body.location-page .title-search-container {
                margin-bottom: 2rem;
            }
            
            @media (max-width: 480px) {
                .title-search-container {
                    margin-bottom: 1rem;
                }
                
                .title-search-input {
                    font-size: 0.95rem;
                    padding: 10px 12px;
                }
            }
        `;
          document.head.appendChild(styleEl);
     }
}
