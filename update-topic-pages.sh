#!/bin/bash

# Function to update HTML files
update_html_files() {
    local dir="$1"
    local count=0
    local total=$(find "$dir" -name "*.html" | wc -l)
    
    echo "Processing $total files in $dir..."
    
    for file in $(find "$dir" -name "*.html"); do
        # Use sed to replace the sidebar HTML
        sed -i '' -e '/<div id="sidebar" class="sidebar".*>/,/<nav>/c\
            <div id="sidebar" class="sidebar" aria-label="Main navigation">\
            <div class="sidebar-header">\
                <img src="/logo.png" alt="The Organize Directory Logo" class="site-logo">\
                <h1><a href="/" class="home-link">The Organize Directory</a></h1>\
            </div>\
            <nav>' "$file"
        
        count=$((count + 1))
        if [ $((count % 10)) -eq 0 ]; then
            echo "Processed $count/$total files in $dir..."
        fi
    done
    
    echo "Completed updating $count files in $dir."
}

# Update topic pages
update_html_files "./topics"

echo "All updates completed successfully!" 