'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { X } from 'lucide-react';
import { createProject } from './actions';

export default function NewProjectModal({ onClose }: { onClose: () => void }) {
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const formRef = useRef<HTMLFormElement>(null);
    const router = useRouter();

    async function handleSubmit(formData: FormData) {
        setLoading(true);
        setError('');

        const result = await createProject(formData);

        if (result.error) {
            setError(result.error);
            setLoading(false);
            return;
        }

        setLoading(false);
        onClose();
        router.refresh();
    }

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-container card" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>Create New Project</h2>
                    <button className="icon-btn" onClick={onClose} type="button">
                        <X size={20} />
                    </button>
                </div>

                <form ref={formRef} action={handleSubmit}>
                    <div className="modal-body">
                        {error && <div className="form-error">{error}</div>}

                        <div className="form-group">
                            <label htmlFor="name">Project Name *</label>
                            <input type="text" id="name" name="name" placeholder="e.g. Client Portal MVP" required />
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="clientName">Client Name</label>
                                <input type="text" id="clientName" name="clientName" placeholder="e.g. Acme Corp" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="dealId">HubSpot Deal ID</label>
                                <input type="text" id="dealId" name="dealId" placeholder="e.g. 10928374" />
                            </div>
                        </div>

                        <div className="form-row">
                            <div className="form-group">
                                <label htmlFor="quotedHours">Quoted Hours *</label>
                                <input type="number" id="quotedHours" name="quotedHours" placeholder="e.g. 120" min="1" step="0.5" required />
                            </div>
                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <select id="status" name="status" defaultValue="ACTIVE">
                                    <option value="ACTIVE">Active</option>
                                    <option value="ON_HOLD">On Hold</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="modal-footer">
                        <button type="button" className="btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn-primary" disabled={loading}>
                            {loading ? 'Creating...' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
