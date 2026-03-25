'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

export async function createProject(formData: FormData) {
    const name = formData.get('name') as string;
    const clientName = formData.get('clientName') as string;
    const dealId = formData.get('dealId') as string;
    const quotedHours = parseFloat(formData.get('quotedHours') as string);
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
                managerId: pmUser?.id, // Assign the manager automatically
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

    try {
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
