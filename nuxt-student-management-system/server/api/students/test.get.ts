import { verifyJWTFallback } from '../../utils/jwt.js'
import { getDB } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    // Test 1: Basic auth
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided', step: 'auth_check' }
    }

    // Test 2: Token verification
    const token = authHeader.substring(7)
    const config = useRuntimeConfig()
    let decoded: any
    
    try {
      decoded = await verifyJWTFallback(token, config.jwtSecret)
    } catch (error) {
      return { error: 'Token verification failed', step: 'token_verify', details: error.message }
    }

    // Test 3: Database connection
    const prisma = getDB(event)
    if (!prisma) {
      return { error: 'Database connection failed', step: 'db_connect' }
    }

    // Test 4: User lookup
    let currentUser
    try {
      currentUser = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })
    } catch (error) {
      return { error: 'User lookup failed', step: 'user_lookup', details: error.message }
    }

    if (!currentUser || !['ADMIN', 'TEACHER'].includes(currentUser.role)) {
      return { error: 'Access denied', step: 'permission_check' }
    }

    // Test 5: Simple student count
    let studentCount
    try {
      studentCount = await prisma.student.count()
    } catch (error) {
      return { error: 'Student count failed', step: 'student_count', details: error.message }
    }

    // Test 6: Basic student query
    let students
    try {
      students = await prisma.student.findMany({
        select: {
          id: true,
          studentId: true,
          firstName: true,
          lastName: true
        },
        take: 2
      })
    } catch (error) {
      return { error: 'Student query failed', step: 'student_query', details: error.message }
    }

    return {
      success: true,
      tests: {
        auth: 'passed',
        token: 'passed',
        database: 'passed',
        user_lookup: 'passed',
        permissions: 'passed',
        student_count: 'passed',
        student_query: 'passed'
      },
      data: {
        user: currentUser.username,
        student_count: studentCount,
        students: students
      }
    }
  } catch (error: any) {
    return {
      error: 'Unexpected error',
      step: 'general',
      details: error.message,
      stack: error.stack
    }
  }
}) 