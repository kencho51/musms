export default defineEventHandler(async (event) => {
  try {
    // Test if bcryptjs can be imported and used
    const bcrypt = await import('bcryptjs')
    
    // Test basic bcrypt operations
    const testPassword = 'test123'
    const hash = await bcrypt.default.hash(testPassword, 10)
    const isValid = await bcrypt.default.compare(testPassword, hash)
    
    return {
      success: true,
      bcrypt_imported: true,
      hash_generated: !!hash,
      comparison_works: isValid,
      hash_sample: hash.substring(0, 10) + '...'
    }
  } catch (error: any) {
    return {
      success: false,
      error: error.message,
      stack: error.stack?.split('\n').slice(0, 3)
    }
  }
}) 