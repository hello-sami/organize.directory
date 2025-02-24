import { citiesByState } from "../../scripts/utils.js";
import { Search } from "../../search/index.js";

// State abbreviations mapping
const stateAbbreviations = {
  Alabama: "al",
  Alaska: "ak",
  Arizona: "az",
  Arkansas: "ar",
  California: "ca",
  Colorado: "co",
  Connecticut: "ct",
  Delaware: "de",
  Florida: "fl",
  Georgia: "ga",
  Hawaii: "hi",
  Idaho: "id",
  Illinois: "il",
  Indiana: "in",
  Iowa: "ia",
  Kansas: "ks",
  Kentucky: "ky",
  Louisiana: "la",
  Maine: "me",
  Maryland: "md",
  Massachusetts: "ma",
  Michigan: "mi",
  Minnesota: "mn",
  Mississippi: "ms",
  Missouri: "mo",
  Montana: "mt",
  Nebraska: "ne",
  Nevada: "nv",
  "New Hampshire": "nh",
  "New Jersey": "nj",
  "New Mexico": "nm",
  "New York": "ny",
  "North Carolina": "nc",
  "North Dakota": "nd",
  Ohio: "oh",
  Oklahoma: "ok",
  Oregon: "or",
  Pennsylvania: "pa",
  "Rhode Island": "ri",
  "South Carolina": "sc",
  "South Dakota": "sd",
  Tennessee: "tn",
  Texas: "tx",
  Utah: "ut",
  Vermont: "vt",
  Virginia: "va",
  Washington: "wa",
  "West Virginia": "wv",
  Wisconsin: "wi",
  Wyoming: "wy",
};

// DOM elements
const searchInput = document.getElementById("searchInput");
const resultsContainer = document.getElementById("resultsContainer");
const statesGrid = document.querySelector(".states-grid");

// Initialize page
export function initializePage() {
  populateStates();
  initializeSearch();
}

function createSlug(text) {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

// Populate the states grid
function populateStates() {
  if (!statesGrid) return;

  const html = Object.keys(citiesByState)
    .sort()
    .map((state) => {
      const stateSlug = createSlug(state);
      const citiesCount = citiesByState[state].length;
      return `
                <div class="state-card">
                    <a href="/states/${stateSlug}.html" class="state-link">
                        <h3>${state}</h3>
                        <span class="cities-count">${citiesCount} ${citiesCount === 1 ? "city" : "cities"}</span>
                    </a>
                </div>
            `;
    })
    .join("");

  statesGrid.innerHTML = html;
}

// Search functionality
function initializeSearch() {
  if (!searchInput || !resultsContainer) return;

  // Initialize search instance
  const search = new Search({
    searchInputId: "searchInput",
    resultsContainerId: "resultsContainer",
    type: "states",
    onResultsDisplay: (results) => {
      if (results.length === 0) {
        resultsContainer.innerHTML = `
          <div class="no-results">
            <p>No states found matching your search.</p>
          </div>
        `;
      } else {
        const statesHtml = results
          .map(
            (state) => `
          <div class="state-card">
            <h2>${state.name}</h2>
            <p>Abbreviation: ${state.abbreviation}</p>
            <a href="/states/${createSlug(state.name)}" class="state-link">View Details</a>
          </div>
        `,
          )
          .join("");

        resultsContainer.innerHTML = statesHtml;
      }
    },
  });
}

// Initialize the page when DOM is loaded
document.addEventListener("DOMContentLoaded", initializePage);
