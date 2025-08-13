#!/bin/bash

echo "🔧 Fixing DateTime format issues in D1 database..."

# Function to fix datetime formats
fix_datetime() {
    local target=$1
    local flag=$2
    
    echo "📅 Fixing DateTime formats for $target database..."
    
    # Fix students table
    echo "  🎓 Fixing students table..."
    npx wrangler d1 execute test-musms --command="UPDATE students SET dateOfBirth = dateOfBirth || ' 00:00:00' WHERE dateOfBirth NOT LIKE '% %' AND dateOfBirth IS NOT NULL;" $flag
    npx wrangler d1 execute test-musms --command="UPDATE students SET enrollmentDate = enrollmentDate || ' 00:00:00' WHERE enrollmentDate NOT LIKE '% %' AND enrollmentDate IS NOT NULL;" $flag
    
    # Fix grades table
    echo "  📊 Fixing grades table..."
    npx wrangler d1 execute test-musms --command="UPDATE grades SET examDate = examDate || ' 00:00:00' WHERE examDate NOT LIKE '% %' AND examDate IS NOT NULL;" $flag
    
    echo "✅ $target database DateTime formats fixed!"
}

# Fix local database
echo ""
echo "🏠 Local Database:"
fix_datetime "local" "--local"

# Fix remote database (if accessible)
echo ""
echo "☁️ Remote Database:"
if npx wrangler d1 execute test-musms --command="SELECT 1;" --remote &>/dev/null; then
    fix_datetime "remote" "--remote"
else
    echo "⚠️  Remote database not accessible (authentication issue)"
    echo "   You can run this manually later when needed:"
    echo "   npx wrangler d1 execute test-musms --command=\"UPDATE students SET dateOfBirth = dateOfBirth || ' 00:00:00' WHERE dateOfBirth NOT LIKE '% %' AND dateOfBirth IS NOT NULL;\" --remote"
    echo "   npx wrangler d1 execute test-musms --command=\"UPDATE students SET enrollmentDate = enrollmentDate || ' 00:00:00' WHERE enrollmentDate NOT LIKE '% %' AND enrollmentDate IS NOT NULL;\" --remote"
    echo "   npx wrangler d1 execute test-musms --command=\"UPDATE grades SET examDate = examDate || ' 00:00:00' WHERE examDate NOT LIKE '% %' AND examDate IS NOT NULL;\" --remote"
fi

echo ""
echo "🎉 DateTime format fix completed!" 