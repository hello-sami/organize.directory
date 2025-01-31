// Search bar component
export function initSearchBar(containerId = 'searchContainer') {
    // Create the search bar HTML
    const searchHTML = `
        <div class="search-container">
            <div class="search-input-wrapper">
                <input 
                    type="text" 
                    id="searchInput" 
                    class="search-input" 
                    placeholder="Type to search..."
                    aria-label="Search content"
                >
                <div id="searchResults" class="search-results" role="listbox"></div>
            </div>
        </div>
    `;

    // Insert the search bar into the specified container
    const container = document.getElementById(containerId);
    if (!container) {
        console.error(`Container with id "${containerId}" not found`);
        return;
    }
    container.innerHTML = searchHTML;

    // Initialize search functionality
    import('./search.js').then(({ Search }) => {
        new Search();
    }).catch(error => {
        console.error('Error initializing search:', error);
    });
} 