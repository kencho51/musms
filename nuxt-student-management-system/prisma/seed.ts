import { PrismaClient } from '../app/generated/prisma'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Start seeding...')

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 10)
  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      email: 'admin@sms.edu',
      name: 'System Administrator',
      password: adminPassword,
      role: 'ADMIN',
      isActive: true
    }
  })
  console.log('✅ Created admin user:', admin.username)

  console.log('🎉 Seeding completed successfully!')
  console.log('')
  console.log('📝 Login credentials:')
  console.log('👨‍💼 Admin: admin / admin123')
  console.log('')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
