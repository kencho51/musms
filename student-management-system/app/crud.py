from sqlalchemy.orm import Session
from sqlalchemy import or_
from app import models, schemas, auth
from datetime import datetime

# User CRUD operations
def get_user(db: Session, user_id: int):
    return db.query(models.User).filter(models.User.id == user_id).first()

def get_user_by_email(db: Session, email: str):
    return db.query(models.User).filter(models.User.email == email).first()

def get_user_by_username(db: Session, username: str):
    return db.query(models.User).filter(models.User.username == username).first()

def create_user(db: Session, user: schemas.UserCreate):
    hashed_password = auth.get_password_hash(user.password)
    db_user = models.User(
        username=user.username,
        email=user.email,
        hashed_password=hashed_password,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.User).offset(skip).limit(limit).all()

def update_user(db: Session, user_id: int, user: schemas.UserUpdate):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        update_data = user.dict(exclude_unset=True)
        for key, value in update_data.items():
            # Only update if value is not None
            if value is not None:
                if key == "password" and value:
                    # Hash the password and update the hashed_password field
                    hashed_password = auth.get_password_hash(value)
                    setattr(db_user, "hashed_password", hashed_password)
                elif key != "password":
                    # Update other fields only if they have actual values
                    setattr(db_user, key, value)
        db.commit()
        db.refresh(db_user)
    return db_user

def delete_user(db: Session, user_id: int):
    db_user = db.query(models.User).filter(models.User.id == user_id).first()
    if db_user:
        db.delete(db_user)
        db.commit()
        return True
    return False

# Student CRUD operations
def get_student(db: Session, student_id: int):
    return db.query(models.Student).filter(models.Student.id == student_id).first()

def get_student_by_student_id(db: Session, student_id: str):
    return db.query(models.Student).filter(models.Student.student_id == student_id).first()

def get_students(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Student).offset(skip).limit(limit).all()

def search_students(db: Session, query: str, skip: int = 0, limit: int = 100):
    return db.query(models.Student).filter(
        or_(
            models.Student.first_name.contains(query),
            models.Student.last_name.contains(query),
            models.Student.student_id.contains(query),
            models.Student.email.contains(query),
            models.Student.major.contains(query)
        )
    ).offset(skip).limit(limit).all()

def create_student(db: Session, student: schemas.StudentCreate):
    db_student = models.Student(**student.dict())
    if student.date_of_birth:
        try:
            db_student.date_of_birth = datetime.strptime(student.date_of_birth, "%Y-%m-%d").date()
        except:
            pass
    db.add(db_student)
    db.commit()
    db.refresh(db_student)
    return db_student

def update_student(db: Session, student_id: int, student: schemas.StudentUpdate):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if db_student:
        for key, value in student.dict(exclude_unset=True).items():
            if key == "date_of_birth" and value:
                try:
                    value = datetime.strptime(value, "%Y-%m-%d").date()
                except:
                    continue
            setattr(db_student, key, value)
        db.commit()
        db.refresh(db_student)
    return db_student

def delete_student(db: Session, student_id: int):
    db_student = db.query(models.Student).filter(models.Student.id == student_id).first()
    if db_student:
        db.delete(db_student)
        db.commit()
        return True
    return False

# Course CRUD operations
def get_course(db: Session, course_id: int):
    return db.query(models.Course).filter(models.Course.id == course_id).first()

def get_course_by_code(db: Session, course_code: str):
    return db.query(models.Course).filter(models.Course.course_code == course_code).first()

def get_courses(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Course).offset(skip).limit(limit).all()

def search_courses(db: Session, query: str, skip: int = 0, limit: int = 100):
    return db.query(models.Course).filter(
        or_(
            models.Course.course_name.contains(query),
            models.Course.course_code.contains(query),
            models.Course.instructor.contains(query),
            models.Course.description.contains(query)
        )
    ).offset(skip).limit(limit).all()

def create_course(db: Session, course: schemas.CourseCreate):
    db_course = models.Course(**course.dict())
    db.add(db_course)
    db.commit()
    db.refresh(db_course)
    return db_course

