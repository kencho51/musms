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
- Python 3.8 or higher
- pip (Python package installer)

### Installation

1. **Clone and navigate to the project**:
   ```bash
   cd /Volumes/kencho/mu-sms
   ```

2. **Create and activate a virtual environment**:
   ```bash
   python3 -m venv sms
   source sms/bin/activate  # On Windows: venv\Scripts\activate
   python --version
   Python 3.13.2  
   pip --version
   pip 25.0 from /Volumes/kencho/mu-sms/sms/lib/python3.13/site-packages/pip (python 3.13)
   pip install --upgrade pip
   pip --version                  
   pip 25.2 from /Volumes/kencho/mu-sms/sms/lib/python3.13/site-packages/pip (python 3.13)
   ```

3. **Install dependencies**:
   ```bash
   cd student-management-system 
   pip install -r requirements.txt
   ```

4. **Run the application**:
   ```bash
   python run.py
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
- **JWT**: JSON Web Tokens for secure authentication
- **bcrypt**: Password hashing for security

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
mu-sms/
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
├── requirements.txt       # Python dependencies
├── run.py                # Application launcher
└── README.md             # This file
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
python run.py
```

### Database Management
The application uses SQLite with automatic table creation. The database file `university_sms.db` will be created automatically on first run.

### Making Changes
1. Backend changes in `app/` directory
2. Frontend styles in `static/css/style.css`
3. JavaScript functionality in `static/js/`
4. Templates in `templates/` directory

## 📝 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For support or questions, please create an issue in the project repository.
