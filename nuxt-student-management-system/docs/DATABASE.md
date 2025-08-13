# 🗄️ Database Documentation

Complete guide to understanding and managing the Cloudflare D1 database setup.

## 🏗️ Database Architecture

### **Cloudflare D1 Overview**
This project uses **Cloudflare D1**, a serverless SQLite database that runs on Cloudflare's edge network.

### **Key Benefits**
- ⚡ **Fast**: Sub-millisecond queries from any location
- 🌍 **Global**: Automatically replicated worldwide
- 💰 **Cost-effective**: Pay per request, generous free tier
- 🔒 **Secure**: Built-in encryption and access controls
- 🛠️ **SQL Compatible**: Standard SQLite syntax

## 🔀 Local vs Remote Databases

### **Critical Understanding**: They are SEPARATE databases!

```
┌─────────────────────────────────────────────────────────────┐
│                    Database Environment                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🏠 LOCAL DATABASE                ☁️  REMOTE DATABASE        │
│  ├─ Location: .wrangler/state/    ├─ Location: Cloudflare   │
│  │  ├─ v3/d1/[hash].sqlite       │            Cloud         │
│  │  └─ Your computer             │                          │
│  ├─ Purpose: Development         ├─ Purpose: Production     │
│  ├─ Command: --local             ├─ Command: --remote       │
│  ├─ Speed: Instant               ├─ Speed: Network latency  │
│  ├─ Data: Independent            ├─ Data: Independent       │
│  └─ Persistence: Until deleted   └─ Persistence: Permanent  │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

### **Why Separate?**
1. **🔒 Safety**: Local changes can't break production
2. **⚡ Performance**: Local development is instant
3. **🧪 Testing**: Safe to experiment with destructive operations
4. **🌐 Offline**: Develop without internet connection

### **Important Implications**
- Changes to local DB **do NOT** affect remote DB
- Changes to remote DB **do NOT** affect local DB  
- You must manually sync data between environments
- Schema changes need to be applied to both

## 📊 Database Schema

### **Core Tables**

#### **users**
Primary authentication and user management table.

```sql
CREATE TABLE users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE NOT NULL,
  passwordHash TEXT NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('ADMIN', 'TEACHER', 'STUDENT')),
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
```

#### **students**
Student-specific information and academic records.

```sql
CREATE TABLE students (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId TEXT UNIQUE NOT NULL,
  firstName TEXT NOT NULL,
  lastName TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  phone TEXT,
  dateOfBirth DATETIME,
  address TEXT,
  enrollmentDate DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  isActive BOOLEAN NOT NULL DEFAULT true,
  userId INTEGER,
  createdBy INTEGER NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (userId) REFERENCES users(id),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

#### **courses**
Course catalog and management.

```sql
CREATE TABLE courses (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  credits INTEGER NOT NULL DEFAULT 3,
  instructorId INTEGER,
  isActive BOOLEAN NOT NULL DEFAULT true,
  createdBy INTEGER NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (instructorId) REFERENCES users(id),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

#### **grades**
Student performance tracking.

```sql
CREATE TABLE grades (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL,
  courseId INTEGER NOT NULL,
  score DECIMAL(5,2) NOT NULL,
  examType TEXT NOT NULL CHECK (examType IN ('MIDTERM', 'FINAL', 'QUIZ', 'ASSIGNMENT')),
  examDate DATETIME NOT NULL,
  createdBy INTEGER NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (courseId) REFERENCES courses(id),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

#### **enrollments**
Student-course relationships.

```sql
CREATE TABLE enrollments (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  studentId INTEGER NOT NULL,
  courseId INTEGER NOT NULL,
  enrolledAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  completedAt DATETIME,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'DROPPED')),
  finalGrade DECIMAL(5,2),
  createdBy INTEGER NOT NULL,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(studentId, courseId),
  FOREIGN KEY (studentId) REFERENCES students(id),
  FOREIGN KEY (courseId) REFERENCES courses(id),
  FOREIGN KEY (createdBy) REFERENCES users(id)
);
```

### **Relationships**
```
users (1) ──→ (n) students [userId]
users (1) ──→ (n) courses [instructorId]
students (n) ──→ (n) courses [enrollments]
students (1) ──→ (n) grades [studentId]
courses (1) ──→ (n) grades [courseId]
users (1) ──→ (n) * [createdBy] (audit trail)
```

## 🛠️ Database Operations

### **Setup Commands**

#### **Initial Setup (New Project)**
```bash
# Setup everything (recommended)
npm run setup:d1

# Manual setup
npx wrangler auth login
npx wrangler d1 create test-musms
# Update wrangler.toml with database ID
npm run db:setup:local
```

#### **Reset Local Database**
```bash
npm run db:reset:local
```

#### **Generate Prisma Client**
```bash
npm run db:generate
```

### **Data Management Commands**

#### **Execute SQL Files**
```bash
# Local database
npm run db:execute:local -- --file=migrations/001_initial_schema.sql

# Remote database  
npm run db:execute -- --file=migrations/001_initial_schema.sql
```

#### **Execute SQL Commands**
```bash
# Local database
npx wrangler d1 execute test-musms --command="SELECT * FROM users;" --local

# Remote database
npx wrangler d1 execute test-musms --command="SELECT * FROM users;" --remote
```

#### **Database Information**
```bash
# Get database info
npm run db:info

# List all D1 databases
npx wrangler d1 list

# Database schema inspection
npx wrangler d1 execute test-musms --command="SELECT name FROM sqlite_master WHERE type='table';" --local
```

### **Migration Management**

#### **Apply Migrations**
```bash
# Apply to both environments
./scripts/deploy-d1.sh

# Apply to local only
npm run db:setup:local

# Apply to remote only
npm run db:execute -- --file=migrations/001_initial_schema.sql
npm run db:execute -- --file=migrations/002_seed_demo_data.sql
```

#### **Create New Migration**
```bash
# 1. Create new migration file
touch migrations/003_add_new_feature.sql

# 2. Write SQL changes
cat > migrations/003_add_new_feature.sql << 'EOF'
-- Add new column to students table
ALTER TABLE students ADD COLUMN middleName TEXT;

-- Create new index
CREATE INDEX idx_students_middleName ON students(middleName);
EOF

# 3. Apply migration
npx wrangler d1 execute test-musms --file=migrations/003_add_new_feature.sql --local
npx wrangler d1 execute test-musms --file=migrations/003_add_new_feature.sql --remote
```

### **Data Synchronization**

#### **Export Data**
```bash
# Export from remote to local
npx wrangler d1 export test-musms --output=backup-remote.sql --remote
npx wrangler d1 execute test-musms --file=backup-remote.sql --local

# Export from local to remote (dangerous!)
npx wrangler d1 export test-musms --output=backup-local.sql --local
npx wrangler d1 execute test-musms --file=backup-local.sql --remote
```

#### **Backup and Restore**
```bash
# Create backup
npx wrangler d1 export test-musms --output=backup-$(date +%Y%m%d).sql --remote

# Restore backup
npx wrangler d1 execute test-musms --file=backup-20240101.sql --remote
```

## 🔧 Connection Configuration

### **Prisma Configuration**

#### **schema.prisma**
```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = "file:./placeholder.db"
}
```

#### **Database Connection (server/utils/db.js)**
```javascript
import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

let prisma = null

export function getPrisma(env) {
  if (prisma) return prisma

  if (!env?.DB) {
    throw new Error('D1 database binding not found')
  }

  const adapter = new PrismaD1(env.DB)
  prisma = new PrismaClient({ adapter })
  return prisma
}

export function getDB(event) {
  const env = event?.context?.cloudflare?.env
  return getPrisma(env)
}
```

### **Wrangler Configuration**

#### **wrangler.toml**
```toml
name = "test-musms"
compatibility_date = "2024-04-05"

[[d1_databases]]
binding = "DB"
database_name = "test-musms"
database_id = "your-database-id-here"
```

## 🐛 Troubleshooting

### **Common Issues**

#### **"no such table: main.users"**
**Cause**: Database schema not applied
```bash
# Fix:
npm run db:setup:local
# or
./scripts/setup-d1.sh
```

#### **"D1 database binding not found"**
**Cause**: Missing wrangler.toml or incorrect binding
```bash
# Check wrangler.toml exists and has correct database_id
cat wrangler.toml

# Verify D1 database exists
npx wrangler d1 list

# Test binding
npm run health
```

#### **"DateTime conversion error"**
**Cause**: Date format mismatch (YYYY-MM-DD vs YYYY-MM-DD HH:MM:SS)
```bash
# Fix:
./scripts/fix-datetime-formats.sh
```

#### **"wrangler command not found"**
```bash
# Install globally
npm install -g wrangler

# Or use npx
npx wrangler --version
```

#### **"Unauthorized" wrangler errors**
```bash
# Re-authenticate
npx wrangler auth login

# Verify authentication
npx wrangler whoami
```

### **Health Checks**

#### **Database Connectivity**
```bash
# Test local database
npx wrangler d1 execute test-musms --command="SELECT 1;" --local

# Test remote database
npx wrangler d1 execute test-musms --command="SELECT 1;" --remote

# Application health check
curl http://localhost:3000/api/health | jq
```

#### **Data Integrity**
```bash
# Count records
npx wrangler d1 execute test-musms --command="
  SELECT 
    (SELECT COUNT(*) FROM users) as users,
    (SELECT COUNT(*) FROM students) as students,
    (SELECT COUNT(*) FROM courses) as courses,
    (SELECT COUNT(*) FROM grades) as grades;
" --local
```

### **Performance Monitoring**

#### **Query Performance**
```bash
# Explain query plans
npx wrangler d1 execute test-musms --command="
  EXPLAIN QUERY PLAN 
  SELECT s.*, u.username 
  FROM students s 
  JOIN users u ON s.userId = u.id;
" --local
```

#### **Database Size**
```bash
# Check database size and table info
npx wrangler d1 execute test-musms --command="
  SELECT 
    name,
    type,
    sql 
  FROM sqlite_master 
  WHERE type IN ('table', 'index')
  ORDER BY type, name;
" --local
```

## 📚 Best Practices

### **Development Workflow**
1. **Always work locally first**: Develop and test on local database
2. **Apply migrations consistently**: Use scripts to ensure both environments have same schema
3. **Backup before changes**: Export data before major modifications
4. **Test in both environments**: Verify functionality works in both local and remote

### **Data Management**
1. **Use transactions**: For operations affecting multiple tables
2. **Validate constraints**: Let the database enforce data integrity
3. **Index strategically**: Add indexes for frequently queried columns
4. **Monitor performance**: Use EXPLAIN QUERY PLAN for optimization

### **Security**
1. **Validate input**: Always sanitize user input before queries
2. **Use parameterized queries**: Prisma handles this automatically
3. **Limit access**: Use role-based permissions in application logic
4. **Audit changes**: Track who made what changes with createdBy fields

### **Deployment**
1. **Test locally**: Ensure all changes work in local environment
2. **Apply migrations**: Update remote database schema
3. **Deploy application**: Update application code
4. **Verify deployment**: Check health endpoints and functionality

---

For more information:
- [Main README](../README.md)
- [API Documentation](API.md)
- [Scripts Documentation](../scripts/README.md) 