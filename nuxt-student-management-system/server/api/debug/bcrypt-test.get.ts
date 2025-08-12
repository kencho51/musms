import bcrypt from 'bcryptjs'
import { getDB } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const prisma = getDB(event)
    
    // Get admin user with password hash
    const user = await prisma.user.findUnique({
      where: { username: 'admin' },
      select: {
        id: true,
        username: true,
        password: true
      }
    })
    
    if (!user) {
      return {
        success: false,
        error: 'USER_NOT_FOUND',
        message: 'Admin user not found'
      }
    }
    
    // Test bcrypt comparison
    let bcryptResult = null
    let bcryptError = null
    
    try {
      bcryptResult = await bcrypt.compare('admin123', user.password)
    } catch (error: any) {
      bcryptError = error.message
    }
    
    // Test simple password check (for debugging)
    const passwordHash = user.password
    
    return {
      success: true,
      tests: {
        user_found: true,
        password_hash_length: passwordHash.length,
        password_hash_starts_with: passwordHash.substring(0, 10),
        bcrypt_available: typeof bcrypt.compare === 'function',
        bcrypt_test_result: bcryptResult,
        bcrypt_error: bcryptError,
        test_password: 'admin123'
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'BCRYPT_TEST_FAILED',
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    }
  }
}) 