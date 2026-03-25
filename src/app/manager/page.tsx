import { prisma } from '@/lib/prisma';
import { Target, Users, AlertTriangle, TrendingUp } from 'lucide-react';
import './page.css';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function ManagerDashboard() {
    const users = await prisma.user.findMany({
        include: {
            timeLogs: true,
            tasks: true,
        }
    });

    const projects = await prisma.project.findMany({
        include: {
            tasks: {
                include: {
                    timeLogs: true
                }
            }
        }
    });

    // Calculate high level metrics
    const overBudgetProjects = projects.filter((project: any) => {
        const totalMinutes = project.tasks.reduce((acc: number, task: any) => {
            return acc + task.timeLogs.reduce((accLog: number, log: any) => accLog + log.timeSpentMinutes, 0);
        }, 0);
        return (totalMinutes / 60) > project.quotedHours;
    });

    const totalTeamCapacity = users.reduce((acc: number, user: any) => acc + user.capacityHours, 0);

    // Weekly logged hours (mock: using all time for MVP demonstration)
    const totalTeamLoggedMinutes = users.reduce((acc: number, user: any) => {
        return acc + user.timeLogs.reduce((accLog: number, log: any) => accLog + log.timeSpentMinutes, 0);
    }, 0);
    const totalTeamLoggedHours = totalTeamLoggedMinutes / 60;

    const utilizationRate = Math.min(100, (totalTeamLoggedHours / totalTeamCapacity) * 100).toFixed(0);

    return (
        <div className="manager-dashboard animate-slide-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Manager Overview</h1>
                    <p className="page-subtitle">Monitor team utilization, active projects, and budget health.</p>
                </div>
                <div className="header-actions">
                    <button className="btn-secondary">Export Report</button>
                </div>
            </header>

            <div className="metrics-grid">
                <div className="metric-card card">
                    <div className="metric-header">
                        <h3>Team Utilization</h3>
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
                        <span>Across {users.length} team members</span>
                    </div>
                </div>
            </div>

            <div className="content-grid manager-grid">
                <div className="utilization-section card">
                    <div className="section-header">
                        <h2>Team Resource Allocation</h2>
                    </div>

                    <div className="resource-list">
                        {users.map((user: any) => {
                            const minutes = user.timeLogs.reduce((acc: number, log: any) => acc + log.timeSpentMinutes, 0);
                            const hoursLogged = (minutes / 60).toFixed(1);
                            const utilization = Math.min(100, (parseFloat(hoursLogged) / user.capacityHours) * 100);
                            const isOverUtilized = utilization > 100;
                            const isUnderUtilized = utilization < 50;

                            return (
                                <div className="resource-item" key={user.id}>
                                    <div className="resource-info">
                                        <div className="avatar-small">{user.name.substring(0, 2).toUpperCase()}</div>
                                        <div>
                                            <div className="resource-name">{user.name}</div>
                                            <div className="resource-role">{user.role}</div>
                                        </div>
                                    </div>
                                    <div className="resource-metrics">
                                        <div className="utilization-bar-container">
                                            <div className="utilization-labels">
                                                <span>{utilization.toFixed(0)}% Booked</span>
                                                <span>{hoursLogged}h / {user.capacityHours}h capacity</span>
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
                        <h2>Project Risks</h2>
                    </div>
                    <div className="risk-list">
                        {overBudgetProjects.length === 0 ? (
                            <div className="empty-state">
                                <Target size={32} className="empty-icon text-success" />
                                <p>All projects are currently under budget.</p>
                            </div>
                        ) : (
                            overBudgetProjects.map((project: any) => {
                                const totalMinutes = project.tasks.reduce((acc: number, task: any) => {
                                    return acc + task.timeLogs.reduce((accLog: number, log: any) => accLog + log.timeSpentMinutes, 0);
                                }, 0);
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

                        {/* Adding a mocked delayed task risk for demonstration */}
                        <div className="risk-item">
                            <div className="risk-icon">
                                <AlertTriangle size={18} className="text-warning" />
                            </div>
                            <div className="risk-content">
                                <div className="risk-title">Website Redesign (Task: QA)</div>
                                <div className="risk-details">
                                    Task has been pending for 5 days without updates.
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
