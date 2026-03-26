import { prisma, Prisma } from '@/lib/prisma';
import { Target, Users, AlertTriangle, TrendingUp, ShieldCheck } from 'lucide-react';
import './page.css';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';
import UserManagementControls from './UserManagementControls';
import AddUserModal from './AddUserModal';

export const dynamic = 'force-dynamic';

export default async function ManagerDashboard() {
    const session = await getSessionUser();
    if (!session || session.role === 'USER') {
        redirect('/');
    }

    const isExecutive = session.role === 'SUPER_ADMIN' || session.role === 'ADMIN';

    // Managers only see their direct reports. Executives see everyone.
    const usersWhere: any = isExecutive ? {} : { managerId: session?.id };
    
    // Fetch users along with their time logs to calculate utilization
    const users = await (prisma.user.findMany as any)({
        where: usersWhere,
        include: {
            timeLogs: true,
            tasks: true,
            manager: true,
        },
        orderBy: { role: 'asc' }
    });

    // Fetch projects to compute risks
    const projectsWhere = isExecutive ? {} : { managerId: session.id };
    const projects = await prisma.project.findMany({
        where: projectsWhere,
        include: {
            tasks: {
                include: { timeLogs: true }
            }
        }
    });

    const managersOnly = isExecutive ? await prisma.user.findMany({ where: { role: 'MANAGER' } }) : [];

    // Calculate metrics
    const overBudgetProjects = projects.filter((project: any) => {
        const totalMinutes = project.tasks.reduce((acc: number, task: any) => acc + task.timeLogs.reduce((accLog: number, log: any) => accLog + log.timeSpentMinutes, 0), 0);
        return project.quotedHours > 0 && (totalMinutes / 60) > project.quotedHours;
    });

    const totalTeamCapacity = users.reduce((acc: number, user: any) => acc + user.capacityHours, 0);
    const totalTeamLoggedMinutes = users.reduce((acc: number, user: any) => acc + user.timeLogs.reduce((accLog: number, log: any) => accLog + log.timeSpentMinutes, 0), 0);
    const utilizationRate = totalTeamCapacity > 0 ? Math.min(100, (totalTeamLoggedMinutes / 60 / totalTeamCapacity) * 100).toFixed(0) : 0;

    return (
        <div className="manager-dashboard animate-slide-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">{isExecutive ? 'User & Organization Management' : 'My Team Overview'}</h1>
                    <p className="page-subtitle">
                        {isExecutive 
                            ? "Control security roles, hierarchy alignments, and monitor global organization utilization." 
                            : "Monitor your team's utilization, active projects, and budget health."}
                    </p>
                </div>
                {isExecutive && (
                    <div className="header-actions">
                        <AddUserModal managers={managersOnly} />
                    </div>
                )}
            </header>

            <div className="metrics-grid">
                <div className="metric-card card">
                    <div className="metric-header">
                        <h3>{isExecutive ? 'Global Capacity Booked' : 'Team Utilization'}</h3>
                        <Users className="metric-icon" size={20} />
                    </div>
                    <div className="metric-value">{utilizationRate}%</div>
                    <div className="metric-trend positive">
                        <TrendingUp size={16} />
                        <span>Target: 80%</span>
                    </div>
                </div>
                <div className="metric-card card">
                    <div className="metric-header">
                        <h3>Over Budget Projects</h3>
                        <AlertTriangle className="metric-icon text-danger" size={20} />
                    </div>
                    <div className="metric-value text-danger">{overBudgetProjects.length}</div>
                    <div className="metric-trend negative">
                        <span>Requires immediate review</span>
                    </div>
                </div>
                <div className="metric-card card">
                    <div className="metric-header">
                        <h3>Active Projects</h3>
                        <Target className="metric-icon" size={20} />
                    </div>
                    <div className="metric-value">{projects.filter((p: any) => p.status === 'ACTIVE').length}</div>
                    <div className="metric-trend">
                        <span>Across {users.length} tracked members</span>
                    </div>
                </div>
            </div>

            <div className="content-grid manager-grid">
                <div className="utilization-section card">
                    <div className="section-header">
                        <h2>{isExecutive ? 'Personnel Directory & Access Roles' : 'Team Resource Allocation'}</h2>
                    </div>

                    <div className="resource-list">
                        {users.map((user: any) => {
                            const minutes = user.timeLogs.reduce((acc: number, log: any) => acc + log.timeSpentMinutes, 0);
                            const hoursLogged = (minutes / 60).toFixed(1);
                            const utilization = user.capacityHours > 0 ? (parseFloat(hoursLogged) / user.capacityHours) * 100 : 0;
                            const isOverUtilized = utilization > 100;
                            const isUnderUtilized = utilization < 50;

                            return (
                                <div className="resource-item" key={user.id} style={{ alignItems: 'flex-start' }}>
                                    <div className="resource-info" style={{ flex: 1.5 }}>
                                        <div className="avatar-small">{user.name.substring(0, 2).toUpperCase()}</div>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <div className="resource-name">{user.name}</div>
                                            <div className="resource-role">
                                                {user.email} • <span style={{ color: 'var(--primary)' }}>{user.role}</span>
                                                {user.manager ? ` (Reports to: ${user.manager.name})` : ''}
                                            </div>
                                            
                                            {/* RBAC CONTROLS INSIDE THE ROW */}
                                            {isExecutive && session.id !== user.id && (
                                                <UserManagementControls user={user} allUsers={users} managersOnly={managersOnly} />
                                            )}
                                        </div>
                                    </div>

                                    <div className="resource-metrics" style={{ flex: 1 }}>
                                        <div className="utilization-bar-container">
                                            <div className="utilization-labels">
                                                <span>{Math.min(100, utilization).toFixed(0)}% Booked</span>
                                                <span>{hoursLogged}h / {user.capacityHours}h</span>
                                            </div>
                                            <div className="progress-bar-bg">
                                                <div
                                                    className={`progress-bar-fill ${isOverUtilized ? 'danger' : isUnderUtilized ? 'warning' : 'primary'}`}
                                                    style={{ width: `${Math.min(100, utilization)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="risks-section card">
                    <div className="section-header">
                        <h2>{isExecutive ? 'Global Project Risks' : 'Project Risks'}</h2>
                    </div>
                    <div className="risk-list">
                        {overBudgetProjects.length === 0 ? (
                            <div className="empty-state">
                                <Target size={32} className="empty-icon text-success" />
                                <p>All monitored projects are under budget.</p>
                            </div>
                        ) : (
                            overBudgetProjects.map((project: any) => {
                                const totalMinutes = project.tasks.reduce((acc: number, task: any) => acc + task.timeLogs.reduce((accLog: number, log: any) => accLog + log.timeSpentMinutes, 0), 0);
                                const actualHours = (totalMinutes / 60).toFixed(1);

                                return (
                                    <div className="risk-item" key={project.id}>
                                        <div className="risk-icon">
                                            <AlertTriangle size={18} className="text-danger" />
                                        </div>
                                        <div className="risk-content">
                                            <Link href={`/projects/${project.id}`} className="risk-title">
                                                {project.name}
                                            </Link>
                                            <div className="risk-details">
                                                Budget exceeded: {actualHours}h logged vs {project.quotedHours}h quoted.
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
