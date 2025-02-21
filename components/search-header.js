// Create and initialize the search header component
export function initSearchBar(containerId = 'searchContainer') {
    const header = createSearchHeader();
    
    // Insert the header into the specified container
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id "${containerId}" not found`);
        return;
    }
    container.appendChild(header);
}

// Create and return the search header component
export function createSearchHeader() {
    const header = document.createElement('header');
    header.className = 'page-header';
    
    // Create search wrapper
    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-wrapper';
    
    // Create search container first
    const searchContainer = document.createElement('div');
    searchContainer.className = 'search-container';
    searchContainer.style.display = 'none';
    
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
    
    // Create search button
    const searchButton = document.createElement('button');
    searchButton.className = 'search-toggle-button';
    searchButton.setAttribute('aria-label', 'Toggle search');
    searchButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
    `;
    
    // Assemble the components
    searchInputWrapper.appendChild(searchInput);
    searchInputWrapper.appendChild(searchResults);
    searchContainer.appendChild(searchInputWrapper);
    
    // Add components to wrapper in correct order (container first, then button)
    searchWrapper.appendChild(searchContainer);
    searchWrapper.appendChild(searchButton);
    header.appendChild(searchWrapper);
    
    // Add click event to toggle search
    searchButton.addEventListener('click', () => {
        const isVisible = searchContainer.style.display === 'block';
        searchContainer.style.display = isVisible ? 'none' : 'block';
        if (!isVisible) {
            searchInput.focus();
            // Lazy load search functionality
            import('/search.js').then(module => {
                if (!window.searchInitialized) {
                    new module.Search();
                    window.searchInitialized = true;
                }
            });
        }
    });
    
    // Close search when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchButton.contains(e.target) && 
            !searchContainer.contains(e.target) && 
            searchContainer.style.display === 'block') {
            searchContainer.style.display = 'none';
        }
    });
    
    return header;
}

// Add styles
const style = document.createElement('style');
style.textContent = `
    .page-header {
        position: relative;
    }

    .search-wrapper {
        position: absolute;
        top: 0;
        right: 0;
        z-index: 1000;
        height: 36px;
        display: flex;
        align-items: flex-start;
    }

    .search-toggle-button {
        position: absolute;
        top: 0;
        right: 0;
        width: 36px;
        height: 36px;
        padding: 6px;
        background: none;
        border: none;
        cursor: pointer;
        color: var(--text-color);
        transition: color 0.2s ease;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 1001;
    }
    
    .search-toggle-button:hover {
        color: var(--primary-color);
    }
    
    .search-toggle-button svg {
        width: 24px;
        height: 24px;
    }
    
    .search-container {
        position: absolute;
        top: 0;
        right: 44px; /* button width + gap */
        width: 300px;
        z-index: 1000;
        display: flex;
        align-items: flex-start;
    }
    
    .search-input-wrapper {
        width: 100%;
        line-height: 0;
        display: flex;
        align-items: flex-start;
    }
    
    .search-input {
        width: 100%;
        height: 36px;
        padding: 0 12px;
        font-size: 16px;
        border: 2px solid var(--border-color);
        border-radius: 6px;
        background: var(--bg-color);
        color: var(--text-color);
        transition: all 0.2s ease;
        display: block;
        margin: 0;
    }
    
    .search-input:focus {
        border-color: var(--primary-color);
        box-shadow: 0 0 0 3px var(--primary-color-alpha);
        outline: none;
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
        border-radius: 6px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        display: none;
    }
    
    @media (max-width: 768px) {
        .search-container {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            width: 100%;
            padding: 8px;
            background: var(--bg-color);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            z-index: 1002;
        }
    }
`;

document.head.appendChild(style); 