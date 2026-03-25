import { Loader2 } from 'lucide-react';

export default function Loading() {
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }} className="animate-slide-in">
            <Loader2 size={40} color="var(--primary)" className="animate-pulse" style={{ animation: 'spin 1.5s linear infinite' }} />
            <p style={{ marginTop: '1rem', color: 'var(--foreground)', opacity: 0.7, fontWeight: 500 }}>Loading data...</p>
            <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
        </div>
    );
}
