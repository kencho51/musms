# 🛠️ Utility Scripts

This directory contains maintenance and deployment scripts for the Student Management System.

## 📜 Available Scripts

### **🚀 Deployment Scripts**

#### `deploy-d1.sh`
**Purpose**: Deploy database schema and demo data to Cloudflare D1.

**Usage**:
```bash
chmod +x scripts/deploy-d1.sh
./scripts/deploy-d1.sh
```

**What it does**:
- Applies `001_initial_schema.sql` to create tables
- Applies `002_seed_demo_data.sql` to add demo users
- Verifies deployment success
- Works with both local (`--local`) and remote (`--remote`) databases

---

#### `setup-d1.sh`
**Purpose**: Complete D1 database setup for new developers.

**Usage**:
```bash
npm run setup:d1
# or directly:
chmod +x scripts/setup-d1.sh
./scripts/setup-d1.sh
```

**What it does**:
- Checks `wrangler.toml` configuration
- Tests D1 connectivity
- Sets up local database with schema and data
- Provides troubleshooting information

---

### **🔧 Maintenance Scripts**

#### `fix-datetime-formats.sh`
**Purpose**: Fix DateTime format inconsistencies in D1 database.

**Usage**:
```bash
chmod +x scripts/fix-datetime-formats.sh
./scripts/fix-datetime-formats.sh

# Options:
./scripts/fix-datetime-formats.sh local    # Fix local DB only
./scripts/fix-datetime-formats.sh remote   # Fix remote DB only
```

**What it does**:
- Updates `dateOfBirth` and `enrollmentDate` in `students` table
- Updates `examDate` in `grades` table  
- Converts `YYYY-MM-DD` to `YYYY-MM-DD HH:MM:SS` format
- Works on both local and remote databases

**Example Output**:
```
🔧 DateTime Format Fixer
📍 Fixing LOCAL database...
  🎓 Fixing students table...
  📊 Fixing grades table...
📍 Fixing REMOTE database...
  🎓 Fixing students table...
  📊 Fixing grades table...
✅ DateTime format fixes completed!
```

---

### **📝 Code Refactoring Scripts**

#### `fix-prisma-imports.sh`
**Purpose**: Update API endpoints to use centralized database connection.

**Usage**:
```bash
chmod +x scripts/fix-prisma-imports.sh
./scripts/fix-prisma-imports.sh
```

**What it does**:
- Replaces `import { PrismaClient }` with `import { getDB }`
- Removes `new PrismaClient()` declarations
- Adds `const prisma = getDB(event)` to event handlers
- Removes `$disconnect()` calls

---

#### `update-jwt-imports.sh`
**Purpose**: Update API endpoints to use Web Crypto API JWT implementation.

**Usage**:
```bash
chmod +x scripts/update-jwt-imports.sh
./scripts/update-jwt-imports.sh
```

**What it does**:
- Replaces `jsonwebtoken` imports with local JWT utilities
- Updates `jwt.sign()` to `signJWTFallback()`
- Updates `jwt.verify()` to `verifyJWTFallback()`
- Ensures Cloudflare Workers compatibility

---

## 🎯 Common Use Cases

### **New Developer Setup**
```bash
# 1. Setup D1 database
npm run setup:d1

# 2. Start development
npm run dev
```

### **Database Issues**
```bash
# Fix DateTime conversion errors
./scripts/fix-datetime-formats.sh

# Reset local database
npm run db:reset:local
npm run db:setup:local
```

### **Deployment**
```bash
# Deploy database changes
./scripts/deploy-d1.sh

# Build and deploy application
npm run build
npm run deploy
```

### **Code Refactoring**
```bash
# After major dependency changes
./scripts/fix-prisma-imports.sh
./scripts/update-jwt-imports.sh
```

## ⚠️ Important Notes

### **Database Separation**
- **Local database**: `.wrangler/state/v3/d1/` (SQLite file)
- **Remote database**: Cloudflare cloud infrastructure
- Scripts can target `local`, `remote`, or `both` environments

### **Script Permissions**
All scripts need execute permissions:
```bash
chmod +x scripts/*.sh
```

### **Error Handling**
Scripts include error checking and will:
- Show clear error messages
- Provide troubleshooting steps
- Exit gracefully on failures

### **Logging**
Scripts use emoji-based logging for clarity:
- 🔧 - Operations
- ✅ - Success
- ❌ - Errors
- 📍 - Status updates
- 🎓/📊 - Table-specific operations

## 🔍 Troubleshooting

### **"wrangler command not found"**
```bash
npm install -g wrangler
# or use npx:
npx wrangler --version
```

### **"no such table" errors**
```bash
# Reset and setup database
npm run db:reset:local
./scripts/setup-d1.sh
```

### **Permission denied**
```bash
chmod +x scripts/*.sh
```

### **D1 binding errors**
- Check `wrangler.toml` configuration
- Verify Cloudflare authentication: `npx wrangler auth login`
- Ensure D1 database exists: `npx wrangler d1 list`

---

For more information, see the main [README.md](../README.md) or [docs/API.md](../docs/API.md). 