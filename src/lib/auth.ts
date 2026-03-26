'use server';

import { cookies } from 'next/headers';
import { prisma } from './prisma';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export async function loginAction(formData: FormData) {
    'use server';
    
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    if (!email || !password) {
        return { error: 'Email and password are required' };
    }

    const user = await prisma.user.findUnique({ where: { email } }) as any;

    // For MVP, simple string comparison of passwordHash
    if (!user || user.passwordHash !== password) {
        return { error: 'Invalid email or password' };
    }

    const cookieStore = await cookies();
    cookieStore.set('session_id', user.id, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        maxAge: 60 * 60 * 24 * 7 // 1 week
    });

    revalidatePath('/', 'layout');
    redirect('/');
}

export async function logoutAction() {
    'use server';
    const cookieStore = await cookies();
    cookieStore.delete('session_id');
    revalidatePath('/', 'layout');
    redirect('/login');
}

export async function getSessionUser() {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get('session_id')?.value;
    
    if (!sessionId) return null;

    try {
        const user = await (prisma.user.findUnique as any)({
            where: { id: sessionId },
            include: {
                manager: true, // gets the user's manager
                reports: true  // gets the users this user manages
            }
        });
        return user;
    } catch (e) {
        return null;
    }
}
