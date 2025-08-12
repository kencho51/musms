import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { getDB } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const { username, password } = await readBody(event)

    // Validate input
    if (!username || !password) {
      return {
        success: false,
        statusCode: 400,
        message: 'Username and password are required'
      }
    }

    // Get database instance
    const prisma = getDB(event)

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
      return {
        success: false,
        statusCode: 401,
        message: 'Invalid credentials'
      }
    }

    // Check if user is active
    if (!user.isActive) {
      return {
        success: false,
        statusCode: 401,
        message: 'Account is deactivated'
      }
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)
    if (!isPasswordValid) {
      return {
        success: false,
        statusCode: 401,
        message: 'Invalid credentials'
      }
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
  } catch (error) {
    console.error('Login error:', error)
    
    return {
      success: false,
      statusCode: 500,
      message: 'Internal server error: ' + error.message
    }
  }
})