# 🎓 Nuxt 4 Student Management System

A comprehensive Student Management System built with **Nuxt 4**, featuring modern UI components, authentication, data management, and real-time functionality.

## ✨ Features

### 🔐 **Authentication & Authorization**
- JWT-based authentication
- Role-based access control (Admin, Teacher, Student)
- Secure cookie management
- Protected routes and middleware

### 👥 **User Management**
- User registration and login
- Profile management
- Role-based permissions
- Admin user management interface

### 🎓 **Student Management**
- Student registration and profiles
- Academic information tracking
- Enrollment management
- Student search and filtering

### 📚 **Course Management**
- Course creation and editing
- Semester and year organization
- Instructor assignment
- Capacity management

### 📊 **Grade Management**
- Grade recording and calculation
- GPA tracking
- Multiple assessment types
- Grade analytics

### 📈 **Dashboard & Analytics**
- Real-time statistics
- Interactive charts
- Recent activity feeds
- Quick action buttons

### 🎨 **Modern UI/UX**
- Responsive design
- Dark/Light theme support
- Accessible components
- Smooth animations
- Toast notifications

## 🚀 Tech Stack

### **Frontend**
- **[Nuxt 4](https://nuxt.com/)** - The Intuitive Vue Framework
- **[Vue 3](https://vuejs.org/)** - Progressive JavaScript Framework
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Nuxt UI](https://ui.nuxt.com/)** - Beautiful & accessible components
- **[Pinia](https://pinia.vuejs.org/)** - State management
- **[VeeValidate](https://vee-validate.logaretm.com/)** - Form validation
- **[Chart.js](https://www.chartjs.org/)** - Interactive charts

### **Backend**
- **[Nitro](https://nitro.unjs.io/)** - Server engine
- **[Prisma](https://www.prisma.io/)** - Database ORM
- **[SQLite](https://www.sqlite.org/)** - Database (development)
- **[bcryptjs](https://www.npmjs.com/package/bcryptjs)** - Password hashing
- **[jsonwebtoken](https://www.npmjs.com/package/jsonwebtoken)** - JWT tokens

### **Development Tools**
- **[ESLint](https://eslint.org/)** - Code linting
- **[Vitest](https://vitest.dev/)** - Unit testing
- **[TypeScript](https://www.typescriptlang.org/)** - Type checking

## 📁 Project Structure

```
nuxt-student-management-system/
├── app/                          # Nuxt 4 app directory
│   ├── assets/                   # Static assets
│   │   ├── css/                  # Global styles
│   │   └── images/               # Images
│   ├── components/               # Vue components
│   │   ├── charts/               # Chart components
│   │   ├── forms/                # Form components
│   │   ├── layout/               # Layout components
│   │   └── ui/                   # UI components
│   ├── composables/              # Vue composables
│   ├── layouts/                  # Nuxt layouts
│   ├── middleware/               # Route middleware
│   ├── pages/                    # Application pages
│   │   ├── auth/                 # Authentication pages
│   │   ├── dashboard/            # Dashboard pages
│   │   ├── students/             # Student management
│   │   ├── courses/              # Course management
│   │   ├── grades/               # Grade management
│   │   └── users/                # User management
│   ├── plugins/                  # Nuxt plugins
│   ├── server/                   # Server-side code
│   │   └── api/                  # API routes
│   │       ├── auth/             # Authentication API
│   │       ├── students/         # Students API
│   │       ├── courses/          # Courses API
│   │       ├── grades/           # Grades API
│   │       └── users/            # Users API
│   ├── stores/                   # Pinia stores
│   ├── types/                    # TypeScript types
│   ├── utils/                    # Utility functions
│   └── app.vue                   # Root component
├── public/                       # Public assets
├── nuxt.config.ts               # Nuxt configuration
├── package.json                 # Dependencies
└── tsconfig.json               # TypeScript config
```

## 🛠️ Installation & Setup

### **Prerequisites**
- Node.js 18+ 
- npm or yarn or pnpm

### **1. Clone the Repository**
```bash
git clone <repository-url>
cd nuxt-student-management-system
```

### **2. Install Dependencies**
```bash
npm install
# or
yarn install
# or
pnpm install
```

### **3. Environment Configuration**
Create a `.env` file in the root directory:

```env
# Database
DATABASE_URL="file:./dev.db"

# JWT Secret
JWT_SECRET="your-super-secret-jwt-key-change-in-production"

# API Configuration
API_BASE_URL="http://localhost:3000/api"

# App Configuration
NUXT_PUBLIC_APP_NAME="Student Management System"
NUXT_PUBLIC_APP_VERSION="1.0.0"
```

### **4. Database Setup**
```bash
# Initialize Prisma
npx prisma init

# Generate Prisma client
npx prisma generate

# Run database migrations
npx prisma db push

# Seed database (optional)
npx prisma db seed
```

### **5. Development Server**
```bash
npm run dev
```

Visit `http://localhost:3000` to see the application.

## 🏗️ Build & Deployment

### **Production Build**
```bash
npm run build
```

### **Preview Production Build**
```bash
npm run preview
```

### **Static Generation**
```bash
npm run generate
```

## 🧪 Testing

### **Run Tests**
```bash
npm run test
```

### **Run Tests in Watch Mode**
```bash
npm run test:watch
```

### **Type Checking**
```bash
npm run typecheck
```

### **Linting**
```bash
npm run lint
npm run lint:fix
```

## 📊 Key Features Overview

### **Dashboard**
- 📈 Real-time statistics cards
- 📊 Interactive charts (enrollment trends, GPA distribution)
- 🔄 Recent activities feed
- ⚡ Quick action buttons
- 🎯 Role-based content

### **Student Management**
- ➕ Add/Edit/Delete students
- 🔍 Search and filter capabilities
- 📋 Detailed student profiles
- 📊 Academic performance tracking
- 📅 Enrollment history

### **Course Management**
- 📚 Course creation and editing
- 👨‍🏫 Instructor assignment
- 📊 Enrollment tracking
- 🗓️ Semester organization
- 📈 Course analytics

### **Grade Management**
- 📝 Grade entry and calculation
- 🎯 Multiple assessment types
- 📊 GPA calculation
- 📈 Performance analytics
- 📋 Grade reports

### **User Management** (Admin Only)
- 👥 User creation and management
- 🔐 Role assignment
- ✅ Account activation/deactivation
- 🛡️ Permission management

## 🎨 UI/UX Features

### **Design System**
- 🎨 Consistent color palette
- 📱 Responsive design
- ♿ Accessible components
- 🌙 Dark/Light theme
- ✨ Smooth animations

### **Navigation**
- 📱 Responsive sidebar
- 🍞 Breadcrumb navigation
- 🔍 Global search
- 🔔 Notification system
- 👤 User profile menu

### **Forms**
- ✅ Real-time validation
- 🎯 Type-safe form handling
- 💾 Auto-save functionality
- 🔄 Loading states
- ❌ Error handling

## 🔒 Security Features

- 🔐 JWT-based authentication
- 🛡️ Role-based access control
- 🍪 Secure cookie management
- 🚫 Protected API routes
- 🔒 Input validation and sanitization
- 🛡️ CSRF protection

## 🌟 Performance Optimizations

- ⚡ Server-side rendering (SSR)
- 🎯 Code splitting
- 🔗 Link prefetching
- 📦 Asset optimization
- 🗜️ Image optimization
- 📊 Bundle analysis

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Nuxt.js Team](https://nuxt.com/) for the amazing framework
- [Vue.js Team](https://vuejs.org/) for the reactive framework
- [Tailwind CSS](https://tailwindcss.com/) for the utility-first CSS
- [Nuxt UI](https://ui.nuxt.com/) for the beautiful components

## 📞 Support

If you have any questions or need help, please:
- 📧 Open an issue on GitHub
- 💬 Join our Discord community
- 📖 Check the documentation

---

**Built with ❤️ using Nuxt 4**

