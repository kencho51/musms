# 🔌 API Documentation

Complete reference for the Student Management System API endpoints.

## 🔑 Authentication

All protected endpoints require a JWT token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

### Authentication Flow

1. **Login** → Get JWT token
2. **Use token** in Authorization header for protected endpoints
3. **Token expires** in 7 days by default

## 📊 Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation successful"
}
```

### Error Response
```json
{
  "success": false,
  "statusCode": 400,
  "message": "Error description"
}
```

## 🔐 Authentication Endpoints

### POST `/api/auth/login`
User login with username/password.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "role": "ADMIN",
      "isActive": true
    },
    "token": "eyJhbGciOiJIUzI1NiIs..."
  },
  "message": "Login successful"
}
```

**Error Responses:**
- `400` - Missing username/password
- `401` - Invalid credentials
- `403` - Account disabled

---

### POST `/api/auth/register`
Register a new user account.

**Request Body:**
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Doe",
  "role": "STUDENT"
}
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 2,
      "username": "newuser",
      "email": "user@example.com",
      "role": "STUDENT"
    }
  },
  "message": "User registered successfully"
}
```

---

### GET `/api/auth/me`
Get current user information.

**Headers Required:**
```http
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@example.com",
      "firstName": "Admin",
      "lastName": "User",
      "role": "ADMIN",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

---

### POST `/api/auth/logout`
Logout current user (invalidate token).

**Headers Required:**
```http
Authorization: Bearer <token>
```

**Success Response:**
```json
{
  "success": true,
  "message": "Logout successful"
}
```

## 👥 User Management (Admin Only)

### GET `/api/users`
List all users with pagination.

**Query Parameters:**
- `page` (optional) - Page number (default: 1)
- `limit` (optional) - Items per page (default: 10)
- `role` (optional) - Filter by role (ADMIN, TEACHER, STUDENT)
- `search` (optional) - Search in username/email

**Example:**
```http
GET /api/users?page=1&limit=20&role=TEACHER&search=john
```

**Success Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": 1,
        "username": "teacher1",
        "email": "teacher@example.com",
        "firstName": "Jane",
        "lastName": "Smith",
        "role": "TEACHER",
        "isActive": true,
        "createdAt": "2024-01-01T00:00:00.000Z"
      }
    ],
    "pagination": {
      "total": 1,
      "page": 1,
      "limit": 20,
      "totalPages": 1
    }
  }
}
```

---

### POST `/api/users`
Create a new user.

**Request Body:**
```json
{
  "username": "teacher2",
  "email": "teacher2@example.com",
  "password": "securepassword",
  "firstName": "John",
  "lastName": "Teacher",
  "role": "TEACHER",
  "isActive": true
}
```

---

### PUT `/api/users/[id]`
Update an existing user.

**Request Body:**
```json
{
  "email": "newemail@example.com",
  "firstName": "Updated",
  "lastName": "Name",
  "isActive": false
}
```

---

### DELETE `/api/users/[id]`
Delete a user (soft delete).

**Success Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

## 🎓 Student Management

### GET `/api/students`
List all students with their related data.

**Query Parameters:**
- `page`, `limit` - Pagination
- `search` - Search in student name/ID
- `courseId` - Filter by enrolled course

**Success Response:**
```json
{
  "success": true,
  "data": {
    "students": [
      {
        "id": 1,
        "studentId": "STU001",
        "firstName": "Alice",
        "lastName": "Johnson",
        "email": "alice@example.com",
        "phone": "+1234567890",
        "dateOfBirth": "2000-05-15T00:00:00.000Z",
        "address": "123 Main St",
        "enrollmentDate": "2024-01-15T00:00:00.000Z",
        "user": {
          "id": 3,
          "username": "alice_student",
          "role": "STUDENT"
        },
        "enrollments": [
          {
            "id": 1,
            "course": {
              "id": 1,
              "name": "Mathematics 101",
              "code": "MATH101"
            }
          }
        ],
        "_count": {
          "grades": 5
        }
      }
    ],
    "pagination": { /* ... */ }
  }
}
```

---

### POST `/api/students`
Create a new student record.

**Request Body:**
```json
{
  "studentId": "STU002",
  "firstName": "Bob",
  "lastName": "Wilson",
  "email": "bob@example.com",
  "phone": "+1234567891",
  "dateOfBirth": "2001-03-10",
  "address": "456 Oak Ave",
  "userId": 4
}
```

---

### PUT `/api/students/[id]`
Update student information.

---

### DELETE `/api/students/[id]`
Delete a student record.

## 📚 Course Management

### GET `/api/courses`
List all courses.

**Success Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "id": 1,
        "name": "Mathematics 101",
        "code": "MATH101",
        "description": "Introduction to Mathematics",
        "credits": 3,
        "instructor": {
          "id": 2,
          "firstName": "Jane",
          "lastName": "Smith"
        },
        "_count": {
          "enrollments": 25,
          "grades": 120
        }
      }
    ]
  }
}
```

---

### POST `/api/courses`
Create a new course.

