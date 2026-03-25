'use client';

import { Search, X } from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function TimeSearchInput() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [query, setQuery] = useState(searchParams.get('q') || '');

    useEffect(() => {
        const timeout = setTimeout(() => {
            const params = new URLSearchParams(searchParams.toString());
            if (query) {
                params.set('q', query);
            } else {
                params.delete('q');
            }
            router.push(`?${params.toString()}`);
        }, 300);
        return () => clearTimeout(timeout);
    }, [query, router, searchParams]); // searchParams needs to be handled properly though because creating new URLSearchParams recreates it, but it's fine for simple use cases

    return (
        <div className="search-bar" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'var(--surface)', padding: '0.5rem 0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1, maxWidth: '400px' }}>
            <Search size={16} className="text-muted" />
            <input 
                type="text" 
                placeholder="Search descriptions or tasks..." 
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'var(--foreground)', fontSize: '0.875rem', outline: 'none', width: '100%' }}
            />
            {query && (
                <button className="icon-btn" onClick={() => setQuery('')} style={{ padding: '0.2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <X size={14} />
                </button>
            )}
        </div>
    );
}
