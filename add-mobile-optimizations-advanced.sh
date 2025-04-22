#!/bin/bash

# Advanced script to add mobile optimizations script to all HTML files
# This script handles different HTML formatting styles and ensures the script
# is added in a consistent location before the closing </head> tag

echo "🔍 Finding all HTML files and adding mobile optimizations..."

# Count of files
total_files=0
modified_files=0
skipped_files=0

# Find all HTML files in the current directory and subdirectories
# Excluding node_modules, .git, and other common build directories
find . -type f -name "*.html" \
  ! -path "./node_modules/*" \
  ! -path "./.git/*" \
  ! -path "./dist/*" \
  ! -path "./build/*" \
  ! -path "./out/*" \
  ! -path "./coverage/*" \
  ! -path "./.next/*" \
  | while read -r file
do
    total_files=$((total_files + 1))
    
    # Check if the file already contains the mobile-optimizations.js script
    if grep -q "mobile-optimizations.js" "$file"; then
        echo "⏭️  Skipping: $file (already contains mobile-optimizations.js)"
        skipped_files=$((skipped_files + 1))
        continue
    fi
    
    echo "🔄 Processing: $file"
    
    # Determine if we should add before a specific script or just before </head>
    insert_before=""
    
    # Check for common patterns where we'd want to insert the script
    # Prioritizing adding it after other scripts but before the closing head tag
    if grep -q "</script>.*</head>" "$file"; then
        # Find the last script tag before </head>
        insert_before="</head>"
    elif grep -q "</head>" "$file"; then
        # No scripts, but there is a head tag
        insert_before="</head>"
    else
        echo "⚠️  Warning: No </head> tag found in $file - skipping"
        skipped_files=$((skipped_files + 1))
        continue
    fi
    
    # Create a temp file for the modifications
    temp_file=$(mktemp)
    
    # Use a more sophisticated approach for inserting the script
    # This preserves indentation and handles different HTML styles
    
    # First, determine if this file uses tabs or spaces for indentation
    if grep -q "^\t" "$file"; then
        # File uses tabs
        indent="\t"
    else
        # Count leading spaces in the head tag line
        spaces=$(grep -o '^ *<head' "$file" | wc -c)
        if [ "$spaces" -gt 0 ]; then
            # File uses spaces, use the same indentation
            indent=$(printf '%*s' "$((spaces-6))" '') # -6 for "<head>" length
        else
            # Default to 4 spaces
            indent="    "
        fi
    fi
    
    # Insert the script before the determined position
    awk -v insert_before="$insert_before" -v indent="$indent" '{
        if (index($0, insert_before) > 0 && !inserted) {
            # If there is already some indentation on the current line, use that
            line_indent = ""
            match($0, /^[ \t]*/)
            if (RLENGTH > 0) {
                line_indent = substr($0, 1, RLENGTH)
            } else {
                line_indent = indent
            }
            
            print line_indent "<!-- Mobile optimizations -->"
            print line_indent "<script src=\"/js/mobile-optimizations.js\" defer></script>"
            inserted = 1
        }
        print $0
    }' "$file" > "$temp_file"
    
    # Check if any changes were made
    if ! diff -q "$file" "$temp_file" > /dev/null; then
        # Replace the original file with the modified one
        mv "$temp_file" "$file"
        echo "✅ Added mobile-optimizations.js to $file"
        modified_files=$((modified_files + 1))
    else
        # No changes were made, remove the temp file
        rm "$temp_file"
        echo "⚠️  No changes made to $file - check file format"
        skipped_files=$((skipped_files + 1))
    fi
done

echo "📊 Summary:"
echo "   Total HTML files: $total_files"
echo "   Modified files: $modified_files"
echo "   Skipped files (already had script or issues): $skipped_files"
echo "✨ Done! Mobile optimizations script has been added to all applicable HTML files." 