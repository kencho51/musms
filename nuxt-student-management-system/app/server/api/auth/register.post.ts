import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    const { name, username, email, password } = await readBody(event)

    // Validate input
    if (!name || !username || !email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'All fields are required'
      })
    }

    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 6 characters long'
      })
    }

    // Check if username already exists
    const existingUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUsername) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Username already exists'
      })
    }

    // Check if email already exists
    const existingEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingEmail) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email already exists'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        username,
        email,
        password: hashedPassword,
        role: 'STUDENT', // Default role
        isActive: true
      },
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

    return {
      success: true,
      data: {
        user,
        token
      },
      message: 'Account created successfully'
    }
  } catch (error: any) {
    console.error('Registration error:', error)
    
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
