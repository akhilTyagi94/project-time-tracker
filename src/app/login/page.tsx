import './login.css';
import { loginAction } from '@/lib/auth';
import { Activity } from 'lucide-react';
import Link from 'next/link';

export default function LoginPage() {
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

                <form action={async (formData) => { 'use server'; await loginAction(formData); }} className="login-form">
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

                    <button type="submit" className="login-btn">
                        Sign In
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