def update_course(db: Session, course_id: int, course: schemas.CourseUpdate):
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if db_course:
        for key, value in course.dict(exclude_unset=True).items():
            setattr(db_course, key, value)
        db.commit()
        db.refresh(db_course)
    return db_course

def delete_course(db: Session, course_id: int):
    db_course = db.query(models.Course).filter(models.Course.id == course_id).first()
    if db_course:
        db.delete(db_course)
        db.commit()
        return True
    return False

# Grade CRUD operations
def get_grade(db: Session, grade_id: int):
    return db.query(models.Grade).filter(models.Grade.id == grade_id).first()

def get_grades(db: Session, skip: int = 0, limit: int = 100):
    return db.query(models.Grade).offset(skip).limit(limit).all()

def get_grades_by_student(db: Session, student_id: int):
    return db.query(models.Grade).filter(models.Grade.student_id == student_id).all()

def get_grades_by_course(db: Session, course_id: int):
    return db.query(models.Grade).filter(models.Grade.course_id == course_id).all()

def get_student_course_grade(db: Session, student_id: int, course_id: int):
    return db.query(models.Grade).filter(
        models.Grade.student_id == student_id,
        models.Grade.course_id == course_id
    ).all()

def create_grade(db: Session, grade: schemas.GradeCreate):
    db_grade = models.Grade(**grade.dict())
    if grade.exam_date:
        try:
            db_grade.exam_date = datetime.strptime(grade.exam_date, "%Y-%m-%d").date()
        except:
            pass
    
    # Auto-calculate GPA points from letter grade if not provided
    if grade.letter_grade and not grade.gpa_points:
        gpa_map = {
            'A+': 4.0, 'A': 4.0, 'A-': 3.7,
            'B+': 3.3, 'B': 3.0, 'B-': 2.7,
            'C+': 2.3, 'C': 2.0, 'C-': 1.7,
            'D+': 1.3, 'D': 1.0, 'F': 0.0
        }
        db_grade.gpa_points = gpa_map.get(grade.letter_grade, 0.0)
    
    # Auto-calculate letter grade from numerical grade if not provided
    if grade.grade_value and not grade.letter_grade:
        if grade.grade_value >= 95:
            db_grade.letter_grade = 'A+'
        elif grade.grade_value >= 90:
            db_grade.letter_grade = 'A'
        elif grade.grade_value >= 87:
            db_grade.letter_grade = 'A-'
        elif grade.grade_value >= 83:
            db_grade.letter_grade = 'B+'
        elif grade.grade_value >= 80:
            db_grade.letter_grade = 'B'
        elif grade.grade_value >= 77:
            db_grade.letter_grade = 'B-'
        elif grade.grade_value >= 73:
            db_grade.letter_grade = 'C+'
        elif grade.grade_value >= 70:
            db_grade.letter_grade = 'C'
        elif grade.grade_value >= 67:
            db_grade.letter_grade = 'C-'
        elif grade.grade_value >= 63:
            db_grade.letter_grade = 'D+'
        elif grade.grade_value >= 60:
            db_grade.letter_grade = 'D'
        else:
            db_grade.letter_grade = 'F'
    
    db.add(db_grade)
    db.commit()
    db.refresh(db_grade)
    return db_grade

def update_grade(db: Session, grade_id: int, grade: schemas.GradeUpdate):
    db_grade = db.query(models.Grade).filter(models.Grade.id == grade_id).first()
    if db_grade:
        for key, value in grade.dict(exclude_unset=True).items():
            if key == "exam_date" and value:
                try:
                    value = datetime.strptime(value, "%Y-%m-%d").date()
                except:
                    continue
            setattr(db_grade, key, value)
        db.commit()
        db.refresh(db_grade)
    return db_grade

def delete_grade(db: Session, grade_id: int):
    db_grade = db.query(models.Grade).filter(models.Grade.id == grade_id).first()
    if db_grade:
        db.delete(db_grade)
        db.commit()
        return True
    return False

def calculate_student_gpa(db: Session, student_id: int):
    grades = db.query(models.Grade).filter(models.Grade.student_id == student_id).all()
    if not grades:
        return 0.0
    
    total_points = sum(grade.gpa_points or 0 for grade in grades)
    return round(total_points / len(grades), 2) 