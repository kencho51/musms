#!/bin/bash

echo "🔄 Fixing Prisma imports in all API endpoints..."

# Find all TypeScript/JavaScript files in server/api and app/server/api (exclude debug folder)
find server/api app/server/api -name "*.ts" -o -name "*.js" 2>/dev/null | grep -v debug | while read file; do
  # Check if file imports PrismaClient
  if grep -q "import.*PrismaClient.*from.*@prisma/client" "$file"; then
    echo "📝 Fixing: $file"
    
    # Replace PrismaClient import with getDB import
    sed -i '' "s/import.*PrismaClient.*from.*@prisma\/client.*/import { getDB } from '..\/..\/utils\/db.js'/" "$file"
    
    # Remove standalone prisma constant declarations
    sed -i '' "/^const prisma = new PrismaClient()/d" "$file"
    
    # Add prisma = getDB(event) after the event handler starts
    sed -i '' "s/export default defineEventHandler(async (event) => {/export default defineEventHandler(async (event) => {\n  const prisma = getDB(event)/" "$file"
    
    # Remove $disconnect calls
    sed -i '' "/await prisma\.\$disconnect()/d" "$file"
    
    echo "✅ Fixed: $file"
  fi
done

echo "🎉 Prisma import fixes complete!" 