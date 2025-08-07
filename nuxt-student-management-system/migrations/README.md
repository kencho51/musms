# 🗄️ Database Migrations for Cloudflare D1

This directory contains SQL migration files for setting up the Student Management System database on Cloudflare D1.

## 📁 Migration Files

### `001_initial_schema.sql`
- Creates all database tables (users, students, courses, grades, enrollments, activity_logs, settings)
- Sets up foreign key relationships
- Creates unique indexes for optimal performance
- Generated from Prisma schema

### `002_seed_demo_data.sql`
- Inserts demo users with proper bcrypt-hashed passwords
- Creates sample courses, students, enrollments, and grades
- Adds sample activity logs and system settings
- Provides test data for development and testing

## 🚀 Deployment Instructions

### 1. **Create D1 Database**

```bash
# Login to Cloudflare
wrangler login

# Create a new D1 database
wrangler d1 create student-management-db

# Note the database ID from the output
```

### 2. **Update wrangler.toml**

Update your `wrangler.toml` with the database ID:

```toml
[[d1_databases]]
binding = "DB"
database_name = "student-management-db"
database_id = "your-database-id-here"
preview_database_id = "DB"
```

### 3. **Apply Schema Migration**

```bash
# Apply the initial schema
wrangler d1 execute student-management-db --file=migrations/001_initial_schema.sql

# Verify tables were created
wrangler d1 execute student-management-db --command="SELECT name FROM sqlite_master WHERE type='table';"
```

### 4. **Seed Demo Data**

```bash
# Apply the seed data
wrangler d1 execute student-management-db --file=migrations/002_seed_demo_data.sql

# Verify data was inserted
wrangler d1 execute student-management-db --command="SELECT username, role FROM users;"
```

### 5. **Deploy Application**

```bash
# Build the application
npm run build

# Deploy to Cloudflare Pages
npm run deploy
```

## 🔧 Local Development

For local development, the application automatically uses SQLite:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to local SQLite
npm run db:push

# Seed local database
npm run db:seed

# Start development server
npm run dev
```

## 📝 Demo Credentials

After seeding, you can login with these accounts:

| Role | Username | Password |
|------|----------|----------|
| **Admin** | `admin` | `admin123` |
| **Teacher** | `teacher` | `teacher123` |
| **Student** | `student` | `student123` |

## 🔄 Schema Updates

When updating the Prisma schema:

1. **Generate new migration**:
   ```bash
   npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migrations/003_your_changes.sql
   ```

2. **Apply to D1**:
   ```bash
   wrangler d1 execute student-management-db --file=migrations/003_your_changes.sql
   ```

3. **Update local database**:
   ```bash
   npm run db:push
   ```

## 🛠️ Useful Commands

### **Database Inspection**

```bash
# List all tables
wrangler d1 execute student-management-db --command="SELECT name FROM sqlite_master WHERE type='table';"

# Check users table
wrangler d1 execute student-management-db --command="SELECT id, username, email, role FROM users;"

# Check table schema
wrangler d1 execute student-management-db --command="PRAGMA table_info(users);"
```

### **Data Management**

```bash
# Count records in each table
wrangler d1 execute student-management-db --command="
SELECT 'users' as table_name, COUNT(*) as count FROM users
UNION SELECT 'students', COUNT(*) FROM students  
UNION SELECT 'courses', COUNT(*) FROM courses
UNION SELECT 'grades', COUNT(*) FROM grades;"

# Reset database (⚠️ DESTRUCTIVE)
wrangler d1 execute student-management-db --command="DROP TABLE IF EXISTS users;"
# Then re-run migrations
```

### **Backup & Restore**

```bash
# Export database to SQL file
wrangler d1 export student-management-db --output=backup.sql

# Import from SQL file (if needed)
wrangler d1 execute student-management-db --file=backup.sql
```

## 🔗 Related Documentation

- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Wrangler CLI Reference](https://developers.cloudflare.com/workers/wrangler/)
- [Prisma D1 Guide](https://www.prisma.io/docs/guides/database/cloudflare-d1)
- [Cloudflare Pages Deployment](https://developers.cloudflare.com/pages/)

## 🚨 Important Notes

- **Production Safety**: Always test migrations on a development database first
- **Backup**: Export your database before applying major schema changes
- **Environment Variables**: Ensure `JWT_SECRET` is set in Cloudflare Pages environment
- **Database Binding**: The binding name `DB` must match in both `wrangler.toml` and your application code

## 🐛 Troubleshooting

### **Migration Fails**
- Check SQL syntax in migration files
- Verify database ID in `wrangler.toml`
- Ensure you're authenticated with `wrangler login`

### **Authentication Issues**
- Verify password hashes are correctly generated
- Check JWT secret is set in environment variables
- Confirm users table has proper indexes

### **Connection Issues**
- Verify D1 binding is configured in Pages
- Check `process.env.NODE_ENV` is 'production' in Cloudflare environment
- Ensure Prisma client is generated with D1 adapter support 