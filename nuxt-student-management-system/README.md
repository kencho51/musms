# 🎓 Student Management System

A modern, full-stack Student Management System built with **Nuxt 4** and deployed on **Cloudflare Pages** with **D1 database**.

## ✨ Features

- 🔐 **Authentication** - JWT-based auth with role-based access control (Admin, Teacher, Student)
- 👥 **User Management** - Complete CRUD operations for users
- 🎓 **Student Management** - Student profiles and academic tracking
- 📚 **Course Management** - Course creation and management
- 📊 **Grade Management** - Grade recording and analytics
- 🎨 **Modern UI** - Responsive design with Tailwind CSS
- ☁️ **Cloud-First** - Built for Cloudflare Pages with D1 database

## 🚀 Tech Stack

- **Frontend & Backend**: [Nuxt 4](https://nuxt.com/) (Full-stack framework)
- **Database**: [Cloudflare D1](https://developers.cloudflare.com/d1/) (SQLite-compatible)
- **ORM**: [Prisma](https://www.prisma.io/) with D1 adapter
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Deployment**: [Cloudflare Pages](https://pages.cloudflare.com/)
- **Language**: JavaScript (minimal TypeScript)

## 🛠️ Local Development

### Prerequisites
- Node.js 18+
- Wrangler CLI (`npm install -g wrangler`)

### Setup

1. **Clone and install**:
```bash
git clone <your-repo>
cd nuxt-student-management-system
npm install
```

2. **Environment setup**:
```bash
# Create .env file
cp .env.example .env
# Edit .env with your values
```

3. **Database setup**:
```bash
# Generate Prisma client
npm run db:generate

# Create local database
npm run db:push

# Seed with demo data
npm run db:seed
```

4. **Start development server**:
```bash
npm run dev
```

Visit `http://localhost:3000`

### Demo Credentials
- **Admin**: `admin` / `admin123`
- **Teacher**: `teacher` / `teacher123`
- **Student**: `student` / `student123`

## ☁️ Cloudflare Deployment

### 1. Create D1 Database

```bash
# Login to Cloudflare
wrangler login

# Create D1 database
wrangler d1 create student-management-db

# Update wrangler.toml with your database ID
```

### 2. Deploy to Pages

#### Option A: Using Wrangler (Direct Upload)
```bash
# Build for production
npm run build

# Deploy to Pages
npm run deploy
```

#### Option B: Git Integration
1. Push code to GitHub
2. Connect repository in [Cloudflare Pages dashboard](https://dash.cloudflare.com/pages)
3. Configure build settings:
   - **Build command**: `npm run build`
   - **Build output**: `dist`
   - **Framework preset**: Nuxt.js

### 3. Configure D1 Binding

In Cloudflare Pages dashboard:
1. Go to your Pages project
2. Settings → Functions
3. Add D1 database binding:
   - **Variable name**: `DB`
   - **D1 database**: Select your database

### 4. Set Environment Variables

In Pages dashboard → Settings → Environment variables:
```
JWT_SECRET=your-production-secret-key
```

### 5. Run Database Migrations

```bash
# Apply schema to D1
wrangler d1 execute student-management-db --file=./prisma/migrations/001_init/migration.sql

# Or generate migration
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > migration.sql
wrangler d1 execute student-management-db --file=migration.sql
```

## 📁 Project Structure

```
nuxt-student-management-system/
├── app/                      # Nuxt app directory
│   ├── components/           # Vue components
│   ├── layouts/             # App layouts
│   ├── pages/               # File-based routes
│   ├── stores/              # Pinia stores
│   ├── utils/               # Utility functions
│   └── app.vue              # Root component
├── server/                  # Nitro server
│   └── api/                 # API routes
├── prisma/                  # Database schema & migrations
├── wrangler.toml            # Cloudflare configuration
└── nuxt.config.ts           # Nuxt configuration
```

## 🔧 Key Files

- **`wrangler.toml`** - Cloudflare D1 database binding configuration
- **`nuxt.config.ts`** - Nuxt config with Cloudflare Pages preset
- **`app/utils/db.js`** - Database connection utility (handles both local SQLite and D1)
- **`prisma/schema.prisma`** - Database schema with D1 adapter support

## 📚 API Routes

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration

### Users (Admin only)
- `GET /api/users` - List users
- `POST /api/users` - Create user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Students
- `GET /api/students` - List students
- `POST /api/students` - Create student
- `PUT /api/students/[id]` - Update student
- `DELETE /api/students/[id]` - Delete student

### Courses
- `GET /api/courses` - List courses
- `POST /api/courses` - Create course
- `PUT /api/courses/[id]` - Update course
- `DELETE /api/courses/[id]` - Delete course

### Grades
- `GET /api/grades` - List grades
- `POST /api/grades` - Create grade
- `PUT /api/grades/[id]` - Update grade
- `DELETE /api/grades/[id]` - Delete grade

## 🧪 Development Commands

```bash
# Development
npm run dev                  # Start dev server
npm run build               # Build for production
npm run preview             # Preview production build

# Database
npm run db:generate         # Generate Prisma client
npm run db:push            # Push schema to database
npm run db:seed            # Seed with demo data
npm run db:studio          # Open Prisma Studio
npm run db:reset           # Reset and seed database

# Deployment
npm run deploy             # Deploy to Cloudflare Pages
npm run cf:dev             # Test with Cloudflare D1 locally
```

## 🔗 Useful Links

- [Nuxt 4 Documentation](https://nuxt.com/)
- [Cloudflare Pages Documentation](https://developers.cloudflare.com/pages/)
- [Cloudflare D1 Documentation](https://developers.cloudflare.com/d1/)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## 📄 License

MIT License
