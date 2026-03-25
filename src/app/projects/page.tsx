import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { Plus, MoreVertical, LayoutGrid, List } from 'lucide-react';
import './page.css';

export default async function ProjectsPage() {
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
                    <button className="btn-secondary">
                        <LayoutGrid size={18} />
                    </button>
                    <button className="btn-secondary active">
                        <List size={18} />
                    </button>
                    <button className="btn-primary">
                        <Plus size={18} />
                        <span>New Project</span>
                    </button>
                </div>
            </header>

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
        </div>
    );
}
