import { signJWTFallback, verifyJWTFallback } from '../../utils/jwt.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Test JWT operations
    const testPayload = {
      userId: 1,
      username: 'admin',
      role: 'ADMIN'
    }
    
    let token = null
    let tokenError = null
    let verifyResult = null
    let verifyError = null
    
    try {
      // Test JWT signing
      token = await signJWTFallback(testPayload, config.jwtSecret, '7d')
    } catch (error: any) {
      tokenError = error.message
    }
    
    if (token) {
      try {
        // Test JWT verification
        verifyResult = await verifyJWTFallback(token, config.jwtSecret)
      } catch (error: any) {
        verifyError = error.message
      }
    }
    
    return {
      success: true,
      tests: {
        jwt_available: true,
        jwt_secret_available: !!config.jwtSecret,
        jwt_secret_length: config.jwtSecret ? config.jwtSecret.length : 0,
        token_generation_success: !!token,
        token_generation_error: tokenError,
        token_length: token ? token.length : 0,
        token_verification_success: !!verifyResult,
        token_verification_error: verifyError,
        verified_payload: verifyResult
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'JWT_TEST_FAILED',
      message: error.message,
      stack: error.stack?.split('\n').slice(0, 5)
    }
  }
}) 