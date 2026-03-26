'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { getSessionUser } from '@/lib/auth';

export async function createProject(formData: FormData) {
    const name = formData.get('name') as string;
    const clientName = formData.get('clientName') as string;
    const dealId = formData.get('dealId') as string;
    const quotedHours = parseFloat(formData.get('quotedHours') as string);
    const managerId = formData.get('managerId') as string;
    const status = formData.get('status') as string || 'ACTIVE';

    if (!name || !quotedHours) {
        return { error: 'Project name and quoted hours are required.' };
    }

    try {
        // Auto-assign the manager (John Doe)
        const pmUser = await prisma.user.findFirst({
            where: { role: 'PM' }
        });

        const project = await prisma.project.create({
            data: {
                name,
                clientName: clientName || null,
                dealId: dealId || null,
                quotedHours,
                status,
                startDate: new Date(),
                managerId: (managerId && managerId !== 'none') ? managerId : null,
            },
        });

        revalidatePath('/projects');
        return { success: true, projectId: project.id };
    } catch (error: any) {
        console.error('Failed to create project:', error);
        return { error: 'Failed to create project. Please try again.' };
    }
}

export async function updateProject(projectId: string, formData: FormData) {
    const name = formData.get('name') as string;
    const clientName = formData.get('clientName') as string;
    const dealId = formData.get('dealId') as string;
    const quotedHours = parseFloat(formData.get('quotedHours') as string);
    const status = formData.get('status') as string;
    const managerId = formData.get('managerId') as string;

    if (!name || isNaN(quotedHours)) {
        return { error: 'Project name and valid quoted hours are required.' };
    }

    try {
        await prisma.project.update({
            where: { id: projectId },
            data: {
                name,
                clientName: clientName || null,
                dealId: dealId || null,
                quotedHours,
                status,
                managerId: (managerId && managerId !== 'none') ? managerId : undefined,
            },
        });

        revalidatePath(`/projects/${projectId}`);
        revalidatePath('/projects', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update project:', error);
        return { error: 'Failed to update project. Please try again.' };
    }
}

export async function createTask(projectId: string, formData: FormData) {
    const title = formData.get('title') as string;
    const description = formData.get('description') as string;
    const estimatedHours = parseFloat(formData.get('estimatedHours') as string);
    const assignedToId = formData.get('assignedToId') as string;
    const milestoneId = formData.get('milestoneId') as string;
    
    
    if (!title) {
        return { error: 'Task title is required.' };
    }

    const session = await getSessionUser();
    if (!session) return { error: 'Unauthorized' };

    try {
        // Restriction: Non-admins must be members of the project to add tasks
        if (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN') {
            const project = await (prisma.project.findUnique as any)({
                where: { id: projectId },
                include: { members: { where: { id: session.id } } }
            });

            const isManager = project?.managerId === session.id;
            const isMember = project?.members?.length > 0;

            if (!isManager && !isMember) {
                return { error: 'You can only add tasks to projects you are assigned to.' };
            }
        }
        await prisma.task.create({
            data: {
                title,
                description: description || null,
                estimatedHours: isNaN(estimatedHours) ? 0 : estimatedHours,
                projectId,
                assignedToId: assignedToId || null,
                milestoneId: milestoneId || null,
                status: 'PENDING',
            },
        });

        revalidatePath(`/projects/${projectId}`);
        revalidatePath('/projects', 'layout');
        return { success: true };
    } catch (error: any) {
        console.error('Failed to create task:', error);
        return { error: 'Failed to create task. Please try again.' };
    }
}

export async function deleteProject(projectId: string) {
    try {
        await prisma.project.delete({
            where: { id: projectId },
        });

        revalidatePath('/projects', 'layout');
    } catch (error: any) {
        console.error('Failed to delete project:', error);
        return { error: 'Failed to delete project. Please try again.' };
    }
    
    redirect('/projects');
}
export async function deleteTask(taskId: string, projectId: string) {
    try {
        await prisma.task.delete({
            where: { id: taskId },
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Failed to delete task:', error);
        return { error: 'Failed to delete task. Please try again.' };
    }
}

export async function updateTaskStatus(taskId: string, status: string, projectId: string) {
    try {
        await prisma.task.update({
            where: { id: taskId },
            data: { status },
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true };
    } catch (error: any) {
        console.error('Failed to update task status:', error);
        return { error: 'Failed to update task status. Please try again.' };
    }
}
