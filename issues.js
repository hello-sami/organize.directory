import { initiatives, debounce } from './utils.js';

// DOM elements
const searchInput = document.getElementById('searchInput');
const resultsContainer = document.getElementById('resultsContainer');

// Initialize page
function initializePage() {
    showAllIssues();
    initializeSearch();
}

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
                    <a href="#" onclick="event.preventDefault(); searchByTopic('${topic}');">
                        ${topic}
                    </a>
                </div>
            `).join('')}
        </div>
    `;
}

function initializeSearch() {
    if (!searchInput) return;
    
    searchInput.addEventListener('input', debounce(() => {
        const query = searchInput.value.trim().toLowerCase();
        if (query) {
            searchIssues(query);
        } else {
            showAllIssues();
        }
    }, 300));
}

function searchIssues(query) {
    const results = initiatives.filter(initiative =>
        initiative.topics.some(topic => 
            topic.toLowerCase().includes(query)
        )
    );
    
    displaySearchResults(results);
}

function searchByTopic(topic) {
    searchInput.value = topic;
    searchIssues(topic.toLowerCase());
}

function displaySearchResults(results) {
    if (results.length === 0) {
        resultsContainer.innerHTML = `
            <div class="no-results">
                <p>No initiatives found matching your search.</p>
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

// Make searchByTopic available globally
window.searchByTopic = searchByTopic;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 