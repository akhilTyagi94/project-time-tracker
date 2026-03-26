'use client';

import { useState } from 'react';
import { UserPlus, X, Mail, Lock, Shield, User as UserIcon, Loader2 } from 'lucide-react';
import { createUserAction } from './actions';

interface AddUserModalProps {
    managers: any[];
}

export default function AddUserModal({ managers }: AddUserModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await createUserAction(formData);

        if (result?.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setIsOpen(false);
            setLoading(false);
        }
    }

    return (
        <>
            <button className="btn-primary" onClick={() => setIsOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <UserPlus size={16} /> Add Member
            </button>

            {isOpen && (
                <div className="modal-overlay">
                    <div className="modal-container slide-up">
                        <div className="modal-header">
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                <div className="logo-icon" style={{ padding: '0.5rem', borderRadius: 'var(--radius-md)', background: 'rgba(139, 92, 246, 0.1)' }}>
                                    <UserPlus size={20} color="var(--primary)" />
                                </div>
                                <h2 style={{ margin: 0 }}>Add New Member</h2>
                            </div>
                            <button className="icon-btn" onClick={() => setIsOpen(false)}><X size={20} /></button>
                        </div>
                        
                        <form onSubmit={handleSubmit} className="modal-form">
                            {error && <div className="error-message" style={{ marginBottom: '1rem' }}>{error}</div>}
                            
                            <div className="form-group">
                                <label htmlFor="name">Full Name</label>
                                <div className="input-wrapper">
                                    <UserIcon size={16} className="input-icon" />
                                    <input type="text" id="name" name="name" required placeholder="e.g. Jane Smith" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={16} className="input-icon" />
                                    <input type="email" id="email" name="email" required placeholder="jane@company.com" />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Initial Password</label>
                                <div className="input-wrapper">
                                    <Lock size={16} className="input-icon" />
                                    <input type="password" id="password" name="password" required placeholder="Create a password" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="role">Security Role</label>
                                    <div className="input-wrapper">
                                        <Shield size={16} className="input-icon" />
                                        <select id="role" name="role" required defaultValue="USER">
                                            <option value="USER">User / Team Member</option>
                                            <option value="MANAGER">Team Manager</option>
                                            <option value="ADMIN">Administrator</option>
                                            <option value="SUPER_ADMIN">Super Administrator</option>
                                        </select>
                                    </div>
                                </div>
                                
                                <div className="form-group">
                                    <label htmlFor="managerId">Reports To</label>
                                    <select id="managerId" name="managerId" defaultValue="none">
                                        <option value="none">No Direct Manager</option>
                                        {managers.map(m => (
                                            <option key={m.id} value={m.id}>{m.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer" style={{ marginTop: '2rem' }}>
                                <button type="button" className="btn-secondary" onClick={() => setIsOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? (
                                        <>
                                            <Loader2 size={16} className="spinner" />
                                            Creating...
                                        </>
                                    ) : 'Create Member Account'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
