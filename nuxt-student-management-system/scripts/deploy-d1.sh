#!/bin/bash

# 🚀 Cloudflare D1 Database Deployment Script
# Student Management System

set -e

echo "🗄️ Cloudflare D1 Database Deployment"
echo "=================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Database name (matches wrangler.toml)
DB_NAME="test-musms"

# Check if wrangler is installed
if ! command -v wrangler &> /dev/null && ! command -v npx &> /dev/null; then
    echo -e "${RED}❌ Neither wrangler nor npx found. Please install Node.js first${NC}"
    exit 1
fi

# Use npx wrangler if wrangler is not globally installed
WRANGLER_CMD="wrangler"
if ! command -v wrangler &> /dev/null; then
    WRANGLER_CMD="npx wrangler"
    echo -e "${BLUE}📦 Using npx wrangler${NC}"
fi

# Check if logged in
if ! $WRANGLER_CMD whoami &> /dev/null; then
    echo -e "${YELLOW}⚠️  Not logged in to Cloudflare. Please login first:${NC}"
    echo "   $WRANGLER_CMD login"
    exit 1
fi

echo -e "${BLUE}👤 Logged in as:${NC}"
$WRANGLER_CMD whoami

# Function to apply migration
apply_migration() {
    local file=$1
    local description=$2
    
    echo -e "\n${BLUE}🔄 Applying: $description${NC}"
    if $WRANGLER_CMD d1 execute $DB_NAME --file="$file" --remote; then
        echo -e "${GREEN}✅ Success: $description${NC}"
    else
        echo -e "${RED}❌ Failed: $description${NC}"
        exit 1
    fi
}

# Function to run SQL command
run_command() {
    local command=$1
    local description=$2
    
    echo -e "\n${BLUE}🔍 $description${NC}"
    $WRANGLER_CMD d1 execute $DB_NAME --command="$command" --remote
}

# Check if database exists
echo -e "\n${BLUE}🔍 Checking if database exists...${NC}"
if $WRANGLER_CMD d1 list | grep -q $DB_NAME; then
    echo -e "${GREEN}✅ Database '$DB_NAME' found${NC}"
else
    echo -e "${YELLOW}⚠️  Database '$DB_NAME' not found. Creating...${NC}"
    $WRANGLER_CMD d1 create $DB_NAME
    echo -e "${GREEN}✅ Database created. Please update wrangler.toml with the database ID${NC}"
    echo -e "${YELLOW}⏸️  Update wrangler.toml and run this script again${NC}"
    exit 0
fi

# Apply migrations
echo -e "\n${BLUE}📦 Applying database migrations...${NC}"

apply_migration "migrations/001_initial_schema.sql" "Initial schema (tables, indexes)"
apply_migration "migrations/002_seed_demo_data.sql" "Demo data (users, courses, grades)"

# Verify deployment
echo -e "\n${BLUE}🔍 Verifying deployment...${NC}"

run_command "SELECT name FROM sqlite_master WHERE type='table';" "Listing tables"

run_command "SELECT 
    'users' as table_name, COUNT(*) as count FROM users
    UNION SELECT 'students', COUNT(*) FROM students  
    UNION SELECT 'courses', COUNT(*) FROM courses
    UNION SELECT 'grades', COUNT(*) FROM grades
    UNION SELECT 'enrollments', COUNT(*) FROM enrollments
    UNION SELECT 'activity_logs', COUNT(*) FROM activity_logs
    UNION SELECT 'settings', COUNT(*) FROM settings;" "Record counts"

run_command "SELECT username, role, isActive FROM users;" "Demo users"

# Success message
echo -e "\n${GREEN}🎉 Database deployment completed successfully!${NC}"
echo ""
echo -e "${BLUE}📝 Demo Credentials:${NC}"
echo "   👨‍💼 Admin:   admin / admin123"
echo "   👨‍🏫 Teacher: teacher / teacher123" 
echo "   🎓 Student: student / student123"
echo ""
echo -e "${BLUE}🚀 Next Steps:${NC}"
echo "   1. Build your application: npm run build"
echo "   2. Deploy to Pages: npm run deploy"
echo "   3. Configure D1 binding in Pages dashboard"
echo "   4. Set JWT_SECRET environment variable"
echo ""
echo -e "${BLUE}🔗 Useful Commands:${NC}"
echo "   $WRANGLER_CMD d1 execute $DB_NAME --command=\"SELECT * FROM users;\" --remote"
echo "   $WRANGLER_CMD d1 export $DB_NAME --output=backup.sql"
echo "   $WRANGLER_CMD d1 execute $DB_NAME --file=backup.sql --remote" 