#!/bin/bash

# Fix indentation in all state pages
for file in states/*.html; do
  echo "Fixing indentation in $file..."
  
  # Create a temporary file
  temp_file=$(mktemp)
  
  # Fix indentation for city-links-container
  sed 's/<div class="city-links-container">/                        <div class="city-links-container">/' "$file" > "$temp_file"
  
  # Fix indentation for the closing div
  sed -i '' 's|</div>\n                    </div>|                        </div>\n                    </div>|g' "$temp_file"
  
  # Replace the original file
  mv "$temp_file" "$file"
done

echo "Fixed indentation in all state pages." 