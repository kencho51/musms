import { verifyJWTFallback } from '../../utils/jwt.js'
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
      decoded = await verifyJWTFallback(token,  config.jwtSecret)
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

    const gradeId = parseInt(getRouterParam(event, 'id') || '0')
    if (!gradeId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid grade ID'
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

    // Check if grade exists
    const existingGrade = await prisma.grade.findUnique({
      where: { id: gradeId }
    })

    if (!existingGrade) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Grade not found'
      })
    }

    // Build update data
    const updateData: any = {}
    
    if (studentId !== undefined) {
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
      updateData.studentId = parseInt(studentId)
    }
    
    if (courseId !== undefined) {
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
      updateData.courseId = parseInt(courseId)
    }
    
    if (gradeValue !== undefined) {
      if (gradeValue !== null && (gradeValue < 0 || gradeValue > 100)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Grade value must be between 0 and 100'
        })
      }
      updateData.gradeValue = gradeValue
    }
    
    if (letterGrade !== undefined) updateData.letterGrade = letterGrade
    
    if (gpaPoints !== undefined) {
      if (gpaPoints !== null && (gpaPoints < 0 || gpaPoints > 4.0)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'GPA points must be between 0.0 and 4.0'
        })
      }
      updateData.gpaPoints = gpaPoints
    }
    
    if (examType !== undefined) updateData.examType = examType
    if (examDate !== undefined) updateData.examDate = examDate ? new Date(examDate) : null
    if (notes !== undefined) updateData.notes = notes

    // Update grade
    const grade = await prisma.grade.update({
      where: { id: gradeId },
      data: updateData,
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
      message: 'Grade updated successfully'
    }
  } catch (error: any) {
    console.error('Update grade error:', error)
    
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