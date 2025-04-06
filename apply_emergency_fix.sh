#!/bin/bash

echo "Adding emergency-fix.css to all state pages..."

# Process each HTML file in the states directory
for file in states/*.html; do
    echo "Processing $file..."
    
    # Check if the file already has the reference
    if grep -q "emergency-fix.css" "$file"; then
        echo "  Already has emergency-fix.css reference. Skipping."
    else
        # Add the reference after the main stylesheet
        sed -i "" 's|<link rel="stylesheet" href="/styles.css?v=1743111072001">|<link rel="stylesheet" href="/styles.css?v=1743111072001">\n    <link rel="stylesheet" href="/emergency-fix.css">|' "$file"
        echo "  Added emergency-fix.css reference."
    fi
done

echo "Done! All state pages now use the emergency fix for header layout." 