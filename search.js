// Search component and functionality
export class Search {
    constructor(options = {}) {
        this.options = {
            searchInputId: 'searchInput',
            resultsContainerId: 'searchResults',
            debounceMs: 300,
            maxResults: 10,
            highlightClass: 'search-highlight',
            ...options
        };

        this.searchInput = document.getElementById(this.options.searchInputId);
        this.resultsContainer = document.getElementById(this.options.resultsContainerId);
        this.isOpen = false;
        this.selectedIndex = -1;
        this.results = [];
        this.searchIndex = null;
        
        this.init();
    }

    async loadSearchIndex() {
        if (this.searchIndex) return;
        
        try {
            // Show loading state
            this.searchInput.classList.add('loading');
            
            // Dynamically import the search index
            const module = await import('./search-index.js');
            this.searchIndex = module.default;
            
            // Remove loading state
            this.searchInput.classList.remove('loading');
        } catch (error) {
            console.error('Failed to load search index:', error);
            this.searchInput.classList.remove('loading');
        }
    }

    init() {
        // Initialize search input listeners
        this.searchInput.addEventListener('input', this.debounce(async () => {
            const query = this.searchInput.value.trim();
            if (query) {
                // Ensure search index is loaded
                await this.loadSearchIndex();
                if (this.searchIndex) {
                    this.performSearch(query);
                }
            } else {
                this.closeResults();
            }
        }, this.options.debounceMs));

        // Keyboard navigation
        this.searchInput.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowDown':
                    e.preventDefault();
                    this.navigateResults(1);
                    break;
                case 'ArrowUp':
                    e.preventDefault();
                    this.navigateResults(-1);
                    break;
                case 'Enter':
                    e.preventDefault();
                    this.selectResult();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.closeResults();
                    break;
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

    calculateRelevance(query, page) {
        let score = 0;
        const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        
        // For multi-word queries, only look for exact matches
        if (words.length > 1) {
            const exactQuery = query.toLowerCase();
            if (page.title.toLowerCase().includes(exactQuery)) score += 50;
            if (page.description.toLowerCase().includes(exactQuery)) score += 25;
            if (page.content.toLowerCase().includes(exactQuery)) score += 15;
            if (page.keywords.toLowerCase().includes(exactQuery)) score += 20;
            return score;
        }
        
        // Single word queries can still do partial matches
        const word = words[0];
        if (word.length < 2) return 0;
        
        if (page.title.toLowerCase().includes(word)) score += 10;
        if (page.description.toLowerCase().includes(word)) score += 5;
        if (page.keywords.toLowerCase().includes(word)) score += 8;
        if (page.content.toLowerCase().includes(word)) score += 3;
        if (page.url.toLowerCase().includes(word)) score += 4;
        
        return score;
    }

    highlightText(text, query) {
        if (!text || !query) return text;
        
        const escapeRegExp = (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };
        
        const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        let highlighted = text;
        
        if (words.length > 1) {
            const exactRegex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
            highlighted = highlighted.replace(exactRegex, '<mark class="search-highlight">$1</mark>');
            return highlighted;
        }
        
        const word = words[0];
        if (word.length < 2) return text;
        
        const regex = new RegExp(`(${escapeRegExp(word)})`, 'gi');
        return highlighted.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    performSearch(query) {
        if (!this.searchIndex) {
            console.error('Search index not loaded');
            return;
        }

        query = query.toLowerCase().trim();
        if (query.length < 2) {
            this.closeResults();
            return;
        }

        const results = [];
        for (const page of this.searchIndex.pages) {
            const score = this.calculateRelevance(query, page);
            if (score > 0) {
                results.push({
                    title: page.title,
                    description: page.description,
                    url: page.url,
                    breadcrumb: page.breadcrumb,
                    score
                });
            }
        }

        results.sort((a, b) => b.score - a.score);
        this.results = results.slice(0, this.options.maxResults);
        this.selectedIndex = -1;
        
        this.displayResults(query);
    }

    displayResults(query) {
        if (this.results.length === 0) {
            this.resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <div class="search-message">
                        <p>No results found</p>
                    </div>
                </div>
            `;
        } else {
            this.resultsContainer.innerHTML = `
                <div class="search-results-list">
                    ${this.results.map((result, index) => `
                        <a href="${result.url}" 
                           class="search-result-item" 
                           data-index="${index}"
                           role="option"
                           aria-selected="false">
                            <div class="search-result-content">
                                <div class="search-result-title">${this.highlightText(result.title, query)}</div>
                                ${result.description ? `
                                    <div class="search-result-description">
                                        ${this.highlightText(result.description, query)}
                                    </div>
                                ` : ''}
                            </div>
                        </a>
                    `).join('')}
                </div>
            `;
        }
        
        this.resultsContainer.style.display = 'block';
        this.isOpen = true;
    }

    navigateResults(direction) {
        if (!this.results.length) return;

        this.selectedIndex = Math.max(-1, Math.min(
            this.selectedIndex + direction,
            this.results.length - 1
        ));

        const items = this.resultsContainer.querySelectorAll('.search-result-item');
        items.forEach((item, index) => {
            if (index === this.selectedIndex) {
                item.classList.add('selected');
                item.setAttribute('aria-selected', 'true');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
                item.setAttribute('aria-selected', 'false');
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
        this.resultsContainer.style.display = 'none';
        this.results = [];
        this.selectedIndex = -1;
        this.isOpen = false;
    }
}

// CSS styles for the search component
const styles = `
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
    padding-right: 80px; /* Space for shortcut hint */
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

.search-shortcut-hint {
    position: absolute;
    right: 12px;
    top: 50%;
    transform: translateY(-50%);
    display: flex;
    gap: 4px;
    pointer-events: none;
}

.search-shortcut-hint kbd {
    padding: 2px 6px;
    font-size: 12px;
    font-family: monospace;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 3px;
    color: var(--text-secondary);
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
}

.search-category {
    border-top: 1px solid var(--border-color);
}

.search-category:first-child {
    border-top: none;
}

.search-category-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8px 16px;
    background: var(--bg-secondary);
}

.search-category-title {
    font-size: 12px;
    font-weight: 500;
    color: var(--text-secondary);
    text-transform: uppercase;
}

.search-category-count {
    font-size: 12px;
    color: var(--text-tertiary);
}

.search-result-item {
    display: flex;
    align-items: center;
    padding: 8px 16px;
    cursor: pointer;
    border-left: 2px solid transparent;
    text-decoration: none;
    color: inherit;
}

.search-result-item:hover,
.search-result-item.selected {
    background: var(--bg-hover);
    border-left-color: var(--primary-color);
}

.search-result-icon {
    width: 20px;
    height: 20px;
    margin-right: 12px;
    color: var(--text-secondary);
}

.search-result-content {
    flex: 1;
    min-width: 0;
}

.search-result-title {
    font-weight: 500;
    color: var(--text-primary);
}

.search-result-breadcrumb {
    font-size: 12px;
    color: var(--text-tertiary);
    margin-top: 2px;
}

.search-result-description {
    font-size: 13px;
    color: var(--text-secondary);
    margin-top: 4px;
}

.search-result-shortcut {
    display: flex;
    align-items: center;
    margin-left: 12px;
}

.search-result-shortcut kbd {
    padding: 2px 6px;
    font-size: 12px;
    font-family: monospace;
    background: var(--bg-secondary);
    border: 1px solid var(--border-color);
    border-radius: 3px;
    color: var(--text-secondary);
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

.search-icon {
    width: 20px;
    height: 20px;
    color: var(--text-tertiary);
}
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = styles;
document.head.appendChild(styleSheet); 