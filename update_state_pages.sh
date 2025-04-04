#!/bin/bash

# Loop through all HTML files in the states directory
for file in states/*.html; do
  echo "Processing $file..."
  
  # Use extended regex and better handling of whitespace variations
  sed -i "" -E 's|<section>[[:space:]]*<h2>Cities</h2>[[:space:]]*<div class="cities-list">|<section><div class="cities-list"><h2>Cities</h2>|g' "$file"
done

echo "Updated all state pages to move headings inside the cities-list containers." 