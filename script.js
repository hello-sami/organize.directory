import { initiatives, citiesByState } from './data.js';

// Breaking News Headlines Management
const breakingNews = {
    headlines: [],
    
    addHeadline(title, description, link) {
        this.headlines.unshift({ 
            title, 
            description, 
            link, 
            timestamp: new Date() 
        });
        this.displayHeadlines();
        this.saveHeadlines();
    },
    
    removeHeadline(index) {
        this.headlines.splice(index, 1);
        this.displayHeadlines();
        this.saveHeadlines();
    },
    
    displayHeadlines() {
        const headlinesContent = document.getElementById('headlinesContent');
        if (!headlinesContent) return;
        
        if (this.headlines.length === 0) {
            headlinesContent.innerHTML = '<p>No current updates</p>';
            return;
        }
        
        headlinesContent.innerHTML = this.headlines.map((item, index) => `
            <div class="news-headline">
                <h3>${item.title}</h3>
                <p>${item.description}</p>
                <div class="timestamp">
                    ${this.formatDate(item.timestamp)}
                    ${item.link ? `· <a href="${item.link}">Learn more</a>` : ''}
                </div>
            </div>
        `).join('');
    },

    formatDate(date) {
        const options = { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric',
            hour: 'numeric',
            minute: '2-digit'
        };
        return new Date(date).toLocaleDateString('en-US', options);
    },

    saveHeadlines() {
        localStorage.setItem('breakingHeadlines', JSON.stringify(this.headlines));
    },

    loadHeadlines() {
        const saved = localStorage.getItem('breakingHeadlines');
        if (saved) {
            this.headlines = JSON.parse(saved);
            this.headlines.forEach(headline => {
                headline.timestamp = new Date(headline.timestamp);
            });
            this.displayHeadlines();
        }
    }
};

