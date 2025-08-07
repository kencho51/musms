# 🗄️ Database Configuration Guide

This document explains how the Student Management System automatically switches between local SQLite and Cloudflare D1 databases based on the environment.

## 🔄 Automatic Environment Detection

The application automatically detects the environment and uses the appropriate database:

### 🔧 **Development Environment**
- **Condition**: `NODE_ENV !== "production"`  
- **Database**: Local SQLite file (`file:./prisma/dev.db`)
- **Location**: `./prisma/dev.db` in your project directory
- **Use Case**: Local development, testing, debugging

### ☁️ **Production Environment**  
- **Condition**: `NODE_ENV === "production"`
- **Database**: Cloudflare D1 (`test-musms`)
- **Location**: Cloudflare's edge network
- **Use Case**: Live deployment on Cloudflare Pages

## 🛠️ Implementation Details

### Database Utility (`server/utils/db.js`)

```javascript
export function getPrisma(env) {
  if (prisma) return prisma

  // Development: Use local SQLite file
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Using local SQLite database (file:./prisma/dev.db)')
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./prisma/dev.db'
        }
      }
    })
    return prisma
  }

  // Production: Use Cloudflare D1
  console.log('☁️ Using Cloudflare D1 database (test-musms)')
  const adapter = new PrismaD1(env.DB)
  prisma = new PrismaClient({ adapter })
  
  return prisma
}
```

### Environment Variables

**Development (.env)**:
```env
NODE_ENV="development"
DATABASE_URL="file:./prisma/dev.db"
JWT_SECRET="your-dev-secret"
```

**Production (Cloudflare Pages)**:
```env
NODE_ENV="production"
JWT_SECRET="your-production-secret"
# D1 binding is automatically provided as env.DB
```

## 📋 Setup Instructions

### 🔧 **Local Development Setup**

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Setup local database**:
   ```bash
   npm run db:generate  # Generate Prisma client
   npm run db:push      # Create tables
   npm run db:seed      # Add demo data
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```

4. **Verify database location**:
   ```bash
   ls -la prisma/dev.db  # Should exist with data
   ```

### ☁️ **Production Setup**

1. **Deploy D1 database**:
   ```bash
   npm run deploy:d1    # Creates and seeds D1 database
   ```

2. **Deploy application**:
   ```bash
   npm run build
   npm run deploy
   ```

3. **Configure D1 binding** in Cloudflare Pages:
   - Variable name: `DB`
   - D1 database: `test-musms`

4. **Set environment variables** in Cloudflare Pages:
   ```
   JWT_SECRET=your-production-secret
   ```

## 🧪 Testing Configuration

Run the test script to verify environment detection:

```bash
node scripts/test-db-config.js
```

**Expected Output**:
```
🔧 Testing Development Environment:
✅ Would use: Local SQLite database (file:./prisma/dev.db)

☁️ Testing Production Environment:  
✅ Would use: Cloudflare D1 database (test-musms)
```

## 🔍 Verification Commands

### **Development Database**
```bash
# Check local database
npm run db:studio

# View tables
sqlite3 prisma/dev.db ".tables"

# Check users
sqlite3 prisma/dev.db "SELECT username, role FROM users;"
```

### **Production Database**
```bash
# Check D1 database
npx wrangler d1 execute test-musms --command="SELECT username, role FROM users;" --remote

# List tables
npx wrangler d1 execute test-musms --command="SELECT name FROM sqlite_master WHERE type='table';" --remote

# Export backup
npx wrangler d1 export test-musms --output=backup.sql
```

## 🚀 Deployment Workflow

### **Development to Production**

1. **Develop locally** (uses `file:./prisma/dev.db`)
2. **Test features** with local SQLite
3. **Deploy D1 database** with `npm run deploy:d1`
4. **Deploy application** with `npm run deploy`
5. **Production runs** with Cloudflare D1 automatically

### **Schema Updates**

1. **Update Prisma schema** (`prisma/schema.prisma`)
2. **Test locally**:
   ```bash
   npm run db:push    # Apply to local SQLite
   npm run dev        # Test changes
   ```
3. **Generate migration**:
   ```bash
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migrations/003_your_changes.sql
   ```
4. **Deploy to D1**:
   ```bash
   npx wrangler d1 execute test-musms --file=migrations/003_your_changes.sql --remote
   ```

## 🔧 Configuration Files

### **wrangler.toml**
```toml
[[d1_databases]]
binding = "DB"
database_name = "test-musms"  
database_id = "your-database-id"
preview_database_id = "DB"
```

### **nuxt.config.ts**
```typescript
export default defineNuxtConfig({
  nitro: {
    preset: 'cloudflare-pages',
    experimental: { wasm: true }
  },
  modules: ['nitro-cloudflare-dev']
})
```

## ⚠️ Important Notes

- **Automatic Switching**: No manual configuration needed - environment detection is automatic
- **D1 Binding**: Must be named `DB` in both code and Cloudflare Pages settings
- **Environment Variables**: `NODE_ENV` is automatically set by Nuxt (dev) and Cloudflare (production)
- **Data Isolation**: Development and production databases are completely separate
- **Backup Strategy**: Export D1 data regularly using `wrangler d1 export`

## 🐛 Troubleshooting

### **Development Issues**
- **Database not found**: Run `npm run db:push`
- **No data**: Run `npm run db:seed`
- **Wrong database**: Check `NODE_ENV` is not set to "production"

### **Production Issues**  
- **D1 binding error**: Verify `DB` binding in Cloudflare Pages
- **Database not found**: Check `database_id` in `wrangler.toml`
- **Migration failed**: Verify SQL syntax in migration files

### **Environment Detection**
- **Wrong database used**: Check console logs for database selection
- **NODE_ENV issues**: Verify environment variable in deployment settings 