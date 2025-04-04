#!/bin/bash

# Update all state pages to add city-links-container to Regions and Sub-Regions
for file in states/*.html; do
  echo "Processing $file..."
  
  # Create temporary file
  temp_file=$(mktemp)
  
  # First, find and update Regions sections
  if grep -q "<h2>Regions</h2>" "$file"; then
    echo "  Found Regions section in $file"
    # Use perl to perform the edit with proper support for newlines and spaces
    perl -pe 's|(<div class="cities-list">[\s\n]+<h2>Regions</h2>[\s\n]+)(<a href="/)|$1<div class="city-links-container">\n                            $2|g' "$file" > "$temp_file"
    perl -i -pe 's|(</a>[\s\n]+)(<hr>)|$1                        </div>\n                    </div>\n                </section>\n                $2|g' "$temp_file"
    mv "$temp_file" "$file"
    temp_file=$(mktemp)
  fi
  
  # Now, find and update Sub-Regions sections
  if grep -q "<h2>Sub-Regions</h2>" "$file"; then
    echo "  Found Sub-Regions section in $file"
    # Use perl to perform the edit with proper support for newlines and spaces
    perl -pe 's|(<div class="cities-list">[\s\n]+<h2>Sub-Regions</h2>[\s\n]+)(<a href="/)|$1<div class="city-links-container">\n                            $2|g' "$file" > "$temp_file"
    perl -i -pe 's|(</a>[\s\n]+)(<hr>)|$1                        </div>\n                    </div>\n                </section>\n                $2|g' "$temp_file"
    mv "$temp_file" "$file"
  fi
done

echo "All state pages with Regions and Sub-Regions sections have been updated." 