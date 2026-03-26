'use server';

import { prisma } from '@/lib/prisma';
import { revalidatePath } from 'next/cache';
import { getSessionUser } from '@/lib/auth';

export async function createDocument(projectId: string, title: string, url: string, type: string) {
    const session = await getSessionUser();
    if (!session) throw new Error("Unauthorized");

    // Basic URL validation
    let finalUrl = url;
    if (!/^https?:\/\//i.test(finalUrl)) {
        finalUrl = 'https://' + finalUrl;
    }

    await (prisma as any).projectDocument.create({
        data: {
            projectId,
            title,
            url: finalUrl,
            type,
        }
    });

    revalidatePath(`/projects/${projectId}`);
}

export async function deleteDocument(documentId: string, projectId: string) {
    const session = await getSessionUser();
    if (!session || session.role === 'USER') { // Users shouldn't delete docs
        throw new Error("Unauthorized");
    }

    await (prisma as any).projectDocument.delete({
        where: { id: documentId }
    });

    revalidatePath(`/projects/${projectId}`);
}
