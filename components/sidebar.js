// Sidebar component
export function createSidebar(activePage) {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    
    sidebar.innerHTML = `
        <h1><a href="/" class="home-link">Mutual Aid Directory</a></h1>
        <nav>
            <a href="/" id="homeLink" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a>
            <a href="/cities" id="cityLink" class="nav-link ${activePage === 'cities' ? 'active' : ''}">Cities</a>
            <a href="/issues" id="issuesLink" class="nav-link ${activePage === 'issues' ? 'active' : ''}">Issues</a>
            <a href="/about" id="aboutLink" class="nav-link ${activePage === 'about' ? 'active' : ''}">About</a>
        </nav>
    `;

    // Add click event listeners to handle navigation
    const links = sidebar.querySelectorAll('a');
    links.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const href = link.getAttribute('href');
            history.pushState({}, '', href);
            navigateToPage(href);
        });
    });
    
    // Handle browser back/forward buttons
    window.addEventListener('popstate', () => {
        navigateToPage(window.location.pathname);
    });
    
    return sidebar;
}

// Function to handle navigation
function navigateToPage(path) {
    // Remove any trailing slashes
    path = path.endsWith('/') ? path.slice(0, -1) : path;
    
    // Handle root path
    if (path === '' || path === '/') {
        path = '/index.html';
    } else {
        // Add .html extension for the server
        path = path + '.html';
    }

    // Fetch the page content
    fetch(path)
        .then(response => {
            if (!response.ok) {
                throw new Error('Page not found');
            }
            return response.text();
        })
        .then(html => {
            // Create a temporary element to parse the HTML
            const parser = new DOMParser();
            const doc = parser.parseFromString(html, 'text/html');
            
            // Update the main content
            const currentMain = document.querySelector('main');
            const newMain = doc.querySelector('main');
            if (currentMain && newMain) {
                currentMain.innerHTML = newMain.innerHTML;
            }
            
            // Update the title
            document.title = doc.title;

            // Update active state in sidebar
            updateActiveLink(path);

            // Re-initialize page-specific JavaScript
            initializePage(path);
        })
        .catch(error => {
            console.error('Navigation error:', error);
            // Fallback to traditional navigation on error
            window.location.href = path;
        });
}

// Function to initialize page-specific JavaScript
function initializePage(path) {
    // Initialize cities page
    if (path.includes('/cities')) {
        // Import and initialize cities.js functionality
        import('/cities.js').then(module => {
            if (typeof module.initializePage === 'function') {
                module.initializePage();
            }
            if (typeof module.initializeSearch === 'function') {
                module.initializeSearch();
            }
        }).catch(err => console.error('Error loading cities.js:', err));
    }
    // Add other page initializations as needed
}

// Function to update active state in sidebar
function updateActiveLink(path) {
    const links = document.querySelectorAll('.nav-link');
    links.forEach(link => {
        const href = link.getAttribute('href');
        if (path.includes(href) && href !== '/') {
            link.classList.add('active');
        } else if (href === '/' && path === '/index.html') {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });
}

// Function to handle relative paths in subdirectories
export function adjustPaths(sidebar, depth = 0) {
    // For static hosting, we keep the absolute paths
    return sidebar;
} 