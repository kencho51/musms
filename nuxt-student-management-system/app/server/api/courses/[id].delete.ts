import jwt from 'jsonwebtoken'
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
      decoded = jwt.verify(token, config.jwtSecret)
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

    const courseId = parseInt(getRouterParam(event, 'id') || '0')
    if (!courseId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid course ID'
      })
    }

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId },
      include: {
        enrollments: true,
        grades: true
      }
    })

    if (!existingCourse) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Course not found'
      })
    }

    // Check if course has enrollments or grades
    if (existingCourse.enrollments.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete course with existing enrollments'
      })
    }

    if (existingCourse.grades.length > 0) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Cannot delete course with existing grades'
      })
    }

    // Delete course
    await prisma.course.delete({
      where: { id: courseId }
    })

    return {
      success: true,
      data: null,
      message: 'Course deleted successfully'
    }
  } catch (error: any) {
    console.error('Delete course error:', error)
    
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