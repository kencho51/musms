-- Seed Demo Data
-- Insert demo users with hashed passwords

-- Admin user (password: admin123)
INSERT INTO "users" ("username", "email", "name", "password", "role", "isActive", "createdAt", "updatedAt") 
VALUES (
  'admin', 
  'admin@sms.edu', 
  'System Administrator', 
  '$2b$10$ZfamWFChtbjTdvj62FD6Le7w9PVb3Vibo0AajG1tstKF/MzGGtTmW', 
  'ADMIN', 
  true, 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP
);

-- Teacher user (password: teacher123)
INSERT INTO "users" ("username", "email", "name", "password", "role", "isActive", "createdAt", "updatedAt") 
VALUES (
  'teacher', 
  'teacher@sms.edu', 
  'John Teacher', 
  '$2b$10$QY6uXlu5LlcT2IGBHLjX6uxw5W9zpacqIxCEhFm6lgv/qYeKWWQRK', 
  'TEACHER', 
  true, 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP
);

-- Student user (password: student123)
INSERT INTO "users" ("username", "email", "name", "password", "role", "isActive", "createdAt", "updatedAt") 
VALUES (
  'student', 
  'student@sms.edu', 
  'Jane Student', 
  '$2b$10$VuQ0m3A0J6KBNSZ4vBRqYuKdR8kXoiIojZD65l5sGU7YO4LaclPJW', 
  'STUDENT', 
  true, 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP
);

-- Sample courses
INSERT INTO "courses" ("courseCode", "courseName", "description", "credits", "semester", "year", "instructor", "maxStudents", "status", "createdAt", "updatedAt", "createdBy") 
VALUES 
  ('CS101', 'Introduction to Computer Science', 'Basic programming concepts and problem solving', 3, 'FALL', 2024, 'John Teacher', 30, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2),
  ('MATH101', 'Calculus I', 'Differential and integral calculus', 4, 'FALL', 2024, 'Dr. Smith', 25, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2),
  ('ENG101', 'English Composition', 'Writing and communication skills', 3, 'FALL', 2024, 'Prof. Johnson', 20, 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 2);

-- Sample student profile
INSERT INTO "students" ("studentId", "firstName", "lastName", "email", "phone", "dateOfBirth", "major", "yearOfStudy", "enrollmentDate", "status", "createdAt", "updatedAt", "userId", "createdBy") 
VALUES (
  'STU001', 
  'Jane', 
  'Student', 
  'jane.student@sms.edu', 
  '+1-555-0123', 
  '2000-05-15', 
  'Computer Science', 
  1, 
  '2024-08-01', 
  'ACTIVE', 
  CURRENT_TIMESTAMP, 
  CURRENT_TIMESTAMP, 
  3, 
  1
);

-- Sample enrollments
INSERT INTO "enrollments" ("enrollmentDate", "status", "finalGrade", "createdAt", "updatedAt", "studentId", "courseId") 
VALUES 
  (CURRENT_TIMESTAMP, 'ENROLLED', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1),
  (CURRENT_TIMESTAMP, 'ENROLLED', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 2),
  (CURRENT_TIMESTAMP, 'ENROLLED', NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 3);

-- Sample grades
INSERT INTO "grades" ("gradeValue", "letterGrade", "gpaPoints", "examType", "examDate", "notes", "createdAt", "updatedAt", "studentId", "courseId", "createdBy") 
VALUES 
  (85.5, 'B+', 3.3, 'Midterm', '2024-10-15', 'Good understanding of concepts', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 1, 2),
  (92.0, 'A-', 3.7, 'Quiz', '2024-09-20', 'Excellent work', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1, 2, 2);

-- Sample activity logs
INSERT INTO "activity_logs" ("type", "title", "description", "metadata", "createdAt", "userId") 
VALUES 
  ('student_registered', 'Student Registration', 'New student Jane Student registered', '{"studentId": "STU001"}', CURRENT_TIMESTAMP, 1),
  ('course_created', 'Course Created', 'New course CS101 created', '{"courseCode": "CS101"}', CURRENT_TIMESTAMP, 2),
  ('grade_added', 'Grade Added', 'Grade added for CS101 midterm', '{"grade": 85.5, "courseCode": "CS101"}', CURRENT_TIMESTAMP, 2);

-- Sample settings
INSERT INTO "settings" ("key", "value", "description", "createdAt", "updatedAt") 
VALUES 
  ('app_name', 'Student Management System', 'Application display name', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('academic_year', '2024-2025', 'Current academic year', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('semester', 'Fall 2024', 'Current semester', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('max_enrollment', '30', 'Default maximum enrollment per course', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP); 