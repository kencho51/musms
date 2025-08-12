// Web Crypto API implementation for Cloudflare Workers compatibility
export async function hashPassword(password) {
  const encoder = new TextEncoder()
  const data = encoder.encode(password)
  const salt = crypto.getRandomValues(new Uint8Array(16))
  
  // Use PBKDF2 with Web Crypto API
  const key = await crypto.subtle.importKey(
    'raw',
    data,
    { name: 'PBKDF2' },
    false,
    ['deriveBits']
  )
  
  const hash = await crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: salt,
      iterations: 100000,
      hash: 'SHA-256'
    },
    key,
    256
  )
  
  // Combine salt and hash
  const combined = new Uint8Array(salt.length + hash.byteLength)
  combined.set(salt)
  combined.set(new Uint8Array(hash), salt.length)
  
  // Return base64 encoded
  return btoa(String.fromCharCode(...combined))
}

export async function verifyPassword(password, hashedPassword) {
  try {
    const encoder = new TextEncoder()
    const data = encoder.encode(password)
    
    // Decode the stored hash
    const combined = new Uint8Array(
      atob(hashedPassword)
        .split('')
        .map(char => char.charCodeAt(0))
    )
    
    // Extract salt (first 16 bytes) and hash (rest)
    const salt = combined.slice(0, 16)
    const storedHash = combined.slice(16)
    
    // Generate hash with same salt
    const key = await crypto.subtle.importKey(
      'raw',
      data,
      { name: 'PBKDF2' },
      false,
      ['deriveBits']
    )
    
    const hash = await crypto.subtle.deriveBits(
      {
        name: 'PBKDF2',
        salt: salt,
        iterations: 100000,
        hash: 'SHA-256'
      },
      key,
      256
    )
    
    // Compare hashes
    const newHash = new Uint8Array(hash)
    if (newHash.length !== storedHash.length) return false
    
    for (let i = 0; i < newHash.length; i++) {
      if (newHash[i] !== storedHash[i]) return false
    }
    
    return true
  } catch (error) {
    console.error('Password verification error:', error)
    return false
  }
}

// Fallback: Simple comparison for existing bcrypt hashes
export async function verifyBcryptPassword(password, bcryptHash) {
  // This is a temporary fallback - in production you'd migrate all passwords
  // For now, we'll try to import bcryptjs dynamically
  try {
    const bcrypt = await import('bcryptjs')
    return await bcrypt.default.compare(password, bcryptHash)
  } catch (error) {
    console.error('Bcrypt fallback failed:', error)
    return false
  }
} 