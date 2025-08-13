import { getDB } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const prisma = getDB(event)
    
    // Test basic student query
    const studentCount = await prisma.student.count()
    
    // Try to get a sample student
    const sampleStudents = await prisma.student.findMany({
      take: 2,
      select: {
        id: true,
        studentId: true,
        firstName: true,
        lastName: true,
        email: true
      }
    })
    
    return {
      success: true,
      database_working: true,
      student_table_exists: true,
      student_count: studentCount,
      sample_students: sampleStudents
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 5),
      database_working: false
    }
  }
}) 