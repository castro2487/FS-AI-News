import { PrismaClient, EventStatus, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create users
  const adminPassword = await bcrypt.hash('Admin123!', 12);
  const userPassword = await bcrypt.hash('User123!', 12);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@example.com' },
    update: {},
    create: {
      email: 'admin@example.com',
      password: adminPassword,
      name: 'Admin User',
      role: UserRole.ADMIN,
    },
  });

  const user = await prisma.user.upsert({
    where: { email: 'user@example.com' },
    update: {},
    create: {
      email: 'user@example.com',
      password: userPassword,
      name: 'Regular User',
      role: UserRole.USER,
    },
  });

  console.log('Users created:', { admin: admin.email, user: user.email });

  // Create events
  await prisma.event.createMany({
    data: [
      {
        title: 'Tech Conference 2025',
        startAt: new Date('2025-12-15T09:00:00Z'),
        endAt: new Date('2025-12-15T17:00:00Z'),
        location: 'San Francisco, CA',
        status: EventStatus.PUBLISHED,
        internalNotes: 'Main annual conference',
        createdBy: admin.email,
        userId: admin.id,
      },
      {
        title: 'Web Development Workshop',
        startAt: new Date('2025-11-20T14:00:00Z'),
        endAt: new Date('2025-11-20T18:00:00Z'),
        location: 'New York, NY',
        status: EventStatus.PUBLISHED,
        internalNotes: 'Beginner friendly workshop',
        createdBy: user.email,
        userId: user.id,
      },
      {
        title: 'AI Summit',
        startAt: new Date('2025-11-25T10:00:00Z'),
        endAt: new Date('2025-11-25T16:00:00Z'),
        location: 'Boston, MA',
        status: EventStatus.DRAFT,
        internalNotes: 'Need to find sponsors',
        createdBy: admin.email,
        userId: admin.id,
      },
      {
        title: 'React Masterclass',
        startAt: new Date('2025-12-01T10:00:00Z'),
        endAt: new Date('2025-12-01T16:00:00Z'),
        location: 'Austin, TX',
        status: EventStatus.PUBLISHED,
        internalNotes: 'Advanced React patterns',
        createdBy: user.email,
        userId: user.id,
      },
    ],
  });

  console.log('Events created successfully!');
  console.log('\nTest Credentials:');
  console.log('Admin - email: admin@example.com, password: Admin123!');
  console.log('User  - email: user@example.com, password: User123!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });