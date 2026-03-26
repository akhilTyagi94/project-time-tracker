import './page.css';
import { Play, CheckCircle2, AlertCircle, Clock, TrendingUp, FolderKanban, DollarSign, BarChart3, Users } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  const user = await getSessionUser();
  if (!user) {
    redirect('/login');
  }

  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // -----------------------------------------------------------------
  // USER DASHBOARD
  // -----------------------------------------------------------------
  if (user.role === 'USER') {
    const todaysTasks = await prisma.task.findMany({
      where: { status: { not: 'COMPLETED' }, assignedToId: user.id },
      include: { project: true },
    });

    return (
        <div className="dashboard animate-slide-in">
            <header className="dashboard-header">
                <div>
                    <h1 className="page-title">Good Morning, {user.name.split(' ')[0]}</h1>
                    <p className="page-subtitle">Your assigned tasks and workload summary.</p>
                </div>
            </header>
            <div className="content-grid" style={{ marginTop: '2rem' }}>
                <div className="tasks-section card">
                    <div className="section-header">
                        <h2>My Assigned Tasks</h2>
                        <Link href="/projects" className="btn-secondary">Go to Projects</Link>
                    </div>
                    <div className="task-list">
                    {todaysTasks.length === 0 ? (
                        <div className="empty-state">
                            <CheckCircle2 size={32} className="empty-icon" />
                            <p>You have no active tasks assigned to you right now.</p>
                        </div>
                    ) : (
                        todaysTasks.map(task => (
                            <div className="task-item" key={task.id}>
                                <div className="task-info">
                                    <div className="task-title">{task.title}</div>
                                    <div className="task-meta">{task.project.name} • {task.estimatedHours}h estimated</div>
                                </div>
                                <div className="task-actions">
                                    <Link href={`/time`} className="btn-primary timer-btn-small">
                                        <Play size={14} fill="currentColor" />
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                    </div>
                </div>
            </div>
        </div>
    );
  }

  // -----------------------------------------------------------------
  // MANAGER, ADMIN, SUPER_ADMIN DASHBOARD
  // -----------------------------------------------------------------
  
  // Set visibility filters based on role
  let projectsWhere: any = {};
  let timeLogWhere: any = { createdAt: { gte: startOfDay, lte: endOfDay } };
  
  if (user.role === 'MANAGER') {
    projectsWhere = { managerId: user.id };
    timeLogWhere.task = { project: { managerId: user.id } };
  }

  // 1. Time Logged Today
  const todayLogs = await prisma.timeLog.aggregate({
    where: timeLogWhere,
    _sum: { timeSpentMinutes: true }
  });
  
  const loggedMinutes = todayLogs._sum.timeSpentMinutes || 0;
  const hours = Math.floor(loggedMinutes / 60);
  const mins = loggedMinutes % 60;
  const timeLoggedStr = loggedMinutes > 0 ? `${hours}h ${mins}m` : '0h 0m';
  const isTimeLogged = loggedMinutes > 0;

  // 2. Active Projects & Quoted vs Consumed
  const activeProjects = await prisma.project.findMany({
    where: { ...projectsWhere, status: 'ACTIVE' },
    include: { tasks: { include: { timeLogs: true } } }
  });

  let totalQuoted = 0;
  let totalLogged = 0;
  let atRiskCount = 0;

  for (const project of activeProjects) {
    totalQuoted += project.quotedHours;
    let projectMinutes = 0;
    for (const task of project.tasks) {
      for (const log of task.timeLogs) {
        projectMinutes += log.timeSpentMinutes;
      }
    }
    const projectHours = projectMinutes / 60;
    totalLogged += projectHours;
    if (project.quotedHours > 0 && (projectHours / project.quotedHours) > 0.9) {
      atRiskCount++;
    }
  }

  const overallBurnRate = totalQuoted > 0 ? (totalLogged / totalQuoted) * 100 : 0;
  const efficiencyValue = totalQuoted > 0 ? Math.max(0, 100 - Math.round(overallBurnRate)) : 100;
  
  // 3. User's Team Tasks (Manager) or All Tasks (Admin/Super)
  const todaysTasks = await prisma.task.findMany({
    where: user.role === 'MANAGER' ? { project: { managerId: user.id }, status: { not: 'COMPLETED' } } : { status: { not: 'COMPLETED' } },
    include: { project: true, assignedTo: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  // 4. Recent Activity
  const recentLogs = await prisma.timeLog.findMany({
    where: user.role === 'MANAGER' ? { task: { project: { managerId: user.id } } } : {},
    include: { task: { include: { project: true } }, user: true },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  return (
    <div className="dashboard animate-slide-in">
      <header className="dashboard-header">
        <div>
          <h1 className="page-title">Good Morning, {user.name.split(' ')[0]}</h1>
          <p className="page-subtitle">
            {user.role === 'SUPER_ADMIN' ? "Global executive overview of all teams and financial performance."
             : user.role === 'ADMIN' ? "Global overview of all organizational projects and timelines."
             : "Here's what your team is working on today."}
          </p>
        </div>
        <div className="date-display">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </header>

      {/* SUPER ADMIN FINANCIAL DASHBOARD */}
      {user.role === 'SUPER_ADMIN' && (
          <div className="metrics-grid" style={{ marginBottom: '1.5rem', background: 'rgba(255, 255, 255, 0.02)', padding: '1rem', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
            <div className="metric-card">
              <div className="metric-header">
                <h3>Total Hours Quoted (Value)</h3>
                <DollarSign className="metric-icon" size={20} />
              </div>
              <div className="metric-value">{totalQuoted} h</div>
              <div className="metric-trend positive">
                <BarChart3 size={16} />
                <span>Across all active firm projects</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <h3>Total Hours Consumed</h3>
                <Clock className="metric-icon" size={20} />
              </div>
              <div className="metric-value">{Math.round(totalLogged)} h</div>
              <div className="metric-trend muted">
                <BarChart3 size={16} />
                <span>Total aggregated billables</span>
              </div>
            </div>
            <div className="metric-card">
              <div className="metric-header">
                <h3>Firm Burn Rate</h3>
                <TrendingUp className="metric-icon" size={20} />
              </div>
              <div className={`metric-value ${overallBurnRate > 90 ? 'text-danger' : 'text-success'}`}>{overallBurnRate.toFixed(1)}%</div>
              <div className="metric-trend">
                <span>Total consumed vs quoted margin</span>
              </div>
            </div>
          </div>
      )}

      {/* STANDARD METRICS */}
      <div className="metrics-grid">
        <div className="metric-card card">
          <div className="metric-header">
            <h3>{user.role === 'MANAGER' ? 'Team Time Logged Today' : 'Org Time Logged Today'}</h3>
            <Clock className="metric-icon" size={20} />
          </div>
          <div className="metric-value">{timeLoggedStr}</div>
          <div className={`metric-trend ${isTimeLogged ? 'positive' : 'muted'}`}>
            <TrendingUp size={16} />
            <span>{isTimeLogged ? 'Tracked today' : 'No time tracked yet'}</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <h3>Avg Efficiency</h3>
            <CheckCircle2 className="metric-icon" size={20} />
          </div>
          <div className="metric-value">{efficiencyValue}%</div>
          <div className="metric-trend positive">
            <TrendingUp size={16} />
            <span>Based on active project budgets</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <h3>At Risk Projects</h3>
            <AlertCircle className={`metric-icon ${atRiskCount > 0 ? 'text-danger' : 'text-success'}`} size={20} />
          </div>
          <div className={`metric-value ${atRiskCount > 0 ? 'text-danger' : 'text-success'}`}>{atRiskCount}</div>
          <div className={`metric-trend ${atRiskCount > 0 ? 'negative' : 'positive'}`}>
            <span>{atRiskCount > 0 ? 'Requires attention' : 'All projects healthy'}</span>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="tasks-section card">
          <div className="section-header">
            <h2>{user.role === 'MANAGER' ? "Team Tasks" : "Organization Tasks"}</h2>
            <Link href="/projects" className="btn-secondary">View All Projects</Link>
          </div>

          <div className="task-list">
            {todaysTasks.length === 0 ? (
               <div className="empty-state">
                  <CheckCircle2 size={32} className="empty-icon" />
                  <p>No active tasks in scope.</p>
               </div>
            ) : (
                todaysTasks.map(task => (
                    <div className="task-item" key={task.id}>
                        <div className="task-info">
                            <div className="task-title">{task.title}</div>
                            <div className="task-meta">{task.project.name} • Assigned to: {task.assignedTo?.name || 'Unassigned'}</div>
                        </div>
                    </div>
                ))
            )}
          </div>
        </div>

        <div className="activity-section card">
          <div className="section-header">
            <h2>{user.role === 'MANAGER' ? "Team Activity" : "Global Log Activity"}</h2>
          </div>
          <div className="activity-placeholder">
            {recentLogs.length === 0 ? (
                <div className="empty-state">
                  <Clock size={32} className="empty-icon" />
                  <p>No recent time logs found.</p>
                </div>
            ) : (
                <div className="recent-activity-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem', width: '100%' }}>
                    {recentLogs.map(log => {
                        const h = Math.floor(log.timeSpentMinutes / 60);
                        const m = log.timeSpentMinutes % 60;
                        const timeStr = `${h > 0 ? h + 'h ' : ''}${m}m`;
                        return (
                            <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                                    <span style={{ fontWeight: 500, fontSize: '0.875rem' }}>{log.task.title}</span>
                                    <span style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <Users size={12} /> {log.user.name} • {log.task.project.name}
                                    </span>
                                </div>
                                <div style={{ fontWeight: 600, color: 'var(--primary)' }}>
                                    +{timeStr}
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
