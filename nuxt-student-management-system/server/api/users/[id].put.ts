import bcrypt from 'bcryptjs'
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

    const userId = parseInt(getRouterParam(event, 'id') || '0')
    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid user ID'
      })
    }

    const { name, username, email, password, role, isActive } = await readBody(event)

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!existingUser) {
      throw createError({
        statusCode: 404,
        statusMessage: 'User not found'
      })
    }

    // Build update data
    const updateData: any = {}
    
    if (name !== undefined) updateData.name = name
    if (username !== undefined) {
      // Check if username already exists (excluding current user)
      const existingUsername = await prisma.user.findFirst({
        where: { 
          username,
          id: { not: userId }
        }
      })

      if (existingUsername) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Username already exists'
        })
      }
      updateData.username = username
    }
    
    if (email !== undefined) {
      // Check if email already exists (excluding current user)
      const existingEmail = await prisma.user.findFirst({
        where: { 
          email,
          id: { not: userId }
        }
      })

      if (existingEmail) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Email already exists'
        })
      }
      updateData.email = email
    }
    
    if (password !== undefined && password.length > 0) {
      if (password.length < 6) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Password must be at least 6 characters long'
        })
      }
      updateData.password = await bcrypt.hash(password, 12)
    }
    
    if (role !== undefined) {
      if (!['ADMIN', 'TEACHER', 'STUDENT'].includes(role)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid role'
        })
      }
      updateData.role = role
    }
    
    if (isActive !== undefined) updateData.isActive = isActive

    // Update user
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    return {
      success: true,
      data: user,
      message: 'User updated successfully'
    }
  } catch (error: any) {
    console.error('Update user error:', error)
    
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