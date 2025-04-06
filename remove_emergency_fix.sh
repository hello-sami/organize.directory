#!/bin/bash

echo "Removing emergency-fix.css references from all state pages..."

# Process each HTML file in the states directory
for file in states/*.html; do
    echo "Processing $file..."
    
    # Remove the emergency-fix.css reference
    sed -i "" 's|<link rel="stylesheet" href="/emergency-fix.css">||g' "$file"
    echo "  Removed emergency-fix.css reference."
done

echo "Done! All state pages now use the consolidated styles in the main CSS file." 