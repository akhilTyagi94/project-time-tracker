import { prisma } from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { Play, Calendar, Users, Target, Clock } from 'lucide-react';
import './page.css';
import Link from 'next/link';
import ProjectActions from './ProjectActions';
import ProjectDocuments from './ProjectDocuments';
import ProjectTeam from './ProjectTeam';
import TaskStatusSelect from './TaskStatusSelect';
import { getSessionUser } from '@/lib/auth';
import { deleteTask } from '../actions';
import { redirect } from 'next/navigation';

export default async function ProjectDetailsPage({ 
    params, 
    searchParams 
}: { 
    params: Promise<{ id: string }>,
    searchParams: Promise<{ taskStatus?: string }>
}) {
    const session = await getSessionUser();
    if (!session) redirect('/login');

    const { id } = await params;
    const { taskStatus = 'all' } = await searchParams;

    const project = await (prisma.project.findUnique as any)({
        where: { id },
        include: {
            manager: true,
            documents: true,
            members: true,
            milestones: true,
            tasks: {
                include: {
                    assignedTo: true,
                    timeLogs: true,
                    milestone: true,
                },
                orderBy: { createdAt: 'desc' }
            }
        }
    });

    const users = await prisma.user.findMany({
        select: { id: true, name: true, role: true },
        orderBy: { name: 'asc' },
    });

    if (!project) {
        notFound();
    }

    // Security Check for assigned projects
    const isExecutive = session.role === 'SUPER_ADMIN' || session.role === 'ADMIN';
    const isManager = project.managerId === session.id;
    const isMember = (project as any).members.some((m: any) => m.id === session.id);

    if (!isExecutive && !isManager && !isMember) {
        redirect('/projects');
    }

    // Analytics
    let totalMinutesLogged = 0;
    let totalEstimatedHours = 0;

    (project as any).tasks.forEach((task: any) => {
        totalEstimatedHours += task.estimatedHours;
        task.timeLogs.forEach((log: any) => {
            totalMinutesLogged += log.timeSpentMinutes;
        });
    });

    // Filter tasks based on status
    const filteredTasks = (project as any).tasks.filter((task: any) => {
        if (taskStatus === 'all') return true;
        if (taskStatus === 'in_progress') return task.status === 'IN_PROGRESS' || task.status === 'PENDING';
        if (taskStatus === 'completed') return task.status === 'COMPLETED';
        return true;
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
                <ProjectActions project={project} users={users} milestones={project.milestones} userRole={session.role} />
            </header>

            <div className="dashboard-grid">
                {/* Analytics Sidebar */}
                <div className="analytics-sidebar">
                    <div className="card overview-card">
                        <h3>Budget Overview</h3>
                        <div className="budget-meter">
                            <div 
                                className="budget-circle"
                                style={{
                                    '--burn-rate': Math.min(Number(burnRate), 100),
                                    '--ring-color': isDanger ? 'var(--danger)' : 'var(--primary)'
                                } as React.CSSProperties}
                            >
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

                    <ProjectTeam 
                        projectId={project.id} 
                        members={(project as any).members} 
                        allUsers={users} 
                        canManage={isExecutive || isManager} 
                    />

                    <ProjectDocuments projectId={project.id} documents={project.documents} userRole={session.role} />
                </div>

                {/* Tasks List */}
                <div className="tasks-main card">
                    <div className="section-header">
                        <h3>Tasks</h3>
                        <div className="task-filters">
                            <Link 
                                href={`/projects/${id}?taskStatus=all`} 
                                className={`filter-btn ${taskStatus === 'all' ? 'active' : ''}`}
                            >
                                All
                            </Link>
                            <Link 
                                href={`/projects/${id}?taskStatus=in_progress`} 
                                className={`filter-btn ${taskStatus === 'in_progress' ? 'active' : ''}`}
                            >
                                In Progress
                            </Link>
                            <Link 
                                href={`/projects/${id}?taskStatus=completed`} 
                                className={`filter-btn ${taskStatus === 'completed' ? 'active' : ''}`}
                            >
                                Completed
                            </Link>
                        </div>
                    </div>

                    <div className="task-list">
                        {filteredTasks.length === 0 ? (
                            <div className="empty-state">
                                <Target size={32} className="empty-icon" />
                                <p>No tasks found for this status.</p>
                            </div>
                        ) : (
                            filteredTasks.map((task: any) => {
                                const taskMinutes = task.timeLogs.reduce((acc: number, log: any) => acc + log.timeSpentMinutes, 0);
                                const taskHours = (taskMinutes / 60).toFixed(1);

                                return (
                                    <div className="task-row" key={task.id}>
                                        <div className="task-status-indicator">
                                            <TaskStatusSelect 
                                                taskId={task.id} 
                                                projectId={project.id} 
                                                initialStatus={task.status} 
                                            />
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
                                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                                {session.role !== 'USER' && (
                                                    <form action={async () => {
                                                        'use server';
                                                        await deleteTask(task.id, project.id);
                                                    }}>
                                                        <button type="submit" className="icon-btn" style={{ color: 'var(--danger)' }} title="Delete Task">×</button>
                                                    </form>
                                                )}
                                                <button className="btn-primary timer-btn-small shrink">
                                                    <Play size={14} fill="currentColor" />
                                                </button>
                                            </div>
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