// Social media icons as SVG
const socialIcons = {
    twitter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
    facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`
};

// Search type state
let currentView = 'home'; // 'home', 'cities', 'issues', or 'about'
let searchType = 'city'; // Initialize searchType

// Initialize variables
let searchInput, homeLink, cityLink, issuesLink, aboutLink, resultsContainer, homePage, mainContent, aboutContent, headlinesContent;

// Wait for both DOM and sidebar to be ready
document.addEventListener('DOMContentLoaded', () => {
    if (document.querySelector('aside.sidebar')) {
        initializeApp();
    } else {
        const observer = new MutationObserver((mutations, obs) => {
            if (document.querySelector('aside.sidebar')) {
                obs.disconnect();
                initializeApp();
            }
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }
});

function initializeApp() {
    // Get DOM elements
    searchInput = document.getElementById('searchInput');
    homeLink = document.getElementById('homeLink');
    cityLink = document.getElementById('cityLink');
    issuesLink = document.getElementById('issuesLink');
    aboutLink = document.getElementById('aboutLink');
    resultsContainer = document.getElementById('resultsContainer');
    homePage = document.getElementById('homePage');
    mainContent = document.getElementById('mainContent');
    aboutContent = document.getElementById('aboutContent');
    headlinesContent = document.getElementById('headlinesContent');

    // Initialize the page based on current path
    initializePage();
    initializeSearch('state');

    // Add search input event listener
    if (searchInput) {
        searchInput.addEventListener('input', debounce(() => {
            const query = searchInput.value.trim().toLowerCase();
            if (query) {
                performSearch(query);
            } else if (searchType === 'issues') {
                showAllIssues();
            } else {
                showAllStates();
            }
        }, 300));
    }

    // Add navigation event listeners
    if (homeLink) {
        homeLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentView = 'home';
            updateNavigation();
            showHomePage();
        });
    }

    if (cityLink) {
        cityLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentView = 'cities';
            updateNavigation();
            showAllStates();
        });
    }

    if (issuesLink) {
        issuesLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentView = 'issues';
            updateNavigation();
            showIssuesPage();
        });
    }

    if (aboutLink) {
        aboutLink.addEventListener('click', (e) => {
            e.preventDefault();
            currentView = 'about';
            updateNavigation();
            showAboutPage();
        });
    }

    // Handle initial route
    handleRoute();
}

// Update navigation styles
function updateNavigation() {
    if (homeLink) homeLink.classList.toggle('active', currentView === 'home');
    if (cityLink) cityLink.classList.toggle('active', currentView === 'cities');
    if (issuesLink) issuesLink.classList.toggle('active', currentView === 'issues');
    if (aboutLink) aboutLink.classList.toggle('active', currentView === 'about');
}

// Show different pages
function showHomePage() {
    if (!homePage || !mainContent || !aboutContent) return;
    homePage.style.display = 'block';
    mainContent.style.display = 'none';
    aboutContent.style.display = 'none';
    updateUrlParams({ page: 'home' });
}

function showCitiesPage() {
    if (!homePage || !mainContent || !aboutContent || !searchInput) return;
    homePage.style.display = 'none';
    mainContent.style.display = 'block';
    aboutContent.style.display = 'none';
    searchInput.placeholder = 'Search cities...';
    searchType = 'city';
    showAllStates();
    updateUrlParams({ page: 'cities' });
}

function showIssuesPage() {
    if (!homePage || !mainContent || !aboutContent || !searchInput) return;
    homePage.style.display = 'none';
    mainContent.style.display = 'block';
    aboutContent.style.display = 'none';
    searchInput.placeholder = 'Search issues...';
    searchType = 'issues';
    showAllIssues();
    updateUrlParams({ page: 'issues' });
}

function showAboutPage() {
    if (!homePage || !mainContent || !aboutContent) return;
    homePage.style.display = 'none';
    mainContent.style.display = 'none';
    aboutContent.style.display = 'block';
    updateUrlParams({ page: 'about' });
}

// Show all available issues
function showAllIssues() {
    if (!resultsContainer) return;
    
    // Get unique topics from all initiatives
    const topics = new Set();
    initiatives.forEach(initiative => {
        initiative.topics.forEach(topic => topics.add(topic));
    });
    
    const sortedTopics = Array.from(topics).sort();
    
    resultsContainer.innerHTML = `
        <div class="issues-grid">
            ${sortedTopics.map(topic => `
                <div class="issue-link">
                    <a href="#" onclick="event.preventDefault(); document.getElementById('searchInput').value = '${topic}'; window.performSearch('${topic}', 'issues');">
                        ${topic}
                    </a>
                </div>
            `).join('')}
        </div>
    `;
}

// URL parameter handling
function getUrlParams() {
    const params = new URLSearchParams(window.location.search);
    return {
        city: params.get('city'),
        state: params.get('state')
    };
}

function updateUrlParams(params) {
    const url = new URL(window.location);
    Object.entries(params).forEach(([key, value]) => {
        if (value) {
            url.searchParams.set(key, value);
        } else {
            url.searchParams.delete(key);
        }
    });
    window.history.pushState({}, '', url);
}

// City page functionality
function showCityPage(cityName, stateName) {
    const cityInitiatives = initiatives.filter(initiative => 
        initiative.scope === "local" && 
        initiative.location.toLowerCase().includes(cityName.toLowerCase())
    );

    const stateSlug = stateName.toLowerCase()
        .replace(/ /g, '-')
        .replace(/\//g, '-')
        .replace(/\s+/g, '-');

    // Create city page content
    resultsContainer.innerHTML = `
        <div class="city-page">
            <div class="breadcrumb">
                <a href="/location" class="breadcrumb-link">Location</a>
                <span class="breadcrumb-separator">›</span>
                <a href="/states/${stateSlug}" class="breadcrumb-link">${stateName}</a>
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-current">${cityName}</span>
            </div>
            <header class="city-header">
                <h2>${cityName}, ${stateName}</h2>
                <p class="initiative-count">
                    ${cityInitiatives.length} initiative${cityInitiatives.length !== 1 ? 's' : ''} found
                </p>
            </header>
            ${cityInitiatives.length > 0 ? 
                `<div class="initiatives-grid">
                    ${cityInitiatives.map(initiative => `
                        <div class="initiative-card">
                            <h3>${initiative.name}</h3>
                            <p class="initiative-description">${initiative.description}</p>
                            <div class="initiative-meta">
                                <div class="initiative-location">
                                    <span class="meta-label">📍 Location:</span>
                                    <span>${initiative.location}</span>
                                </div>
                                ${initiative.scope ? `
                                    <div class="initiative-scope">
                                        <span class="meta-label">🌐 Scope:</span>
                                        <span>${initiative.scope}</span>
                                    </div>
                                ` : ''}
                            </div>
                            <div class="initiative-links">
                                ${initiative.website ? 
                                    `<a href="${initiative.website}" target="_blank" class="website-link">
                                        <span>Visit Website</span>
                                    </a>` : ''
                                }
                                ${initiative.contact ? 
                                    `<a href="mailto:${initiative.contact}" class="contact-link">
                                        <span>Contact</span>
                                    </a>` : ''
                                }
                            </div>
                        </div>
                    `).join('')}
                </div>`
                : `<div class="no-initiatives">
                    <p>No mutual aid initiatives found in ${cityName} yet.</p>
                    <p class="help-text">Know of an initiative that should be listed here? 
                        <a href="mailto:contact@organize.directory">Contact us</a> to have it added.</p>
                    </div>`
            }
        </div>
    `;
}

// Function to create city link
function createCityLink(city, state) {
    const citySlug = city.toLowerCase()
        .replace(/ /g, '-')
        .replace(/\//g, '-')
        .replace(/\s+/g, '-');
    
    return `<a href="/${citySlug}" class="city-link">${city}</a>`;
}

// Function to create state link
function createStateLink(state) {
    const stateSlug = state.toLowerCase()
        .replace(/ /g, '-')
        .replace(/\//g, '-')
        .replace(/\s+/g, '-');
    
    return `<a href="/states/${stateSlug}" class="state-link">${state}</a>`;
}

// Function to show all states
function showAllStates() {
    searchType = 'state';
    updateNavigation();
    
    let statesHtml = `
        <div class="states-grid">
            ${Object.keys(citiesByState).map(state => `
                <div class="state-section">
                    ${createStateLink(state)}
                </div>
            `).join('')}
        </div>
    `;
    resultsContainer.innerHTML = statesHtml;
}

// Function to show state page
function showStatePage(stateName) {
    const cities = citiesByState[stateName] || [];
    const stateInitiatives = initiatives.filter(initiative => 
        initiative.scope === "state" && 
        initiative.location?.toLowerCase().includes(stateName.toLowerCase())
    );

    resultsContainer.innerHTML = `
        <div class="state-page">
            <div class="breadcrumb">
                <a href="/location" class="breadcrumb-link">Location</a>
                <span class="breadcrumb-separator">›</span>
                <span class="breadcrumb-current">${stateName}</span>
            </div>

            <h1 class="state-title">${stateName}</h1>

            <section class="cities-section">
                <h2>Cities in ${stateName}</h2>
                <div class="cities-list">
                    ${cities.map(city => createCityLink(city, stateName)).join('')}
                </div>
            </section>

            <section class="initiatives-section">
                <h2>Statewide Mutual Aid Networks</h2>
                ${stateInitiatives.length > 0 ? `
                    <div class="initiatives-grid">
                        ${stateInitiatives.map(initiative => `
                            <div class="initiative-card">
                                <h3>${initiative.name}</h3>
                                <p class="initiative-description">${initiative.description}</p>
                                <div class="initiative-links">
                                    ${initiative.website ? 
                                        `<a href="${initiative.website}" target="_blank" class="website-link">Visit Website</a>` : ''
                                    }
                                    ${initiative.contact ? 
                                        `<a href="mailto:${initiative.contact}" class="contact-link">Contact</a>` : ''
                                    }
                                </div>
                            </div>
                        `).join('')}
                    </div>
                ` : `
                    <p class="no-initiatives">Know of a statewide mutual aid initiative in ${stateName}? <a href="mailto:contact@organize.directory">Contact us</a> to have it added.</p>
                `}
            </section>
        </div>
    `;
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function performSearch(query, type) {
    if (!resultsContainer) return;
    
    const results = initiatives.filter(initiative => {
        if (type === 'city') {
            return initiative.scope === 'local' && 
                   initiative.location?.toLowerCase().includes(query.toLowerCase());
        } else {
            return initiative.topics.some(topic => 
                topic.toLowerCase().includes(query.toLowerCase())
            );
        }
    });
    
    displayResults(results);
}

function displayResults(results) {
    if (!resultsContainer) return;
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="result-item">
                <p>No initiatives found. Try a different search term.</p>
            </div>
        `;
        return;
    }

    resultsContainer.innerHTML = results.map(initiative => `
        <div class="result-item">
            <h3>${initiative.name}</h3>
            <p>${initiative.description}</p>
            <div class="meta">
                <span>🌐 ${initiative.scope.charAt(0).toUpperCase() + initiative.scope.slice(1)}</span>
                <a href="${initiative.website}" target="_blank">Website</a>
                <a href="mailto:${initiative.contact}">Contact</a>
            </div>
            <div class="topics">
                ${initiative.topics.map(topic => 
                    `<span class="topic-tag">${topic}</span>`
                ).join('')}
            </div>
        </div>
    `).join('');
}

