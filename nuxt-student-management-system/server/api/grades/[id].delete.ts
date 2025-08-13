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

    // Delete grade
    await prisma.grade.delete({
      where: { id: gradeId }
    })

    return {
      success: true,
      data: null,
      message: 'Grade deleted successfully'
    }
  } catch (error: any) {
    console.error('Delete grade error:', error)
    
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