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

    const courseId = parseInt(getRouterParam(event, 'id') || '0')
    if (!courseId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid course ID'
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
      maxStudents,
      status
    } = await readBody(event)

    // Check if course exists
    const existingCourse = await prisma.course.findUnique({
      where: { id: courseId }
    })

    if (!existingCourse) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Course not found'
      })
    }

    // Build update data
    const updateData: any = {}
    
    if (courseCode !== undefined) {
      // Check if course code already exists for the same semester/year (excluding current course)
      const duplicateCourse = await prisma.course.findFirst({
        where: { 
          courseCode,
          semester: semester || existingCourse.semester,
          year: year || existingCourse.year,
          id: { not: courseId }
        }
      })

      if (duplicateCourse) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Course code already exists for this semester and year'
        })
      }
      updateData.courseCode = courseCode
    }
    
    if (courseName !== undefined) updateData.courseName = courseName
    if (description !== undefined) updateData.description = description
    if (credits !== undefined) {
      if (credits < 1 || credits > 6) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Credits must be between 1 and 6'
        })
      }
      updateData.credits = credits
    }
    
    if (semester !== undefined) {
      if (!['FALL', 'SPRING', 'SUMMER'].includes(semester)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid semester'
        })
      }
      updateData.semester = semester
    }
    
    if (year !== undefined) {
      if (year < 2020 || year > 2030) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Year must be between 2020 and 2030'
        })
      }
      updateData.year = year
    }
    
    if (instructor !== undefined) updateData.instructor = instructor
    if (maxStudents !== undefined) updateData.maxStudents = maxStudents
    if (status !== undefined) {
      if (!['ACTIVE', 'INACTIVE', 'COMPLETED'].includes(status)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid status'
        })
      }
      updateData.status = status
    }

    // Update course
    const course = await prisma.course.update({
      where: { id: courseId },
      data: updateData,
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
      message: 'Course updated successfully'
    }
  } catch (error: any) {
    console.error('Update course error:', error)
    
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