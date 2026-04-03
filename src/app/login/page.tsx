'use client';

import { useState } from 'react';
import { loginAction } from '@/lib/auth';
import { Activity, Loader2 } from 'lucide-react';
import Link from 'next/link';
import './login.css';

export default function LoginPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await loginAction(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        }
        // Success case is handled by redirect inside loginAction
    }

    return (
        <div className="login-container">
            <div className="login-card glass-panel">
                <div className="login-header">
                    <div className="login-logo">
                        <Activity className="logo-icon" size={32} />
                        <h2>OneMetric</h2>
                    </div>
                    <p className="login-subtitle">Sign in to your account</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && (
                        <div className="error-message" style={{ 
                            color: '#ef4444', 
                            backgroundColor: 'rgba(239, 68, 68, 0.1)',
                            padding: '0.75rem',
                            borderRadius: '0.5rem',
                            fontSize: '0.875rem',
                            marginBottom: '1rem',
                            textAlign: 'center',
                            border: '1px solid rgba(239, 68, 68, 0.2)'
                        }}>
                            {error}
                        </div>
                    )}
                    
                    <div className="form-group">
                        <label htmlFor="email">Email</label>
                        <input
                            type="email"
                            id="email"
                            name="email"
                            placeholder="e.g. admin@onemetric.com"
                            required
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            name="password"
                            placeholder="e.g. password123"
                            required
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="spinner" size={18} />
                                Signing in...
                            </>
                        ) : 'Sign In'}
                    </button>
                    
                    <div className="login-test-info">
                        <strong>Test Accounts:</strong>
                        <p>superadmin@onemetric.com</p>
                        <p>admin@onemetric.com</p>
                        <p>manager@onemetric.com</p>
                        <p>user@onemetric.com</p>
                        <p className="hint">Password for all is: password123</p>
                    </div>
                    <div className="login-footer" style={{ marginTop: '1.5rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
                        Don't have an account? <Link href="/register" style={{ color: 'var(--primary)', fontWeight: 600 }}>Create one</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
