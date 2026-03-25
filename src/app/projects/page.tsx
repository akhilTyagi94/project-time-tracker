import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { MoreVertical, LayoutGrid, List } from 'lucide-react';
import NewProjectButton from './NewProjectButton';
import ProjectViewToggle from './ProjectViewToggle';
import './page.css';

export const dynamic = 'force-dynamic';

export default async function ProjectsPage({ searchParams }: { searchParams: Promise<{ view?: string }> }) {
    const { view } = await searchParams;
    const isGrid = view === 'grid';
    const projects = await prisma.project.findMany({
        include: {
            manager: true,
            tasks: {
                include: {
                    timeLogs: true,
                }
            }
        },
        orderBy: { updatedAt: 'desc' }
    });

    return (
        <div className="projects-page animate-slide-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Projects</h1>
                    <p className="page-subtitle">Manage your active deals and ongoing implementations.</p>
                </div>
                <div className="header-actions">
                    <ProjectViewToggle />
                    <NewProjectButton />
                </div>
            </header>

            {isGrid ? (
                <div className="projects-grid">
                    {projects.map((project: any) => {
                        const totalMinutes = project.tasks.reduce((acc: number, task: any) => {
                            return acc + task.timeLogs.reduce((accLog: number, log: any) => accLog + log.timeSpentMinutes, 0);
                        }, 0);
                        const actualHours = (totalMinutes / 60).toFixed(1);
                        const progressPercent = Math.min(100, (parseFloat(actualHours) / project.quotedHours) * 100);
                        const isOverBudget = parseFloat(actualHours) > project.quotedHours;

                        return (
                            <div key={project.id} className="project-card card">
                                <div className="project-card-header">
                                    <div>
                                        <Link href={`/projects/${project.id}`} className="project-name-link">
                                            <div className="project-card-title">{project.name}</div>
                                        </Link>
                                        <div className="project-card-client">
                                            {project.clientName} {project.dealId ? `(#${project.dealId})` : ''}
                                        </div>
                                    </div>
                                    <span className={`status-badge ${project.status.toLowerCase()}`}>
                                        {project.status.replace('_', ' ')}
                                    </span>
                                </div>
                                
                                <div className="progress-cell" style={{ width: '100%' }}>
                                    <div className="progress-text" style={{ justifyContent: 'space-between' }}>
                                        <span className="muted">Hours Logged</span>
                                        <div>
                                            <span className={isOverBudget ? 'text-danger' : ''}>{actualHours}h</span>
                                            <span className="muted"> / {project.quotedHours}h</span>
                                        </div>
                                    </div>
                                    <div className="progress-bar-bg">
                                        <div
                                            className={`progress-bar-fill ${isOverBudget ? 'danger' : 'primary'}`}
                                            style={{ width: `${progressPercent}%` }}
                                        />
                                    </div>
                                </div>

                                <div className="project-card-meta">
                                    <div className="manager-info">
                                        <div className="avatar-small">
                                            {project.manager?.name.substring(0, 2).toUpperCase()}
                                        </div>
                                        <span>{project.manager?.name}</span>
                                    </div>
                                    <Link href={`/projects/${project.id}`} className="btn-secondary" style={{ padding: '0.25rem 0.75rem', fontSize: '0.75rem' }}>
                                        View
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                    {projects.length === 0 && (
                        <div className="empty-row" style={{ gridColumn: '1 / -1' }}>
                            No projects found. Create one to get started.
                        </div>
                    )}
                </div>
            ) : (
                <div className="projects-table-container card">
                    <table className="projects-table">
                        <thead>
                            <tr>
                                <th>Project Name</th>
                                <th>Client / Deal</th>
                                <th>Manager</th>
                                <th>Progress</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {projects.map((project: any) => {
                                // Calculate actual hours
                                const totalMinutes = project.tasks.reduce((acc: number, task: any) => {
                                    return acc + task.timeLogs.reduce((accLog: number, log: any) => accLog + log.timeSpentMinutes, 0);
                                }, 0);

                                const actualHours = (totalMinutes / 60).toFixed(1);
                                const progressPercent = Math.min(100, (parseFloat(actualHours) / project.quotedHours) * 100);

                                const isOverBudget = parseFloat(actualHours) > project.quotedHours;

                                return (
                                    <tr key={project.id} className="project-row">
                                        <td>
                                            <Link href={`/projects/${project.id}`} className="project-name-link">
                                                {project.name}
                                            </Link>
                                        </td>
                                        <td>
                                            <div className="client-info">
                                                <span className="client-name">{project.clientName}</span>
                                                {project.dealId && <span className="deal-id">#{project.dealId}</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="manager-info">
                                                <div className="avatar-small">
                                                    {project.manager?.name.substring(0, 2).toUpperCase()}
                                                </div>
                                                <span>{project.manager?.name}</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="progress-cell">
                                                <div className="progress-text">
                                                    <span className={isOverBudget ? 'text-danger' : ''}>
                                                        {actualHours}h
                                                    </span>
                                                    <span className="muted">/ {project.quotedHours}h</span>
                                                </div>
                                                <div className="progress-bar-bg">
                                                    <div
                                                        className={`progress-bar-fill ${isOverBudget ? 'danger' : 'primary'}`}
                                                        style={{ width: `${progressPercent}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <span className={`status-badge ${project.status.toLowerCase()}`}>
                                                {project.status.replace('_', ' ')}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="icon-btn action-menu-btn">
                                                <MoreVertical size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}

                            {projects.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="empty-row">
                                        No projects found. Create one to get started.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
