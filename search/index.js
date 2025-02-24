// Unified search implementation
export class Search {
  constructor(options = {}) {
    this.options = {
      searchInputId: "searchInput",
      resultsContainerId: "searchResults",
      debounceMs: 150, // Reduced debounce time for faster response
      maxResults: 20, // Show more initial results since we're not paginating
      highlightClass: "search-highlight",
      type: "global", // 'global', 'initiatives', 'states', 'city'
      onResultsDisplay: null, // Optional callback for custom results display
      ...options,
    };

    this.searchInput = document.getElementById(this.options.searchInputId);
    this.resultsContainer = document.getElementById(
      this.options.resultsContainerId,
    );
    this.isOpen = false;
    this.selectedIndex = -1;
    this.results = [];
    this.searchIndex = null;
    this.searchCache = new Map(); // Cache for recent search results

    this.init();
  }

  async loadSearchIndex() {
    if (this.searchIndex) return;

    try {
      this.searchInput.classList.add("loading");

      // Load and preprocess the search index
      switch (this.options.type) {
        case "initiatives":
          const { initiatives } = await import("../data/initiatives.js");
          this.searchIndex = this.preprocessSearchData(initiatives);
          break;
        case "states":
          const { states } = await import("../data/states.js");
          this.searchIndex = this.preprocessSearchData(states);
          break;
        default:
          const module = await import("../data/search-index.js");
          this.searchIndex = this.preprocessSearchData(module.default.pages);
      }

      this.searchInput.classList.remove("loading");
    } catch (error) {
      console.error("Failed to load search data:", error);
      this.searchInput.classList.remove("loading");
    }
  }

