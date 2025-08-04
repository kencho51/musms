from pydantic import BaseModel, EmailStr, field_serializer
from datetime import date, datetime
from typing import Optional, Union, List

# User schemas
class UserBase(BaseModel):
    username: str
    email: str
    role: str = "student"

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int
    is_active: bool
    created_at: datetime
    
    class Config:
        from_attributes = True

# Student schemas
class StudentBase(BaseModel):
    student_id: str
    first_name: str
    last_name: str
    email: str
    phone: Optional[str] = None
    date_of_birth: Optional[Union[str, date]] = None
    major: Optional[str] = None
    year_of_study: Optional[int] = None

class StudentCreate(StudentBase):
    pass

class StudentUpdate(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[str] = None
    phone: Optional[str] = None
    date_of_birth: Optional[Union[str, date]] = None
    major: Optional[str] = None
    year_of_study: Optional[int] = None

class Student(StudentBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @field_serializer('date_of_birth')
    def serialize_date_of_birth(self, value):
        if isinstance(value, date):
            return value.strftime('%Y-%m-%d')
        return value
    
    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, value):
        if isinstance(value, datetime):
            return value.isoformat()
        return value
    
    class Config:
        from_attributes = True

# Course schemas
class CourseBase(BaseModel):
    course_code: str
    course_name: str
    description: Optional[str] = None
    credits: Optional[int] = 3
    semester: Optional[str] = None
    year: Optional[int] = None
    instructor: Optional[str] = None
    max_students: Optional[int] = 30

class CourseCreate(CourseBase):
    pass

class CourseUpdate(BaseModel):
    course_name: Optional[str] = None
    description: Optional[str] = None
    credits: Optional[int] = None
    semester: Optional[str] = None
    year: Optional[int] = None
    instructor: Optional[str] = None
    max_students: Optional[int] = None

class Course(CourseBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, value):
        if isinstance(value, datetime):
            return value.isoformat()
        return value
    
    class Config:
        from_attributes = True

# Grade schemas
class GradeBase(BaseModel):
    student_id: int
    course_id: int
    grade_value: Optional[float] = None
    letter_grade: Optional[str] = None
    gpa_points: Optional[float] = None
    exam_type: Optional[str] = None
    exam_date: Optional[Union[str, date]] = None
    notes: Optional[str] = None

class GradeCreate(GradeBase):
    pass

class GradeUpdate(BaseModel):
    grade_value: Optional[float] = None
    letter_grade: Optional[str] = None
    gpa_points: Optional[float] = None
    exam_type: Optional[str] = None
    exam_date: Optional[Union[str, date]] = None
    notes: Optional[str] = None

class Grade(GradeBase):
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    @field_serializer('exam_date')
    def serialize_exam_date(self, value):
        if isinstance(value, date):
            return value.strftime('%Y-%m-%d')
        return value
    
    @field_serializer('created_at', 'updated_at')
    def serialize_datetime(self, value):
        if isinstance(value, datetime):
            return value.isoformat()
        return value
    
    class Config:
        from_attributes = True

# Combined schemas for detailed views
class StudentWithGrades(Student):
    grades: List['Grade'] = []

class CourseWithGrades(Course):
    grades: List['Grade'] = []
    
class GradeWithDetails(Grade):
    student: Optional[Student] = None
    course: Optional[Course] = None 