import bcrypt from 'bcryptjs'
import { verifyJWTFallback } from '../../utils/jwt.js'
import { getDB } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const body = await readBody(event)
    const { username, password } = body

    // Step 1: Validate input
    if (!username || !password) {
      return {
        success: false,
        step: 'INPUT_VALIDATION',
        error: 'Username and password are required'
      }
    }

    // Step 2: Get database connection
    let prisma
    try {
      prisma = getDB(event)
    } catch (error: any) {
      return {
        success: false,
        step: 'DATABASE_CONNECTION',
        error: error.message
      }
    }

    // Step 3: Find user
    let user
    try {
      user = await prisma.user.findUnique({
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
    } catch (error: any) {
      return {
        success: false,
        step: 'USER_LOOKUP',
        error: error.message
      }
    }

    if (!user) {
      return {
        success: false,
        step: 'USER_NOT_FOUND',
        error: 'Invalid credentials'
      }
    }

    if (!user.isActive) {
      return {
        success: false,
        step: 'USER_INACTIVE',
        error: 'Account is deactivated'
      }
    }

    // Step 4: Verify password
    let isPasswordValid
    try {
      isPasswordValid = await bcrypt.compare(password, user.password)
    } catch (error: any) {
      return {
        success: false,
        step: 'PASSWORD_VERIFICATION',
        error: error.message
      }
    }

    if (!isPasswordValid) {
      return {
        success: false,
        step: 'PASSWORD_INVALID',
        error: 'Invalid credentials'
      }
    }

    // Step 5: Generate JWT token
    let token
    try {
      const config = useRuntimeConfig()
      token = jwt.sign(
        { 
          userId: user.id, 
          username: user.username, 
          role: user.role 
        },
        config.jwtSecret,
        { expiresIn: '7d' }
      )
    } catch (error: any) {
      return {
        success: false,
        step: 'TOKEN_GENERATION',
        error: error.message
      }
    }

    // Step 6: Success - prepare response
    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      step: 'SUCCESS',
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful'
    }
  } catch (error: any) {
    return {
      success: false,
      step: 'UNEXPECTED_ERROR',
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    }
  }
}) 