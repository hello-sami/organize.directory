import { citiesByState, debounce } from './utils.js';

// State abbreviations mapping
const stateAbbreviations = {
    'Alabama': 'al',
    'Alaska': 'ak',
    'Arizona': 'az',
    'Arkansas': 'ar',
    'California': 'ca',
    'Colorado': 'co',
    'Connecticut': 'ct',
    'Delaware': 'de',
    'Florida': 'fl',
    'Georgia': 'ga',
    'Hawaii': 'hi',
    'Idaho': 'id',
    'Illinois': 'il',
    'Indiana': 'in',
    'Iowa': 'ia',
    'Kansas': 'ks',
    'Kentucky': 'ky',
    'Louisiana': 'la',
    'Maine': 'me',
    'Maryland': 'md',
    'Massachusetts': 'ma',
    'Michigan': 'mi',
    'Minnesota': 'mn',
    'Mississippi': 'ms',
    'Missouri': 'mo',
    'Montana': 'mt',
    'Nebraska': 'ne',
    'Nevada': 'nv',
    'New Hampshire': 'nh',
    'New Jersey': 'nj',
    'New Mexico': 'nm',
    'New York': 'ny',
    'North Carolina': 'nc',
    'North Dakota': 'nd',
    'Ohio': 'oh',
    'Oklahoma': 'ok',
    'Oregon': 'or',
    'Pennsylvania': 'pa',
    'Rhode Island': 'ri',
    'South Carolina': 'sc',
    'South Dakota': 'sd',
    'Tennessee': 'tn',
    'Texas': 'tx',
    'Utah': 'ut',
    'Vermont': 'vt',
    'Virginia': 'va',
    'Washington': 'wa',
    'West Virginia': 'wv',
    'Wisconsin': 'wi',
    'Wyoming': 'wy'
};

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
    // Check if slug contains state abbreviation
    const parts = slug.split('-');
    const stateAbbr = parts[parts.length - 1];
    const citySlug = parts.slice(0, -1).join('-');

    // Find state from abbreviation
    const state = Object.keys(stateAbbreviations).find(
        state => stateAbbreviations[state] === stateAbbr
    );

    if (state) {
        // Look for city in specific state
        const city = citiesByState[state]?.find(
            city => createSlug(city) === citySlug
        );
        if (city) return { city, state };
    }

    // If no state abbreviation found or no match, try as a regular city slug
    for (const [state, cities] of Object.entries(citiesByState)) {
        const city = cities.find(city => createSlug(city) === slug);
        if (city) {
            return { city, state };
        }
    }
    return null;
}

function createSlug(text) {
    return text.toLowerCase()
        .replace(/ /g, '-')
        .replace(/\//g, '-')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

function getCitySlug(city, state) {
    // Check if this city name exists in other states
    let isDuplicate = false;
    for (const [otherState, cities] of Object.entries(citiesByState)) {
        if (otherState !== state && cities.includes(city)) {
            isDuplicate = true;
            break;
        }
    }
    
    // If it's a duplicate, include the state abbreviation
    if (isDuplicate) {
        return `${createSlug(city)}-${stateAbbreviations[state]}`;
    }
    
    return createSlug(city);
}

function showCityPage(cityName, stateName) {
    resultsContainer.innerHTML = `
        <div class="city-page">
            <div class="breadcrumb">
                <a href="javascript:void(0)" onclick="showAllCities(); history.pushState(null, '', '/cities');" class="back-link">← Back to Cities</a>
            </div>
            <header class="city-header">
                <h2>${cityName}, ${stateName}</h2>
            </header>
            <div class="initiatives-list">
                <p class="help-text">Know of a mutual aid initiative in ${cityName}? 
                    <a href="mailto:contact@organize.directory">Contact us</a> to have it added.</p>
            </div>
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
                            <a href="/${getCitySlug(city, state)}">${city}</a>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }
    resultsContainer.innerHTML = citiesHtml;
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
                        <a href="/${getCitySlug(city, state)}">${city}</a>
                    </div>
                `).join('')}
            </div>
        </div>
    `).join('');
}

// Make functions available globally
window.showCityPage = showCityPage;
window.showAllCities = showAllCities;

// Handle browser back/forward buttons
window.addEventListener('popstate', () => {
    const pathSegments = window.location.pathname.split('/');
    const citySlug = pathSegments[pathSegments.length - 1];
    
    if (citySlug === 'cities.html' || citySlug === 'cities') {
        showAllCities();
    } else {
        const cityInfo = getCityFromSlug(citySlug);
        if (cityInfo) {
            showCityPage(cityInfo.city, cityInfo.state);
        } else {
            showAllCities();
        }
    }
});

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 