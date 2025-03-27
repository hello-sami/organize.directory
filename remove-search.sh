#!/bin/bash

# Script to remove search functionality references from all HTML files

# Find all HTML files in the current directory and subdirectories
find . -type f -name "*.html" | while read -r file; do
  # Skip files in node_modules and hidden directories
  if [[ "$file" != *node_modules* && "$file" != *\.* ]]; then
    echo "Processing $file"
    
    # Remove preload for search-index.js
    sed -i '' 's|<link rel="preload" href="/search-index.js" as="script">||g' "$file"
    
    # Change description meta tags that mention search
    sed -i '' 's|content="Browse or search for mutual aid|content="Browse mutual aid|g' "$file"
    
    # Remove references to search in text content
    sed -i '' 's|navigation menu or search|navigation menu|g' "$file"
    
    # Remove or comment out search initialization code
    sed -i '' 's|import { createSearchHeader } from "/components/search-header.js";|// Search functionality removed|g' "$file"
    
    echo "Completed $file"
  fi
done

echo "Search functionality references have been removed from HTML files" 