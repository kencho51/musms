import { verifyJWTFallback } from '../../../../server/utils/jwt.js'
import { getDB } from '../../../../server/utils/db.js'


export default defineEventHandler(async (event) => {
  const prisma = getDB(event)
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
    const courseId = query.courseId as string
    const studentId = query.studentId as string
    const examType = query.examType as string
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (courseId) {
      where.courseId = parseInt(courseId)
    }
    
    if (studentId) {
      where.studentId = parseInt(studentId)
    }
    
    if (examType) {
      where.examType = { contains: examType }
    }

    // Get grades with pagination
    const [grades, total] = await Promise.all([
      prisma.grade.findMany({
        where,
        select: {
          id: true,
          gradeValue: true,
          letterGrade: true,
          gpaPoints: true,
          examType: true,
          examDate: true,
          notes: true,
          createdAt: true,
          updatedAt: true,
          student: {
            select: {
              id: true,
              studentId: true,
              firstName: true,
              lastName: true,
              email: true
            }
          },
          course: {
            select: {
              id: true,
              courseCode: true,
              courseName: true,
              credits: true,
              semester: true,
              year: true
            }
          },
          creator: {
            select: {
              name: true,
              username: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.grade.count({ where })
    ])

    return {
      success: true,
      data: {
        grades,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Grades retrieved successfully'
    }
  } catch (error: any) {
    console.error('Get grades error:', error)
    
    if (error.statusCode) {
      throw error
    }
    
    throw createError({
      statusCode: 500,
      statusMessage: 'Internal server error'
    })
  } finally {
  }
})