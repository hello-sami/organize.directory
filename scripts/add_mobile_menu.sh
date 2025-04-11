#!/bin/bash

# Script to add mobile menu script to all state and city pages
# Usage: ./scripts/add_mobile_menu.sh

# Find all HTML files in states and cities directories
find states cities -name "*.html" | while read -r file; do
  # Check if the file already has the mobile menu script
  if ! grep -q "mobile-menu.js" "$file"; then
    echo "Adding mobile menu script to $file"
    # Use sed to insert the script tag before the closing body tag
    sed -i '' 's|</body>|  <script src="/mobile-menu.js" defer></script>\n</body>|' "$file"
  else
    echo "File $file already has mobile menu script, skipping"
  fi
done

echo "Mobile menu script added to all state and city pages" 