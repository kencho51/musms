#!/bin/bash

echo "🔧 Setting up Cloudflare D1 Database Configuration"
echo "=================================================="

# Check if wrangler.toml exists
if [ ! -f "wrangler.toml" ]; then
    echo "❌ wrangler.toml not found!"
    echo "Please make sure you're in the project root directory."
    exit 1
fi

# Check if D1 database is configured
if ! grep -q "d1_databases" wrangler.toml; then
    echo "❌ D1 database configuration not found in wrangler.toml"
    echo "Please configure your D1 database in wrangler.toml first."
    exit 1
fi

echo "✅ Found D1 database configuration in wrangler.toml"

# Extract database info
DB_NAME=$(grep "database_name" wrangler.toml | sed 's/.*= *"\([^"]*\)".*/\1/')
DB_ID=$(grep "database_id" wrangler.toml | sed 's/.*= *"\([^"]*\)".*/\1/')

echo "📊 Database Name: $DB_NAME"
echo "🆔 Database ID: $DB_ID"

# Check database connectivity
echo ""
echo "🔍 Testing database connectivity..."
if npx wrangler d1 execute "$DB_NAME" --command="SELECT 1" --remote > /dev/null 2>&1; then
    echo "✅ Successfully connected to remote D1 database"
else
    echo "❌ Failed to connect to remote D1 database"
    echo "Please check your database configuration and authentication."
    exit 1
fi

# Setup local D1 database
echo ""
echo "🗄️  Setting up local D1 database..."
echo "Creating schema in local D1..."
if npx wrangler d1 execute "$DB_NAME" --file=migrations/001_initial_schema.sql --local > /dev/null 2>&1; then
    echo "✅ Schema created successfully"
else
    echo "⚠️  Schema creation failed (might already exist)"
fi

echo "Adding demo data to local D1..."
if npx wrangler d1 execute "$DB_NAME" --file=migrations/002_seed_demo_data.sql --local > /dev/null 2>&1; then
    echo "✅ Demo data added successfully"
else
    echo "⚠️  Demo data insertion failed (might already exist)"
fi

# Generate Prisma client
echo ""
echo "🏗️  Generating Prisma client..."
npm run db:generate

echo ""
echo "🎉 D1 Setup Complete!"
echo ""
echo "Next steps:"
echo "1. Run 'npm run dev' to start development with D1 database"
echo "2. Use 'npm run db:execute -- --command=\"YOUR_SQL\"' to run SQL commands"
echo "3. Use 'npm run db:info' to get database information"
echo ""
echo "Note: The application now uses Cloudflare D1 for all environments." 