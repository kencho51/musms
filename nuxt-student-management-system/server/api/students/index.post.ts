import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export default defineEventHandler(async (event) => {
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
      decoded = jwt.verify(token, config.jwtSecret)
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

    const { 
      studentId,
      firstName, 
      lastName, 
      email, 
      phone,
      dateOfBirth,
      major, 
      yearOfStudy,
      enrollmentDate,
      userId
    } = await readBody(event)

    // Validate input
    if (!studentId || !firstName || !lastName || !email) {
      throw createError({
        statusCode: 400,
        statusMessage: 'Student ID, first name, last name, and email are required'
      })
    }

    // Check if student ID already exists
    const existingStudentId = await prisma.student.findUnique({
      where: { studentId }
    })

    if (existingStudentId) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Student ID already exists'
      })
    }

    // Check if email already exists
    const existingEmail = await prisma.student.findUnique({
      where: { email }
    })

    if (existingEmail) {
      throw createError({
        statusCode: 409,
        statusMessage: 'Email already exists'
      })
    }

    // If userId is provided, check if it exists and is a student user
    if (userId) {
      const user = await prisma.user.findUnique({
        where: { id: userId }
      })

      if (!user) {
        throw createError({
          statusCode: 404,
          statusMessage: 'User not found'
        })
      }

      if (user.role !== 'STUDENT') {
        throw createError({
          statusCode: 400,
          statusMessage: 'User must have STUDENT role'
        })
      }

      // Check if user is already linked to another student
      const existingStudent = await prisma.student.findUnique({
        where: { userId }
      })

      if (existingStudent) {
        throw createError({
          statusCode: 409,
          statusMessage: 'User is already linked to another student'
        })
      }
    }

    // Create student
    const student = await prisma.student.create({
      data: {
        studentId,
        firstName,
        lastName,
        email,
        phone: phone || null,
        dateOfBirth: dateOfBirth ? new Date(dateOfBirth) : null,
        major: major || null,
        yearOfStudy: yearOfStudy || null,
        enrollmentDate: enrollmentDate ? new Date(enrollmentDate) : new Date(),
        userId: userId || null,
        createdBy: currentUser.id
      },
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
      message: 'Student created successfully'
    }
  } catch (error: any) {
    console.error('Create student error:', error)
    
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