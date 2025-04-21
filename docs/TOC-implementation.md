# Table of Contents (TOC) Implementation

This document explains how to implement the Table of Contents (TOC) feature on city pages.

## Overview

The TOC provides a floating navigation menu that follows the user as they scroll through the page, highlighting the current section and allowing for quick navigation to different sections of the page.

## Files

The TOC implementation consists of three main components:

1. **CSS Styles** (`/css/toc.css`): Contains all the styles for the TOC
2. **JavaScript** (`/js/toc.js`): Contains the logic for fixed positioning and active section highlighting
3. **HTML Structure**: Required DOM structure in city pages to support the TOC

## Implementation Steps

### 1. Include Required Files

Make sure your city page includes these files:

```html
<!-- CSS for TOC -->
<link rel="stylesheet" href="/css/toc.css" />

<!-- JavaScript for TOC (import in your module script) -->
<script type="module">
     import { initializeTOC } from "/js/toc.js";
     // ... other imports
</script>
```

### 2. HTML Structure

Your city page must follow this structure:

```html
<div class="page-heading">
     <!-- Breadcrumbs and h1 heading go here -->
</div>

<div class="content-wrapper">
     <!-- Main content -->
     <div class="city-content">
          <!-- Each section must have:
         1. An ID attribute
         2. The "city-section" class -->
          <section id="section-id" class="city-section">
               <h2>Section Title</h2>
               <hr />
               <!-- Section content -->
          </section>

          <!-- More sections... -->
     </div>

     <!-- TOC Container -->
     <aside class="toc-container">
          <nav
               class="toc"
               role="navigation"
               aria-label="Table of Contents"
               id="toc">
               <h2 class="toc-title">Contents</h2>
               <ul class="toc-list">
                    <li class="toc-item">
                         <a href="#section-id" class="toc-link">
                              <span class="toc-number">1.</span>
                              Section Title
                         </a>
                    </li>
                    <!-- More TOC items... -->
               </ul>
          </nav>
     </aside>
</div>
```

### 3. Using the Template

A complete template is available at `templates/city-toc-template.html`. You can use this as a starting point for new city pages.

### 4. Key Classes and IDs

- `.content-wrapper`: Container for both content and TOC, provides positioning context
- `.city-content`: Main content container, has right margin to accommodate TOC
- `.toc-container`: Container for the TOC
- `.toc`: The actual TOC element
- `.toc-fixed`: Class automatically added to TOC when it's in fixed position
- `#toc`: ID required for the TOC element
- `.city-section`: Class required for each section to be included in TOC

### 5. Mobile Behavior

The TOC automatically adapts to mobile screens (below 1020px):

- The TOC becomes static (non-fixed)
- The TOC appears below the content instead of beside it
- The content takes full width

### 6. Troubleshooting

If the TOC isn't working properly:

1. Check browser console for errors
2. Verify that all required elements exist in the DOM
3. Confirm that sections have both the proper ID and the `city-section` class
4. Make sure the TOC links have href attributes matching the section IDs
5. Ensure the CSS and JS files are properly loaded

## Example

See `/cities/los-angeles.html` for a complete working example of the TOC implementation.
