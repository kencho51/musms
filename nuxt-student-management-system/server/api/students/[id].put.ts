import { verifyJWTFallback } from '../../utils/jwt.js'
import { getDB } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    // Auth check
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'No token provided', step: 'auth_check' }
    }

    const token = authHeader.substring(7)
    const config = useRuntimeConfig()
    
    let decoded: any
    try {
      decoded = await verifyJWTFallback(token, config.jwtSecret)
    } catch (error: any) {
      return { error: 'Token verification failed', step: 'token_verify', details: error.message }
    }

    const prisma = getDB(event)
    
    // Check user permissions
    const currentUser = await prisma.user.findUnique({
      where: { id: decoded.userId }
    })

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return { error: 'Access denied - Admin required', step: 'permission_check' }
    }

    // Get student ID from route
    const studentId = parseInt(getRouterParam(event, 'id') || '0')
    if (!studentId) {
      return { error: 'Invalid student ID', step: 'id_validation' }
    }

    // Check if student exists
    const existingStudent = await prisma.student.findUnique({
      where: { id: studentId }
    })

    if (!existingStudent) {
      return { error: 'Student not found', step: 'student_check' }
    }

    // Get update data
    const { 
      studentId: studentIdCode,
      firstName, 
      lastName, 
      email, 
      phone,
      major, 
      yearOfStudy,
      status
    } = await readBody(event)

    // Build minimal update data
    const updateData: any = {}
    
    if (firstName !== undefined) updateData.firstName = firstName
    if (lastName !== undefined) updateData.lastName = lastName
    if (email !== undefined) updateData.email = email
    if (phone !== undefined) updateData.phone = phone
    if (major !== undefined) updateData.major = major
    if (yearOfStudy !== undefined) updateData.yearOfStudy = yearOfStudy
    if (studentIdCode !== undefined) updateData.studentId = studentIdCode
    if (status !== undefined && ['ACTIVE', 'INACTIVE', 'GRADUATED', 'SUSPENDED'].includes(status)) {
      updateData.status = status
    }

    // Simple update without complex validation
    try {
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
          major: true,
          yearOfStudy: true,
          status: true,
          userId: true,
          createdBy: true
        }
      })

      return {
        success: true,
        data: { student },
        message: 'Student updated successfully'
      }
    } catch (updateError: any) {
      return {
        error: 'Update failed',
        step: 'prisma_update',
        details: updateError.message
      }
    }
  } catch (error: any) {
    return {
      error: 'General error',
      step: 'general',
      details: error.message
    }
  }
}) 