'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function updateProfile(formData: FormData) {
    const name = formData.get('name') as string;

    if (!name || name.trim() === '') {
        return { error: 'Name is required' };
    }

    try {
        await prisma.user.update({
            where: { email: 'alice@onemetric.com' },
            data: { name: name.trim() }
        });

        // Revalidate the layout so Header and Sidebar update with the new name
        revalidatePath('/', 'layout');
        return { success: true };
    } catch (e: any) {
        console.error('Failed to update profile:', e);
        return { error: 'Failed to update profile' };
    }
}
