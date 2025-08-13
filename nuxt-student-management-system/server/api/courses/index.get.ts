import { verifyJWTFallback } from '../../utils/jwt.js'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
  try {
    // Verify admin/teacher access
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw createError({
        statusCode: 401,
        statusMessage: 'No token provided'
      })
    }

    const token = authHeader.substring(7)
    const config = useRuntimeConfig()
    let decoded: any
    
    try {
      decoded = await verifyJWTFallback(token,  config.jwtSecret)
    } catch (error) {
      throw createError({
        statusCode: 401,
        statusMessage: 'Invalid token'
      })
    }

    // Get user and check if admin or teacher
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!currentUser || !['ADMIN', 'TEACHER'].includes(currentUser.role)) {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin or Teacher access required'
      })
    }

    // Get query parameters for pagination and filtering
    const query = getQuery(event)
    const page = parseInt(query.page as string) || 1
    const limit = parseInt(query.limit as string) || 10
    const search = query.search as string
    const semester = query.semester as string
    const year = query.year as string
    const status = query.status as string
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { courseCode: { contains: search } },
        { courseName: { contains: search } },
        { instructor: { contains: search } }
      ]
    }
    
    if (semester && ['FALL', 'SPRING', 'SUMMER'].includes(semester)) {
      where.semester = semester
    }
    
    if (year) {
      where.year = parseInt(year)
    }
    
    if (status && ['ACTIVE', 'INACTIVE', 'COMPLETED'].includes(status)) {
      where.status = status
    }

    // Get courses with pagination
    const [courses, total] = await Promise.all([
      prisma.course.findMany({
        where,
        select: {
          id: true,
          courseCode: true,
          courseName: true,
          description: true,
          credits: true,
          semester: true,
          year: true,
          instructor: true,
          maxStudents: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          creator: {
            select: {
              name: true,
              username: true
            }
          },
          _count: {
            select: {
              enrollments: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.course.count({ where })
    ])

    return {
      success: true,
      data: {
        courses,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Courses retrieved successfully'
    }
  } catch (error: any) {
    console.error('Get courses error:', error)
    
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