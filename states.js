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
const statesGrid = document.querySelector('.states-grid');

// Initialize page
export function initializePage() {
    populateStates();
    initializeSearch();
}

function createSlug(text) {
    return text.toLowerCase()
        .replace(/ /g, '-')
        .replace(/\//g, '-')
        .replace(/[^a-z0-9-]/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}

// Populate the states grid
function populateStates() {
    if (!statesGrid) return;
    
    const html = Object.keys(citiesByState)
        .sort()
        .map(state => {
            const stateSlug = createSlug(state);
            const citiesCount = citiesByState[state].length;
            return `
                <div class="state-card">
                    <a href="/states/${stateSlug}.html" class="state-link">
                        <h3>${state}</h3>
                        <span class="cities-count">${citiesCount} ${citiesCount === 1 ? 'city' : 'cities'}</span>
                    </a>
                </div>
            `;
        })
        .join('');
    
    statesGrid.innerHTML = html;
}

// Search functionality
function initializeSearch() {
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
            const results = searchStates(query);
            displaySearchResults(results);
        } else {
            resultsContainer.innerHTML = '';
            populateStates();
        }
    }, 300));
}

function searchStates(query) {
    return Object.keys(citiesByState)
        .filter(state => {
            // Match state name
            if (state.toLowerCase().includes(query)) return true;
            
            // Match cities in state
            return citiesByState[state].some(city => 
                city.toLowerCase().includes(query)
            );
        })
        .map(state => ({
            name: state,
            url: `/states/${createSlug(state)}.html`,
            cities: citiesByState[state].filter(city => 
                city.toLowerCase().includes(query)
            )
        }));
}

function displaySearchResults(results) {
    if (!results.length) {
        resultsContainer.innerHTML = '<p class="no-results">No states or cities found</p>';
        return;
    }

    const html = results.map(result => `
        <div class="search-result">
            <a href="${result.url}">${result.name}<a>
            ${result.cities.length ? `
                <div class="matching-cities">
                    ${result.cities.map(city => `
                        <a href="/cities/${createSlug(city)}-${stateAbbreviations[result.name]}.html">${city}</a>
                    `).join(', ')}
                </div>
            ` : ''}
        </div>
    `).join('');

    resultsContainer.innerHTML = html;
}

// Initialize the page when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 