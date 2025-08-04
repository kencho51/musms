import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const { username, password } = await readBody(event)

    // Validate input
    if (!username || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username and password are required'
      })
    }

    // Find user by username
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true,
        createdAt: true,
        updatedAt: true
      }
    })

    if (!user) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Check if user is active
    if (!user.isActive) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Account is deactivated'
      })
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid credentials'
      })
    }

    // Generate JWT token
    const config = useRuntimeConfig()
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    )

    // Remove password from response
    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    }
  } catch (error: any) {
    console.error('Login error:', error)
    
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