import { verifyJWTFallback } from '../../utils/jwt.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Verify admin access
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

    // Get user and check if admin
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }

    const studentId = parseInt(getRouterParam(event, 'id') || '0')
    if (!studentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid student ID'
      })
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId },
      include: {
        enrollments: true,
        grades: true
      }
    })

    if (!existingStudent) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Student not found'
      })
    }

    // Check if student has enrollments or grades
    if (existingStudent.enrollments.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete student with existing enrollments'
      })
    }

    if (existingStudent.grades.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete student with existing grades'
      })
    }

    // Delete student
    await prisma.student.delete({
      where: { id: studentId }
    })

    return {
      success: true,
      data: null,
      message: 'Student deleted successfully'
    }
  } catch (error: any) {
    console.error('Delete student error:', error)
    
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