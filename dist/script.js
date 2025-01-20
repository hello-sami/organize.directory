import { initiatives, citiesByState } from './data.js';

// Social media icons as SVG
const socialIcons = {
    twitter: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 3a10.9 10.9 0 0 1-3.14 1.53 4.48 4.48 0 0 0-7.86 3v1A10.66 10.66 0 0 1 3 4s-4 9 5 13a11.64 11.64 0 0 1-7 2c9 5 20 0 20-11.5a4.5 4.5 0 0 0-.08-.83A7.72 7.72 0 0 0 23 3z"></path></svg>`,
    instagram: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>`,
    facebook: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>`
};

// DOM elements
const searchInput = document.getElementById('searchInput');
const cityLink = document.getElementById('cityLink');
const issuesLink = document.getElementById('issuesLink');
const aboutLink = document.getElementById('aboutLink');
const resultsContainer = document.getElementById('resultsContainer');
const searchContainer = document.querySelector('.search-container');
const aboutContent = document.getElementById('aboutContent');

// Search type state
let searchType = 'city'; // 'city' or 'issues' or 'about'

// Event listeners for navigation
cityLink.addEventListener('click', (e) => {
    e.preventDefault();
    searchType = 'city';
    updateNavigation();
    showSearchInterface();
    searchInput.placeholder = 'Search cities...';
    searchInput.value = '';
    showAllCities();
});

issuesLink.addEventListener('click', (e) => {
    e.preventDefault();
    searchType = 'issues';
    updateNavigation();
    showSearchInterface();
    searchInput.placeholder = 'Search issues...';
    searchInput.value = '';
    clearResults();
    showAllIssues();
});

aboutLink.addEventListener('click', (e) => {
    e.preventDefault();
    searchType = 'about';
    updateNavigation();
    showAboutPage();
});

// Update navigation styles
function updateNavigation() {
    cityLink.classList.toggle('active', searchType === 'city');
    issuesLink.classList.toggle('active', searchType === 'issues');
    aboutLink.classList.toggle('active', searchType === 'about');
}

// Toggle between search interface and about page
function showSearchInterface() {
    searchContainer.style.display = 'block';
    aboutContent.style.display = 'none';
    searchInput.value = '';
    searchInput.placeholder = `Search ${searchType}...`;
}

function showAboutPage() {
    searchContainer.style.display = 'none';
    aboutContent.style.display = 'block';
}

// Show all available issues
function showAllIssues() {
    const issues = new Set();
    initiatives
        .filter(initiative => initiative.scope === 'nationwide' || initiative.scope === 'online')
        .forEach(initiative => {
            initiative.topics.forEach(topic => issues.add(topic));
        });
    
    const sortedIssues = Array.from(issues).sort();
    
    resultsContainer.innerHTML = `
        <div class="result-item">
            ${sortedIssues.map(issue => `
                <div class="issue-link" style="margin-bottom: 0.75rem;">
                    <a href="#" onclick="event.preventDefault(); document.getElementById('searchInput').value = '${issue}'; performSearch('${issue}');">
                        ${issue}
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

    // Hide search interface and about content
    searchContainer.style.display = 'block';
    aboutContent.style.display = 'none';

    // Create city page content
    resultsContainer.innerHTML = `
        <div class="city-page">
            <div class="breadcrumb">
                <a href="/" class="back-link" onclick="event.preventDefault(); showAllCities(); return false;">← Back to Cities</a>
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
    
    return `<a href="/${citySlug}" class="city-link" onclick="
        event.preventDefault(); 
        window.showCityPage('${city.replace(/'/g, "\\'")}', '${state.replace(/'/g, "\\'")}'); 
        history.pushState({}, '', '/${citySlug}'); 
        return false;">${city}</a>`;
}

// Function to show all cities
function showAllCities() {
    searchType = 'city';
    updateNavigation();
    showSearchInterface();
    
    let citiesHtml = '';
    for (const [state, cities] of Object.entries(citiesByState)) {
        citiesHtml += `
            <div class="state-section">
                <h2>${state}</h2>
                <div class="cities-grid">
                    ${cities.map(city => createCityLink(city, state)).join('')}
                </div>
            </div>
        `;
    }
    resultsContainer.innerHTML = citiesHtml;
}

// Search input handler
searchInput.addEventListener('input', debounce(() => {
    const query = searchInput.value.trim().toLowerCase();
    if (query) {
        performSearch(query);
    } else if (searchType === 'issues') {
        showAllIssues();
    } else if (searchType === 'city') {
        showAllCities();
    } else {
        clearResults();
    }
}, 300));

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

function performSearch(query) {
    const results = initiatives.filter(initiative => {
        if (searchType === 'city') {
            // Only show local initiatives when searching by city
            return initiative.scope === 'local' && 
                   initiative.location.toLowerCase().includes(query.toLowerCase());
        } else {
            // Only show nationwide/online initiatives when searching by topic
            return (initiative.scope === 'nationwide' || initiative.scope === 'online') && 
                   initiative.topics.some(topic => 
                       topic.toLowerCase().includes(query.toLowerCase())
                   );
        }
    });
    displayResults(results);
}

function displayResults(results) {
    clearResults();
    
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="result-item">
                <p>No initiatives found. Try a different search term.</p>
            </div>
        `;
        return;
    }

    results.forEach(initiative => {
        const resultElement = document.createElement('div');
        resultElement.className = 'result-item';
        resultElement.innerHTML = `
            <h3>${initiative.name}</h3>
            <p>${initiative.description}</p>
            <div class="meta">
                ${initiative.scope === 'local' ? 
                    `<span>📍 ${initiative.location}</span>` :
                    `<span>🌐 ${initiative.scope === 'nationwide' ? 'Nationwide' : 'Online'}</span>`
                }
                <a href="${initiative.website}" target="_blank">Website</a>
                <a href="mailto:${initiative.contact}">Contact</a>
            </div>
        `;
        resultsContainer.appendChild(resultElement);
    });
}

function clearResults() {
    resultsContainer.innerHTML = '';
}

// Route handling for direct URL navigation
function handleRoute() {
    const path = window.location.pathname;
    if (path === '/' || path === '') {
        showAllCities();
    } else if (path === '/about') {
        searchType = 'about';
        updateNavigation();
        showAboutPage();
    } else {
        // Remove leading slash
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
                showCityPage(city, state);
                return;
            }
        }
        // If no match found, show all cities
        showAllCities();
    }
}

// Listen for popstate events (back/forward navigation)
window.addEventListener('popstate', handleRoute);

// Initialize
handleRoute();

// Make functions available globally
window.showCityPage = showCityPage;
window.showAllCities = showAllCities;
