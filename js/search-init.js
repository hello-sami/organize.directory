// Lazy load search functionality
let searchInitialized = false;

function initializeSearch() {
    if (searchInitialized) return;
    
    const searchInput = document.getElementById('searchInput');
    if (!searchInput) return;

    // Only initialize search when user interacts with search input
    searchInput.addEventListener('focus', async () => {
        if (searchInitialized) return;
        
        try {
            const { Search } = await import('/search.js');
            new Search();
            searchInitialized = true;
        } catch (error) {
            console.error('Error initializing search:', error);
        }
    });
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeSearch);
} else {
    initializeSearch();
} 