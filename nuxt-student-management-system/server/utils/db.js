import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

let prisma = null

export function getPrisma(env) {
  if (prisma) return prisma

  // Always use local SQLite in development
  if (process.env.NODE_ENV !== 'production') {
    console.log('🔧 Using local SQLite database for development')
    prisma = new PrismaClient()
    return prisma
  }

  // For production (Cloudflare D1)
  console.log('☁️ Using Cloudflare D1 database for production')
  const adapter = new PrismaD1(env.DB)
  prisma = new PrismaClient({ adapter })
  
  return prisma
}

export function getDB(event) {
  const env = event?.context?.cloudflare?.env
  return getPrisma(env)
} 