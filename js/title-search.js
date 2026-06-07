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
     loadSearchIndex();
}

// Setup the search UI elements
function setupSearchUI() {
     // Detect the page by which mount point is present rather than a body
     // class (the location page doesn't reliably carry a `location-page`
     // class). The location page provides an empty #location-search-section
     // for us to fill; the homepage ships a static #site-search form we wire
     // onto directly.
     const locationMount = document.getElementById("location-search-section");
     const existingInput = document.getElementById("site-search");
     const isLocationPage = !!locationMount;

     let searchContainer, searchInput, searchResults;

     if (existingInput && !isLocationPage) {
          // Avoid double-initialization
          if (document.getElementById("title-search-results")) {
               addSearchStyles();
               return;
          }

          searchInput = existingInput;
          const form = existingInput.closest("form") || existingInput;

          // The form has overflow:hidden, which would clip an absolutely
          // positioned dropdown. Wrap it in a positioned container and place
          // the results outside the form so they render fully.
          const wrapper = document.createElement("div");
          wrapper.className = "title-search-wrapper";
          wrapper.style.position = "relative";
          form.parentNode.insertBefore(wrapper, form);
          wrapper.appendChild(form);

          searchResults = document.createElement("div");
          searchResults.id = "title-search-results";
          searchResults.className = "title-search-results";
          wrapper.appendChild(searchResults);

          searchContainer = wrapper;

          // Submitting (Enter or the "Go" button) jumps to the top result.
          form.addEventListener("submit", function (event) {
               event.preventDefault();
               const first = searchResults.querySelector("a.title-search-result");
               if (first) window.location.href = first.getAttribute("href");
          });
     } else {
          // Location page (and any legacy .homepage-content layout): inject our
          // own input/results into the designated container.
          const targetContainer =
               locationMount || document.querySelector(".homepage-content");

          if (!targetContainer) return;
          if (document.getElementById("title-search-container")) {
               addSearchStyles();
               return;
          }

          searchContainer = document.createElement("div");
          searchContainer.id = "title-search-container";
          searchContainer.className = "title-search-container";

          searchInput = document.createElement("input");
          searchInput.type = "text";
          searchInput.id = "title-search-input";
          searchInput.className = "title-search-input";
          searchInput.placeholder = isLocationPage
               ? "Search states, cities..."
               : "Search states, cities, regions...";
          searchInput.setAttribute("aria-label", "Search states, cities, regions");

          searchResults = document.createElement("div");
          searchResults.id = "title-search-results";
          searchResults.className = "title-search-results";

          searchContainer.appendChild(searchInput);
          searchContainer.appendChild(searchResults);

          if (isLocationPage) {
               targetContainer.appendChild(searchContainer);
          } else {
               targetContainer.insertBefore(
                    searchContainer,
                    targetContainer.firstChild
               );
          }
     }

     // Shared wiring for whichever input/results we ended up with
     searchInput.addEventListener("input", debounce(handleSearchInput, 300));

     document.addEventListener("click", function (event) {
          if (!searchContainer.contains(event.target)) {
               searchResults.style.display = "none";
          }
     });

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

          titleIndex = [
               ...(await getFallbackStatesIndex()),
               ...(await getFallbackCitiesIndex()),
          ];
     } catch {
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
     resultsContainer.replaceChildren();
     if (results.length > 0) {
          results.forEach((result) => {
               const resultItem = document.createElement("a");
               resultItem.href = result.url;
               resultItem.className = "title-search-result";

               const titleDiv = document.createElement("div");
               titleDiv.className = "result-title";
               appendHighlightedText(titleDiv, result.title, query);

               const typeDiv = document.createElement("div");
               typeDiv.className = "result-type";
               const typeLabel = result.type || "Page";
               typeDiv.textContent =
                    typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1);

               resultItem.append(titleDiv, typeDiv);
               resultsContainer.appendChild(resultItem);
          });
     } else {
          const noResults = document.createElement("div");
          noResults.className = "no-results";
          noResults.textContent = "No matches found";
          resultsContainer.appendChild(noResults);
     }
     resultsContainer.style.display = "block";
}

// Escape regex metacharacters in user-supplied query
function escapeRegExp(str) {
     return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Build text with matching substrings wrapped in <span class="highlight"> nodes.
// All segments are added via textContent, so there's no HTML injection path.
function appendHighlightedText(parent, text, query) {
     if (!query) {
          parent.textContent = text;
          return;
     }
     const regex = new RegExp(`(${escapeRegExp(query)})`, "gi");
     const parts = text.split(regex);
     parts.forEach((part, i) => {
          if (i % 2 === 1) {
               // Odd indices are matches because of the capture group
               const span = document.createElement("span");
               span.className = "highlight";
               span.textContent = part;
               parent.appendChild(span);
          } else if (part) {
               parent.appendChild(document.createTextNode(part));
          }
     });
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
            /* Font loading - make search input fully visible even during loading */
            html.wf-loading .title-search-input {
                visibility: visible !important;
            }
            
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
            
            /* State links styling - with consistent sizing to prevent layout shift */
            body.location-page .state-link {
                display: block;
                padding: 0.5rem 0;
                border-bottom: 1px solid #eee;
                font-size: 1rem;
                line-height: 1.5;
                height: 2.5rem;
                box-sizing: border-box;
            }
            
            body.location-page .state-link:last-child {
                border-bottom: none;
            }
            
            /* States list container - give it consistent dimensions */
            body.location-page .states-list {
                margin-top: 1.5rem;
                box-sizing: border-box;
                /* Ensure this container has a fixed size regardless of content */
                min-height: 100px; /* Minimum height while loading */
            }
            
            /* Mobile styles */
            @media (max-width: 480px) {
                body.location-page h1 {
                    margin-bottom: 1.5rem;
                }
                
                .separator-text {
                    margin: 0.75rem 0 1rem;
                }
                
                body.location-page .state-link {
                    height: 2.25rem; /* Smaller height on mobile */
                    font-size: 0.95rem;
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
