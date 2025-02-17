#!/bin/bash
find . -type f -name "*.html" -exec sed -i "" "/<link.*href=\"\/styles\/city\.css\".*>/d" {} +
find . -type f -name "*.html" -exec sed -i "" "/<link.*href=\"\/styles\/location\.css\".*>/d" {} +
find . -type f -name "*.html" -exec sed -i "" "/<link.*href=\"\/styles\/states-list\.css\".*>/d" {} +
echo "CSS references removed successfully!"
