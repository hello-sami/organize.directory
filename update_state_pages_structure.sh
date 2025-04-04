#!/bin/bash

# Loop through all HTML files in the states directory
for file in states/*.html; do
  echo "Processing $file..."
  
  # First, let's make a backup
  cp "$file" "${file}.bak"
  
  # Find the line with <h2>Cities</h2>
  cities_line_num=$(grep -n "<h2>Cities</h2>" "$file" | cut -d: -f1)
  
  if [ -n "$cities_line_num" ]; then
    echo "  Found Cities heading at line $cities_line_num"
    
    # Create a temporary file
    temp_file=$(mktemp)
    
    # Get the line number of the div.cities-list closing tag after the Cities heading
    div_end_line_num=$(tail -n +$cities_line_num "$file" | grep -n "</div>" | head -n 1 | cut -d: -f1)
    div_end_line_num=$((cities_line_num + div_end_line_num - 1))
    
    echo "  Found closing div at line $div_end_line_num"
    
    # Split the file into parts
    head -n $cities_line_num "$file" > "$temp_file"
    
    # Insert the city-links-container opening tag after the h2
    echo '<div class="city-links-container">' >> "$temp_file"
    
    # Get all content between h2 line and the closing div line (excluding both)
    line_after_h2=$((cities_line_num + 1))
    line_before_div_end=$((div_end_line_num - 1))
    
    if [ $line_after_h2 -le $line_before_div_end ]; then
      sed -n "${line_after_h2},${line_before_div_end}p" "$file" >> "$temp_file"
    fi
    
    # Close the city-links-container
    echo '</div>' >> "$temp_file"
    
    # Get the original closing div
    sed -n "${div_end_line_num}p" "$file" >> "$temp_file"
    
    # Add the rest of the file after the closing div
    tail -n +$((div_end_line_num + 1)) "$file" >> "$temp_file"
    
    # Replace the original file
    mv "$temp_file" "$file"
    
    echo "  Updated $file with city-links-container"
  else
    echo "  No Cities heading found in $file, skipping"
  fi
done

echo "All state pages updated with city-links-container." 