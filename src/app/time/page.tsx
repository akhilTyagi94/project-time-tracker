import { prisma } from '@/lib/prisma';
import { Play, Check, Filter, Search } from 'lucide-react';
import './page.css';
import Link from 'next/link';

export default async function TimeLogsPage() {
    // Mock logged in user for MVP
    const user = await prisma.user.findFirst({
        where: { email: 'alice@onemetric.com' }
    });

    if (!user) return <div>User not found. Run seed script.</div>;

    const timeLogs = await prisma.timeLog.findMany({
        where: { userId: user.id },
        include: {
            task: {
                include: {
                    project: true
                }
            }
        },
        orderBy: { date: 'desc' }
    });

    return (
        <div className="time-logs-page animate-slide-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Time Logs</h1>
                    <p className="page-subtitle">Track, review, and adjust your personal logged hours.</p>
                </div>
                <div className="header-actions">
                    <div className="filter-group">
                        <button className="btn-secondary">
                            <Filter size={16} />
                            <span>This Week</span>
                        </button>
                    </div>
                    <button className="btn-primary">
                        <Play size={16} />
                        <span>Manual Entry</span>
                    </button>
                </div>
            </header>

            <div className="logs-container card">
                <div className="logs-toolbar">
                    <div className="search-bar">
                        <Search size={16} className="text-muted" />
                        <input type="text" placeholder="Search descriptions or tasks..." />
                    </div>
                    <div className="bulk-actions">
                        <button className="btn-secondary text-sm">Submit Approvals</button>
                    </div>
                </div>

                <table className="logs-table">
                    <thead>
                        <tr>
                            <th style={{ width: 40 }}><input type="checkbox" /></th>
                            <th>Task & Project</th>
                            <th>Date</th>
                            <th>Description</th>
                            <th>Duration</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {timeLogs.map((log: any) => {
                            const hours = Math.floor(log.timeSpentMinutes / 60);
                            const minutes = log.timeSpentMinutes % 60;
                            const formattedTime = `${hours}h ${minutes}m`;

                            return (
                                <tr key={log.id} className="log-row">
                                    <td><input type="checkbox" /></td>
                                    <td>
                                        <div className="task-identifier">
                                            <div className="task-name">{log.task.title}</div>
                                            <Link href={`/projects/${log.task.projectId}`} className="project-badge">
                                                {log.task.project.name}
                                            </Link>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="date-cell">
                                            {log.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="desc-cell">{log.description || 'No description provided.'}</div>
                                    </td>
                                    <td>
                                        <div className="duration-cell">{formattedTime}</div>
                                    </td>
                                    <td>
                                        <div className={`billable-status ${log.billable ? 'billable' : 'non-billable'}`}>
                                            {log.billable && <Check size={12} />}
                                            {log.billable ? 'Billable' : 'Non-Billable'}
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}

                        {timeLogs.length === 0 && (
                            <tr>
                                <td colSpan={6} className="empty-row">
                                    No time logs found. Start a timer to track your work.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
