#!/bin/bash

# Script to clean up backup files created during state page updates

echo "Removing backup files from states directory..."

# Count files before removal
bak_count=$(find states -name "*.bak" | wc -l)
bak2_count=$(find states -name "*.bak2" | wc -l)
total_count=$((bak_count + bak2_count))

# Remove .bak files
find states -name "*.bak" -delete

# Remove .bak2 files
find states -name "*.bak2" -delete

# Verify removal
remaining=$(find states -name "*.bak*" | wc -l)

echo "Removed $total_count backup files ($bak_count .bak files and $bak2_count .bak2 files)"

if [ $remaining -eq 0 ]; then
    echo "All backup files successfully deleted!"
else
    echo "Warning: $remaining backup files still remain."
fi 