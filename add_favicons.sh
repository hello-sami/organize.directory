#!/bin/bash

# Create a temporary file with the favicon links
cat > /tmp/favicon-links.html << 'EOL'
<link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">
<link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">
<link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">
<link rel="manifest" href="/site.webmanifest">
EOL

# Function to update HTML files in a directory
update_html_files() {
    local dir="$1"
    local count=0
    local total=$(find "$dir" -name "*.html" | wc -l)
    
    echo "Processing $total files in $dir..."
    
    for file in $(find "$dir" -name "*.html"); do
        # First remove any existing favicon links
        sed -i '' -e '/<link rel="icon"/d' "$file"
        sed -i '' -e '/<link rel="shortcut icon"/d' "$file"
        sed -i '' -e '/<link rel="apple-touch-icon"/d' "$file"
        sed -i '' -e '/<link rel="manifest"/d' "$file"
        
        # Then add new favicon links after meta viewport tag
        sed -i '' -e '/<meta name="viewport".*>/a\
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png">\
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png">\
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png">\
    <link rel="manifest" href="/site.webmanifest">' "$file"
        
        count=$((count + 1))
        if [ $((count % 50)) -eq 0 ]; then
            echo "Processed $count/$total files in $dir..."
        fi
    done
    
    echo "Completed updating $count files in $dir."
}

# Update main directory HTML files
update_html_files "."

# Update states directory
update_html_files "./states"

# Update cities directory
update_html_files "./cities"

# Update topics directory
update_html_files "./topics"

# Update templates directory
update_html_files "./templates"

echo "All favicon updates completed successfully!" 