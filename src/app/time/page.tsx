import { prisma } from '@/lib/prisma';
import { Play, Check, Filter, Search } from 'lucide-react';
import './page.css';
import Link from 'next/link';
import TimeSearchInput from './TimeSearchInput';
import TimeDeleteButton from './TimeDeleteButton';
import TimeFilterButton from './TimeFilterButton';
import TimeManualEntryButton from './TimeManualEntryButton';

export const dynamic = 'force-dynamic';

export default async function TimeLogsPage(props: { searchParams?: Promise<{ q?: string, filter?: string }> }) {
    const searchParams = await props.searchParams;
    const query = searchParams?.q || '';
    const filter = searchParams?.filter || '';

    // Mock logged in user for MVP
    const user = await prisma.user.findFirst({
        where: { email: 'alice@onemetric.com' }
    });

    if (!user) return <div>User not found. Run seed script.</div>;

    let dateFilter = {};
    if (filter === 'this_week') {
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay())); // Set to Sunday of current week
        startOfWeek.setHours(0, 0, 0, 0);
        dateFilter = { date: { gte: startOfWeek } };
    }

    const timeLogs = await prisma.timeLog.findMany({
        where: { 
            userId: user.id,
            ...dateFilter,
            ...(query ? {
                OR: [
                    { description: { contains: query } },
                    { task: { title: { contains: query } } },
                    { task: { project: { name: { contains: query } } } }
                ]
            } : {})
        },
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
            </header>

            <div className="logs-container card">
                <div className="logs-toolbar">
                    <TimeSearchInput />
                    <div className="toolbar-actions" style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
                        <TimeFilterButton />
                        <TimeManualEntryButton />
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
                            <th style={{ width: 60, textAlign: 'center' }}>Actions</th>
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
                                    <td style={{ textAlign: 'center', verticalAlign: 'middle' }}>
                                        <TimeDeleteButton id={log.id} />
                                    </td>
                                </tr>
                            );
                        })}

                        {timeLogs.length === 0 && (
                            <tr>
                                <td colSpan={7} className="empty-row">
                                    No time logs found matched your criteria.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
