# 🚀 Cloudflare Pages Deployment Guide

This guide will help you deploy the Student Management System to Cloudflare Pages with proper D1 database configuration.

## ⚠️ Current Issue

If you're seeing login errors on production ([https://22ddcd8f.musms.pages.dev](https://22ddcd8f.musms.pages.dev)), it's likely due to missing D1 database binding configuration.

## 🔧 Step-by-Step Fix

### 1. **Configure D1 Database Binding in Cloudflare Pages**

1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to **Pages** → Your project (`musms`)
3. Go to **Settings** → **Functions**
4. Scroll down to **D1 database bindings**
5. Click **Add binding**
6. Configure:
   - **Variable name**: `DB`
   - **D1 database**: `test-musms`
7. Click **Save**

### 2. **Set Environment Variables**

In Cloudflare Pages **Settings** → **Environment variables**, add:

```env
NODE_ENV=production
JWT_SECRET=your-production-secret-key-32-chars-min
```

### 3. **Verify Database Has Data**

Run locally to confirm production database has users:

```bash
npx wrangler d1 execute test-musms --command="SELECT username, role FROM users;" --remote
```

Should show:
```
┌──────────┬─────────┐
│ username │ role    │
├──────────┼─────────┤
│ admin    │ ADMIN   │
│ teacher  │ TEACHER │
│ student  │ STUDENT │
└──────────┴─────────┘
```

### 4. **Test Database Connection**

After configuring the binding, test at:
```
https://your-deployment.pages.dev/api/debug/db-test
```

Expected response:
```json
{
  "success": true,
  "message": "D1 database connection successful",
  "test_result": { "test": 1 },
  "environment": "production"
}
```

### 5. **Redeploy Application**

After configuring the D1 binding:

```bash
npm run build
npm run deploy
```

Or trigger a redeploy from Cloudflare Pages dashboard.

## 🐛 Troubleshooting

### Login Returns 500 Error

**Cause**: D1 binding not configured
**Solution**: Follow step 1 above to add D1 binding

### "D1 database binding not found"

**Check**: Visit `/api/debug/db-test` endpoint
**If missing**: Add D1 binding with variable name `DB`

### Invalid/Missing JWT Secret

**Cause**: `JWT_SECRET` environment variable not set
**Solution**: Add to environment variables (min 32 characters)

### Database Empty

**Check**: Run `npx wrangler d1 execute test-musms --command="SELECT COUNT(*) FROM users;" --remote`
**If 0**: Run database setup:

```bash
npx wrangler d1 execute test-musms --file=migrations/001_initial_schema.sql --remote
npx wrangler d1 execute test-musms --file=migrations/002_seed_demo_data.sql --remote
```

## ✅ Final Verification

1. **Database Test**: `https://your-domain.pages.dev/api/debug/db-test` → Should return success
2. **Login Test**: Try admin login at `https://your-domain.pages.dev/auth/login`
3. **API Test**: Check authenticated endpoints work

## 📋 Demo Credentials

- **Admin**: `admin` / `admin123`
- **Teacher**: `teacher` / `teacher123`  
- **Student**: `student` / `student123`

## 🔄 Deployment Commands

```bash
# Build for production
npm run build

# Deploy to Cloudflare Pages
npm run deploy

# Test production database
npm run db:execute -- --command="SELECT 1" --remote
```

---

**Note**: The D1 database binding is the most critical configuration. Without it, all database operations will fail in production. 