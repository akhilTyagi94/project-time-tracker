'use client';

import { Filter } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';

export default function TimeFilterButton() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const isThisWeek = searchParams.get('filter') === 'this_week';

    function toggleFilter() {
        const params = new URLSearchParams(searchParams.toString());
        if (isThisWeek) {
            params.delete('filter');
        } else {
            params.set('filter', 'this_week');
        }
        router.push(`?${params.toString()}`);
    }

    return (
        <button 
            className={`btn-secondary ${isThisWeek ? 'active' : ''}`} 
            onClick={toggleFilter}
            style={{ 
                background: isThisWeek ? 'var(--primary)' : undefined, 
                color: isThisWeek ? 'white' : undefined,
                border: isThisWeek ? '1px solid var(--primary)' : undefined
            }}
        >
            <Filter size={16} />
            <span>This Week</span>
        </button>
    );
}
