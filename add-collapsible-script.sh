#!/bin/bash

# Add the script tag to all city pages
echo "Processing city pages..."
for file in cities/*.html; do
  # Check if the script is already included
  if ! grep -q "initiative-collapsible.js" "$file"; then
    # Add the script before the closing body tag
    sed -i '' '/<\/body>/i\
  <!-- Add initiative collapsible functionality for mobile -->\
  <script src="/js/initiative-collapsible.js"></script>' "$file"
    echo "Updated $file"
  else
    echo "Script already exists in $file"
  fi
done

# Add the script tag to all state pages
echo "Processing state pages..."
for file in states/*.html; do
  # Check if the script is already included
  if ! grep -q "initiative-collapsible.js" "$file"; then
    # Add the script before the closing body tag
    sed -i '' '/<\/body>/i\
  <!-- Add initiative collapsible functionality for mobile -->\
  <script src="/js/initiative-collapsible.js"></script>' "$file"
    echo "Updated $file"
  else
    echo "Script already exists in $file"
  fi
done

echo "All files processed!" 