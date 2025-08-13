# 🎓 Student Management System

A modern, full-stack student management system built with **Nuxt 4**, **Cloudflare D1**, and **TypeScript**. Features role-based access control, real-time data management, and a responsive UI.

## ✨ Features

- **👥 User Management** - Role-based access (Admin, Teacher, Student)
- **🎓 Student Records** - Comprehensive academic information management
- **📚 Course Management** - Create and manage academic programs
- **📊 Grade Tracking** - Academic performance monitoring
- **🔐 Authentication** - Secure JWT-based auth system
- **🌙 Dark Mode** - Full dark/light theme support
- **📱 Responsive** - Works on all device sizes
- **☁️ Cloud-Native** - Built for Cloudflare ecosystem

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account (free tier works)
- Git

### 1. **Setup Project**

```bash
git clone <repository-url>
cd nuxt-student-management-system
npm install
```

### 2. **Configure Cloudflare D1**

```bash
# Login to Cloudflare
npx wrangler auth login

# Setup D1 database
npm run setup:d1
```

### 3. **Development**

```bash
# Start development server (with D1 integration)
npm run dev

# Or start without Cloudflare integration
npm run dev:local
```

### 4. **Access the Application**

- **Local**: http://localhost:3000
- **Demo Credentials**:
  - Admin: `admin` / `admin123`
  - Teacher: `teacher` / `teacher123`
  - Student: `student` / `student123`

## 🏗️ Architecture

### **Database Strategy**

This project uses **Cloudflare D1** (SQLite) for all environments:

```
┌─────────────────────────────────────────┐
│              D1 Architecture            │
├─────────────────────────────────────────┤
│  🏠 Local Dev     ☁️ Production         │
│  ├─ .wrangler/    ├─ Cloudflare Cloud   │
│  ├─ SQLite file   ├─ Distributed DB     │
│  └─ --local flag  └─ --remote flag      │
│                                         │
│  ⚠️  Databases are SEPARATE             │
│      Changes don't sync automatically   │
└─────────────────────────────────────────┘
```

**Important**: Local and remote databases are independent. Apply changes to both:

```bash
# Apply to local
npx wrangler d1 execute test-musms --file=migration.sql --local

# Apply to remote  
npx wrangler d1 execute test-musms --file=migration.sql --remote
```

### **Tech Stack**

- **Frontend**: Nuxt 4, Vue 3, TypeScript, Tailwind CSS
- **Backend**: Nitro, Cloudflare Functions
- **Database**: Cloudflare D1 (SQLite)
- **ORM**: Prisma with D1 adapter
- **Auth**: Custom JWT implementation (Web Crypto API)
- **Deployment**: Cloudflare Pages

## 📁 Project Structure

```
nuxt-student-management-system/
├── 📱 app/                    # Frontend application
│   ├── components/           # Vue components
│   ├── layouts/              # App layouts
│   ├── pages/                # File-based routes
│   ├── stores/               # Pinia state management
│   └── types/                # TypeScript definitions
├── 🔧 server/                # Backend API
│   ├── api/                  # API endpoints
│   │   ├── auth/            # Authentication
│   │   ├── users/           # User management
│   │   ├── students/        # Student records
│   │   ├── courses/         # Course management
│   │   ├── grades/          # Grade tracking
│   │   └── health.get.ts    # System health check
│   └── utils/               # Server utilities
│       ├── db.js            # Database connection
│       ├── jwt.js           # JWT handling
│       └── crypto.js        # Cryptography
├── 🗄️ migrations/            # Database migrations
│   ├── 001_initial_schema.sql
│   └── 002_seed_demo_data.sql
├── 🛠️ scripts/               # Utility scripts
│   ├── deploy-d1.sh         # Deploy database
│   └── fix-datetime-formats.sh
├── ⚙️ prisma/                # Database schema
│   └── schema.prisma        # Prisma schema
└── 📄 docs/                  # Documentation
    └── API.md               # API documentation
```

## 🔌 API Reference

