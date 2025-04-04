#!/bin/bash

# Script to remove all horizontal line (hr) tags from state pages

echo "Removing horizontal lines from state pages..."

# Count the number of state HTML files
state_file_count=$(find states -name "*.html" | wc -l)
echo "Found $state_file_count state HTML files to process"

# Count how many hr tags exist before removal
hr_count_before=$(grep -o "<hr>" states/*.html | wc -l)
echo "Found $hr_count_before horizontal lines to remove"

# Use sed to remove all <hr> tags (both standalone and self-closing)
for file in states/*.html; do
    echo "Processing $file..."
    sed -i "" -e 's|<hr>||g' -e 's|<hr/>||g' "$file"
done

# Verify removal
hr_count_after=$(grep -o "<hr>" states/*.html | wc -l)

echo "Completed removal of horizontal lines from state pages"
echo "Before: $hr_count_before horizontal lines"
echo "After: $hr_count_after horizontal lines"
echo "Removed: $((hr_count_before - hr_count_after)) horizontal lines"

if [ $hr_count_after -eq 0 ]; then
    echo "All horizontal lines successfully removed!"
else
    echo "Warning: $hr_count_after horizontal lines still remain."
fi 