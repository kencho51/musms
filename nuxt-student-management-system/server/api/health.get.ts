import { verifyJWTFallback } from '../utils/jwt.js'
import { getDB } from '../utils/db.js'

/**
 * Comprehensive health check endpoint
 * Tests database, JWT, and auth system health
 * 
 * Usage:
 * - GET /api/health - Basic health check
 * - GET /api/health with Authorization header - Full auth test
 */
export default defineEventHandler(async (event) => {
  const results = {
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: '1.0.0',
    checks: {
      database: { status: 'unknown', details: {} },
      jwt: { status: 'unknown', details: {} },
      auth: { status: 'unknown', details: {} }
    }
  }

  // 1. Database Health Check
  try {
    const prisma = getDB(event)
    
    // Test basic query
    await prisma.$queryRaw`SELECT 1 as test`
    
    // Count records in main tables
    const [userCount, studentCount, courseCount] = await Promise.all([
      prisma.user.count().catch(() => 0),
      prisma.student.count().catch(() => 0),
      prisma.course.count().catch(() => 0)
    ])
    
    results.checks.database = {
      status: 'healthy',
      details: {
        connection: 'success',
        records: { users: userCount, students: studentCount, courses: courseCount }
      }
    }
  } catch (error: any) {
    results.checks.database = {
      status: 'error',
      details: { error: error.message }
    }
  }

  // 2. JWT Health Check
  try {
    const config = useRuntimeConfig()
    results.checks.jwt = {
      status: 'healthy',
      details: {
        secret_available: !!config.jwtSecret,
        secret_length: config.jwtSecret?.length || 0
      }
    }
  } catch (error: any) {
    results.checks.jwt = {
      status: 'error',
      details: { error: error.message }
    }
  }

  // 3. Auth System Check (if auth header provided)
  const authHeader = getHeader(event, 'authorization')
  if (authHeader?.startsWith('Bearer ')) {
    try {
      const token = authHeader.substring(7)
      const config = useRuntimeConfig()
      const decoded = await verifyJWTFallback(token, config.jwtSecret)
      
      const prisma = getDB(event)
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { id: true, username: true, role: true, isActive: true }
      })
      
      results.checks.auth = {
        status: user ? 'authenticated' : 'user_not_found',
        details: { user: user || null }
      }
    } catch (error: any) {
      results.checks.auth = {
        status: 'invalid_token',
        details: { error: error.message }
      }
    }
  } else {
    results.checks.auth = {
      status: 'no_token',
      details: { message: 'No Authorization header provided' }
    }
  }

  // Overall health status
  const overallStatus = Object.values(results.checks).every(check => 
    check.status === 'healthy' || check.status === 'authenticated' || check.status === 'no_token'
  ) ? 'healthy' : 'degraded'

  return {
    status: overallStatus,
    ...results
  }
}) 