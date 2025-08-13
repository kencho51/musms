import bcrypt from 'bcryptjs'
import { verifyJWTFallback } from '../../../../server/utils/jwt.js'
import { getDB } from '~/utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const { username, email, password, name } = await readBody(event)

    // Validate input
    if (!username || !email || !password) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username, email, and password are required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid email format'
      })
    }

    // Validate password length
    if (password.length < 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Password must be at least 6 characters long'
      })
    }

    // Get database instance
    const prisma = getDB(event)

    // Check if username already exists
    const existingUserByUsername = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUserByUsername) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Username already exists'
      })
    }

    // Check if email already exists
    const existingUserByEmail = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUserByEmail) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Email already exists'
      })
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10)

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        email,
        name: name || username,
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
  } catch (error) {
    console.error('Registration error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  }
})