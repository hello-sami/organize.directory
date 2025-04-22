#!/bin/bash

# Master script to run all mobile optimizations
# This script coordinates the execution of all mobile optimization scripts

echo "🚀 Starting mobile optimization process for organize.directory..."
echo "------------------------------------------------------------------"

# 1. Check if all required scripts exist
if [ ! -f "./add-mobile-optimizations-advanced.sh" ] || 
   [ ! -f "./optimize-state-pages.sh" ]; then
    echo "❌ One or more required scripts are missing."
    echo "Please ensure the following files exist in the current directory:"
    echo "  - add-mobile-optimizations-advanced.sh"
    echo "  - optimize-state-pages.sh"
    exit 1
fi

# 2. Make sure all scripts are executable
chmod +x ./add-mobile-optimizations-advanced.sh ./optimize-state-pages.sh

# 3. Run the advanced mobile optimizations script for all HTML files
echo -e "\n📱 Adding mobile optimizations to all HTML files..."
./add-mobile-optimizations-advanced.sh

# 4. Run specific optimizations for state pages
echo -e "\n🗺️ Specifically optimizing state pages..."
./optimize-state-pages.sh

# 5. Verify js directory and mobile optimization scripts exist
js_dir="./js"
if [ ! -d "$js_dir" ]; then
    echo -e "\n⚠️ Warning: 'js' directory not found. Creating it now..."
    mkdir -p "$js_dir"
fi

# Check for required JavaScript files
required_files=(
    "$js_dir/mobile-optimizations.js"
    "$js_dir/back-to-top.js"
    "$js_dir/state-page-mobile.js"
    "$js_dir/swipe-handler.js"
)

missing_files=false
for file in "${required_files[@]}"; do
    if [ ! -f "$file" ]; then
        echo "❌ Missing file: $file"
        missing_files=true
    fi
done

if [ "$missing_files" = true ]; then
    echo -e "\n⚠️ Warning: Some required JavaScript files are missing."
    echo "Please ensure all mobile optimization JavaScript files are in the js/ directory:"
    echo "  - mobile-optimizations.js"
    echo "  - back-to-top.js"
    echo "  - state-page-mobile.js"
    echo "  - swipe-handler.js"
else
    echo -e "\n✅ All required JavaScript files verified!"
fi

echo -e "\n✨ Mobile optimization process completed!"
echo "Your site should now be fully optimized for mobile devices."
echo "------------------------------------------------------------------"
echo "Next steps:"
echo "1. Test the site on various mobile devices and browsers"
echo "2. Check for any remaining mobile-specific issues"
echo "3. Verify that state pages display correctly in mobile view"
echo "------------------------------------------------------------------" 