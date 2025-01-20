import { initiatives, citiesByState, debounce } from './utils.js';

// DOM elements
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');

// Initialize page
function initializePage() {
    // Check if we're on a specific city page from the pathname
    const pathSegments = window.location.pathname.split('/');
    const citySlug = pathSegments[pathSegments.length - 1];
    
    if (citySlug && citySlug !== 'cities') {
        const cityInfo = getCityFromSlug(citySlug);
        if (cityInfo) {
            showCityPage(cityInfo.city, cityInfo.state);
            return;
        }
    }
    
    showAllCities();
    initializeSearch();
}

function getCityFromSlug(slug) {
    for (const [state, cities] of Object.entries(citiesByState)) {
        const city = cities.find(city => 
            createSlug(city) === slug
        );
        if (city) {
            return { city, state };
        }
    }
    return null;
}

function createSlug(city) {
    return city.toLowerCase()
        .replace(/ /g, '-')
        .replace(/\//g, '-')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function showCityPage(cityName, stateName) {
    const cityInitiatives = initiatives.filter(initiative => 
        initiative.scope === "local" && 
        initiative.location.toLowerCase().includes(cityName.toLowerCase())
    );

    resultsContainer.innerHTML = `
        <div class="city-page">
            <div class="breadcrumb">
                <a href="/cities" class="back-link">← Back to Cities</a>
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

function showAllCities() {
    if (!resultsContainer) return;
    
    let citiesHtml = '';
    for (const [state, cities] of Object.entries(citiesByState)) {
        citiesHtml += `
            <div class="state-section">
                <h2>${state}</h2>
                <div class="cities-grid">
                    ${cities.map(city => `
                        <div class="city-link">
                            <a href="/${createSlug(city)}">${city}</a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    resultsContainer.innerHTML = citiesHtml;

    // Add click handlers for city links
    document.querySelectorAll('.city-link a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const citySlug = link.getAttribute('href').substring(1);
            const cityInfo = getCityFromSlug(citySlug);
            if (cityInfo) {
                showCityPage(cityInfo.city, cityInfo.state);
                history.pushState(null, '', `/${citySlug}`);
            }
        });
    });
}

function initializeSearch() {
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
            searchCities(query);
        } else {
            showAllCities();
        }
    }, 300));
}

function searchCities(query) {
    const results = [];
    for (const [state, cities] of Object.entries(citiesByState)) {
        const matchingCities = cities.filter(city => 
            city.toLowerCase().includes(query)
        );
        if (matchingCities.length > 0) {
            results.push({ state, cities: matchingCities });
        }
    }
    
    displaySearchResults(results);
}

function displaySearchResults(results) {
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>No cities found matching your search.</p>
            </div>
        `;
        return;
    }
    
    resultsContainer.innerHTML = results.map(({ state, cities }) => `
        <div class="state-section">
            <h2>${state}</h2>
            <div class="cities-grid">
                ${cities.map(city => `
                    <div class="city-link">
                        <a href="/${createSlug(city)}">${city}</a>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');

    // Add click handlers for city links in search results
    document.querySelectorAll('.city-link a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const citySlug = link.getAttribute('href').substring(1);
            const cityInfo = getCityFromSlug(citySlug);
            if (cityInfo) {
                showCityPage(cityInfo.city, cityInfo.state);
                history.pushState(null, '', `/${citySlug}`);
            }
        });
    });
}

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    initializePage();
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 