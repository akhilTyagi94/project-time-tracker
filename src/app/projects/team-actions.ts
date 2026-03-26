'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth';

export async function addProjectMember(projectId: string, userId: string) {
    const session = await getSessionUser();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
        throw new Error("Unauthorized");
    }

    await (prisma.project.update as any)({
        where: { id: projectId },
        data: {
            members: {
                connect: { id: userId }
            }
        }
    });

    revalidatePath(`/projects/${projectId}`);
}

export async function removeProjectMember(projectId: string, userId: string) {
    const session = await getSessionUser();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN' && session.role !== 'MANAGER')) {
        throw new Error("Unauthorized");
    }

    await (prisma.project.update as any)({
        where: { id: projectId },
        data: {
            members: {
                disconnect: { id: userId }
            }
        }
    });

    revalidatePath(`/projects/${projectId}`);
}
