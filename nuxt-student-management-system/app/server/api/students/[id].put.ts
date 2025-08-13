import { verifyJWTFallback } from '../../../../server/utils/jwt.js'
import { getDB } from '../../../../server/utils/db.js'


export default defineEventHandler(async (event) => {
  const prisma = getDB(event)
  try {
    // Verify admin access
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

    // Get user and check if admin
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      throw createError({
        statusCode: 403,
        statusMessage: 'Admin access required'
      })
    }

    const studentId = parseInt(getRouterParam(event, 'id') || '0')
    if (!studentId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Invalid student ID'
      })
    }

    const { 
      studentId: studentIdCode,
      firstName, 
      lastName, 
      email, 
      phone,
      dateOfBirth,
      major, 
      yearOfStudy,
      enrollmentDate,
      status
    } = await readBody(event)

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!existingStudent) {
      throw createError({
        statusCode: 404,
        statusMessage: 'Student not found'
      })
    }

    // Build update data
    const updateData: any = {}
    
    if (studentIdCode !== undefined) {
      // Check if student ID already exists (excluding current student)
      const existingStudentId = await prisma.student.findFirst({
        where: { 
          studentId: studentIdCode,
          id: { not: studentId }
        }
      })

      if (existingStudentId) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Student ID already exists'
        })
      }
      updateData.studentId = studentIdCode
    }
    
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    
    if (email !== undefined) {
      // Check if email already exists (excluding current student)
      const existingEmail = await prisma.student.findFirst({
        where: { 
          email,
          id: { not: studentId }
        }
      })

      if (existingEmail) {
        throw createError({
          statusCode: 409,
          statusMessage: 'Email already exists'
        })
      }
      updateData.email = email
    }
    
    if (phone !== undefined) updateData.phone = phone
    if (dateOfBirth !== undefined) updateData.dateOfBirth = dateOfBirth ? new Date(dateOfBirth) : null
    if (major !== undefined) updateData.major = major
    if (yearOfStudy !== undefined) updateData.yearOfStudy = yearOfStudy
    if (enrollmentDate !== undefined) updateData.enrollmentDate = enrollmentDate ? new Date(enrollmentDate) : null
    if (status !== undefined) {
      if (!['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED'].includes(status)) {
        throw createError({
          statusCode: 400,
          statusMessage: 'Invalid status'
        })
      }
      updateData.status = status
    }

    // Update student
    const student = await prisma.student.update({
      where: { id: studentId },
      data: updateData,
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
        }
      }
    })

    return {
      success: true,
      data: student,
      message: 'Student updated successfully'
    }
  } catch (error: any) {
    console.error('Update student error:', error)
    
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