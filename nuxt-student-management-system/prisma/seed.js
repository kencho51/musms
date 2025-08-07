import { PrismaClient } from '@prisma/client'
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

  // Create teacher user
  const teacherPassword = await bcrypt.hash('teacher123', 10)
  const teacher = await prisma.user.upsert({
    where: { username: 'teacher' },
    update: {},
    create: {
      username: 'teacher',
      email: 'teacher@sms.edu',
      name: 'John Teacher',
      password: teacherPassword,
      role: 'TEACHER',
      isActive: true
    }
  })
  console.log('✅ Created teacher user:', teacher.username)

  // Create student user
  const studentPassword = await bcrypt.hash('student123', 10)
  const student = await prisma.user.upsert({
    where: { username: 'student' },
    update: {},
    create: {
      username: 'student',
      email: 'student@sms.edu',
      name: 'Jane Student',
      password: studentPassword,
      role: 'STUDENT',
      isActive: true
    }
  })
  console.log('✅ Created student user:', student.username)

  console.log('🎉 Seeding completed successfully!')
  console.log('')
  console.log('📝 Login credentials:')
  console.log('👨‍💼 Admin: admin / admin123')
  console.log('👨‍🏫 Teacher: teacher / teacher123')
  console.log('🎓 Student: student / student123')
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