# University Student Management System

A comprehensive web-based student management system built with **FastAPI** backend and **shadcn/ui-inspired** frontend using pure HTML, CSS, and JavaScript.

## 🌟 Features

### Student Management
- ✅ **CRUD Operations**: Create, Read, Update, Delete student records
- 🔍 **Search & Filter**: Real-time search by name, ID, email, or major
- 📊 **Dashboard Analytics**: Student distribution by year and major
- 📝 **Detailed Profiles**: Complete student information management

### User Authentication
- 🔐 **Secure Registration**: User account creation with role-based access
- 🔑 **JWT Authentication**: Token-based authentication system
- 👥 **Role Management**: Support for Admin, Teacher, and Student roles
- 🛡️ **Protected Routes**: Secure access to sensitive operations

### Modern UI/UX
- 🎨 **shadcn/ui Design**: Beautiful, modern interface inspired by shadcn/ui
- 📱 **Responsive Design**: Works seamlessly on desktop and mobile
- ⚡ **Real-time Updates**: Dynamic content updates without page refresh
- 🌙 **Clean Styling**: Professional design with consistent theming

## 🚀 Quick Start

### Prerequisites
- Python 3.13 or higher
- [uv](https://docs.astral.sh/uv/) - Fast Python package installer and resolver

### Installation

1. **Install uv** (if not already installed):
   ```bash
   # macOS/Linux
   brew install uv
   ```

2. **Clone and navigate to the project**:
   ```bash
   cd /path/to/your/project
   cd student-management-system
   ```

3. **Install dependencies and create virtual environment**:
   ```bash
   uv sync
   ```
   
   This will automatically:
   - Create a virtual environment
   - Install all dependencies from `pyproject.toml`
   - Set up the project for development

4. **Run the application**:
   ```bash
   uv run run.py
   ```

5. **Access the application**:
   - **Home Page**: http://127.0.0.1:8000/
   - **Dashboard**: http://127.0.0.1:8000/dashboard
   - **Student Management**: http://127.0.0.1:8000/students
   - **Login**: http://127.0.0.1:8000/login
   - **Register**: http://127.0.0.1:8000/register
   - **API Documentation**: http://127.0.0.1:8000/docs

## 📖 Usage Guide

### Getting Started

1. **Create an Account**:
   - Visit http://127.0.0.1:8000/register
   - Fill in your details and select your role (Student/Teacher/Admin)
   - Click "Create Account"

2. **Sign In**:
   - Go to http://127.0.0.1:8000/login
   - Enter your username/email and password
   - Click "Sign In" to access the dashboard

3. **Manage Students**:
   - Navigate to the Students page
   - Click "Add New Student" to create records
   - Use the search bar to find specific students
   - Click "Edit" or "Delete" to modify records

### Student Record Fields

- **Student ID**: Unique identifier for each student
- **Personal Info**: First name, last name, email, phone
- **Academic Info**: Major, year of study, date of birth
- **Timestamps**: Automatic creation and update tracking

### Dashboard Features

- **Statistics Cards**: Total students, active users, academic years
- **Quick Actions**: Direct access to common operations
- **Student Distribution**: Breakdown by year and major
- **Recent Activity**: Latest system activities
- **System Health**: Database and API status monitoring

## 🛠️ Technology Stack

### Backend
- **FastAPI**: Modern, fast web framework for Python
- **SQLAlchemy**: SQL toolkit and Object-Relational Mapping
- **SQLite**: Lightweight database for development
- **Pydantic**: Data validation using Python type annotations
- **python-jose**: JSON Web Tokens for secure authentication
- **passlib + bcrypt**: Password hashing for security
- **uv**: Fast Python package installer and resolver

### Frontend
- **HTML5**: Semantic markup structure
- **CSS3**: Modern styling with CSS variables and Flexbox/Grid
- **Vanilla JavaScript**: Pure JavaScript for interactivity
- **shadcn/ui Inspired**: Design system inspired by shadcn/ui
- **Responsive Design**: Mobile-first approach

### Architecture
- **RESTful API**: Clean API design with proper HTTP methods
- **MVC Pattern**: Separation of concerns
- **Component-based CSS**: Reusable UI components
- **JWT Authentication**: Stateless authentication system

## 📁 Project Structure

```
student-management-system/
├── app/                    # FastAPI application
│   ├── __init__.py
│   ├── main.py            # Main FastAPI app and routes
│   ├── models.py          # SQLAlchemy database models
│   ├── schemas.py         # Pydantic schemas
│   ├── crud.py            # Database operations
│   ├── auth.py            # Authentication utilities
│   └── database.py        # Database configuration
├── static/                # Static files
│   ├── css/
│   │   └── style.css      # Main stylesheet
│   └── js/
│       ├── main.js        # Core JavaScript
│       └── students.js    # Student management
├── templates/             # HTML templates
│   ├── base.html          # Base template
│   ├── index.html         # Home page
│   ├── login.html         # Login page
│   ├── register.html      # Registration page
│   ├── dashboard.html     # Dashboard
│   └── students.html      # Student management
├── pyproject.toml         # Project configuration and dependencies
├── uv.lock                # Dependency lock file (auto-generated)
├── reset_password.py      # Password reset utility
├── run.py                 # Application launcher
└── README.md              # This file
```

## 🔧 API Endpoints

### Authentication
- `POST /api/register` - User registration
- `POST /api/login` - User login

### Students
- `GET /api/students` - List all students
- `POST /api/students` - Create new student
- `GET /api/students/{id}` - Get student by ID
- `PUT /api/students/{id}` - Update student
- `DELETE /api/students/{id}` - Delete student

### Pages
- `GET /` - Home page
- `GET /login` - Login page
- `GET /register` - Registration page
- `GET /dashboard` - Dashboard (protected)
- `GET /students` - Student management (protected)

## 🔐 Security Features

- **Password Hashing**: bcrypt for secure password storage
- **JWT Tokens**: Secure authentication with expiration
- **Protected Routes**: Authentication required for sensitive operations
- **Input Validation**: Pydantic schemas for data validation
- **CORS Configuration**: Secure cross-origin requests

## 🎨 Design System

The frontend uses a shadcn/ui-inspired design system with:

- **Color Scheme**: Semantic color variables for consistency
- **Typography**: Clean, readable font hierarchy
- **Components**: Reusable button, card, form, and table components
- **Spacing**: Consistent spacing scale
- **Responsive Design**: Mobile-first responsive layouts

## 🔄 Development

### Running in Development Mode
```bash
uv run run.py
```

### Common uv Commands
```bash
# Install dependencies and sync environment
uv sync

# Run the application
uv run run.py

# Run the password reset utility
uv run reset_password.py list
uv run reset_password.py admin newpassword123

# Add new dependencies
uv add package-name

# Add development dependencies
uv add --dev package-name

# Update dependencies
uv sync --upgrade
```

### Database Management
The application uses SQLite with automatic table creation. The database file `university_sms.db` will be created automatically on first run.

### Password Reset Utility
If you forget a password, use the included reset utility:
```bash
# List all users
uv run reset_password.py list

# Reset a specific user's password
uv run reset_password.py username newpassword
uv run reset_password.py admin admin123
```

### Making Changes
1. Backend changes in `app/` directory
2. Frontend styles in `static/css/style.css`
3. JavaScript functionality in `static/js/`
4. Templates in `templates/` directory
5. Dependencies in `pyproject.toml`

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support or questions, please create an issue in the project repository.


# reference
1. https://www.youtube.com/watch?v=jd1aRE5pJWc
2. https://www.youtube.com/watch?v=aVXs8lb7i9U