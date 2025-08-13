import bcrypt from 'bcryptjs'
import { verifyJWTFallback } from '../../utils/jwt.js'
import { getDB } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const { username, password } = await readBody(event)

    if (!username || !password) {
      return {
        success: false,
        message: 'Username and password required'
      }
    }

    const prisma = getDB(event)
    
    const user = await prisma.user.findUnique({
      where: { username },
      select: {
        id: true,
        username: true,
        email: true,
        name: true,
        password: true,
        role: true,
        isActive: true
      }
    })

    if (!user || !user.isActive) {
      return {
        success: false,
        message: 'User not found or inactive'
      }
    }

    const isPasswordValid = await bcrypt.compare(password, user.password)
    
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Invalid password'
      }
    }

    const config = useRuntimeConfig()
    const token = jwt.sign(
      { userId: user.id, username: user.username, role: user.role },
      config.jwtSecret,
      { expiresIn: '7d' }
    )

    const { password: _, ...userWithoutPassword } = user

    return {
      success: true,
      data: { user: userWithoutPassword, token },
      message: 'Login successful'
    }
  } catch (error) {
    return {
      success: false,
      message: 'Error: ' + error.message,
      stack: error.stack
    }
  }
}) 