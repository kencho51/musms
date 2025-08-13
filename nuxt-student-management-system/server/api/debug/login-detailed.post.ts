import bcrypt from 'bcryptjs'
import { verifyJWTFallback } from '../../utils/jwt.js'
import { getDB } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const steps = []
  
  try {
    // Step 1: Read body
    steps.push('1. Reading request body')
    const body = await readBody(event)
    const { username, password } = body
    steps.push('1. ✅ Request body read successfully')

    // Step 2: Validate input
    steps.push('2. Validating input')
    if (!username || !password) {
      return {
        success: false,
        error: 'INPUT_VALIDATION_FAILED',
        message: 'Username and password are required',
        steps
      }
    }
    steps.push('2. ✅ Input validation passed')

    // Step 3: Get database connection
    steps.push('3. Getting database connection')
    const prisma = getDB(event)
    steps.push('3. ✅ Database connection obtained')

    // Step 4: Find user
    steps.push('4. Finding user in database')
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
    steps.push(`4. ✅ User query completed, found: ${!!user}`)

    if (!user) {
      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'User not found',
        steps
      }
    }

    // Step 5: Check if user is active
    steps.push('5. Checking user status')
    if (!user.isActive) {
      return {
        success: false,
        error: 'USER_INACTIVE',
        message: 'Account is deactivated',
        steps
      }
    }
    steps.push('5. ✅ User is active')

    // Step 6: Verify password
    steps.push('6. Verifying password')
    const isPasswordValid = await bcrypt.compare(password, user.password)
    steps.push(`6. ✅ Password verification completed, valid: ${isPasswordValid}`)
    
    if (!isPasswordValid) {
      return {
        success: false,
        error: 'INVALID_PASSWORD',
        message: 'Invalid credentials',
        steps
      }
    }

    // Step 7: Get runtime config
    steps.push('7. Getting runtime config')
    const config = useRuntimeConfig()
    steps.push('7. ✅ Runtime config obtained')

    // Step 8: Generate JWT token
    steps.push('8. Generating JWT token')
    const token = jwt.sign(
      { 
        userId: user.id, 
        username: user.username, 
        role: user.role 
      },
      config.jwtSecret,
      { expiresIn: '7d' }
    )
    steps.push('8. ✅ JWT token generated')

    // Step 9: Prepare response
    steps.push('9. Preparing response')
    const { password: _, ...userWithoutPassword } = user
    steps.push('9. ✅ Response prepared')

    return {
      success: true,
      data: {
        user: userWithoutPassword,
        token
      },
      message: 'Login successful',
      steps
    }

  } catch (error: any) {
    steps.push(`❌ Error at step: ${error.message}`)
    
    return {
      success: false,
      error: 'UNEXPECTED_ERROR',
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5), // First 5 lines of stack trace
      steps
    }
  }
}) 