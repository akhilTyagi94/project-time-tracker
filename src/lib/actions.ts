'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function searchItems(query: string) {
    if (!query || query.length < 2) return { projects: [], tasks: [] };

    const projects = await prisma.project.findMany({
        where: {
            OR: [
                { name: { contains: query } },
                { clientName: { contains: query } },
            ],
        },
        select: { id: true, name: true, clientName: true, status: true },
        take: 5,
    });

    const tasks = await prisma.task.findMany({
        where: {
            title: { contains: query },
        },
        select: {
            id: true,
            title: true,
            status: true,
            project: { select: { id: true, name: true } },
        },
        take: 5,
    });

    return { projects, tasks };
}

export async function getActiveTasks() {
    const tasks = await prisma.task.findMany({
        where: {
            status: { in: ['PENDING', 'IN_PROGRESS'] },
        },
        select: {
            id: true,
            title: true,
            project: { select: { name: true } },
        },
        take: 20,
    });
    return tasks;
}

export async function saveTimeLog(data: {
    taskId: string;
    timeSpentMinutes: number;
    description: string;
    date?: Date;
}) {
    // Use first user for MVP
    const user = await prisma.user.findFirst({
        where: { email: 'alice@onemetric.com' },
    });

    if (!user) throw new Error('User not found');

    await prisma.timeLog.create({
        data: {
            taskId: data.taskId,
            userId: user.id,
            timeSpentMinutes: data.timeSpentMinutes,
            description: data.description,
            billable: true,
            date: data.date || new Date(),
        },
    });

    revalidatePath('/time', 'layout');
    revalidatePath('/projects', 'layout');
    revalidatePath('/manager');
    return { success: true };
}

export async function getAlerts() {
    const alerts = await prisma.alert.findMany({
        orderBy: { createdAt: 'desc' },
        take: 10,
    });
    return alerts;
}

export async function markAlertRead(id: string) {
    await prisma.alert.update({
        where: { id },
        data: { readStatus: true },
    });
    return { success: true };
}

export async function deleteTimeLog(id: string) {
    await prisma.timeLog.delete({
        where: { id }
    });
    
    // Revalidate paths that might display time logged
    revalidatePath('/time', 'layout');
    revalidatePath('/projects', 'layout');
    revalidatePath('/', 'layout');
    return { success: true };
}
