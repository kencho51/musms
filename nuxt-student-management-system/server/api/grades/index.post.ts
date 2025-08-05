import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Verify admin/teacher access
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No token provided'
      })
    }

    const token = authHeader.substring(7)
    const config = useRuntimeConfig()
    let decoded: any
    
    try {
      decoded = jwt.verify(token, config.jwtSecret)
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    // Get user and check if admin or teacher
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!currentUser || !['ADMIN', 'TEACHER'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin or Teacher access required'
      })
    }

    const { 
      studentId,
      courseId,
      gradeValue, 
      letterGrade, 
      gpaPoints,
      examType,
      examDate,
      notes
    } = await readBody(event)

    // Validate input
    if (!studentId || !courseId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Student ID and Course ID are required'
      })
    }

    // Check if student exists
    const student = await prisma.student.findUnique({
      where: { id: parseInt(studentId) }
    })

    if (!student) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Student not found'
      })
    }

    // Check if course exists
    const course = await prisma.course.findUnique({
      where: { id: parseInt(courseId) }
    })

    if (!course) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Course not found'
      })
    }

    // Check if student is enrolled in the course
    const enrollment = await prisma.enrollment.findUnique({
      where: {
        studentId_courseId: {
          studentId: parseInt(studentId),
          courseId: parseInt(courseId)
        }
      }
    })

    if (!enrollment) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Student is not enrolled in this course'
      })
    }

    // Validate grade values
    if (gradeValue !== undefined && gradeValue !== null) {
      if (gradeValue < 0 || gradeValue > 100) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Grade value must be between 0 and 100'
        })
      }
    }

    if (gpaPoints !== undefined && gpaPoints !== null) {
      if (gpaPoints < 0 || gpaPoints > 4.0) {
        throw createError({
          statusCode: 400,
          statusMessage: 'GPA points must be between 0.0 and 4.0'
        })
      }
    }

    // Create grade
    const grade = await prisma.grade.create({
      data: {
        studentId: parseInt(studentId),
        courseId: parseInt(courseId),
        gradeValue: gradeValue || null,
        letterGrade: letterGrade || null,
        gpaPoints: gpaPoints || null,
        examType: examType || null,
        examDate: examDate ? new Date(examDate) : null,
        notes: notes || null,
        createdBy: currentUser.id
      },
      select: {
        id: true,
        gradeValue: true,
        letterGrade: true,
        gpaPoints: true,
        examType: true,
        examDate: true,
        notes: true,
        createdAt: true,
        updatedAt: true,
        student: {
          select: {
            id: true,
            studentId: true,
            firstName: true,
            lastName: true,
            email: true
          }
        },
        course: {
          select: {
            id: true,
            courseCode: true,
            courseName: true,
            credits: true,
            semester: true,
            year: true
          }
        },
        creator: {
          select: {
            name: true,
            username: true
          }
        }
      }
    })

    return {
      success: true,
      data: grade,
      message: 'Grade created successfully'
    }
  } catch (error: any) {
    console.error('Create grade error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  } finally {
    await prisma.$disconnect()
  }
}) 