  // Preprocess search data for faster lookups
  preprocessSearchData(data) {
    return {
      data: data.map((item) => {
        // Create a single searchable text field
        const searchText = [
          item.title,
          item.description,
          item.content,
          item.keywords,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return {
          ...item,
          searchText,
          // Pre-split words for faster matching
          searchWords: new Set(searchText.split(/\s+/)),
        };
      }),
    };
  }

  init() {
    if (!this.searchInput || !this.resultsContainer) {
      console.error("Search input or results container not found");
      return;
    }

    // Initialize search input listeners
    this.searchInput.addEventListener(
      "input",
      this.debounce(async () => {
        const query = this.searchInput.value.trim();
        if (query) {
          await this.loadSearchIndex();
          if (this.searchIndex) {
            this.performSearch(query);
          }
        } else {
          this.closeResults();
        }
      }, this.options.debounceMs),
    );

    // Keyboard navigation
    this.searchInput.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          this.navigateResults(1);
          break;
        case "ArrowUp":
          e.preventDefault();
          this.navigateResults(-1);
          break;
        case "Enter":
          e.preventDefault();
          this.selectResult();
          break;
        case "Escape":
          e.preventDefault();
          this.closeResults();
          break;
      }
    });

    // Close results when clicking outside
    document.addEventListener("click", (e) => {
      if (
        !this.searchInput.contains(e.target) &&
        !this.resultsContainer.contains(e.target)
      ) {
        this.closeResults();
      }
    });

    // Add infinite scroll
    window.addEventListener("scroll", () => {
      if (!this.isOpen || this.isLoading) return;

      const scrollPosition = window.scrollY + window.innerHeight;
      const scrollThreshold = document.documentElement.scrollHeight - 200;

      if (scrollPosition >= scrollThreshold) {
        this.loadMore();
      }
    });
  }

  debounce(func, wait) {
    let timeout;
    return (...args) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func.apply(this, args), wait);
    };
  }

  calculateRelevance(query, item) {
    const queryWords = query
      .toLowerCase()
      .split(/\s+/)
      .filter((w) => w.length > 0);

    // Quick exit for empty queries
    if (queryWords.length === 0) return 0;

    let score = 0;
    const searchText = item.searchText;

    // Check for exact phrase match first (highest priority)
    if (searchText.includes(query.toLowerCase())) {
      score += 100;
    }

    // Check individual word matches
    const matchedWords = queryWords.filter(
      (word) => item.searchWords.has(word) || searchText.includes(word),
    );

    // Score based on percentage of matched words
    score += (matchedWords.length / queryWords.length) * 50;

    // Boost score based on where matches are found
    if (item.title?.toLowerCase().includes(query.toLowerCase())) score += 30;
    if (item.description?.toLowerCase().includes(query.toLowerCase()))
      score += 20;
    if (item.url?.toLowerCase().includes(query.toLowerCase())) score += 10;

    return score;
  }

  highlightText(text, query) {
    if (!text || !query) return text;

    const escapeRegExp = (string) => {
      return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    };

    const words = query
      .toLowerCase()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    let highlighted = text;

    if (words.length > 1) {
      const exactRegex = new RegExp(`(${escapeRegExp(query)})`, "gi");
      highlighted = highlighted.replace(
        exactRegex,
        `<mark class="${this.options.highlightClass}">$1</mark>`,
      );
      return highlighted;
    }

    const word = words[0];
    if (word.length < 2) return text;

    const regex = new RegExp(`(${escapeRegExp(word)})`, "gi");
    return highlighted.replace(
      regex,
      `<mark class="${this.options.highlightClass}">$1</mark>`,
    );
  }

  async performSearch(query) {
    if (!this.searchIndex) {
      await this.loadSearchIndex();
    }

    query = query.trim();
    if (!query) {
      this.results = [];
      return { items: [] };
    }

    // Check cache first
    const cacheKey = query.toLowerCase();
    if (this.searchCache.has(cacheKey)) {
      this.results = this.searchCache.get(cacheKey);
      return { items: this.results };
    }

    // Perform new search
    const results = this.searchIndex.data
      .filter((item) => {
        const relevance = this.calculateRelevance(query, item);
        item.relevance = relevance;
        return relevance > 0;
      })
      .sort((a, b) => b.relevance - a.relevance)
      .slice(0, this.options.maxResults);

    // Cache results
    this.searchCache.set(cacheKey, results);
    if (this.searchCache.size > 100) {
      // Limit cache size
      const firstKey = this.searchCache.keys().next().value;
      this.searchCache.delete(firstKey);
    }

    this.results = results;
    return { items: results };
  }

  async displayResults(query) {
    if (!query) {
      this.closeResults();
      return;
    }

    const results = await this.performSearch(query);

    if (this.options.onResultsDisplay) {
      this.options.onResultsDisplay(results);
      return;
    }

    if (!results.items.length) {
      this.resultsContainer.innerHTML =
        '<div class="no-results">No results found</div>';
      return;
    }

    const html = results.items
      .map((item, index) => {
        const title = this.highlightText(item.title, query);
        const description = item.description
          ? this.highlightText(item.description, query)
          : "";

        return `
        <div class="search-result ${index === this.selectedIndex ? "selected" : ""}" 
             data-url="${item.url}">
          <h3>${title}</h3>
          ${description ? `<p>${description}</p>` : ""}
        </div>
      `;
      })
      .join("");

    this.resultsContainer.innerHTML = html;

    // Add load more button if there are more results
    if (results.hasMore) {
      const loadMore = document.createElement("button");
      loadMore.className = "load-more-btn";
      loadMore.textContent = "Load More Results";
      loadMore.onclick = () => this.loadMore();
      this.resultsContainer.appendChild(loadMore);
    }

    this.isOpen = true;
  }

  async loadMore() {
    if (this.isLoading) return;

    this.isLoading = true;
    const results = await this.performSearch(
      this.currentQuery,
      this.currentPage + 1,
    );

    if (results.items.length) {
      const html = results.items
        .map((item) => {
          const title = this.highlightText(item.title, this.currentQuery);
          const description = item.description
            ? this.highlightText(item.description, this.currentQuery)
            : "";

          return `
          <div class="search-result" data-url="${item.url}">
            <h3>${title}</h3>
            ${description ? `<p>${description}</p>` : ""}
          </div>
        `;
        })
        .join("");

      // Remove existing load more button
      const existingBtn = this.resultsContainer.querySelector(".load-more-btn");
      if (existingBtn) {
        existingBtn.remove();
      }

      // Append new results
      this.resultsContainer.insertAdjacentHTML("beforeend", html);

      // Add new load more button if there are more results
      if (results.hasMore) {
        const loadMore = document.createElement("button");
        loadMore.className = "load-more-btn";
        loadMore.textContent = "Load More Results";
        loadMore.onclick = () => this.loadMore();
        this.resultsContainer.appendChild(loadMore);
      }
    }

    this.isLoading = false;
  }

  navigateResults(direction) {
    if (!this.results.length) return;

    this.selectedIndex = Math.max(
      -1,
      Math.min(this.selectedIndex + direction, this.results.length - 1),
    );

    const items = this.resultsContainer.querySelectorAll(".search-result-item");
    items.forEach((item, index) => {
      if (index === this.selectedIndex) {
        item.classList.add("selected");
        item.setAttribute("aria-selected", "true");
        item.scrollIntoView({ block: "nearest" });
      } else {
        item.classList.remove("selected");
        item.setAttribute("aria-selected", "false");
      }
    });
  }

  selectResult() {
    if (this.selectedIndex >= 0 && this.results[this.selectedIndex]) {
      window.location.href = this.results[this.selectedIndex].url;
    } else if (this.results.length > 0) {
      window.location.href = this.results[0].url;
    }
  }

  closeResults() {
    this.resultsContainer.style.display = "none";
    this.results = [];
    this.selectedIndex = -1;
    this.isOpen = false;
  }
}

