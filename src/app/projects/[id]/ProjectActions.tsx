'use client';

import { useState } from 'react';
import { updateProject, createTask, deleteProject } from '../actions';

interface ProjectActionsProps {
    project: any;
    users: any[];
    milestones: any[];
    userRole: string;
}

export default function ProjectActions({ project, users, milestones, userRole }: ProjectActionsProps) {
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    async function handleEditSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await updateProject(project.id, formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setIsEditModalOpen(false);
            setLoading(false);
        }
    }

    async function handleDelete() {
        if (confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
            setLoading(true);
            const result = await deleteProject(project.id);
            if (result?.error) {
                setError(result.error);
                setLoading(false);
            }
        }
    }

    async function handleTaskSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setLoading(true);
        setError('');

        const formData = new FormData(e.currentTarget);
        const result = await createTask(project.id, formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
        } else {
            setIsTaskModalOpen(false);
            setLoading(false);
        }
    }

    return (
        <>
            <div className="header-actions">
                {userRole !== 'USER' && (
                    <button className="btn-secondary" onClick={() => setIsEditModalOpen(true)}>Edit Project</button>
                )}
                <button className="btn-primary" onClick={() => setIsTaskModalOpen(true)}>Add Task</button>
            </div>

            {/* Edit Project Modal */}
            {isEditModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container slide-up">
                        <div className="modal-header">
                            <h2>Edit Project</h2>
                            <button className="icon-btn" onClick={() => setIsEditModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleEditSubmit} className="modal-form">
                            {error && <div className="error-message">{error}</div>}
                            
                            <div className="form-group">
                                <label htmlFor="name">Project Name</label>
                                <input type="text" id="name" name="name" required defaultValue={project.name} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="clientName">Client Name</label>
                                <input type="text" id="clientName" name="clientName" defaultValue={project.clientName || ''} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="dealId">Deal ID</label>
                                <input type="text" id="dealId" name="dealId" defaultValue={project.dealId || ''} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="quotedHours">Quoted Hours</label>
                                <input type="number" id="quotedHours" name="quotedHours" required min="1" step="0.5" defaultValue={project.quotedHours} />
                            </div>

                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <select id="status" name="status" defaultValue={project.status}>
                                    <option value="ACTIVE">Active</option>
                                    <option value="AT_RISK">At Risk</option>
                                    <option value="ON_HOLD">On Hold</option>
                                    <option value="COMPLETED">Completed</option>
                                </select>
                            </div>

                            {userRole === 'SUPER_ADMIN' && (
                                <div className="form-group">
                                    <label htmlFor="managerId">Project Manager</label>
                                    <select id="managerId" name="managerId" defaultValue={project.managerId || 'none'}>
                                        <option value="none">No Manager</option>
                                        {users.filter(u => u.role === 'SUPER_ADMIN' || u.role === 'ADMIN' || u.role === 'MANAGER' || u.role === 'PM').map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
                                <button type="button" className="btn-secondary" style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleDelete} disabled={loading}>
                                    Delete Project
                                </button>
                                <div style={{ display: 'flex', gap: '0.75rem' }}>
                                    <button type="button" className="btn-secondary" onClick={() => setIsEditModalOpen(false)}>Cancel</button>
                                    <button type="submit" className="btn-primary" disabled={loading}>
                                        {loading ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Add Task Modal */}
            {isTaskModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-container slide-up">
                        <div className="modal-header">
                            <h2>Add Task</h2>
                            <button className="icon-btn" onClick={() => setIsTaskModalOpen(false)}>×</button>
                        </div>
                        <form onSubmit={handleTaskSubmit} className="modal-form">
                            {error && <div className="error-message">{error}</div>}
                            
                            <div className="form-group">
                                <label htmlFor="title">Task Title</label>
                                <input type="text" id="title" name="title" required placeholder="e.g. Database Schema Design" />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Description (Optional)</label>
                                <textarea id="description" name="description" rows={3} placeholder="Provide additional details..." />
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="estimatedHours">Estimated Hours</label>
                                    <input type="number" id="estimatedHours" name="estimatedHours" required min="0" step="0.5" defaultValue="0" />
                                </div>
                                <div className="form-group">
                                    <label htmlFor="assignedToId">Assign To</label>
                                    <select id="assignedToId" name="assignedToId" defaultValue="">
                                        <option value="">Unassigned</option>
                                        {users.map(u => (
                                            <option key={u.id} value={u.id}>{u.name} ({u.role})</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            
                            <div className="form-group">
                                <label htmlFor="milestoneId">Milestone</label>
                                <select id="milestoneId" name="milestoneId" defaultValue="">
                                    <option value="">No Milestone</option>
                                    {milestones.map(m => (
                                        <option key={m.id} value={m.id}>{m.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn-secondary" onClick={() => setIsTaskModalOpen(false)}>Cancel</button>
                                <button type="submit" className="btn-primary" disabled={loading}>
                                    {loading ? 'Creating...' : 'Create Task'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
