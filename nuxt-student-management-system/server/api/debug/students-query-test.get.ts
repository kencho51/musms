import { getDB } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  try {
    const prisma = getDB(event)
    
    // Test the exact query structure from the students endpoint
    const where: any = {}
    
    try {
      // First, try a simple query
      const simpleStudents = await prisma.student.findMany({
        select: {
          id: true,
          studentId: true,
          firstName: true,
          lastName: true,
          email: true
        },
        take: 2
      })
      
      // Then try with relations
      const studentsWithRelations = await prisma.student.findMany({
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
        take: 2,
        skip: 0,
        orderBy: {
          createdAt: 'desc'
        }
      })
      
      const total = await prisma.student.count({ where })
      
      return {
        success: true,
        simple_query_works: true,
        simple_students: simpleStudents,
        complex_query_works: true,
        students_with_relations: studentsWithRelations,
        total_count: total
      }
    } catch (queryError: any) {
      return {
        success: false,
        error: 'Query failed',
        message: queryError.message,
        stack: queryError.stack?.split('\n').slice(0, 5)
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'General error',
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    }
  }
}) 