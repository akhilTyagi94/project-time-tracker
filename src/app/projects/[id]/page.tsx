import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Play, Calendar, Users, Target, Clock } from 'lucide-react';
import './page.css';
import Link from 'next/link';

export default async function ProjectDetailsPage({ params }: { params: { id: string } }) {
    const project = await prisma.project.findUnique({
        where: { id: params.id },
        include: {
            manager: true,
            milestones: true,
            tasks: {
                include: {
                    assignedTo: true,
                    timeLogs: true,
                    milestone: true,
                }
            }
        }
    });

    if (!project) {
        notFound();
    }

    // Analytics
    let totalMinutesLogged = 0;
    let totalEstimatedHours = 0;

    project.tasks.forEach(task => {
        totalEstimatedHours += task.estimatedHours;
        task.timeLogs.forEach(log => {
            totalMinutesLogged += log.timeSpentMinutes;
        });
    });

    const loggedHours = (totalMinutesLogged / 60).toFixed(1);
    const remainingHours = Math.max(0, project.quotedHours - parseFloat(loggedHours)).toFixed(1);
    const burnRate = ((parseFloat(loggedHours) / project.quotedHours) * 100).toFixed(0);
    const isDanger = parseFloat(burnRate) > 90;

    return (
        <div className="project-detail-page animate-slide-in">
            <div className="breadcrumbs">
                <Link href="/projects" className="muted-link">Projects</Link>
                <span className="separator">/</span>
                <span className="current">{project.name}</span>
            </div>

            <header className="detail-header">
                <div className="title-section">
                    <h1 className="page-title">{project.name}</h1>
                    <div className="project-meta">
                        <span className={`status-badge ${project.status.toLowerCase()}`}>
                            {project.status.replace('_', ' ')}
                        </span>
                        <span className="meta-item">
                            <Users size={14} />
                            {project.clientName} {project.dealId ? `(#${project.dealId})` : ''}
                        </span>
                        <span className="meta-item">
                            <Calendar size={14} />
                            {project.startDate ? project.startDate.toLocaleDateString() : 'No start date'} - {project.endDate ? project.endDate.toLocaleDateString() : 'No end date'}
                        </span>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">Edit Project</button>
                    <button className="btn-primary">Add Task</button>
                </div>
            </header>

            <div className="dashboard-grid">
                {/* Analytics Sidebar */}
                <div className="analytics-sidebar">
                    <div className="card overview-card">
                        <h3>Budget Overview</h3>
                        <div className="budget-meter">
                            <div className="budget-circle">
                                <span className={`burn-rate ${isDanger ? 'text-danger' : ''}`}>{burnRate}%</span>
                                <span className="label">Burned</span>
                            </div>
                        </div>

                        <div className="stats-list">
                            <div className="stat-item">
                                <div className="stat-label">Quoted Hours</div>
                                <div className="stat-value">{project.quotedHours}h</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-label">Logged Hours</div>
                                <div className={`stat-value ${isDanger ? 'text-danger' : ''}`}>{loggedHours}h</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-label">Remaining</div>
                                <div className="stat-value">{remainingHours}h</div>
                            </div>
                        </div>
                    </div>

                    <div className="card team-card">
                        <h3>Team</h3>
                        <div className="team-list">
                            <div className="team-member">
                                <div className="avatar-small">
                                    {project.manager?.name.substring(0, 2).toUpperCase()}
                                </div>
                                <div className="member-info">
                                    <div className="member-name">{project.manager?.name}</div>
                                    <div className="member-role">Manager</div>
                                </div>
                            </div>
                            {/* Distinct assignees from tasks */}
                            {Array.from(new Set(project.tasks.map(t => t.assignedTo?.id)))
                                .filter(Boolean)
                                .map(id => {
                                    const user = project.tasks.find(t => t.assignedTo?.id === id)?.assignedTo;
                                    if (!user) return null;
                                    return (
                                        <div className="team-member" key={user.id}>
                                            <div className="avatar-small">
                                                {user.name.substring(0, 2).toUpperCase()}
                                            </div>
                                            <div className="member-info">
                                                <div className="member-name">{user.name}</div>
                                                <div className="member-role">{user.role}</div>
                                            </div>
                                        </div>
                                    );
                                })}
                        </div>
                    </div>
                </div>

                {/* Tasks List */}
                <div className="tasks-main card">
                    <div className="section-header">
                        <h3>Tasks</h3>
                        <div className="task-filters">
                            <button className="filter-btn active">All</button>
                            <button className="filter-btn">In Progress</button>
                            <button className="filter-btn">Completed</button>
                        </div>
                    </div>

                    <div className="task-list">
                        {project.tasks.length === 0 ? (
                            <div className="empty-state">
                                <Target size={32} className="empty-icon" />
                                <p>No tasks yet. Create one to begin tracking time.</p>
                            </div>
                        ) : (
                            project.tasks.map(task => {
                                const taskMinutes = task.timeLogs.reduce((acc, log) => acc + log.timeSpentMinutes, 0);
                                const taskHours = (taskMinutes / 60).toFixed(1);

                                return (
                                    <div className="task-row" key={task.id}>
                                        <div className="task-status-indicator">
                                            <div className={`status-dot ${task.status.toLowerCase()}`}></div>
                                        </div>
                                        <div className="task-content">
                                            <div className="task-title-area">
                                                <h4>{task.title}</h4>
                                                {task.milestone && (
                                                    <span className="milestone-badge">{task.milestone.name}</span>
                                                )}
                                            </div>
                                            <div className="task-meta-row">
                                                {task.assignedTo && (
                                                    <span className="assignee">
                                                        <div className="avatar-micro">{task.assignedTo.name.substring(0, 1)}</div>
                                                        {task.assignedTo.name}
                                                    </span>
                                                )}
                                                <span className="task-hours">
                                                    <Clock size={12} />
                                                    {taskHours}h / {task.estimatedHours}h est.
                                                </span>
                                            </div>
                                        </div>
                                        <div className="task-actions-right">
                                            <button className="btn-primary timer-btn-small shrink">
                                                <Play size={14} fill="currentColor" />
                                            </button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
