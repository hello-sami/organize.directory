#!/bin/bash

# Get all HTML files in the topics directory
TOPICS_DIR="./topics"
TOPIC_FILES=$(find "$TOPICS_DIR" -name "*.html")

echo "Found $(echo "$TOPIC_FILES" | wc -l | tr -d ' ') topic HTML files"

MODIFIED_COUNT=0

# Process each file
for file in $TOPIC_FILES; do
    # Check if the file already has a subscribe link
    if grep -q '<a href="/subscribe" class="nav-link">Subscribe</a>' "$file"; then
        echo "$(basename "$file") already has a subscribe link. Skipping."
        continue
    fi

    # Add the subscribe link after the contact link
    sed -i '' -e '/<a href="\/contact" class="nav-link">Contact<\/a>/a\
                <a href="/subscribe" class="nav-link">Subscribe</a>' "$file"

    # Check if the content was actually modified
    if [ $? -eq 0 ]; then
        MODIFIED_COUNT=$((MODIFIED_COUNT + 1))
        echo "Added subscribe link to $(basename "$file")"
    else
        echo "Could not add subscribe link to $(basename "$file") - pattern not found"
    fi
done

echo -e "\nAdded subscribe link to $MODIFIED_COUNT files out of $(echo "$TOPIC_FILES" | wc -l | tr -d ' ') total files" 