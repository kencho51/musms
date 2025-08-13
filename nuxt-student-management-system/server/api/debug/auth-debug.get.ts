import { verifyJWTFallback } from '../../utils/jwt.js'

export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    
    // Get all headers
    const headers = getHeaders(event)
    const authorization = getHeader(event, 'authorization')
    
    let tokenInfo = {
      has_auth_header: !!authorization,
      auth_header_value: authorization,
      auth_header_length: authorization?.length || 0,
      starts_with_bearer: authorization?.startsWith('Bearer '),
      extracted_token: null,
      token_length: 0,
      jwt_verification: null,
      jwt_error: null
    }
    
    if (authorization && authorization.startsWith('Bearer ')) {
      const token = authorization.substring(7)
      tokenInfo.extracted_token = token.substring(0, 20) + '...' // First 20 chars for debugging
      tokenInfo.token_length = token.length
      
      try {
        const decoded = await verifyJWTFallback(token, config.jwtSecret)
        tokenInfo.jwt_verification = {
          success: true,
          userId: decoded.userId,
          username: decoded.username,
          role: decoded.role,
          exp: decoded.exp,
          iat: decoded.iat
        }
      } catch (error: any) {
        tokenInfo.jwt_error = error.message
        tokenInfo.jwt_verification = { success: false }
      }
    }
    
    return {
      success: true,
      headers: {
        authorization: headers.authorization,
        'user-agent': headers['user-agent'],
        'content-type': headers['content-type'],
        origin: headers.origin,
        referer: headers.referer
      },
      token_analysis: tokenInfo,
      jwt_secret_available: !!config.jwtSecret,
      jwt_secret_length: config.jwtSecret?.length || 0
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    }
  }
}) 