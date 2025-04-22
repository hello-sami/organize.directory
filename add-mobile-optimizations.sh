#!/bin/bash

# Script to add mobile optimizations script to all HTML files
# This script adds the mobile-optimizations.js script reference to all HTML files
# right before the closing </head> tag, but only if it doesn't already exist

echo "Adding mobile-optimizations.js to all HTML files..."

# Find all HTML files in the current directory and subdirectories
# Excluding node_modules and any other build/temporary directories
find . -type f -name "*.html" ! -path "./node_modules/*" ! -path "./.git/*" ! -path "./dist/*" | while read -r file
do
    # Check if the file already contains the mobile-optimizations.js script
    if ! grep -q "mobile-optimizations.js" "$file"; then
        echo "Processing: $file"
        
        # Create a temporary file
        temp_file=$(mktemp)
        
        # Add the script before the closing head tag
        # Using awk for more precise insertion
        awk '{
            print $0;
            if (/<\/head>/) {
                # If we find the line with </head>, we insert our script tag before it
                if (!inserted) {
                    print "    <!-- Mobile optimizations -->";
                    print "    <script src=\"/js/mobile-optimizations.js\" defer></script>";
                    inserted = 1;
                }
            }
        }' "$file" > "$temp_file"
        
        # Replace the original file with the modified one
        mv "$temp_file" "$file"
        
        echo "✅ Added mobile-optimizations.js to $file"
    else
        echo "⏭️  Skipping: $file (already contains mobile-optimizations.js)"
    fi
done

echo "Done! Mobile optimizations script has been added to all HTML files." 