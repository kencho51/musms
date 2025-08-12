import jwt from 'jsonwebtoken'
import { getDB } from '../../utils/db'

export default defineEventHandler(async (event) => {
  try {
    const prisma = getDB(event)
    // Get authorization header
    const authorization = getHeader(event, 'authorization')
    
    if (!authorization || !authorization.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Authorization token required'
      })
    }

    // Extract token
    const token = authorization.substring(7) // Remove 'Bearer ' prefix

    // Verify JWT token
    const config = useRuntimeConfig()
    let decoded: any
    
    try {
      decoded = jwt.verify(token, config.jwtSecret)
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid or expired token'
      })
    }

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Check if user is still active
    if (!user.isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Account is deactivated'
      })
    }

    return {
      success: true,
      data: user,
      message: 'User retrieved successfully'
    }
  } catch (error: any) {
    console.error('Get user error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
}) 