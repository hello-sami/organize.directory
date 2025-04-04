#!/bin/bash

# Loop through all state pages and fix all indentation issues
for file in states/*.html; do
  echo "Processing $file..."
  
  # Create a backup
  cp "$file" "${file}.bak2"
  
  # Create a temporary file
  temp_file=$(mktemp)
  
  # Use sed to make multiple replacements to fix indentation
  cat "$file" | 
    # Fix opening container div
    sed 's|<div class="city-links-container">|                        <div class="city-links-container">|g' |
    # Fix city links indentation (add 8 more spaces)
    sed 's|                        <a href="|                            <a href="|g' |
    # Fix commented city links indentation (add 8 more spaces)
    sed 's|                        <!-- <a href="|                            <!-- <a href="|g' |
    # Fix closing div
    sed 's|                        </div>|                            </div>|g' > "$temp_file"
  
  # Move the fixed file back
  mv "$temp_file" "$file"
  
  echo "Fixed indentation in $file"
done

echo "All state pages have been fixed." 