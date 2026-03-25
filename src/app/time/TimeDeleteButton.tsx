'use client';

import { Trash2 } from 'lucide-react';
import { deleteTimeLog } from '@/lib/actions';
import { useState } from 'react';

export default function TimeDeleteButton({ id }: { id: string }) {
    const [deleting, setDeleting] = useState(false);

    async function handleDelete() {
        if (!confirm('Are you sure you want to delete this time log?')) return;
        setDeleting(true);
        await deleteTimeLog(id);
        setDeleting(false);
    }

    return (
        <button 
            className="icon-btn text-danger action-menu-btn" 
            onClick={handleDelete}
            disabled={deleting}
            title="Delete Log"
            style={{ opacity: deleting ? 0.5 : 1, padding: '0.5rem', borderRadius: 'var(--radius-sm)' }}
        >
            <Trash2 size={16} />
        </button>
    );
}
