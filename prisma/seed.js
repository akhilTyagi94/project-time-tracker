const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding authentication data...');

  // Since we added new required fields, clean up existing data
  await prisma.timeLog.deleteMany({});
  await prisma.task.deleteMany({});
  await prisma.milestone.deleteMany({});
  await prisma.projectDocument.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.user.deleteMany({});
  await prisma.alert.deleteMany({});

  console.log('Cleaned database.');

  // Create users for each of the 4 roles
  const superAdmin = await prisma.user.create({
    data: {
      name: 'Sarah Super',
      email: 'superadmin@onemetric.com',
      passwordHash: 'password123',
      role: 'SUPER_ADMIN',
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Adam Admin',
      email: 'admin@onemetric.com',
      passwordHash: 'password123',
      role: 'ADMIN',
    }
  });

  const manager = await prisma.user.create({
    data: {
      name: 'Mike Manager',
      email: 'manager@onemetric.com',
      passwordHash: 'password123',
      role: 'MANAGER',
    }
  });

  const user1 = await prisma.user.create({
    data: {
      name: 'Bob Builder',
      email: 'user@onemetric.com',
      passwordHash: 'password123',
      role: 'USER',
      managerId: manager.id, // Bob reports to Mike
    }
  });

  const user2 = await prisma.user.create({
    data: {
      name: 'Alice Dev',
      email: 'alice@onemetric.com',
      passwordHash: 'password123',
      role: 'USER',
      managerId: manager.id,
    }
  });

  // Create a sample project assigned to the manager and with user1 as a member
  const project1 = await prisma.project.create({
    data: {
      name: 'Acme Website Redesign',
      clientName: 'Acme Corp',
      quotedHours: 120,
      status: 'ACTIVE',
      managerId: manager.id,
      members: {
        connect: [{ id: user1.id }]
      }
    }
  });

  console.log('Seeding complete. Use password123 for all accounts.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