**Request Body:**
```json
{
  "name": "Physics 101",
  "code": "PHYS101",
  "description": "Introduction to Physics",
  "credits": 4,
  "instructorId": 2
}
```

---

### PUT `/api/courses/[id]`
Update course information.

---

### DELETE `/api/courses/[id]`
Delete a course.

## 📊 Grade Management

### GET `/api/grades`
List grades with filters.

**Query Parameters:**
- `studentId` - Filter by student
- `courseId` - Filter by course
- `examType` - Filter by exam type (MIDTERM, FINAL, QUIZ, ASSIGNMENT)

**Success Response:**
```json
{
  "success": true,
  "data": {
    "grades": [
      {
        "id": 1,
        "score": 85.5,
        "examType": "MIDTERM",
        "examDate": "2024-03-15T00:00:00.000Z",
        "student": {
          "id": 1,
          "firstName": "Alice",
          "lastName": "Johnson",
          "studentId": "STU001"
        },
        "course": {
          "id": 1,
          "name": "Mathematics 101",
          "code": "MATH101"
        }
      }
    ]
  }
}
```

---

### POST `/api/grades`
Create a new grade record.

**Request Body:**
```json
{
  "studentId": 1,
  "courseId": 1,
  "score": 92.0,
  "examType": "FINAL",
  "examDate": "2024-05-20"
}
```

---

### PUT `/api/grades/[id]`
Update a grade.

---

### DELETE `/api/grades/[id]`
Delete a grade record.

## 🏥 System Health

### GET `/api/health`
System health check and diagnostics.

**Optional Headers:**
```http
Authorization: Bearer <token>  # For auth system test
```

**Success Response:**
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "environment": "production",
  "version": "1.0.0",
  "checks": {
    "database": {
      "status": "healthy",
      "details": {
        "connection": "success",
        "records": {
          "users": 10,
          "students": 50,
          "courses": 15
        }
      }
    },
    "jwt": {
      "status": "healthy",
      "details": {
        "secret_available": true,
        "secret_length": 32
      }
    },
    "auth": {
      "status": "authenticated",
      "details": {
        "user": {
          "id": 1,
          "username": "admin",
          "role": "ADMIN",
          "isActive": true
        }
      }
    }
  }
}
```

## 🔒 Role-Based Access Control

### Permissions Matrix

| Endpoint | ADMIN | TEACHER | STUDENT |
|----------|-------|---------|---------|
| `/api/users/*` | ✅ Full | ❌ None | ❌ None |
| `/api/students/*` | ✅ Full | ✅ Read/Update | ❌ Read Own |
| `/api/courses/*` | ✅ Full | ✅ Read/Update | ❌ Read Only |
| `/api/grades/*` | ✅ Full | ✅ Full | ❌ Read Own |
| `/api/auth/*` | ✅ All | ✅ All | ✅ All |
| `/api/health` | ✅ Yes | ✅ Yes | ✅ Yes |

## 🚫 Error Codes

### Common HTTP Status Codes

- **200** - Success
- **400** - Bad Request (invalid data)
- **401** - Unauthorized (invalid/missing token)
- **403** - Forbidden (insufficient permissions)
- **404** - Not Found
- **422** - Validation Error
- **500** - Internal Server Error

### Custom Error Messages

```json
{
  "success": false,
  "statusCode": 401,
  "message": "Invalid or expired token"
}
```

```json
{
  "success": false,
  "statusCode": 403,
  "message": "Insufficient permissions for this operation"
}
```

```json
{
  "success": false,
  "statusCode": 422,
  "message": "Validation failed",
  "details": {
    "email": "Email is required",
    "password": "Password must be at least 8 characters"
  }
}
```

## 📋 Request Examples

### Using curl

```bash
# Login
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123"}'

# Get students (with token)
curl -X GET http://localhost:3000/api/students \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"

# Create student
curl -X POST http://localhost:3000/api/students \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{
    "studentId": "STU003",
    "firstName": "Charlie",
    "lastName": "Brown",
    "email": "charlie@example.com",
    "userId": 5
  }'
```

### Using JavaScript/Fetch

```javascript
// Login
const loginResponse = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'admin',
    password: 'admin123'
  })
})

const { data } = await loginResponse.json()
const token = data.token

// Get students
const studentsResponse = await fetch('/api/students', {
  headers: { 'Authorization': `Bearer ${token}` }
})

const students = await studentsResponse.json()
```

## 🎯 Rate Limiting

Currently no rate limiting is implemented. In production, consider:

- **Authentication endpoints**: 5 requests/minute per IP
- **CRUD operations**: 60 requests/minute per user
- **Health checks**: 10 requests/minute per IP

## 🔄 Pagination

All list endpoints support pagination:

**Query Parameters:**
- `page` - Page number (1-based, default: 1)
- `limit` - Items per page (default: 10, max: 100)

**Response Format:**
```json
{
  "data": {
    "items": [...],
    "pagination": {
      "total": 150,
      "page": 2,
      "limit": 25,
      "totalPages": 6,
      "hasNext": true,
      "hasPrev": true
    }
  }
}
```

---

For more information, see the main [README.md](../README.md). 