import './page.css';
import { Play, CheckCircle2, AlertCircle, Clock, TrendingUp, FolderKanban } from 'lucide-react';
import { prisma } from '@/lib/prisma';
import Link from 'next/link';

export const dynamic = 'force-dynamic';

export default async function Dashboard() {
  // Get date range for today
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);
  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  // 1. Time Logged Today
  const todayLogs = await prisma.timeLog.aggregate({
    where: {
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      }
    },
    _sum: {
      timeSpentMinutes: true,
    }
  });
  
  const loggedMinutes = todayLogs._sum.timeSpentMinutes || 0;
  const hours = Math.floor(loggedMinutes / 60);
  const mins = loggedMinutes % 60;
  const timeLoggedStr = loggedMinutes > 0 ? `${hours}h ${mins}m` : '0h 0m';
  const isTimeLogged = loggedMinutes > 0;

  // 2. Active Projects & Efficiency
  const activeProjects = await prisma.project.findMany({
    where: { status: 'ACTIVE' },
    include: {
      tasks: {
        include: { timeLogs: true }
      }
    }
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
  const efficiencyStr = `${efficiencyValue}%`;

  // 3. Today's Tasks
  const todaysTasks = await prisma.task.findMany({
    where: { status: { not: 'COMPLETED' } },
    include: { project: true, assignedTo: true },
    orderBy: { createdAt: 'desc' },
    take: 3,
  });

  // 4. Recent Activity
  const recentLogs = await prisma.timeLog.findMany({
    include: { task: { include: { project: true } } },
    orderBy: { createdAt: 'desc' },
    take: 4,
  });

  return (
    <div className="dashboard animate-slide-in">
      <header className="dashboard-header">
        <div>
          <h1 className="page-title">Good Morning, John</h1>
          <p className="page-subtitle">Here's what's happening with your projects today.</p>
        </div>
        <div className="date-display">
          {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
        </div>
      </header>

      <div className="metrics-grid">
        <div className="metric-card card">
          <div className="metric-header">
            <h3>Time Logged Today</h3>
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
          <div className="metric-value">{efficiencyStr}</div>
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
            <h2>Today's Tasks</h2>
            <Link href="/projects" className="btn-secondary">View All</Link>
          </div>

          <div className="task-list">
            {todaysTasks.length === 0 ? (
               <div className="empty-state">
                  <CheckCircle2 size={32} className="empty-icon" />
                  <p>No active tasks assigned.</p>
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

        <div className="activity-section card">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="activity-placeholder">
            {recentLogs.length === 0 ? (
                <div className="empty-state">
                  <Clock size={32} className="empty-icon" />
                  <p>No recent time logs. Start working on a task!</p>
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
                                        <FolderKanban size={12} /> {log.task.project.name}
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
