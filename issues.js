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
    
    // Get unique topics and their initiative counts
    const topicCounts = new Map();
    initiatives.forEach(initiative => {
        initiative.topics.forEach(topic => {
            topicCounts.set(topic, (topicCounts.get(topic) || 0) + 1);
        });
    });
    
    const sortedTopics = Array.from(topicCounts.entries())
        .sort((a, b) => a[0].localeCompare(b[0]));
    
    resultsContainer.innerHTML = `
        <div class="issues-grid">
            ${sortedTopics.map(([topic, count]) => `
                <div class="issue-link">
                    <a href="#" onclick="event.preventDefault(); searchByTopic('${topic}');">
                        ${topic}
                        <div class="topics">
                            <span class="topic-tag">${count} initiative${count !== 1 ? 's' : ''}</span>
                        </div>
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
            <div class="topics">
                ${initiative.topics.map(topic => 
                    `<span class="topic-tag">${topic}</span>`
                ).join('')}
            </div>
            <div class="meta">
                <span>${initiative.scope.charAt(0).toUpperCase() + initiative.scope.slice(1)}</span>
                ${initiative.website ? `<a href="${initiative.website}" target="_blank">Website</a>` : ''}
                ${initiative.contact ? `<a href="mailto:${initiative.contact}">Contact</a>` : ''}
            </div>
        </div>
    `).join('');
}

// Make searchByTopic available globally
window.searchByTopic = searchByTopic;

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initializePage); 