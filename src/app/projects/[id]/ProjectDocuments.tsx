'use client';

import { useState } from 'react';
import { Link2, Plus, ExternalLink, Trash2, FileText, Image, Table, GitBranch, Link as LinkIcon } from 'lucide-react';
import { createDocument, deleteDocument } from '../documents-actions';

// Helpers to get an icon based on type
const getIcon = (type: string) => {
    switch (type) {
        case 'Google Doc':
        case 'Word':
            return <FileText size={16} className="text-secondary" />;
        case 'Figma':
        case 'Design':
            return <Image size={16} className="text-primary" />;
        case 'Excel':
        case 'Sheet':
            return <Table size={16} className="text-success" />;
        case 'GitHub':
            return <GitBranch size={16} className="text-foreground" />;
        default:
            return <LinkIcon size={16} className="text-muted" />;
    }
};

export default function ProjectDocuments({ projectId, documents, userRole }: { projectId: string, documents: any[], userRole: string }) {
    const [isAdding, setIsAdding] = useState(false);
    
    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const title = formData.get('title') as string;
        const url = formData.get('url') as string;
        const type = formData.get('type') as string;

        await createDocument(projectId, title, url, type);
        setIsAdding(false);
    }

    return (
        <div className="card documents-card" style={{ marginTop: '1.5rem' }}>
            <div className="section-header" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0 }}>
                    <Link2 size={18} /> Documents & Links
                </h3>
                {userRole !== 'USER' && (
                    <button onClick={() => setIsAdding(!isAdding)} className="icon-btn text-primary" title="Add Document">
                        <Plus size={18} />
                    </button>
                )}
            </div>

            {isAdding && (
                <form onSubmit={handleSubmit} style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                        <input name="title" required placeholder="Doc Title (e.g., Q3 Scope)" className="input-field" style={{ flex: 1 }} />
                        <select name="type" className="input-field" style={{ width: '120px' }}>
                            <option value="Link">Link</option>
                            <option value="Google Doc">Google Doc</option>
                            <option value="Excel">Excel</option>
                            <option value="Figma">Figma</option>
                            <option value="GitHub">GitHub</option>
                        </select>
                    </div>
                    <input name="url" type="url" required placeholder="https://..." className="input-field w-full" style={{ marginBottom: '0.75rem' }} />
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button type="button" onClick={() => setIsAdding(false)} className="btn-secondary" style={{ padding: '0.25rem 0.75rem' }}>Cancel</button>
                        <button type="submit" className="btn-primary" style={{ padding: '0.25rem 0.75rem' }}>Save Link</button>
                    </div>
                </form>
            )}

            <div className="documents-list" style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {documents.length === 0 && !isAdding && (
                    <div className="muted" style={{ fontSize: '0.875rem' }}>No documents attached.</div>
                )}
                {documents.map((doc: any) => (
                    <div key={doc.id} className="document-item" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-sm)' }}>
                        <a href={doc.url} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', color: 'inherit', textDecoration: 'none', flex: 1 }}>
                            {getIcon(doc.type)}
                            <div>
                                <div style={{ fontWeight: 500, fontSize: '0.875rem' }}>{doc.title}</div>
                                <div style={{ fontSize: '0.75rem', color: 'var(--muted)' }} className="truncate max-w-[200px]">{doc.url}</div>
                            </div>
                        </a>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer" className="icon-btn muted" title="Open Link">
                                <ExternalLink size={14} />
                            </a>
                            {userRole !== 'USER' && (
                                <button onClick={async () => await deleteDocument(doc.id, projectId)} className="icon-btn text-danger" title="Remove Link">
                                    <Trash2 size={14} />
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
