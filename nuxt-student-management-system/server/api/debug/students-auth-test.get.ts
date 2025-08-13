import { verifyJWTFallback } from '../../utils/jwt.js'
import { getDB } from '../../utils/db.js'

export default defineEventHandler(async (event) => {
  const steps = {
    step1_db_connection: false,
    step2_auth_header: false,
    step3_token_extract: false,
    step4_jwt_verify: false,
    step5_user_lookup: false,
    step6_role_check: false,
    step7_students_query: false,
    error_details: null
  }
  
  try {
    // Step 1: Database connection
    const prisma = getDB(event)
    steps.step1_db_connection = true
    
    // Step 2: Check auth header
    const authHeader = getHeader(event, 'authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { success: false, steps, error: 'No auth header or invalid format' }
    }
    steps.step2_auth_header = true
    
    // Step 3: Extract token
    const token = authHeader.substring(7)
    if (!token) {
      return { success: false, steps, error: 'Empty token' }
    }
    steps.step3_token_extract = true
    
    // Step 4: Verify JWT
    const config = useRuntimeConfig()
    let decoded: any
    try {
      decoded = await verifyJWTFallback(token, config.jwtSecret)
      steps.step4_jwt_verify = true
    } catch (error: any) {
      return { success: false, steps, error: `JWT verification failed: ${error.message}` }
    }
    
    // Step 5: User lookup
    let currentUser: any
    try {
      currentUser = await prisma.user.findUnique({
        where: { id: decoded.userId }
      })
      steps.step5_user_lookup = true
    } catch (error: any) {
      return { success: false, steps, error: `User lookup failed: ${error.message}` }
    }
    
    if (!currentUser) {
      return { success: false, steps, error: 'User not found in database' }
    }
    
    // Step 6: Role check
    if (!['ADMIN', 'TEACHER'].includes(currentUser.role)) {
      return { success: false, steps, error: `Invalid role: ${currentUser.role}` }
    }
    steps.step6_role_check = true
    
    // Step 7: Students query (simple)
    try {
      const studentCount = await prisma.student.count()
      steps.step7_students_query = true
      
      return {
        success: true,
        steps,
        student_count: studentCount,
        user_info: {
          id: currentUser.id,
          username: currentUser.username,
          role: currentUser.role
        }
      }
    } catch (error: any) {
      return { success: false, steps, error: `Students query failed: ${error.message}` }
    }
    
  } catch (error: any) {
    steps.error_details = {
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    }
    return { success: false, steps, general_error: error.message }
  }
}) 