function clearResults() {
    resultsContainer.innerHTML = '';
}

// Route handling for direct URL navigation
function handleRoute() {
    const path = window.location.pathname;
    const params = new URLSearchParams(window.location.search);
    const page = params.get('page') || 'home';

    // Handle state pages
    const stateMatch = path.match(/^\/states\/([^/]+)$/);
    if (stateMatch) {
        const stateSlug = stateMatch[1];
        const state = Object.keys(citiesByState).find(s => {
            const slug = s.toLowerCase()
                .replace(/ /g, '-')
                .replace(/\//g, '-')
                .replace(/\s+/g, '-');
            return slug === stateSlug;
        });
        
        if (state) {
            currentView = 'states';
            updateNavigation();
            showStatePage(state);
            return;
        }
    }

    // Handle city pages
    const citySlug = path.slice(1);
    for (const [state, cities] of Object.entries(citiesByState)) {
        const city = cities.find(c => {
            const slug = c.toLowerCase()
                .replace(/ /g, '-')
                .replace(/\//g, '-')
                .replace(/\s+/g, '-');
            return slug === citySlug;
        });
        
        if (city) {
            currentView = 'cities';
            updateNavigation();
            showCityPage(city, state);
            return;
        }
    }

    // Handle main pages
    if (path === '/location' || path === '/location/') {
        showAllStates();
    } else if (path === '/' || path === '') {
        currentView = page;
        updateNavigation();
        
        switch (page) {
            case 'home':
                showHomePage();
                break;
            case 'cities':
                showCitiesPage();
                break;
            case 'issues':
                showIssuesPage();
                break;
            case 'about':
                showAboutPage();
                break;
            default:
                showHomePage();
        }
    }
}

// Listen for popstate events (back/forward navigation)
window.addEventListener('popstate', handleRoute);

// Initialize
handleRoute();

// Make functions available globally
window.showCityPage = showCityPage;
window.showAllStates = showAllStates;

// Initialize based on current page
function initializePage() {
    const currentPath = window.location.pathname;
    
    if (currentPath === '/location' || currentPath === '/location/') {
        currentView = 'states';
        updateNavigation();
        showAllStates();
    } else if (currentPath.endsWith('issues.html')) {
        showAllIssues();
        initializeSearch('issues');
    } else if (currentPath === '/' || currentPath === '' || currentPath.endsWith('index.html')) {
        initializeHomePage();
    }
}

function initializeHomePage() {
    if (headlinesContent) {
        breakingNews.loadHeadlines();
        // Add example headlines if none exist
        if (breakingNews.headlines.length === 0) {
            breakingNews.addHeadline(
                "Urgent: Hurricane Relief in Wilmington",
                "Local mutual aid networks are coordinating emergency supplies and shelter. Volunteers and donations needed.",
                "/wilmington.html"
            );
            breakingNews.addHeadline(
                "Northwest CT Mutual Aid Network Launches Winter Drive",
                "Collection centers are now open for winter clothing and supplies to support community members.",
                "/northwest-ct.html"
            );
        }
    }
}

function initializeSearch(type) {
    if (!searchInput) return;
    
    const handler = debounce(() => {
        const query = searchInput.value.trim();
        if (query) {
            performSearch(query, type);
        } else if (type === 'issues') {
            showAllIssues();
        } else {
            showAllStates();
        }
    }, 300);

    searchInput.addEventListener('input', handler);
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    initializePage();
    initializeSearch('city');
});

// Make necessary functions available globally
window.breakingNews = breakingNews;
window.performSearch = performSearch;
