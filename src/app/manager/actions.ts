'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth';

export async function updateUserRole(userId: string, newRole: string) {
    const session = await getSessionUser();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
        throw new Error("Unauthorized");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { role: newRole }
    });

    revalidatePath('/manager');
}

export async function deleteUser(userId: string) {
    const session = await getSessionUser();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
        throw new Error("Unauthorized");
    }

    // Ensure we aren't deleting ourselves
    if (session.id === userId) {
        throw new Error("Cannot delete your own account.");
    }

    await prisma.user.delete({
        where: { id: userId }
    });

    revalidatePath('/manager');
}

export async function assignToManager(userId: string, managerId: string | null) {
    const session = await getSessionUser();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
        throw new Error("Unauthorized");
    }

    await prisma.user.update({
        where: { id: userId },
        data: { managerId: (managerId === 'none' || !managerId) ? null : managerId } as any
    });

    revalidatePath('/manager');
}
