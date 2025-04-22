#!/bin/bash

# Fix the CSS syntax errors

# Backup the original file
cp styles.css styles.css.bak

# Create a temporary file for modifications
touch temp_styles.css

# Process the file
line_num=0
while IFS= read -r line; do
  line_num=$((line_num + 1))
  
  # Fix 1: Line 843 - Skip the extra closing brace
  if [ $line_num -eq 843 ] && [ "$line" = "}" ]; then
    echo "" >> temp_styles.css
  
  # Fix 2: Lines 1275-1278 - Fix the malformed CSS block
  elif [ $line_num -ge 1275 ] && [ $line_num -le 1278 ]; then
    if [ $line_num -eq 1275 ]; then
      echo "/* Responsive adjustments for even smaller screens */" >> temp_styles.css
      echo "@media (max-width: 480px) {" >> temp_styles.css
      echo "     .city-section h2 {" >> temp_styles.css
      echo "          padding: 0.7rem 0.8rem;" >> temp_styles.css
      echo "     }" >> temp_styles.css
      echo "}" >> temp_styles.css
    fi
  
  # Fix 3: Line 1644 - Skip the extra closing brace
  elif [ $line_num -eq 1644 ] && [ "$line" = "}" ]; then
    echo "" >> temp_styles.css
  
  # Fix 4: Line 3146 - Skip the extra closing brace
  elif [ $line_num -eq 3146 ] && [ "$line" = "}" ]; then
    echo "" >> temp_styles.css
  
  # Fix 5: Line 3284 - Skip the extra closing brace
  elif [ $line_num -eq 3284 ] && [ "$line" = "}" ]; then
    echo "" >> temp_styles.css
  
  # Copy all other lines
  else
    echo "$line" >> temp_styles.css
  fi
done < styles.css

# Replace the original file with the fixed version
mv temp_styles.css styles.css

echo "CSS syntax errors fixed!" 