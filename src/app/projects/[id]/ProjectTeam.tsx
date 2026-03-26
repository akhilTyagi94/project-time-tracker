'use client';

import { useState } from 'react';
import { Users, UserPlus, X } from 'lucide-react';
import { addProjectMember, removeProjectMember } from '../team-actions';

interface ProjectTeamProps {
    projectId: string;
    members: any[];
    allUsers: any[];
    canManage: boolean;
}

export default function ProjectTeam({ projectId, members, allUsers, canManage }: ProjectTeamProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const nonMembers = allUsers.filter(u => !members.some(m => m.id === u.id));

    async function handleAddMember(userId: string) {
        setLoading(true);
        try {
            await addProjectMember(projectId, userId);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    async function handleRemoveMember(userId: string) {
        if (!confirm('Remove user from project team?')) return;
        setLoading(true);
        try {
            await removeProjectMember(projectId, userId);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="card team-card">
            <div className="section-header">
                <h3>Project Team</h3>
                {canManage && (
                    <button className="icon-btn-text" onClick={() => setIsModalOpen(true)}>
                        <UserPlus size={16} />
                        Add Member
                    </button>
                )}
            </div>

            <div className="team-list">
                {members.length === 0 ? (
                    <p className="muted-text small">No specific members assigned yet.</p>
                ) : (
                    members.map(user => (
                        <div className="team-member" key={user.id}>
                            <div className="avatar-small">
                                {user.name.substring(0, 2).toUpperCase()}
                            </div>
                            <div className="member-info">
                                <div className="member-name">{user.name}</div>
                                <div className="member-role">{user.role}</div>
                            </div>
                            {canManage && (
                                <button 
                                    className="remove-btn" 
                                    onClick={() => handleRemoveMember(user.id)}
                                    title="Remove from project"
                                >
                                    <X size={14} />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>

            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container slide-up" style={{ maxWidth: '400px' }}>
                        <div className="modal-header">
                            <h2>Add Team Member</h2>
                            <button className="icon-btn" onClick={() => setIsModalOpen(false)}>×</button>
                        </div>
                        <div className="user-selection-list">
                            {nonMembers.length === 0 ? (
                                <p className="muted-text" style={{ padding: '1rem' }}>All users are already in this project.</p>
                            ) : (
                                nonMembers.map(user => (
                                    <div className="user-select-row" key={user.id}>
                                        <div className="user-info">
                                            <span className="name">{user.name}</span>
                                            <span className="role">{user.role}</span>
                                        </div>
                                        <button 
                                            className="btn-primary btn-sm" 
                                            onClick={() => handleAddMember(user.id)}
                                            disabled={loading}
                                        >
                                            Add
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
