// Web Crypto API JWT implementation for Cloudflare Workers compatibility

function base64urlEscape(str) {
  return str.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function base64urlEncode(str) {
  return base64urlEscape(btoa(str))
}

function base64urlDecode(str) {
  str += new Array(5 - str.length % 4).join('=')
  return atob(str.replace(/\-/g, '+').replace(/_/g, '/'))
}

export async function signJWT(payload, secret, expiresIn = '24h') {
  const header = {
    alg: 'HS256',
    typ: 'JWT'
  }

  // Add expiration time
  const now = Math.floor(Date.now() / 1000)
  const exp = expiresIn === '24h' ? now + 24 * 60 * 60 : now + parseInt(expiresIn)
  
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: exp
  }

  const encodedHeader = base64urlEncode(JSON.stringify(header))
  const encodedPayload = base64urlEncode(JSON.stringify(jwtPayload))
  
  const data = `${encodedHeader}.${encodedPayload}`
  
  // Create signature using Web Crypto API
  const encoder = new TextEncoder()
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  )
  
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(data)
  )
  
  const encodedSignature = base64urlEscape(btoa(String.fromCharCode(...new Uint8Array(signature))))
  
  return `${data}.${encodedSignature}`
}

export async function verifyJWT(token, secret) {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) {
      throw new Error('Invalid token format')
    }

    const [encodedHeader, encodedPayload, encodedSignature] = parts
    const data = `${encodedHeader}.${encodedPayload}`
    
    // Verify signature
    const encoder = new TextEncoder()
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(secret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    )
    
    // Decode the signature
    const signature = new Uint8Array(
      atob(encodedSignature.replace(/-/g, '+').replace(/_/g, '/') + '===')
        .split('')
        .map(char => char.charCodeAt(0))
    )
    
    const isValid = await crypto.subtle.verify(
      'HMAC',
      key,
      signature,
      encoder.encode(data)
    )
    
    if (!isValid) {
      throw new Error('Invalid signature')
    }
    
    // Decode payload and check expiration
    const payload = JSON.parse(base64urlDecode(encodedPayload))
    
    if (payload.exp && Date.now() >= payload.exp * 1000) {
      throw new Error('Token expired')
    }
    
    return payload
  } catch (error) {
    throw new Error(`JWT verification failed: ${error.message}`)
  }
}

// Fallback: Try to use jsonwebtoken if available
export async function signJWTFallback(payload, secret, expiresIn = '24h') {
  try {
    const jwt = await import('jsonwebtoken')
    return jwt.default.sign(payload, secret, { expiresIn })
  } catch (error) {
    console.error('JWT fallback failed:', error)
    return await signJWT(payload, secret, expiresIn)
  }
}

export async function verifyJWTFallback(token, secret) {
  try {
    const jwt = await import('jsonwebtoken')
    return jwt.default.verify(token, secret)
  } catch (error) {
    console.error('JWT verification fallback failed:', error)
    return await verifyJWT(token, secret)
  }
} 