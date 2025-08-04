from fastapi import FastAPI, Depends, HTTPException, status, Request, Form
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse, RedirectResponse
from fastapi.templating import Jinja2Templates
from sqlalchemy.orm import Session
from typing import List, Optional
import os

from app.database import get_db, engine
from app import models, schemas, crud, auth
from app.models import Base

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="University Student Management System", version="1.0.0")

# Mount static files
app.mount("/static", StaticFiles(directory="static"), name="static")

# Templates
templates = Jinja2Templates(directory="templates")

# Security
security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    if credentials is None:
        return None
    token = credentials.credentials
    try:
        user = auth.verify_token(token, db)
        return user
    except:
        return None

# Routes

@app.get("/", response_class=HTMLResponse)
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@app.get("/login", response_class=HTMLResponse)
async def login_page(request: Request):
    return templates.TemplateResponse("login.html", {"request": request})

@app.get("/register", response_class=HTMLResponse)
async def register_page(request: Request):
    return templates.TemplateResponse("register.html", {"request": request})

@app.get("/dashboard", response_class=HTMLResponse)
async def dashboard(request: Request):
    return templates.TemplateResponse("dashboard.html", {"request": request})

@app.get("/students", response_class=HTMLResponse)
async def students_page(request: Request):
    return templates.TemplateResponse("students.html", {"request": request})

@app.get("/courses", response_class=HTMLResponse)
async def courses_page(request: Request):
    return templates.TemplateResponse("courses.html", {"request": request})

@app.get("/grades", response_class=HTMLResponse)
async def grades_page(request: Request):
    return templates.TemplateResponse("grades.html", {"request": request})

@app.get("/student-grades/{student_id}", response_class=HTMLResponse)
async def student_grades_page(request: Request, student_id: int):
    return templates.TemplateResponse("student_grades.html", {"request": request, "student_id": student_id})

@app.get("/users", response_class=HTMLResponse)
async def users_page(request: Request):
    return templates.TemplateResponse("users.html", {"request": request})

# API Routes

@app.post("/api/register")
async def register(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form(default="student"),
    db: Session = Depends(get_db)
):
    # Check if user exists
    if crud.get_user_by_email(db, email):
        raise HTTPException(status_code=400, detail="Email already registered")
    if crud.get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail="Username already taken")
    
    user_data = schemas.UserCreate(username=username, email=email, password=password, role=role)
    user = crud.create_user(db, user_data)
    return {"message": "User created successfully", "user_id": user.id}

@app.post("/api/login")
async def login(
    username: str = Form(...),
    password: str = Form(...),
    db: Session = Depends(get_db)
):
    user = auth.authenticate_user(db, username, password)
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    
    token = auth.create_access_token(data={"sub": user.username})
    return {"access_token": token, "token_type": "bearer", "user": {"id": user.id, "username": user.username, "role": user.role}}

@app.get("/api/students", response_model=List[schemas.Student])
async def get_students(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    students = crud.get_students(db, skip=skip, limit=limit)
    return students

@app.post("/api/students", response_model=schemas.Student)
async def create_student(
    student_id: str = Form(...),
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    date_of_birth: str = Form(...),
    major: str = Form(...),
    year_of_study: int = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    student_data = schemas.StudentCreate(
        student_id=student_id,
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        date_of_birth=date_of_birth,
        major=major,
        year_of_study=year_of_study
    )
    
    return crud.create_student(db, student_data)

@app.get("/api/students/{student_id}", response_model=schemas.Student)
async def get_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    student = crud.get_student(db, student_id)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.put("/api/students/{student_id}", response_model=schemas.Student)
async def update_student(
    student_id: int,
    first_name: str = Form(...),
    last_name: str = Form(...),
    email: str = Form(...),
    phone: str = Form(...),
    date_of_birth: str = Form(...),
    major: str = Form(...),
    year_of_study: int = Form(...),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    student_data = schemas.StudentUpdate(
        first_name=first_name,
        last_name=last_name,
        email=email,
        phone=phone,
        date_of_birth=date_of_birth,
        major=major,
        year_of_study=year_of_study
    )
    
    student = crud.update_student(db, student_id, student_data)
    if student is None:
        raise HTTPException(status_code=404, detail="Student not found")
    return student

@app.delete("/api/students/{student_id}")
async def delete_student(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if not crud.delete_student(db, student_id):
        raise HTTPException(status_code=404, detail="Student not found")
    return {"message": "Student deleted successfully"}

# Course API Routes

@app.get("/api/courses", response_model=List[schemas.Course])
async def get_courses(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    courses = crud.get_courses(db, skip=skip, limit=limit)
    return courses

@app.post("/api/courses", response_model=schemas.Course)
async def create_course(
    course_code: str = Form(...),
    course_name: str = Form(...),
    description: str = Form(""),
    credits: int = Form(3),
    semester: str = Form(""),
    year: int = Form(None),
    instructor: str = Form(""),
    max_students: int = Form(30),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Check if course code already exists
    if crud.get_course_by_code(db, course_code):
        raise HTTPException(status_code=400, detail="Course code already exists")
    
    course_data = schemas.CourseCreate(
        course_code=course_code,
        course_name=course_name,
        description=description if description else None,
        credits=credits,
        semester=semester if semester else None,
        year=year if year else None,
        instructor=instructor if instructor else None,
        max_students=max_students
    )
    
    return crud.create_course(db, course_data)

@app.get("/api/courses/{course_id}", response_model=schemas.Course)
async def get_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    course = crud.get_course(db, course_id)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.put("/api/courses/{course_id}", response_model=schemas.Course)
async def update_course(
    course_id: int,
    course_name: str = Form(...),
    description: str = Form(""),
    credits: int = Form(3),
    semester: str = Form(""),
    year: int = Form(None),
    instructor: str = Form(""),
    max_students: int = Form(30),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    course_data = schemas.CourseUpdate(
        course_name=course_name,
        description=description if description else None,
        credits=credits,
        semester=semester if semester else None,
        year=year if year else None,
        instructor=instructor if instructor else None,
        max_students=max_students
    )
    
    course = crud.update_course(db, course_id, course_data)
    if course is None:
        raise HTTPException(status_code=404, detail="Course not found")
    return course

@app.delete("/api/courses/{course_id}")
async def delete_course(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if not crud.delete_course(db, course_id):
        raise HTTPException(status_code=404, detail="Course not found")
    return {"message": "Course deleted successfully"}

# Grade API Routes

@app.get("/api/grades", response_model=List[schemas.Grade])
async def get_grades(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    grades = crud.get_grades(db, skip=skip, limit=limit)
    return grades

@app.get("/api/students/{student_id}/grades", response_model=List[schemas.Grade])
async def get_student_grades(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    grades = crud.get_grades_by_student(db, student_id)
    return grades

@app.get("/api/courses/{course_id}/grades", response_model=List[schemas.Grade])
async def get_course_grades(
    course_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    grades = crud.get_grades_by_course(db, course_id)
    return grades

@app.get("/api/students/{student_id}/gpa")
async def get_student_gpa(
    student_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    gpa = crud.calculate_student_gpa(db, student_id)
    return {"student_id": student_id, "gpa": gpa}

@app.post("/api/grades", response_model=schemas.Grade)
async def create_grade(
    student_id: int = Form(...),
    course_id: int = Form(...),
    grade_value: float = Form(None),
    letter_grade: str = Form(""),
    exam_type: str = Form(""),
    exam_date: str = Form(""),
    notes: str = Form(""),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    # Verify student and course exist
    if not crud.get_student(db, student_id):
        raise HTTPException(status_code=404, detail="Student not found")
    if not crud.get_course(db, course_id):
        raise HTTPException(status_code=404, detail="Course not found")
    
    grade_data = schemas.GradeCreate(
        student_id=student_id,
        course_id=course_id,
        grade_value=grade_value if grade_value is not None else None,
        letter_grade=letter_grade if letter_grade else None,
        exam_type=exam_type if exam_type else None,
        exam_date=exam_date if exam_date else None,
        notes=notes if notes else None
    )
    
    return crud.create_grade(db, grade_data)

@app.put("/api/grades/{grade_id}", response_model=schemas.Grade)
async def update_grade(
    grade_id: int,
    grade_value: float = Form(None),
    letter_grade: str = Form(""),
    exam_type: str = Form(""),
    exam_date: str = Form(""),
    notes: str = Form(""),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    grade_data = schemas.GradeUpdate(
        grade_value=grade_value if grade_value is not None else None,
        letter_grade=letter_grade if letter_grade else None,
        exam_type=exam_type if exam_type else None,
        exam_date=exam_date if exam_date else None,
        notes=notes if notes else None
    )
    
    grade = crud.update_grade(db, grade_id, grade_data)
    if grade is None:
        raise HTTPException(status_code=404, detail="Grade not found")
    return grade

@app.delete("/api/grades/{grade_id}")
async def delete_grade(
    grade_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    
    if not crud.delete_grade(db, grade_id):
        raise HTTPException(status_code=404, detail="Grade not found")
    return {"message": "Grade deleted successfully"}

# User Management API Routes (Admin Only)

def check_admin_permissions(current_user: models.User):
    if current_user is None:
        raise HTTPException(status_code=401, detail="Not authenticated")
    if current_user.role != "admin":
        raise HTTPException(status_code=403, detail="Admin access required")

@app.get("/api/users", response_model=List[schemas.User])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    check_admin_permissions(current_user)
    users = crud.get_users(db, skip=skip, limit=limit)
    return users

@app.post("/api/users", response_model=schemas.User)
async def create_user_admin(
    username: str = Form(...),
    email: str = Form(...),
    password: str = Form(...),
    role: str = Form(default="student"),
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    check_admin_permissions(current_user)
    
    # Check if user exists
    if crud.get_user_by_username(db, username):
        raise HTTPException(status_code=400, detail="Username already registered")
    if crud.get_user_by_email(db, email):
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_data = schemas.UserCreate(username=username, email=email, password=password, role=role)
    user = crud.create_user(db, user_data)
    return user

@app.put("/api/users/{user_id}", response_model=schemas.User)
async def update_user_admin(
    user_id: int,
    request: Request,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    check_admin_permissions(current_user)
    
    try:
        # Get form data
        form_data = await request.form()
        
        username = form_data.get("username", "").strip()
        email = form_data.get("email", "").strip()
        role = form_data.get("role", "").strip()
        is_active_str = form_data.get("is_active", "")
        password = form_data.get("password", "").strip()
        
        # Debug logging
        print(f"Updating user {user_id}")
        print(f"Raw form data: {dict(form_data)}")
        print(f"Parsed values: username='{username}', email='{email}', role='{role}', is_active='{is_active_str}', password={'***' if password else '(empty)'}")
        
        # Convert is_active string to boolean
        is_active_bool = None
        if is_active_str:
            is_active_bool = is_active_str.lower() in ['true', '1', 'yes', 'on']
        
        # Validate that required fields are not empty
        if not username:
            raise HTTPException(status_code=400, detail="Username is required")
        if not email:
            raise HTTPException(status_code=400, detail="Email is required")
        if not role:
            raise HTTPException(status_code=400, detail="Role is required")
        
        # Check if username or email already exists for other users
        existing_user_by_username = crud.get_user_by_username(db, username)
        if existing_user_by_username and existing_user_by_username.id != user_id:
            raise HTTPException(status_code=400, detail="Username already exists")
        
        existing_user_by_email = crud.get_user_by_email(db, email)
        if existing_user_by_email and existing_user_by_email.id != user_id:
            raise HTTPException(status_code=400, detail="Email already exists")
        
        user_data = schemas.UserUpdate(
            username=username,
            email=email,
            role=role,
            is_active=is_active_bool,
            password=password if password else None
        )
        
        user = crud.update_user(db, user_id, user_data)
        if user is None:
            raise HTTPException(status_code=404, detail="User not found")
        return user
        
    except HTTPException:
        raise
    except Exception as e:
        print(f"Error updating user: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Failed to update user: {str(e)}")

@app.delete("/api/users/{user_id}")
async def delete_user_admin(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_user)
):
    check_admin_permissions(current_user)
    
    # Prevent admin from deleting themselves
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    if not crud.delete_user(db, user_id):
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 