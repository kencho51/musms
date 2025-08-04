// User and Authentication Types
export interface User {
  id: number
  username: string
  email: string
  name?: string
  role: 'admin' | 'teacher' | 'student'
  isActive: boolean
  createdAt: string
  updatedAt?: string
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  email: string
  password: string
  name?: string
  role?: 'admin' | 'teacher' | 'student'
}

// Student Types
export interface Student {
  id: number
  studentId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  major?: string
  yearOfStudy?: number
  enrollmentDate?: string
  status: 'active' | 'inactive' | 'graduated' | 'suspended'
  createdAt: string
  updatedAt?: string
}

export interface StudentFormData {
  studentId: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  dateOfBirth?: string
  major?: string
  yearOfStudy?: number
  status?: 'active' | 'inactive' | 'graduated' | 'suspended'
}

// Course Types
export interface Course {
  id: number
  courseCode: string
  courseName: string
  description?: string
  credits: number
  semester: 'fall' | 'spring' | 'summer'
  year: number
  instructor?: string
  maxStudents: number
  enrolledStudents?: number
  status: 'active' | 'inactive' | 'completed'
  createdAt: string
  updatedAt?: string
}

export interface CourseFormData {
  courseCode: string
  courseName: string
  description?: string
  credits: number
  semester: 'fall' | 'spring' | 'summer'
  year: number
  instructor?: string
  maxStudents: number
  status?: 'active' | 'inactive' | 'completed'
}

// Grade Types
export interface Grade {
  id: number
  studentId: number
  courseId: number
  gradeValue?: number
  letterGrade?: string
  gpaPoints?: number
  examType?: string
  examDate?: string
  notes?: string
  createdAt: string
  updatedAt?: string
  student?: Student
  course?: Course
}

export interface GradeFormData {
  studentId: number
  courseId: number
  gradeValue?: number
  letterGrade?: string
  gpaPoints?: number
  examType?: string
  examDate?: string
  notes?: string
}

// Enrollment Types
export interface Enrollment {
  id: number
  studentId: number
  courseId: number
  enrollmentDate: string
  status: 'enrolled' | 'dropped' | 'completed'
  finalGrade?: string
  student?: Student
  course?: Course
}

// Notification Types
export interface Notification {
  id: number
  title: string
  message?: string
  type: 'info' | 'success' | 'warning' | 'error'
  read: boolean
  createdAt: Date
  userId?: number
}

// API Response Types
export interface ApiResponse<T = any> {
  data: T
  message?: string
  success: boolean
}

export interface PaginatedResponse<T = any> {
  data: T[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface ApiError {
  message: string
  statusCode: number
  details?: any
}

// Form Validation Types
export interface ValidationRule {
  required?: boolean
  minLength?: number
  maxLength?: number
  pattern?: RegExp
  custom?: (value: any) => boolean | string
}

export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'password' | 'number' | 'date' | 'select' | 'textarea'
  placeholder?: string
  rules?: ValidationRule
  options?: { value: string | number; label: string }[]
}

// Dashboard Types
export interface DashboardStats {
  totalStudents: number
  totalCourses: number
  totalGrades: number
  activeEnrollments: number
  averageGPA: number
  recentActivities: ActivityItem[]
}

export interface ActivityItem {
  id: number
  type: 'student_registered' | 'course_created' | 'grade_added' | 'enrollment'
  title: string
  description: string
  timestamp: string
  userId?: number
  metadata?: Record<string, any>
}

// Filter and Search Types
export interface FilterOptions {
  search?: string
  status?: string
  role?: string
  major?: string
  semester?: string
  year?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  limit?: number
}

// Theme Types
export interface ThemeConfig {
  primary: string
  secondary: string
  accent: string
  background: string
  foreground: string
  muted: string
}

// File Upload Types
export interface FileUpload {
  file: File
  preview?: string
  progress?: number
  uploaded?: boolean
  error?: string
}

// Settings Types
export interface AppSettings {
  siteName: string
  siteDescription: string
  allowRegistration: boolean
  defaultRole: 'student' | 'teacher'
  academicYear: string
  semester: 'fall' | 'spring' | 'summer'
  theme: 'light' | 'dark' | 'system'
  language: string
  timezone: string
  emailNotifications: boolean
  features: {
    grades: boolean
    attendance: boolean
    messaging: boolean
    reports: boolean
  }
}

// Export commonly used type unions
export type UserRole = 'admin' | 'teacher' | 'student'
export type StudentStatus = 'active' | 'inactive' | 'graduated' | 'suspended'
export type CourseStatus = 'active' | 'inactive' | 'completed'
export type EnrollmentStatus = 'enrolled' | 'dropped' | 'completed'
export type Semester = 'fall' | 'spring' | 'summer'
export type NotificationType = 'info' | 'success' | 'warning' | 'error'
export type SortOrder = 'asc' | 'desc' 