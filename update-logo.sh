#!/bin/bash

# Create a temporary file with the new sidebar HTML
cat > /tmp/new-sidebar.html << 'EOL'
<div id="sidebar" class="sidebar" aria-label="Main navigation">
            <div class="sidebar-header">
                <img src="/logo.png" alt="The Organize Directory Logo" class="site-logo">
                <h1><a href="/" class="home-link">The Organize Directory</a></h1>
            </div>
            <nav>
EOL

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
        if [ $((count % 50)) -eq 0 ]; then
            echo "Processed $count/$total files in $dir..."
        fi
    done
    
    echo "Completed updating $count files in $dir."
}

# Update state pages
update_html_files "./states"

# Update city pages
update_html_files "./cities"

echo "All updates completed successfully!" 