// Export styles
export const styles = `
.search-container {
    position: relative;
    width: 100%;
    max-width: 600px;
    margin: 0 auto 2rem;
}

.search-input-wrapper {
    position: relative;
    width: 100%;
}

.search-input {
    width: 100%;
    padding: 12px 16px;
    padding-right: 80px;
    font-size: 16px;
    border: 2px solid var(--border-color);
    border-radius: 8px;
    background: var(--bg-color);
    color: var(--text-color);
    transition: all 0.2s ease;
}

.search-input:focus {
    border-color: var(--primary-color);
    box-shadow: 0 0 0 3px var(--primary-color-alpha);
    outline: none;
}

.search-input.loading {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' d='M12 2v4m0 12v4M4.93 4.93l2.83 2.83m8.48 8.48l2.83 2.83M2 12h4m12 0h4M4.93 19.07l2.83-2.83m8.48-8.48l2.83-2.83'/%3E%3C/svg%3E");
    background-repeat: no-repeat;
    background-position: right 16px center;
    background-size: 24px;
    animation: spin 0.8s linear infinite;
}

@keyframes spin {
    100% { transform: rotate(360deg); }
}

.search-results {
    position: absolute;
    top: calc(100% + 4px);
    left: 0;
    right: 0;
    max-height: 400px;
    overflow-y: auto;
    background: var(--bg-color);
    border: 2px solid var(--primary-color);
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    display: none;
    transition: opacity 0.15s ease;
}

.search-results.loading {
    opacity: 0.7;
}

.search-result-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    border-left: 2px solid transparent;
    text-decoration: none;
    color: inherit;
    transition: background-color 0.15s ease;
}

.search-result-item:hover,
.search-result-item.selected {
    background: var(--bg-hover);
    border-left-color: var(--primary-color);
}

.search-result-content {
    flex: 1;
    min-width: 0;
}

.search-result-title {
    font-weight: 500;
    color: var(--text-primary);
}

.search-result-description {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 4px;
}

.search-result-breadcrumb {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-top: 2px;
}

.search-highlight {
    background-color: var(--highlight-color, #ffeb3b);
    padding: 0 2px;
    border-radius: 2px;
}

.search-no-results {
    padding: 24px;
    text-align: center;
    color: var(--text-tertiary);
}

.search-message {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
}

.load-more-btn {
    display: block;
    width: 100%;
    padding: 10px;
    margin-top: 10px;
    background: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 4px;
    cursor: pointer;
    text-align: center;
}

.load-more-btn:hover {
    background: #e9e9e9;
}
`;

// Add styles to document
const styleSheet = document.createElement("style");
styleSheet.textContent = styles;
document.head.appendChild(styleSheet);
