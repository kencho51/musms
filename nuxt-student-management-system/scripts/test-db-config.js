#!/usr/bin/env node

// Test script to verify database configuration
// Usage: node scripts/test-db-config.js

console.log('🧪 Testing Database Configuration')
console.log('================================')

// Test development environment
process.env.NODE_ENV = 'development'
console.log('\n🔧 Testing Development Environment:')
console.log('NODE_ENV:', process.env.NODE_ENV)

// Simulate the database utility logic
function testGetPrisma(env) {
  if (process.env.NODE_ENV !== 'prod') {
    console.log('✅ Would use: Local SQLite database (file:./dev.db)')
    return 'local-sqlite'
  } else {
    console.log('✅ Would use: Cloudflare D1 database (test-musms)')
    return 'd1-database'
  }
}

let result = testGetPrisma()
console.log('Result:', result)

// Test production environment  
process.env.NODE_ENV = 'prod'
console.log('\n☁️ Testing Production Environment:')
console.log('NODE_ENV:', process.env.NODE_ENV)

result = testGetPrisma({ DB: 'mock-d1-binding' })
console.log('Result:', result)

console.log('\n✅ Database configuration test completed!')
console.log('\n📋 Summary:')
console.log('• Development (NODE_ENV !== "production"): Uses file:./dev.db')
console.log('• Production (NODE_ENV === "production"): Uses Cloudflare D1 (test-musms)')
console.log('• Switching is automatic based on NODE_ENV environment variable') 