import jwt from 'jsonwebtoken'
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
      decoded = jwt.verify(token, config.jwtSecret)
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
    const major = query.major as string
    const status = query.status as string
    const yearOfStudy = query.yearOfStudy as string
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { studentId: { contains: search } },
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } }
      ]
    }
    
    if (major) {
      where.major = { contains: major }
    }
    
    if (status && ['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED'].includes(status)) {
      where.status = status
    }
    
    if (yearOfStudy) {
      where.yearOfStudy = parseInt(yearOfStudy)
    }

    // Get students with pagination
    const [students, total] = await Promise.all([
      prisma.student.findMany({
        where,
        select: {
          id: true,
          studentId: true,
          firstName: true,
          lastName: true,
          email: true,
          phone: true,
          dateOfBirth: true,
          major: true,
          yearOfStudy: true,
          enrollmentDate: true,
          status: true,
          createdAt: true,
          updatedAt: true,
          user: {
            select: {
              username: true,
              isActive: true
            }
          },
          creator: {
            select: {
              name: true,
              username: true
            }
          },
          _count: {
            select: {
              enrollments: true,
              grades: true
            }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.student.count({ where })
    ])

    return {
      success: true,
      data: {
        students,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      },
      message: 'Students retrieved successfully'
    }
  } catch (error: any) {
    console.error('Get students error:', error)
    
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