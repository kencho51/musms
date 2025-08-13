#!/bin/bash

echo "🔄 Updating JWT imports in all API endpoints..."

# Find all files with jwt import in both server/api and app/server/api
find server/api app/server/api -name "*.ts" -o -name "*.js" 2>/dev/null | while read file; do
  if grep -q "import jwt from 'jsonwebtoken'" "$file"; then
    echo "📝 Updating: $file"
    
    # Replace import statement
    sed -i '' "s/import jwt from 'jsonwebtoken'/import { verifyJWTFallback } from '..\/..\/utils\/jwt.js'/" "$file"
    
    # Replace jwt.verify usage
    sed -i '' "s/jwt\.verify(\([^,]*\),\s*\([^)]*\))/await verifyJWTFallback(\1, \2)/g" "$file"
    
    # Replace jwt.sign usage (less common in API endpoints)
    sed -i '' "s/jwt\.sign(\([^,]*\),\s*\([^,]*\),\s*{\s*expiresIn:\s*\([^}]*\)\s*})/await signJWTFallback(\1, \2, \3)/g" "$file"
    
    echo "✅ Updated: $file"
  fi
done

echo "🎉 JWT import updates complete!"
echo "📋 Remember to also import signJWTFallback if any endpoints use jwt.sign()" 