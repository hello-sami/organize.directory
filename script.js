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

    resultsContainer.innerHTML = `
        <div class="city-page">
            <h2>${cityName}, ${stateName}</h2>
            <div class="city-initiatives">
                ${cityInitiatives.length > 0 ? 
                    cityInitiatives.map(initiative => `
                        <div class="initiative-card">
                            <h3>${initiative.name}</h3>
                            <p>${initiative.description}</p>
                            <div class="initiative-links">
                                ${initiative.website ? `<a href="${initiative.website}" target="_blank">Website</a>` : ''}
                                ${initiative.contact ? `<a href="mailto:${initiative.contact}">Contact</a>` : ''}
                            </div>
                            <div class="initiative-topics">
                                ${initiative.topics.map(topic => `<span class="topic-tag">${topic}</span>`).join('')}
                            </div>
                        </div>
                    `).join('') :
                    `<p>No mutual aid initiatives found in ${cityName} yet. Want to add one? Contact us!</p>`
                }
            </div>
        </div>
    `;

    // Hide search interface
    searchContainer.style.display = 'none';
    resultsContainer.style.display = 'block';
}

// Update city link click handlers
function createCityLink(city, state) {
    const citySlug = city.toLowerCase().replace(/ /g, '-');
    // Create a regular link that navigates to the static page
    return `<a href="/${citySlug}/" class="city-link">${city}</a>`;
}

// Update showAllCities function
function showAllCities() {
    let citiesHtml = '';
    Object.entries(citiesByState).forEach(([state, cities]) => {
        citiesHtml += `
            <div class="state-section">
                <h3>${state}</h3>
                <div class="cities-grid">
                    ${cities.map(city => createCityLink(city, state)).join('')}
                </div>
            </div>
        `;
    });
    resultsContainer.innerHTML = citiesHtml;
    resultsContainer.style.display = 'block';
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

// Initialize
updateNavigation();
