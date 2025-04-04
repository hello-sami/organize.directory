#!/bin/bash

# Fix the closing div tags in all state pages
for file in states/*.html; do
  echo "Fixing closing div in $file..."
  
  # Use sed to replace the closing div tag
  sed -i '' 's|</div>\n                    </div>|                        </div>\n                    </div>|g' "$file"
  sed -i '' 's|</div>$|                        </div>|g' "$file"
  
  # Use a more targeted approach to find and replace the closing div
  perl -i -pe 's|(\s*)</div>\s*\n(\s*)</div>|$1                        </div>\n$2</div>|g' "$file"
done

echo "Fixed closing divs in all state pages." 