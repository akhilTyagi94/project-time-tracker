'use client';

import { useEffect } from 'react';
import { AlertCircle } from 'lucide-react';

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('Global Error Boundary Caught:', error);
    }, [error]);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', textAlign: 'center', padding: '2rem' }} className="animate-slide-in">
            <AlertCircle size={48} color="var(--danger)" style={{ marginBottom: '1rem' }} />
            <h2 style={{ fontSize: '1.5rem', fontWeight: 600, marginBottom: '0.5rem' }}>Something went wrong!</h2>
            <p style={{ color: 'var(--foreground)', opacity: 0.7, marginBottom: '1.5rem', maxWidth: '400px' }}>
                {error.message || "An unexpected error occurred. Our team has been notified."}
            </p>
            <button className="btn-primary" onClick={() => reset()}>
                Try again
            </button>
        </div>
    );
}
