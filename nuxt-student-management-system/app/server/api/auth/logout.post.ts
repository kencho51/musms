export default defineEventHandler(async (event) => {
  // In a JWT-based system, logout is typically handled client-side
  // by removing the token from storage. This endpoint can be used
  // for logging purposes or if you implement token blacklisting.
  
  return {
    success: true,
    message: 'Logged out successfully'
  }
})
