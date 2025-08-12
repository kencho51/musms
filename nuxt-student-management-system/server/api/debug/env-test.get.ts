export default defineEventHandler(async (event) => {
  try {
    const config = useRuntimeConfig()
    const env = event?.context?.cloudflare?.env
    
    return {
      success: true,
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        has_cloudflare_env: !!env,
        has_DB_binding: !!(env?.DB),
        has_jwt_secret: !!config.jwtSecret,
        jwt_secret_length: config.jwtSecret ? config.jwtSecret.length : 0,
        runtime_config_keys: Object.keys(config),
        available_env_keys: env ? Object.keys(env).filter(key => !key.startsWith('__')) : 'No env available'
      }
    }
  } catch (error: any) {
    return {
      success: false,
      error: 'ENV_CHECK_FAILED',
      message: error.message,
      stack: error.stack
    }
  }
}) 