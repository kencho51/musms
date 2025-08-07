import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

let prisma = null

export function getPrisma(env) {
  if (prisma) return prisma

  // Development: Use local SQLite file
  if (process.env.NODE_ENV !== 'prod') {
    console.log('🔧 Using local SQLite database (file:./prisma/dev.db) for development')
    prisma = new PrismaClient({
      datasources: {
        db: {
          url: 'file:./dev.db'
        }
      }
    })
    return prisma
  }

  // Production: Use Cloudflare D1 (test-musms)
  console.log('☁️ Using Cloudflare D1 database (test-musms) for production')
  const adapter = new PrismaD1(env.DB)
  prisma = new PrismaClient({ adapter })
  
  return prisma
}

export function getDB(event) {
  const env = event?.context?.cloudflare?.env
  return getPrisma(env)
} 