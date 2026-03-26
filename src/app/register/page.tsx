'use client';

import { useState } from 'react';
import { registerAction } from '@/lib/auth';
import Link from 'next/link';
import { Shield, UserPlus, Mail, Lock, Loader2 } from 'lucide-react';
import '../login/login.css'; // Reuse login styles for consistency

export default function RegisterPage() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await registerAction(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            if (result?.success) {
                window.location.href = '/';
            }
        }
    }

    return (
        <div className="login-container">
            <div className="login-card glass-panel animate-fade-in">
                <div className="login-header">
                    <div className="login-logo">
                        <Shield className="logo-icon" size={32} />
                        <h2>OneMetric</h2>
                    </div>
                    <p className="login-subtitle">Join OneMetric to start tracking your projects</p>
                </div>

                <form onSubmit={handleSubmit} className="login-form">
                    {error && <div className="error-message" style={{ color: 'var(--danger)', fontSize: '0.875rem', textAlign: 'center' }}>{error}</div>}
                    
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input 
                            type="text" 
                            id="name" 
                            name="name" 
                            placeholder="e.g. Jane Doe" 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input 
                            type="email" 
                            id="email" 
                            name="email" 
                            placeholder="name@company.com" 
                            required 
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <input 
                            type="password" 
                            id="password" 
                            name="password" 
                            placeholder="Create a password" 
                            required 
                        />
                    </div>

                    <button type="submit" className="login-btn" disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="spinner" size={18} />
                                Creating account...
                            </>
                        ) : 'Scale Your Business Now'}
                    </button>

                    <div className="login-footer" style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.875rem', color: '#94a3b8' }}>
                        Already have an account? <Link href="/login" style={{ color: 'var(--primary)', fontWeight: 600 }}>Sign In</Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
