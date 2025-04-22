#!/bin/bash

# Script to specifically optimize state pages for mobile
# This script:
# 1. Adds the mobile-optimizations.js script
# 2. Ensures the page has the state-page class for proper styling
# 3. Checks for proper HTML structure for mobile optimizations

echo "🔍 Finding and optimizing state pages for mobile..."

# Count of files
total_files=0
modified_files=0
skipped_files=0

# Directory where state pages are located
states_dir="./states"

# If states directory doesn't exist, check if we're in the root
if [ ! -d "$states_dir" ]; then
    if [ -d "states" ]; then
        states_dir="states"
    else
        echo "❌ States directory not found. Please run this script from the project root."
        exit 1
    fi
fi

# Find all HTML files in the states directory
find "$states_dir" -type f -name "*.html" | while read -r file
do
    total_files=$((total_files + 1))
    echo "🔄 Processing state page: $file"
    
    # Create a temp file for the modifications
    temp_file=$(mktemp)
    
    # Flag to track if any changes were made
    changes_made=false
    
    # 1. Add mobile-optimizations.js if it doesn't exist
    if ! grep -q "mobile-optimizations.js" "$file"; then
        # Add the script before the closing head tag
        sed '/<\/head>/i \    <!-- Mobile optimizations -->\n    <script src="/js/mobile-optimizations.js" defer></script>' "$file" > "$temp_file"
        mv "$temp_file" "$file"
        echo "  ✅ Added mobile-optimizations.js script"
        changes_made=true
    else
        echo "  ℹ️ Mobile optimizations script already present"
    fi
    
    # 2. Ensure the page has state-page class
    if ! grep -q 'class=".*state-page' "$file"; then
        if grep -q '<body class="' "$file"; then
            # Add state-page to existing class
            sed -i.bak 's/<body class="/<body class="state-page /' "$file"
            rm "$file.bak"  # Remove backup file
            echo "  ✅ Added state-page class to body"
            changes_made=true
        elif grep -q '<body>' "$file"; then
            # Add class attribute
            sed -i.bak 's/<body>/<body class="state-page">/' "$file"
            rm "$file.bak"  # Remove backup file
            echo "  ✅ Added state-page class to body"
            changes_made=true
        else
            echo "  ⚠️ Could not locate body tag to add state-page class"
        fi
    else
        echo "  ℹ️ Page already has state-page class"
    fi
    
    # 3. Check for proper city-links-container structure for mobile styling
    if grep -q 'class="cities-list"' "$file" && ! grep -q 'class="city-links-container"' "$file"; then
        # Create a new temp file
        temp_file=$(mktemp)
        
        # Add city-links-container div around city links if it doesn't exist
        awk '
        {
            if (match($0, /<div[^>]*class="cities-list"[^>]*>/)) {
                print $0
                # After cities-list div opening, add city-links-container
                city_list_start = 1
                indentation = ""
                match($0, /^[ \t]*/)
                indentation = substr($0, 1, RLENGTH)
                print indentation "  <div class=\"city-links-container\">"
                inside_container = 1
            } 
            else if (city_list_start && match($0, /<\/div>/)) {
                # At the first closing div after cities-list, close our container
                if (inside_container) {
                    indentation = ""
                    match($0, /^[ \t]*/)
                    indentation = substr($0, 1, RLENGTH)
                    print indentation "  </div>"
                    inside_container = 0
                    city_list_start = 0
                }
                print $0
            }
            else {
                print $0
            }
        }' "$file" > "$temp_file"
        
        # Check if the structure was modified
        if ! diff -q "$file" "$temp_file" > /dev/null; then
            mv "$temp_file" "$file"
            echo "  ✅ Added city-links-container structure for better mobile styling"
            changes_made=true
        else
            rm "$temp_file"
        fi
    fi
    
    # If any changes were made, count as modified
    if [ "$changes_made" = true ]; then
        modified_files=$((modified_files + 1))
        echo "✅ Optimized: $file"
    else
        skipped_files=$((skipped_files + 1))
        echo "⏭️ No changes needed for: $file"
    fi
done

echo "📊 Summary:"
echo "   Total state pages: $total_files"
echo "   Optimized pages: $modified_files"
echo "   Skipped (already optimized): $skipped_files"
echo "✨ Done! State pages have been optimized for mobile display." 