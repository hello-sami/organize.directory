// Title Search Functionality
document.addEventListener("DOMContentLoaded", function () {
     initTitleSearch();
});

// Title search index - will hold all searchable titles
let titleIndex = [];

// "loading" until the index has been fetched (or given up on), then "ready"
// (the real index) or "limited" (the short built-in fallback list).
let indexStatus = "loading";
let indexLoaded = Promise.resolve(); // settles once the index is in place
let activeInput = null; // the search box on this page
let searchStatus = null; // visually hidden live region that says what the dropdown shows

// Initialize the title search functionality
function initTitleSearch() {
     // Setup the search UI
     setupSearchUI();

     // Load the search index. Whatever was typed while it loaded gets searched
     // as soon as it arrives, instead of staying on "No matches found".
     indexLoaded = loadSearchIndex().then(function () {
          if (activeInput && activeInput.value.trim()) {
               handleSearchInput({ target: activeInput });
          }
     });
}

// Jump to the top result for whatever is typed right now.
async function openTopResult(searchInput, searchResults) {
     // Wait for the index if it's still loading, so a quick Enter works.
     await indexLoaded;
     // Results are debounced; refresh them for what's typed right now so a
     // quick Enter doesn't open the top hit for an earlier query.
     handleSearchInput({ target: searchInput });
     // One letter matches almost anything ("x" would open New Mexico), so Enter
     // only jumps once there are at least two; before that the list just shows.
     if (searchInput.value.trim().length < 2) return;
     const first = searchResults.querySelector("a.title-search-result");
     if (first) window.location.href = first.getAttribute("href");
}

// Setup the search UI elements
function setupSearchUI() {
     // Detect the page by which mount point is present rather than a body
     // class. The location page provides an empty #location-search-section
     // for us to fill; the homepage ships a static #site-search form we wire
     // onto directly.
     const locationMount = document.getElementById("location-search-section");
     const existingInput = document.getElementById("site-search");

     let searchContainer, searchInput, searchResults;

     if (existingInput && !locationMount) {
          // Avoid double-initialization
          if (document.getElementById("title-search-results")) return;

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
               openTopResult(searchInput, searchResults);
          });
     } else {
          // Location page: inject our own input/results into its mount point.
          if (!locationMount) return;
          if (document.getElementById("title-search-container")) return;

          searchContainer = document.createElement("div");
          searchContainer.id = "title-search-container";
          searchContainer.className = "title-search-container";

          searchInput = document.createElement("input");
          searchInput.type = "text";
          searchInput.id = "title-search-input";
          searchInput.className = "title-search-input";
          searchInput.placeholder = "Search states, cities, or issues";
          searchInput.setAttribute("aria-label", "Search states, cities, or issues");

          searchResults = document.createElement("div");
          searchResults.id = "title-search-results";
          searchResults.className = "title-search-results";

          searchContainer.appendChild(searchInput);
          searchContainer.appendChild(searchResults);

          locationMount.appendChild(searchContainer);

          // No form here, so Enter needs its own handler (same as the homepage).
          searchInput.addEventListener("keydown", function (event) {
               if (event.key !== "Enter") return;
               event.preventDefault();
               openTopResult(searchInput, searchResults);
          });
     }

     activeInput = searchInput;

     // The dropdown appears visually, but a screen reader isn't told about it.
     // This hidden polite status says how many matches there are.
     searchStatus = document.createElement("div");
     searchStatus.className = "skip";
     searchStatus.setAttribute("role", "status");
     searchContainer.appendChild(searchStatus);

     // Shared wiring for whichever input/results we ended up with
     searchInput.addEventListener("input", debounce(handleSearchInput, 300));

     document.addEventListener("click", function (event) {
          if (!searchContainer.contains(event.target)) {
               searchResults.style.display = "none";
          }
     });

     // Keyboard: Down from the box moves into the results, Up/Down move through
     // them (Down from the last wraps to the first), Up from the first goes back
     // to the box, Escape closes the list.
     // The results stay ordinary links, so Enter on one opens it.
     const isOpen = () => searchResults.style.display === "block";
     const links = () =>
          Array.from(searchResults.querySelectorAll("a.title-search-result"));
     const close = () => {
          searchResults.style.display = "none";
          searchStatus.textContent = "";
          searchInput.focus();
     };

     searchInput.addEventListener("keydown", function (event) {
          if (event.key === "ArrowDown" && isOpen() && links().length) {
               event.preventDefault();
               links()[0].focus();
          } else if (event.key === "Escape" && isOpen()) {
               // Close the list first; a second Escape clears a type=search box.
               event.preventDefault();
               close();
          }
     });

     searchResults.addEventListener("keydown", function (event) {
          const all = links();
          const i = all.indexOf(document.activeElement);
          if (event.key === "Escape") {
               event.preventDefault();
               close();
          } else if (event.key === "ArrowDown" && i !== -1) {
               event.preventDefault();
               all[(i + 1) % all.length].focus(); // wraps: last goes to first
          } else if (event.key === "ArrowUp" && i !== -1) {
               event.preventDefault();
               (i > 0 ? all[i - 1] : searchInput).focus();
          }
     });
}

