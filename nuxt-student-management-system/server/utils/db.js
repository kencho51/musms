import { PrismaClient } from '@prisma/client'
import { PrismaD1 } from '@prisma/adapter-d1'

let prisma = null

export function getPrisma(env) {
  if (prisma) return prisma

  // Always use Cloudflare D1 database (test-musms)
  console.log('☁️ Using Cloudflare D1 database (test-musms)')
  
  if (!env?.DB) {
    throw new Error('D1 database binding not found. Make sure DB is configured in wrangler.toml and bound in your environment.')
  }
  
  const adapter = new PrismaD1(env.DB)
  prisma = new PrismaClient({ adapter })
  
  return prisma
}

export function getDB(event) {
  const env = event?.context?.cloudflare?.env
  return getPrisma(env)
} 