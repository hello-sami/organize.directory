// Mobile menu functionality
document.addEventListener('DOMContentLoaded', () => {
    const sidebar = document.querySelector('aside');
    const MOBILE_BREAKPOINT = 1020; // Match this with CSS breakpoint
    
    // Create mobile menu button
    const mobileMenuButton = document.createElement('button');
    mobileMenuButton.className = 'mobile-menu-button';
    mobileMenuButton.setAttribute('aria-label', 'Toggle menu');
    mobileMenuButton.setAttribute('aria-expanded', 'false');
    mobileMenuButton.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="3" y1="12" x2="21" y2="12"></line>
            <line x1="3" y1="6" x2="21" y2="6"></line>
            <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
    `;
    
    // Create overlay
    const overlay = document.createElement('div');
    overlay.className = 'mobile-menu-overlay';
    
    // Create mobile search
    const mobileSearch = document.createElement('div');
    mobileSearch.className = 'mobile-search';
    mobileSearch.innerHTML = `
        <form class="search-form">
            <input type="search" 
                   class="search-input" 
                   placeholder="Search locations..." 
                   aria-label="Search locations"
                   autocomplete="off">
            <div class="search-results" role="listbox"></div>
        </form>
    `;

    // Insert elements
    sidebar.insertBefore(mobileSearch, sidebar.firstChild);
    document.body.insertBefore(mobileMenuButton, document.body.firstChild);
    document.body.insertBefore(overlay, document.body.firstChild);

    // Initialize search functionality
    const searchForm = mobileSearch.querySelector('.search-form');
    const searchInput = mobileSearch.querySelector('.search-input');
    const searchResults = mobileSearch.querySelector('.search-results');
    let selectedResultIndex = -1;
    let currentResults = [];
    
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

    // Handle form submission
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault();
        if (currentResults.length > 0) {
            window.location.href = currentResults[selectedResultIndex >= 0 ? selectedResultIndex : 0].url;
        }
    });

    // Debounce search input
    let searchTimeout;
    searchInput.addEventListener('input', () => {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(() => {
            performSearch(searchInput.value);
        }, 150); // Reduced debounce time for more responsive feel
    });

    // Close search results when clicking outside
    document.addEventListener('click', (e) => {
        if (!searchInput.contains(e.target) && !searchResults.contains(e.target)) {
            searchResults.style.display = 'none';
            selectedResultIndex = -1;
        }
    });

    // Toggle menu and overlay
    function toggleMenu() {
        const isOpen = sidebar.classList.contains('active');
        sidebar.classList.toggle('active');
        overlay.classList.toggle('active');
        mobileMenuButton.setAttribute('aria-expanded', !isOpen);
        document.body.style.overflow = !isOpen ? 'hidden' : '';
        
        if (!isOpen) {
            setTimeout(() => {
                searchInput.focus();
            }, 300);
        }
    }

    // Close menu
    function closeMenu() {
        sidebar.classList.remove('active');
        overlay.classList.remove('active');
        mobileMenuButton.setAttribute('aria-expanded', 'false');
        document.body.style.overflow = '';
        searchInput.value = '';
        searchResults.style.display = 'none';
    }

    mobileMenuButton.addEventListener('click', (e) => {
        e.stopPropagation();
        toggleMenu();
    });

    // Close menu when clicking overlay
    overlay.addEventListener('click', closeMenu);

    // Close menu when pressing escape key
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            if (searchResults.style.display === 'block') {
                searchResults.style.display = 'none';
            } else if (sidebar.classList.contains('active')) {
                closeMenu();
            }
        }
    });

    // Handle resize events
    let resizeTimer;
    function handleResize() {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            const isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
            mobileMenuButton.style.display = isMobile ? 'flex' : 'none';
            mobileSearch.style.display = isMobile ? 'block' : 'none';
            
            if (!isMobile) {
                closeMenu();
            }
        }, 100);
    }

    // Check on load and resize
    handleResize();
    window.addEventListener('resize', handleResize);

    // Clean up on page unload
    window.addEventListener('unload', () => {
        window.removeEventListener('resize', handleResize);
    });
});