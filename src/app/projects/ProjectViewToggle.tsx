'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { LayoutGrid, List } from 'lucide-react';

export default function ProjectViewToggle() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const currentView = searchParams.get('view') || 'table';

    const handleToggle = (view: 'table' | 'grid') => {
        const params = new URLSearchParams(searchParams.toString());
        params.set('view', view);
        router.push(`?${params.toString()}`);
    };

    return (
        <div className="header-actions" style={{ marginRight: '0.75rem' }}>
            <button 
                className={`btn-secondary ${currentView === 'grid' ? 'active' : ''}`}
                onClick={() => handleToggle('grid')}
                title="Grid View"
            >
                <LayoutGrid size={18} />
            </button>
            <button 
                className={`btn-secondary ${currentView === 'table' ? 'active' : ''}`}
                onClick={() => handleToggle('table')}
                title="Table View"
            >
                <List size={18} />
            </button>
        </div>
    );
}
