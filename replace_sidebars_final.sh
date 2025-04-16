#!/bin/bash

# Final cleanup script to remove any remaining sidebar elements

echo "Starting final cleanup of sidebar elements..."
echo "This will remove any remaining sidebar elements from HTML files."
echo "===================================================================="

# Count the number of files being processed
FILES=$(find . -type f -name "*.html" | grep -v "node_modules" | grep -v "sidebar_backup")
FILE_COUNT=$(echo "$FILES" | wc -l)

echo "Found $FILE_COUNT HTML files to process."
echo "===================================================================="

# Create backup directory
BACKUP_DIR="./sidebar_backup_final_$(date +%Y%m%d_%H%M%S)"
mkdir -p "$BACKUP_DIR"
echo "Created backup directory: $BACKUP_DIR"

# Process each HTML file
counter=0
for file in $FILES; do
    # Create directory structure in backup dir
    dir_path=$(dirname "$file")
    mkdir -p "$BACKUP_DIR/$dir_path"
    
    # Make a backup copy
    cp "$file" "$BACKUP_DIR/$file"
    
    # Fix case where there's no sidebar-placeholder but leftover elements
    perl -i -0pe 's/<div class="layout">\s*<div class="sidebar-motto">.*?<\/div>\s*<\/div>/<div class="layout">\n        <div id="sidebar-placeholder"><\/div>/s' "$file"
    
    # Remove any nav elements after the sidebar placeholder
    perl -i -0pe 's/<div id="sidebar-placeholder"><\/div>\s*<nav>.*?<\/nav>/<div id="sidebar-placeholder"><\/div>/s' "$file"
    
    # Remove any sidebar-motto divs after the sidebar placeholder
    perl -i -0pe 's/<div id="sidebar-placeholder"><\/div>\s*<div class="sidebar-motto">.*?<\/div>\s*<\/div>/<div id="sidebar-placeholder"><\/div>/s' "$file"
    
    # Fix any doubled up closing div tags
    perl -i -0pe 's/<div id="sidebar-placeholder"><\/div>\s*<\/div>\s*<main/<div id="sidebar-placeholder"><\/div>\n\n        <main/s' "$file"
    
    # Output progress
    counter=$((counter + 1))
    echo "Processed ($counter/$FILE_COUNT): $file"
done

echo "===================================================================="
echo "Complete! All remaining sidebar elements have been removed."
echo "Original files backed up to: $BACKUP_DIR"
echo "===================================================================="
echo "NOTE: If any files weren't updated correctly, you can restore them from the backup."
echo "To verify the changes worked properly, check a few files manually." 