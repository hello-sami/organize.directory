/**
 * Render Initiatives Component
 *
 * A module to dynamically render city initiatives from JSON data
 */

// Function to render a single initiative
function renderInitiative(initiative) {
     return `
    <div class="initiative">
      <a href="${initiative.url}">${initiative.name}</a>
      <p>${initiative.description}</p>
    </div>
  `;
}

// Function to render a category of initiatives
function renderCategory(category) {
     const initiativesHtml = category.initiatives
          .map(renderInitiative)
          .join("");

     return `
    <section id="${category.id}" class="city-section">
      <h2>${category.name}</h2>
      ${initiativesHtml}
    </section>
  `;
}

// Function to render the TOC from categories
function renderTOC(categories) {
     const tocItemsHtml = categories
          .map((category, index) => {
               return `
      <li class="toc-item">
        <a href="#${category.id}" class="toc-link">
          <span class="toc-number">${index + 1}.</span>
          ${category.name}
        </a>
      </li>
    `;
          })
          .join("");

     return `
    <aside class="toc-container">
      <nav class="toc" role="navigation" aria-label="Table of Contents" id="toc">
        <ul class="toc-list">
          ${tocItemsHtml}
        </ul>
      </nav>
    </aside>
  `;
}

// Function to render boroughs section
function renderBoroughs(boroughs) {
     const boroughLinksHtml = boroughs
          .map((borough) => {
               return `<a href="${borough.path}" class="city-link nav-link-base location-link">${borough.name}</a>`;
          })
          .join("");

     return `
    <section class="cities-list-container state-page" style="margin-bottom: 5rem;">
      <div class="cities-list" style="margin-bottom: 2rem;">
        <h2>Boroughs</h2>
        <div class="city-links-container" style="display: flex; flex-direction: column; gap: 0.75rem;">
          ${boroughLinksHtml}
        </div>
      </div>
    </section>
  `;
}

// Main function to render all city content
async function renderCityContent(jsonPath, targetContainer) {
     try {
          // Fetch the city data
          const response = await fetch(jsonPath);
          if (!response.ok) {
               throw new Error(`Failed to fetch data: ${response.status}`);
          }

          const cityData = await response.json();
          const contentContainer = document.querySelector(targetContainer);

          if (!contentContainer) {
               console.error(`Target container ${targetContainer} not found`);
               return;
          }

          // Set breadcrumb and title
          document.querySelector(".breadcrumb").innerHTML = `
      <a href="${cityData.breadcrumb.parent.path}">${cityData.breadcrumb.parent.name}</a>
      <span>›</span>
      <span>${cityData.breadcrumb.current}</span>
    `;

          document.querySelector("h1").textContent = cityData.name;

          // Render the content
          const boroughsSection = renderBoroughs(cityData.boroughs);
          const categoriesHtml = cityData.categories
               .map(renderCategory)
               .join("");
          const tocHtml = renderTOC(cityData.categories);

          // Update the DOM
          contentContainer.innerHTML = `
      <div class="city-content">
        ${boroughsSection}
        ${categoriesHtml}
      </div>
      ${tocHtml}
    `;

          // Initialize any scripts that need to run after rendering
          if (window.initializeComponents) {
               window.initializeComponents();
          }
     } catch (error) {
          console.error("Error rendering city content:", error);
          document.querySelector(targetContainer).innerHTML = `
      <div class="error-message">
        <p>Sorry, there was an error loading the content. Please try again later.</p>
      </div>
    `;
     }
}

// Export the main function
export { renderCityContent };
