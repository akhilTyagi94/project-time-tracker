'use client';

import { UserRoundMinus, Crown, ShieldAlert, Monitor, User } from 'lucide-react';
import { updateUserRole, deleteUser, assignToManager } from '@/app/manager/actions';

export default function UserManagementControls({ user, allUsers, managersOnly }: { user: any, allUsers: any[], managersOnly: any[] }) {
    
    // Determine the color of the role badge
    const roleColors: Record<string, string> = {
        'SUPER_ADMIN': 'text-primary border-primary',
        'ADMIN': 'text-secondary border-secondary',
        'MANAGER': 'text-warning border-warning',
        'USER': 'text-foreground border-border',
    };

    return (
        <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginTop: '0.5rem' }}>
            {/* Role Assignment Dropdown */}
            <select 
                defaultValue={user.role} 
                onChange={async (e) => await updateUserRole(user.id, e.target.value)}
                style={{ padding: '0.25rem 0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--foreground)' }}
            >
                <option value="SUPER_ADMIN">Super Admin</option>
                <option value="ADMIN">Admin</option>
                <option value="MANAGER">Manager</option>
                <option value="USER">User</option>
            </select>

            {/* Manager Assignment Dropdown */}
            {user.role === 'USER' && (
                <select 
                    defaultValue={user.managerId || 'none'} 
                    onChange={async (e) => await assignToManager(user.id, e.target.value)}
                    style={{ padding: '0.25rem 0.5rem', background: 'rgba(0,0,0,0.2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm)', color: 'var(--secondary)' }}
                >
                    <option value="none">No Manager</option>
                    {managersOnly.map(m => (
                        <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                </select>
            )}

            {/* Delete User */}
            <button 
                onClick={async () => {
                    if (confirm(`Are you sure you want to permanently delete ${user.name}?`)) {
                        await deleteUser(user.id);
                    }
                }}
                className="icon-btn text-danger" 
                title="Delete User"
            >
                <UserRoundMinus size={16} />
            </button>
        </div>
    );
}
