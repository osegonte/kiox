#!/bin/bash
cd ~/kiox/web/src

# Replace in all TypeScript files
find . -name "*.tsx" -o -name "*.ts" | while read file; do
  sed -i '' 's|http://localhost:8000|${API_URL}|g' "$file"
done

echo "✅ Updated all API URLs"
