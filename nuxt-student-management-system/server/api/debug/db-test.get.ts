export default defineEventHandler(async (event) => {
  try {
    const env = event?.context?.cloudflare?.env
    
    // Check if D1 binding exists
    if (!env?.DB) {
      return {
        success: false,
        error: 'D1_BINDING_MISSING',
        message: 'D1 database binding (DB) not found in environment',
        environment: process.env.NODE_ENV,
        available_env_keys: env ? Object.keys(env) : 'No cloudflare env available'
      }
    }

    // Test basic D1 connection
    try {
      const result = await env.DB.prepare('SELECT 1 as test').first()
      return {
        success: true,
        message: 'D1 database connection successful',
        test_result: result,
        environment: process.env.NODE_ENV
      }
    } catch (dbError: any) {
      return {
        success: false,
        error: 'D1_CONNECTION_FAILED',
        message: 'D1 database connection failed',
        db_error: dbError.message,
        environment: process.env.NODE_ENV
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'GENERAL_ERROR',
      message: error.message,
      environment: process.env.NODE_ENV
    }
  }
}) 