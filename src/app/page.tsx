import './page.css';
import { Play, CheckCircle2, AlertCircle, Clock, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  return (
    <div className="dashboard animate-slide-in">
      <header className="dashboard-header">
        <div>
          <h1 className="page-title">Good Morning, John</h1>
          <p className="page-subtitle">Here's what's happening with your projects today.</p>
        </div>
        <div className="date-display">
          March 25, 2026
        </div>
      </header>

      <div className="metrics-grid">
        <div className="metric-card card">
          <div className="metric-header">
            <h3>Time Logged Today</h3>
            <Clock className="metric-icon" size={20} />
          </div>
          <div className="metric-value">4h 15m</div>
          <div className="metric-trend positive">
            <TrendingUp size={16} />
            <span>On track</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <h3>Avg Efficiency</h3>
            <CheckCircle2 className="metric-icon" size={20} />
          </div>
          <div className="metric-value">92%</div>
          <div className="metric-trend positive">
            <TrendingUp size={16} />
            <span>+5% this week</span>
          </div>
        </div>

        <div className="metric-card card">
          <div className="metric-header">
            <h3>At Risk Projects</h3>
            <AlertCircle className="metric-icon text-danger" size={20} />
          </div>
          <div className="metric-value text-danger">2</div>
          <div className="metric-trend negative">
            <span>Requires attention</span>
          </div>
        </div>
      </div>

      <div className="content-grid">
        <div className="tasks-section card">
          <div className="section-header">
            <h2>Today's Tasks</h2>
            <button className="btn-secondary">View All</button>
          </div>

          <div className="task-list">
            {/* Task Item */}
            <div className="task-item">
              <div className="task-info">
                <div className="task-title">API Integration & Debugging</div>
                <div className="task-meta">OneMetric Client Portal • 2h estimated</div>
              </div>
              <div className="task-actions">
                <button className="btn-primary timer-btn-small">
                  <Play size={14} fill="currentColor" />
                </button>
              </div>
            </div>

            <div className="task-item">
              <div className="task-info">
                <div className="task-title">Design System Overhaul</div>
                <div className="task-meta">HubSpot CRM Sync • 4h estimated</div>
              </div>
              <div className="task-actions">
                <button className="btn-primary timer-btn-small">
                  <Play size={14} fill="currentColor" />
                </button>
              </div>
            </div>

          </div>
        </div>

        <div className="activity-section card">
          <div className="section-header">
            <h2>Recent Activity</h2>
          </div>
          <div className="activity-placeholder">
            <div className="empty-state">
              <Clock size={32} className="empty-icon" />
              <p>No recent time logs. Start working on a task!</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
