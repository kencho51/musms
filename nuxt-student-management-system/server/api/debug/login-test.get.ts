import { getDB } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const prisma = getDB(event)
    
    // Test basic user query
    const user = await prisma.user.findUnique({
      where: { username: 'admin' },
      select: {
        id: true,
        username: true,
        email: true,
        role: true,
        isActive: true
      }
    })
    
    return {
      success: true,
      message: 'Login test successful',
      user_found: !!user,
      user_data: user ? {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        isActive: user.isActive
      } : null
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'LOGIN_TEST_FAILED',
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5) // First 5 lines of stack trace
    }
  }
}) 