// Load the title index from the JSON file the build writes (npm run build)
async function loadSearchIndex() {
     try {
          const response = await fetch("/data/title-index.json");

          // Use it only if it really is a list of { title, url } entries.
          if (response.ok) {
               const data = await response.json();
               const usable = Array.isArray(data)
                    ? data.filter(
                           (item) =>
                                item &&
                                typeof item.title === "string" &&
                                typeof item.url === "string",
                      )
                    : [];
               if (usable.length) {
                    titleIndex = usable;
                    indexStatus = "ready";
                    return;
               }
          }
     } catch {
          // Offline or unreadable: fall through to the built-in list.
     }

     titleIndex = [
          ...(await getFallbackStatesIndex()),
          ...(await getFallbackCitiesIndex()),
     ];
     indexStatus = "limited";
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

     // Clear results if query is empty
     if (query.length === 0) {
          resultsContainer.style.display = "none";
          if (searchStatus) searchStatus.textContent = "";
          return;
     }

     // Index still on its way: say so rather than claiming there are no matches.
     if (indexStatus === "loading") {
          resultsContainer.replaceChildren();
          const loading = document.createElement("div");
          loading.className = "no-results";
          loading.textContent = "Loading…";
          resultsContainer.appendChild(loading);
          resultsContainer.style.display = "block";
          if (searchStatus) searchStatus.textContent = "Loading results.";
          return;
     }

     // Filter titles based on query. Names that start with the query come
     // first, then names with a word that starts with it ("Portland" before
     // "Shreveport"), then anything else that merely contains it. Within each
     // group the index order (states, cities, issues) is kept.
     const wordStart = new RegExp("(^|[^a-z0-9])" + escapeRegExp(query));
     const rank = (title) => {
          const t = title.toLowerCase();
          if (t.startsWith(query)) return 0;
          return wordStart.test(t) ? 1 : 2;
     };
     const results = titleIndex
          .filter((item) => item.title.toLowerCase().includes(query))
          .map((item, i) => ({ item, i, r: rank(item.title) }))
          .sort((a, b) => a.r - b.r || a.i - b.i)
          .map((x) => x.item)
          .slice(0, 10); // Limit to 10 results for performance

     // Display results
     resultsContainer.replaceChildren();
     if (results.length > 0) {
          results.forEach((result) => {
               const resultItem = document.createElement("a");
               // Link to the clean URL: Pages answers "/cities/x.html" with a 308
               // to "/cities/x", so the .html form costs an extra round trip.
               resultItem.href = result.url.replace(/\.html$/, "");
               resultItem.className = "title-search-result";

               const titleDiv = document.createElement("div");
               titleDiv.className = "result-title";
               appendHighlightedText(titleDiv, result.title, query);

               const typeDiv = document.createElement("div");
               typeDiv.className = "result-type";
               // Topic pages are called "issues" on the site.
               const TYPE_LABELS = { topic: "Issue", location: "City" };
               const typeLabel = result.type || "Page";
               typeDiv.textContent =
                    TYPE_LABELS[typeLabel] ||
                    typeLabel.charAt(0).toUpperCase() + typeLabel.slice(1);

               resultItem.append(titleDiv, typeDiv);
               resultsContainer.appendChild(resultItem);
          });
     } else {
          const noResults = document.createElement("div");
          noResults.className = "no-results";
          noResults.textContent = "No matches found";
          // On the short fallback list, "no match" may just mean "not in the
          // short list", so don't let it read as "not in the directory".
          if (indexStatus === "limited") {
               noResults.textContent +=
                    ". Search isn't fully available right now. Try browsing by state.";
          }
          resultsContainer.appendChild(noResults);
     }
     resultsContainer.style.display = "block";
     if (searchStatus) {
          searchStatus.textContent =
               results.length === 0
                    ? "No matches found."
                    : results.length === 1
                      ? "1 match. Press down arrow to move to it."
                      : results.length + " matches. Press down arrow to move through them.";
     }
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
