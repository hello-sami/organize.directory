#!/bin/bash

# Script to replace sidebar HTML with placeholder in all HTML files
# Script to replace sidebar HTML with placeholder in all HTML files

echo "Starting sidebar replacement process..."
echo "This will replace all sidebar HTML with placeholders in all HTML files."
echo "===================================================================="

# Count the number of files being processed
FILES=$(find . -type f -name "*.html" | grep -v "node_modules")
FILE_COUNT=$(echo "$FILES" | wc -l)

echo "Found $FILE_COUNT HTML files to process."
echo "===================================================================="

# Create backup directory
BACKUP_DIR="./sidebar_backup_$(date +%Y%m%d_%H%M%S)"
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
    
    # Use perl for multiline regex replacement with proper handling of newlines
    perl -i -0pe 's/<(?:div|aside)[^>]*\s+(?:id="sidebar"|class="sidebar")[^>]*>.*?<\/(?:div|aside)>/<div id="sidebar-placeholder"><\/div>/s' "$file"
    
    # Output progress
    counter=$((counter + 1))
    echo "Processed ($counter/$FILE_COUNT): $file"
done

echo "===================================================================="
echo "Complete! All sidebars have been replaced with placeholder divs."
echo "Original files backed up to: $BACKUP_DIR"
echo "===================================================================="
echo "NOTE: If any files weren't updated correctly, you can restore them from the backup."
echo "To verify the changes worked properly, check a few files manually." 