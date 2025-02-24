// Search configuration
const SEARCH_CONFIG = {
  pageSize: 10,
  searchDelay: 300, // ms to wait after typing before searching
};

class SearchManager {
  constructor(searchIndex) {
    this.searchIndex = searchIndex;
    this.currentPage = 1;
    this.currentQuery = "";
    this.isLoading = false;
  }

  search(query, page = 1) {
    this.currentQuery = query;
    this.currentPage = page;

    const start = (page - 1) * SEARCH_CONFIG.pageSize;
    const end = start + SEARCH_CONFIG.pageSize;

    // Filter pages based on search query
    const results = this.searchIndex.pages.filter((page) => {
      const searchContent = [page.title, page.description, page.content]
        .join(" ")
        .toLowerCase();

      return query
        .toLowerCase()
        .split(" ")
        .every((term) => searchContent.includes(term));
    });

    return {
      items: results.slice(start, end),
      total: results.length,
      currentPage: page,
      totalPages: Math.ceil(results.length / SEARCH_CONFIG.pageSize),
      hasMore: end < results.length,
    };
  }

  loadMore() {
    if (this.isLoading) return;

    this.isLoading = true;
    const results = this.search(this.currentQuery, this.currentPage + 1);
    this.currentPage++;
    this.isLoading = false;

    return results;
  }
}

// Initialize search when document loads
document.addEventListener("DOMContentLoaded", () => {
  const searchManager = new SearchManager(window.searchIndex);

  // Get UI elements
  const searchInput = document.querySelector("#search-input");
  const searchResults = document.querySelector("#search-results");
  const loadMoreButton =
    document.querySelector("#load-more") || createLoadMoreButton();

  // Add search input handler with debounce
  let searchTimeout;
  searchInput.addEventListener("input", (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      const results = searchManager.search(e.target.value);
      displayResults(results);
    }, SEARCH_CONFIG.searchDelay);
  });

  // Add infinite scroll
  window.addEventListener("scroll", () => {
    const scrollPosition = window.scrollY + window.innerHeight;
    const scrollThreshold = document.documentElement.scrollHeight - 200;

    if (scrollPosition >= scrollThreshold) {
      const moreResults = searchManager.loadMore();
      if (moreResults.hasMore) {
        appendResults(moreResults);
      }
    }
  });

  // Helper to create load more button if needed
  function createLoadMoreButton() {
    const button = document.createElement("button");
    button.id = "load-more";
    button.textContent = "Load More Results";
    button.style.display = "none";
    searchResults.parentNode.insertBefore(button, searchResults.nextSibling);
    return button;
  }

  // Helper to display search results
  function displayResults(results) {
    searchResults.innerHTML = results.items
      .map(
        (item) => `
      <div class="search-result">
        <h3><a href="${item.url}">${item.title}</a></h3>
        <p>${item.description || ""}</p>
      </div>
    `,
      )
      .join("");

    loadMoreButton.style.display = results.hasMore ? "block" : "none";
  }

  // Helper to append more results
  function appendResults(results) {
    const newResults = results.items
      .map(
        (item) => `
      <div class="search-result">
        <h3><a href="${item.url}">${item.title}</a></h3>
        <p>${item.description || ""}</p>
      </div>
    `,
      )
      .join("");

    searchResults.insertAdjacentHTML("beforeend", newResults);
    loadMoreButton.style.display = results.hasMore ? "block" : "none";
  }
});
