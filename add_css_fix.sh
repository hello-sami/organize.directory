#!/bin/bash

# Add our CSS fix to all state pages
for file in states/*.html; do
  echo "Adding styles-fix.css to $file..."
  
  # Check if styles-fix.css is already added
  if grep -q "styles-fix.css" "$file"; then
    echo "  Already present in $file. Skipping."
  else
    # Use sed to add the styles-fix.css link after the main styles.css link
    sed -i "" 's|<link rel="stylesheet" href="/styles.css?v=1743111072001">|<link rel="stylesheet" href="/styles.css?v=1743111072001">\n    <link rel="stylesheet" href="/styles-fix.css">|' "$file"
  fi
done

echo "CSS fix added to all state pages." 