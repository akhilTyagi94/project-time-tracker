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
export async function createUserAction(formData: FormData) {
    const session = await getSessionUser();
    if (!session || (session.role !== 'SUPER_ADMIN' && session.role !== 'ADMIN')) {
        throw new Error("Unauthorized");
    }

    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const role = formData.get('role') as string;
    const managerId = formData.get('managerId') as string;

    if (!name || !email || !password || !role) {
        return { error: 'Name, email, password, and role are required.' };
    }

    try {
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return { error: 'A user with this email already exists.' };
        }

        await (prisma.user.create as any)({
            data: {
                name,
                email,
                passwordHash: password,
                role,
                managerId: (managerId === 'none' || !managerId) ? null : managerId,
            }
        });

        revalidatePath('/manager');
        return { success: true };
    } catch (error) {
        console.error('Failed to create user:', error);
        return { error: 'Failed to create user. Please try again.' };
    }
}