### **Authentication**
```http
POST /api/auth/login      # User login
POST /api/auth/register   # User registration
GET  /api/auth/me         # Get current user
POST /api/auth/logout     # User logout
```

### **Users** (Admin only)
```http
GET    /api/users         # List users
POST   /api/users         # Create user
PUT    /api/users/[id]    # Update user
DELETE /api/users/[id]    # Delete user
```

### **Students** (Admin/Teacher)
```http
GET    /api/students      # List students
POST   /api/students      # Create student
PUT    /api/students/[id] # Update student
DELETE /api/students/[id] # Delete student
```

### **Courses** (Admin/Teacher)
```http
GET    /api/courses       # List courses
POST   /api/courses       # Create course
PUT    /api/courses/[id]  # Update course
DELETE /api/courses/[id]  # Delete course
```

### **Grades** (Admin/Teacher)
```http
GET    /api/grades        # List grades
POST   /api/grades        # Create grade
PUT    /api/grades/[id]   # Update grade
DELETE /api/grades/[id]   # Delete grade
```

### **System**
```http
GET /api/health           # System health check
```

## 🚀 Deployment

### **Cloudflare Pages Deployment**

1. **Connect GitHub Repository**
   - Go to Cloudflare Pages dashboard
   - Connect your GitHub repository
   - Set build command: `npm run build`
   - Set output directory: `dist`

2. **Configure D1 Database Binding**
   ```
   Variable name: DB
   D1 database: test-musms
   ```

3. **Set Environment Variables**
   ```env
   NODE_ENV=production
   JWT_SECRET=your-production-secret-key-min-32-chars
   ```

4. **Deploy Database**
   ```bash
   npm run deploy:d1
   ```

### **Manual Deployment**
```bash
# Build and deploy
npm run build
npm run deploy

# Or deploy everything
npm run deploy:full
```

## 🔧 Development Commands

### **Database Management**
```bash
# Setup D1 database
npm run setup:d1

# Execute SQL on local DB
npm run db:execute:local -- --file=query.sql

# Execute SQL on remote DB  
npm run db:execute -- --file=query.sql

# Reset local database
npm run db:reset:local

# Get database info
npm run db:info
```

### **Development**
```bash
# Start with Cloudflare integration
npm run dev

# Start without Cloudflare
npm run dev:local

# Build for production
npm run build

# Preview production build
npm run preview
```

### **Maintenance**
```bash
# Fix DateTime format issues
chmod +x scripts/fix-datetime-formats.sh
./scripts/fix-datetime-formats.sh

# Health check
curl http://localhost:3000/api/health | jq
```

## 🐛 Troubleshooting

### **Common Issues**

#### "no such table: main.users"
- **Cause**: Local D1 database not initialized
- **Fix**: `npm run db:setup:local`

#### "persistedState is not defined"
- **Cause**: Pinia store persistence issue
- **Fix**: Clear `.nuxt` cache and restart

#### "DateTime conversion error"
- **Cause**: Date format mismatch in database
- **Fix**: Run `./scripts/fix-datetime-formats.sh`

#### Login returns 500 error
- **Cause**: Missing D1 binding or JWT secret
- **Fix**: Configure D1 binding and JWT_SECRET in Cloudflare Pages

### **Health Check**

Monitor system health at `/api/health`:

```json
{
  "status": "healthy",
  "checks": {
    "database": { "status": "healthy" },
    "jwt": { "status": "healthy" },
    "auth": { "status": "no_token" }
  }
}
```

## 📝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make changes and test thoroughly
4. Commit: `git commit -m "Add new feature"`
5. Push: `git push origin feature/new-feature`
6. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 🙏 Acknowledgments

- Built with [Nuxt 4](https://nuxt.com/)
- Powered by [Cloudflare D1](https://developers.cloudflare.com/d1/)
- UI components inspired by [Tailwind UI](https://tailwindui.com/)

---

For detailed API documentation, see [docs/API.md](docs/API.md)
