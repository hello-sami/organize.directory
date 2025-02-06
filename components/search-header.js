// Create and return the search header component
export function createSearchHeader() {
    const header = document.createElement('header');
    header.className = 'page-header';
    
    // Create search container
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    
    // Create search input wrapper
    const searchInputWrapper = document.createElement('div');
    searchInputWrapper.className = 'search-input-wrapper';
    
    // Create search input
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.id = 'searchInput';
    searchInput.className = 'search-input';
    searchInput.placeholder = 'Search mutual aid resources...';
    searchInput.setAttribute('aria-label', 'Search mutual aid resources');
    
    // Create search results container
    const searchResults = document.createElement('div');
    searchResults.id = 'searchResults';
    searchResults.className = 'search-results';
    searchResults.setAttribute('role', 'listbox');
    
    // Assemble the components
    searchInputWrapper.appendChild(searchInput);
    searchInputWrapper.appendChild(searchResults);
    searchContainer.appendChild(searchInputWrapper);
    header.appendChild(searchContainer);
    
    return header;
}

// Initialize search functionality
export function initializeSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchResults = document.getElementById('searchResults');
    let selectedResultIndex = -1;
    let currentResults = [];
    let searchTimeout;

    function calculateRelevance(query, page) {
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
        
        // Heading matches
        for (const heading of page.headings) {
            if (heading.toLowerCase().includes(word)) {
                score += 6;
                break;
            }
        }
        
        return score;
    }

    function highlightText(text, query) {
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

    function performSearch(query) {
        if (!window.searchIndex) {
            console.error('Search index not loaded');
            return;
        }

        query = query.toLowerCase().trim();
        if (query.length < 2) {
            searchResults.style.display = 'none';
            currentResults = [];
            selectedResultIndex = -1;
            return;
        }

        const results = [];
        for (const page of window.searchIndex.pages) {
            const score = calculateRelevance(query, page);
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
        currentResults = results.slice(0, 5);
        selectedResultIndex = -1;
        
        if (results.length === 0) {
            searchResults.innerHTML = `
                <div class="search-no-results">
                    <div class="search-message">
                        <p>No results found</p>
                    </div>
                </div>
            `;
        } else {
            searchResults.innerHTML = `
                <div class="search-results-list">
                    ${currentResults.map((result, index) => `
                        <a href="${result.url}" 
                           class="search-result-item" 
                           data-index="${index}"
                           role="option"
                           aria-selected="false">
                            <div class="search-result-content">
                                <div class="search-result-title">${highlightText(result.title, query)}</div>
                                ${result.description ? `
                                    <div class="search-result-description">
                                        ${highlightText(result.description, query)}
                                    </div>
                                ` : ''}
                            </div>
                        </a>
                    `).join('')}
                </div>
            `;
        }
        
        searchResults.style.display = 'block';
    }

    // Handle keyboard navigation
    searchInput.addEventListener('keydown', (e) => {
        if (!currentResults.length) return;

        switch(e.key) {
            case 'ArrowDown':
                e.preventDefault();
                selectedResultIndex = Math.min(selectedResultIndex + 1, currentResults.length - 1);
                updateSelectedResult();
                break;
            case 'ArrowUp':
                e.preventDefault();
                selectedResultIndex = Math.max(selectedResultIndex - 1, -1);
                updateSelectedResult();
                break;
            case 'Enter':
                e.preventDefault();
                if (selectedResultIndex >= 0 && currentResults[selectedResultIndex]) {
                    window.location.href = currentResults[selectedResultIndex].url;
                } else if (currentResults.length > 0) {
                    window.location.href = currentResults[0].url;
                }
                break;
            case 'Escape':
                e.preventDefault();
                searchResults.style.display = 'none';
                searchInput.blur();
                break;
        }
    });

    function updateSelectedResult() {
        const items = searchResults.querySelectorAll('.search-result-item');
        items.forEach((item, index) => {
            if (index === selectedResultIndex) {
                item.classList.add('selected');
                item.setAttribute('aria-selected', 'true');
                item.scrollIntoView({ block: 'nearest' });
            } else {
                item.classList.remove('selected');
                item.setAttribute('aria-selected', 'false');
            }
        });
    }

    // Debounce search input
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(searchInput.value);
        }, 150);
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
            selectedResultIndex = -1;
        }
    });
} 