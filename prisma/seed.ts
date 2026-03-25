import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding database...');

    // 1. Create Users
    const pManager = await prisma.user.create({
        data: {
            name: 'John Doe',
            email: 'john@onemetric.com',
            role: 'PM',
            capacityHours: 40,
        }
    });

    const dev = await prisma.user.create({
        data: {
            name: 'Alice Dev',
            email: 'alice@onemetric.com',
            role: 'DEV',
            capacityHours: 40,
            costPerHour: 65.0,
        }
    });

    // 2. Create Project
    const project = await prisma.project.create({
        data: {
            name: 'Client Portal Overhaul',
            clientName: 'Acme Corp',
            dealId: '10928374',
            startDate: new Date(),
            endDate: new Date(new Date().setDate(new Date().getDate() + 30)),
            quotedHours: 120,
            status: 'ACTIVE',
            managerId: pManager.id,
        }
    });

    // 3. Create Milestone
    const milestone = await prisma.milestone.create({
        data: {
            name: 'Phase 1 MVP',
            projectId: project.id,
            dueDate: new Date(new Date().setDate(new Date().getDate() + 15)),
            status: 'IN_PROGRESS',
        }
    });

    // 4. Create Tasks
    const task1 = await prisma.task.create({
        data: {
            title: 'API Integration & Debugging',
            projectId: project.id,
            milestoneId: milestone.id,
            assignedToId: dev.id,
            estimatedHours: 15,
            status: 'IN_PROGRESS',
        }
    });

    const task2 = await prisma.task.create({
        data: {
            title: 'Design System Overhaul',
            projectId: project.id,
            milestoneId: milestone.id,
            assignedToId: dev.id,
            estimatedHours: 25,
            status: 'PENDING',
        }
    });

    // 5. Create TimeLog
    await prisma.timeLog.create({
        data: {
            timeSpentMinutes: 255, // 4h 15m
            description: 'Worked on initial database schemas and API scaffolding',
            billable: true,
            taskId: task1.id,
            userId: dev.id,
            date: new Date(),
        }
    });

    // 6. Create Alert
    await prisma.alert.create({
        data: {
            type: 'OVER_BUDGET',
            message: 'Client Portal Overhaul is approaching its quoted hours limit.',
            readStatus: false,
        }
    });

    console.log('Database seeded successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
