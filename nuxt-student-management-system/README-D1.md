# Cloudflare D1 Database Configuration

This application now uses **Cloudflare D1 exclusively** for all environments (development, testing, and production).

## 🚀 Quick Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Setup D1 database:**
   ```bash
   npm run setup:d1
   ```

3. **Start development:**
   ```bash
   npm run dev
   ```

## 📊 Database Information

- **Database Name:** `test-musms`
- **Database ID:** `496744f0-44cd-4e2e-8e9c-5f02a22ca67c`
- **Binding:** `DB` (configured in `wrangler.toml`)

## 🛠️ Available Commands

### Development
```bash
npm run dev          # Start development server with D1 binding
npm run dev:local    # Start Nuxt only (without wrangler - will fail without DB)
```

### Database Operations
```bash
npm run db:generate      # Generate Prisma client
npm run db:execute       # Execute SQL commands on remote D1
npm run db:execute:local # Execute SQL commands on local D1
npm run db:info          # Get database information
npm run db:query         # Interactive query mode
npm run db:setup:local   # Setup local D1 with schema and data
npm run db:reset:local   # Reset and recreate local D1 database
```

### Deployment
```bash
npm run build        # Build for production
npm run deploy       # Deploy to Cloudflare Pages
npm run deploy:full  # Build and deploy
```

## 🔧 Configuration Files

### `wrangler.toml`
```toml
[[d1_databases]]
binding = "DB"
database_name = "test-musms"
database_id = "496744f0-44cd-4e2e-8e9c-5f02a22ca67c"
preview_database_id = "DB"
```

### Database Connection (`server/utils/db.js`)
The application automatically connects to your D1 database using the `DB` binding. No environment variables needed for database connection.

## 🔍 Troubleshooting

### "D1 database binding not found"
- Ensure `wrangler.toml` is properly configured
- Run `npm run setup:d1` to verify configuration
- Make sure you're authenticated with Cloudflare: `npx wrangler auth login`

### "no such table: main.users" during development
- This means your local D1 database is empty
- Run `npm run db:setup:local` to create schema and add data
- Or run `npm run setup:d1` which does this automatically

### Development server issues
- Use `npm run dev` (with wrangler) instead of `npm run dev:local`
- Verify D1 database exists: `npm run db:info`

### Database queries failing
- Check database connectivity: `npm run db:execute -- --command="SELECT 1"`
- Verify database has tables: `npm run db:execute -- --command="SELECT name FROM sqlite_master WHERE type='table'"`

## 🎯 Migration from Local SQLite

The application has been migrated from dual-database setup (local SQLite + D1) to D1-only:

- ✅ Removed local SQLite dependency
- ✅ Updated database utility for D1-only usage
- ✅ Modified development workflow to use wrangler
- ✅ Updated scripts for D1 operations
- ✅ Removed local database files

All data is now stored in Cloudflare D1, providing consistent behavior across all environments. 