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
        
        this.init();
    }

    init() {
        // Initialize search input listeners
        this.searchInput.addEventListener('input', this.debounce(() => {
            const query = this.searchInput.value.trim();
            if (query) {
                this.performSearch(query);
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
                    this.searchInput.blur();
                    break;
            }
        });

        // Close results when clicking outside
        document.addEventListener('click', (e) => {
            if (!this.searchInput.contains(e.target) && !this.resultsContainer.contains(e.target)) {
                this.closeResults();
            }
        });
    }

    async performSearch(query) {
        if (!window.searchIndex) {
            console.error('Search index not loaded');
            return;
        }

        query = query.toLowerCase();
        const results = this.searchInIndex(query);
        this.displayResults(results);
    }

    searchInIndex(query) {
        const results = {
            'Pages': [],
            'Resources': []
        };

        // Search through pages in the index
        for (const page of window.searchIndex.pages) {
            const score = this.calculateRelevance(query, page);
            if (score > 0) {
                const result = {
                    title: page.title,
                    description: page.description,
                    url: page.url,
                    breadcrumb: page.breadcrumb,
                    score
                };

                // Categorize results
                if (page.url.startsWith('/resources')) {
                    results['Resources'].push(result);
                } else {
                    results['Pages'].push(result);
                }
            }
        }

        // Sort results by score
        for (const category in results) {
            results[category].sort((a, b) => b.score - a.score);
            results[category] = results[category].slice(0, this.options.maxResults);
        }

        return results;
    }

    calculateRelevance(query, page) {
        let score = 0;
        const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        
        // For multi-word queries, only look for exact matches
        if (words.length > 1) {
            const exactQuery = query.toLowerCase();
            if (page.title.toLowerCase().includes(exactQuery)) {
                score += 50;
            }
            if (page.description.toLowerCase().includes(exactQuery)) {
                score += 25;
            }
            if (page.content.toLowerCase().includes(exactQuery)) {
                score += 15;
            }
            if (page.keywords.toLowerCase().includes(exactQuery)) {
                score += 20;
            }
            return score;
        }
        
        // Single word queries can still do partial matches
        const word = words[0];
        if (word.length < 2) return 0; // Skip single-character words
        
        // Title matches
        if (page.title.toLowerCase().includes(word)) {
            score += 10;
        }

        // Description matches
        if (page.description.toLowerCase().includes(word)) {
            score += 5;
        }

        // Keyword matches
        if (page.keywords.toLowerCase().includes(word)) {
            score += 8;
        }

        // Heading matches
        for (const heading of page.headings) {
            if (heading.toLowerCase().includes(word)) {
                score += 6;
                break;
            }
        }

        // Content matches
        if (page.content.toLowerCase().includes(word)) {
            score += 3;
        }

        // URL matches
        if (page.url.toLowerCase().includes(word)) {
            score += 4;
        }

        return score;
    }

    highlightText(text, query) {
        if (!text || !query) return text;
        
        // Function to escape special regex characters
        const escapeRegExp = (string) => {
            return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        };
        
        const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        let highlighted = text;
        
        // For multi-word queries, only highlight exact matches
        if (words.length > 1) {
            const exactRegex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
            highlighted = highlighted.replace(exactRegex, '<mark class="search-highlight">$1</mark>');
            return highlighted;
        }
        
        // Single word queries can do partial matches
        const word = words[0];
        if (word.length < 2) return text;
        
        const regex = new RegExp(`(${escapeRegExp(word)})`, 'gi');
        return highlighted.replace(regex, '<mark class="search-highlight">$1</mark>');
    }

    getContextSnippet(content, query, maxLength = 200) {
        if (!content || !query) return '';
        
        const words = query.toLowerCase().split(/\s+/).filter(word => word.length > 0);
        const contentLower = content.toLowerCase();
        
        // For multi-word queries, find exact phrase
        if (words.length > 1) {
            const pos = contentLower.indexOf(query.toLowerCase());
            if (pos === -1) return '';
            
            // Calculate snippet range around the exact match
            const snippetStart = Math.max(0, pos - 50);
            const snippetEnd = Math.min(content.length, pos + query.length + 150);
            
            // Create snippet with ellipsis
            let snippet = '';
            if (snippetStart > 0) snippet += '...';
            snippet += content.slice(snippetStart, snippetEnd);
            if (snippetEnd < content.length) snippet += '...';
            
            return snippet;
        }
        
        // Single word queries can still do partial matches
        const word = words[0];
        if (word.length < 2) return '';
        
        const pos = contentLower.indexOf(word);
        if (pos === -1) return '';
        
        // Calculate snippet range
        const snippetStart = Math.max(0, pos - 50);
        const snippetEnd = Math.min(content.length, pos + maxLength);
        
        // Create snippet with ellipsis
        let snippet = '';
        if (snippetStart > 0) snippet += '...';
        snippet += content.slice(snippetStart, snippetEnd);
        if (snippetEnd < content.length) snippet += '...';
        
        return snippet;
    }

    displayResults(categorizedResults) {
        if (Object.values(categorizedResults).every(results => results.length === 0)) {
            this.resultsContainer.innerHTML = `
                <div class="search-no-results">
                    <div class="search-message">
                        <svg class="search-icon" viewBox="0 0 16 16">
                            <path fill="currentColor" d="M8 0C3.58 0 0 3.58 0 8c0 4.42 3.58 8 8 8 4.42 0 8-3.58 8-8 0-4.42-3.58-8-8-8zm0 14c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6z"/>
                        </svg>
                        <p>No results found</p>
                    </div>
                </div>
            `;
            return;
        }

        const query = this.searchInput.value.trim();
        let html = '';
        
        for (const [category, results] of Object.entries(categorizedResults)) {
            if (results.length === 0) continue;

            html += `
                <div class="search-category">
                    <div class="search-category-header">
                        <span class="search-category-title">${category}</span>
                        <span class="search-category-count">${results.length} results</span>
                    </div>
                    <div class="search-results-list">
                        ${results.map((result, idx) => {
                            const snippet = this.getContextSnippet(result.description || result.content, query);
                            return `
                                <a href="${result.url}" class="search-result-item" data-index="${idx}" role="option" tabindex="-1">
                                    <div class="search-result-icon">
                                        ${category === 'Resources' ? 
                                            '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M2 2.5A2.5 2.5 0 014.5 0h7A2.5 2.5 0 0114 2.5v11a2.5 2.5 0 01-2.5 2.5h-7A2.5 2.5 0 012 13.5v-11z"/></svg>' :
                                            '<svg viewBox="0 0 16 16"><path fill="currentColor" d="M8 0a8 8 0 100 16A8 8 0 008 0zM4 8a4 4 0 118 0 4 4 0 01-8 0z"/></svg>'
                                        }
                                    </div>
                                    <div class="search-result-content">
                                        <div class="search-result-title">${this.highlightText(result.title, query)}</div>
                                        ${result.breadcrumb ? `
                                            <div class="search-result-breadcrumb">
                                                ${result.breadcrumb.join(' › ')}
                                            </div>
                                        ` : ''}
                                        ${snippet ? `
                                            <div class="search-result-description">
                                                ${this.highlightText(snippet, query)}
                                            </div>
                                        ` : ''}
                                    </div>
                                    <div class="search-result-shortcut">
                                        <kbd>↵</kbd>
                                    </div>
                                </a>
                            `;
                        }).join('')}
                    </div>
                </div>
            `;
        }

        this.resultsContainer.innerHTML = html;
        this.isOpen = true;
        this.selectedIndex = -1;
        this.results = this.resultsContainer.querySelectorAll('.search-result-item');
        this.resultsContainer.style.display = 'block';
    }

    navigateResults(direction) {
        if (!this.isOpen || this.results.length === 0) return;

        this.selectedIndex = (this.selectedIndex + direction + this.results.length) % this.results.length;
        
        this.results.forEach((result, idx) => {
            result.classList.toggle('selected', idx === this.selectedIndex);
            if (idx === this.selectedIndex) {
                result.scrollIntoView({ block: 'nearest' });
            }
        });
    }

    selectResult() {
        if (!this.isOpen || this.selectedIndex === -1) return;
        
        const selectedResult = this.results[this.selectedIndex];
        if (selectedResult) {
            window.location.href = selectedResult.href;
        }
    }

    closeResults() {
        this.resultsContainer.innerHTML = '';
        this.resultsContainer.style.display = 'none';
        this.isOpen = false;
        this.selectedIndex = -1;
        this.results = [];
    }

    debounce(func, wait) {
        let timeout;
        return (...args) => {
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(this, args), wait);
        };
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
    border-radius: 8px 8px 0 0;
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
    top: 100%;
    left: 0;
    right: 0;
    max-height: 400px;
    overflow-y: auto;
    background: var(--bg-color);
    border: 2px solid var(--primary-color);
    border-top: none;
    border-radius: 0 0 8px 8px;
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