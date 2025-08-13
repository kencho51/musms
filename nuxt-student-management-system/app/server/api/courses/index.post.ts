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

    const { 
      courseCode, 
      courseName, 
      description, 
      credits, 
      semester, 
      year, 
      instructor, 
      maxStudents 
    } = await readBody(event)

    // Validate input
    if (!courseCode || !courseName || !credits || !semester || !year) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Course code, name, credits, semester, and year are required'
      })
    }

    if (!['FALL', 'SPRING', 'SUMMER'].includes(semester)) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid semester'
      })
    }

    if (credits < 1 || credits > 6) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Credits must be between 1 and 6'
      })
    }

    if (year < 2020 || year > 2030) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Year must be between 2020 and 2030'
      })
    }

    // Check if course code already exists for the same semester/year
    const existingCourse = await prisma.course.findFirst({
      where: { 
        courseCode,
        semester,
        year
      }
    })

    if (existingCourse) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Course code already exists for this semester and year'
      })
    }

    // Create course
    const course = await prisma.course.create({
      data: {
        courseCode,
        courseName,
        description: description || null,
        credits,
        semester,
        year,
        instructor: instructor || null,
        maxStudents: maxStudents || 30,
        createdBy: currentUser.id
      },
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
        }
      }
    })

    return {
      success: true,
      data: course,
      message: 'Course created successfully'
    }
  } catch (error: any) {
    console.error('Create course error:', error)
    
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