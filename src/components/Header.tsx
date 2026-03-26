'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Play, Pause, Square, Bell, Search, Clock, X, Minus, FolderKanban, CheckCircle2, AlertCircle } from 'lucide-react';
import { searchItems, getActiveTasks, saveTimeLog, getAlerts, markAlertRead } from '@/lib/actions';
import { logoutAction } from '@/lib/auth';
import './Header.css';

export default function Header({ user }: { user: any }) {
    const router = useRouter();

    // Search state
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<{ projects: any[]; tasks: any[] }>({ projects: [], tasks: [] });
    const [showSearch, setShowSearch] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    // Timer state
    const [isRunning, setIsRunning] = useState(false);
    const [elapsed, setElapsed] = useState(0); // seconds
    const [showTimerPanel, setShowTimerPanel] = useState(false);
    const [activeTasks, setActiveTasks] = useState<any[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [timerDescription, setTimerDescription] = useState('');
    const [saving, setSaving] = useState(false);
    const [saved, setSaved] = useState(false);
    const timerRef = useRef<HTMLDivElement>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Notifications state
    const [alerts, setAlerts] = useState<any[]>([]);
    const [showNotifications, setShowNotifications] = useState(false);
    const notificationsRef = useRef<HTMLDivElement>(null);

    // Initial load
    useEffect(() => {
        async function loadAlerts() {
            const data = await getAlerts();
            setAlerts(data);
        }
        loadAlerts();
    }, []);

    // Search debounce
    useEffect(() => {
        if (searchQuery.length < 2) {
            setSearchResults({ projects: [], tasks: [] });
            setShowSearch(false);
            return;
        }

        const timeout = setTimeout(async () => {
            const results = await searchItems(searchQuery);
            setSearchResults(results);
            setShowSearch(true);
        }, 300);

        return () => clearTimeout(timeout);
    }, [searchQuery]);

    // Click outside to close search
    useEffect(() => {
        function handleClick(e: MouseEvent) {
            if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
                setShowSearch(false);
            }
            if (timerRef.current && !timerRef.current.contains(e.target as Node)) {
                if (!isRunning) setShowTimerPanel(false);
            }
            if (notificationsRef.current && !notificationsRef.current.contains(e.target as Node)) {
                setShowNotifications(false);
            }
        }
        document.addEventListener('mousedown', handleClick);
        return () => document.removeEventListener('mousedown', handleClick);
    }, [isRunning]);

    // Timer interval
    useEffect(() => {
        if (isRunning) {
            intervalRef.current = setInterval(() => {
                setElapsed((prev) => prev + 1);
            }, 1000);
        } else if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning]);

    // Load tasks when timer panel opens
    const loadTasks = useCallback(async () => {
        const tasks = await getActiveTasks();
        setActiveTasks(tasks);
        if (tasks.length > 0 && !selectedTaskId) {
            setSelectedTaskId(tasks[0].id);
        }
    }, [selectedTaskId]);

    function formatTime(seconds: number) {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }

    async function handleStartTimer() {
        await loadTasks();
        setShowTimerPanel(true);
        setSaved(false);
        setElapsed(0);
    }

    function handleBeginTimer() {
        if (!selectedTaskId) return;
        setIsRunning(true);
    }

    function handlePauseTimer() {
        setIsRunning(false);
    }

    function handleResumeTimer() {
        setIsRunning(true);
    }

    function handleStopTimer() {
        setIsRunning(false);
    }

    async function handleSaveTime() {
        if (!selectedTaskId || elapsed < 1) return;
        setSaving(true);

        try {
            await saveTimeLog({
                taskId: selectedTaskId,
                timeSpentMinutes: Math.max(1, Math.round(elapsed / 60)),
                description: timerDescription || 'Timer session',
            });
            setSaved(true);
            setSaving(false);
            setTimeout(() => {
                setShowTimerPanel(false);
                setElapsed(0);
                setTimerDescription('');
                setSaved(false);
            }, 1500);
        } catch {
            setSaving(false);
        }
    }

    function handleMinimize() {
        setShowTimerPanel(false);
    }

    function handleDiscard() {
        if (elapsed > 0) {
            if (!window.confirm('Are you sure you want to discard this tracking session? All logged time will be lost.')) {
                return;
            }
        }
        setIsRunning(false);
        setShowTimerPanel(false);
        setElapsed(0);
        setTimerDescription('');
    }

    async function handleMarkAlertRead(id: string, e: React.MouseEvent) {
        e.stopPropagation();
        await markAlertRead(id);
        setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, readStatus: true } : a)));
    }

    const hasResults = searchResults.projects.length > 0 || searchResults.tasks.length > 0;
    const unreadAlertsCount = alerts.filter(a => !a.readStatus).length;

    return (
        <header className="header glass-panel">
            <div className="header-search" ref={searchRef}>
                <Search size={18} className="search-icon" />
                <input
                    type="text"
                    placeholder="Search tasks, projects..."
                    className="search-input"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onFocus={() => { if (searchQuery.length >= 2) setShowSearch(true); }}
                />

                {showSearch && (
                    <div className="search-dropdown">
                        {!hasResults ? (
                            <div className="search-empty">No results for "{searchQuery}"</div>
                        ) : (
                            <>
                                {searchResults.projects.length > 0 && (
                                    <div className="search-section">
                                        <div className="search-section-title">Projects</div>
                                        {searchResults.projects.map((p: any) => (
                                            <button
                                                key={p.id}
                                                className="search-result-item"
                                                onClick={() => {
                                                    router.push(`/projects/${p.id}`);
                                                    setShowSearch(false);
                                                    setSearchQuery('');
                                                }}
                                            >
                                                <FolderKanban size={14} />
                                                <div className="search-result-info">
                                                    <span className="search-result-name">{p.name}</span>
                                                    {p.clientName && <span className="search-result-meta">{p.clientName}</span>}
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}

                                {searchResults.tasks.length > 0 && (
                                    <div className="search-section">
                                        <div className="search-section-title">Tasks</div>
                                        {searchResults.tasks.map((t: any) => (
                                            <button
                                                key={t.id}
                                                className="search-result-item"
                                                onClick={() => {
                                                    router.push(`/projects/${t.project.id}`);
                                                    setShowSearch(false);
                                                    setSearchQuery('');
                                                }}
                                            >
                                                <CheckCircle2 size={14} />
                                                <div className="search-result-info">
                                                    <span className="search-result-name">{t.title}</span>
                                                    <span className="search-result-meta">{t.project.name}</span>
                                                </div>
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}
            </div>

            <div className="header-actions">
                {/* Timer */}
                <div className="timer-wrapper" ref={timerRef}>
                    {!isRunning && !showTimerPanel ? (
                        <button className="btn-primary timer-btn" onClick={handleStartTimer}>
                            <Play size={16} fill="currentColor" />
                            <span>Start Timer</span>
                        </button>
                    ) : (
                        <button
                            className={`btn-primary timer-btn timer-active ${isRunning ? 'running' : 'stopped'}`}
                            onClick={() => setShowTimerPanel(!showTimerPanel)}
                        >
                            <Clock size={16} />
                            <span className="timer-display">{formatTime(elapsed)}</span>
                        </button>
                    )}

                    {showTimerPanel && (
                        <div className="timer-panel card">
                            <div className="timer-panel-header">
                                <h3>{isRunning ? 'Timer Running' : elapsed > 0 ? 'Timer Paused' : 'Select a Task'}</h3>
                                <div style={{ display: 'flex', gap: '0.25rem' }}>
                                    <button className="icon-btn" onClick={handleMinimize} title="Minimize"><Minus size={16} /></button>
                                    <button className="icon-btn" onClick={handleDiscard} title="Discard Time"><X size={16} /></button>
                                </div>
                            </div>

                            <div className="timer-panel-time">{formatTime(elapsed)}</div>

                            <div className="timer-panel-body">
                                <div className="form-group">
                                    <label>Task</label>
                                    <select
                                        value={selectedTaskId}
                                        onChange={(e) => setSelectedTaskId(e.target.value)}
                                    >
                                        {activeTasks.map((t: any) => (
                                            <option key={t.id} value={t.id}>
                                                {t.title} — {t.project.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="form-group">
                                    <label>Description</label>
                                    <input
                                        type="text"
                                        placeholder="What did you work on?"
                                        value={timerDescription}
                                        onChange={(e) => setTimerDescription(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="timer-panel-footer">
                                {isRunning ? (
                                    <div className="timer-btn-row">
                                        <button className="btn-pause" onClick={handlePauseTimer}>
                                            <Pause size={14} fill="currentColor" />
                                            Pause
                                        </button>
                                        <button className="btn-stop" onClick={handleStopTimer}>
                                            <Square size={14} fill="currentColor" />
                                            Stop
                                        </button>
                                    </div>
                                ) : elapsed > 0 ? (
                                    <div className="timer-btn-row">
                                        <button className="btn-resume" onClick={handleResumeTimer}>
                                            <Play size={14} fill="currentColor" />
                                            Resume
                                        </button>
                                        <button
                                            className="btn-primary"
                                            onClick={handleSaveTime}
                                            disabled={saving || elapsed < 1}
                                        >
                                            {saved ? '✓ Saved!' : saving ? 'Saving...' : 'Save Time'}
                                        </button>
                                    </div>
                                ) : (
                                    <button className="btn-primary" style={{ width: '100%' }} onClick={handleBeginTimer} disabled={!selectedTaskId}>
                                        <Play size={14} fill="currentColor" />
                                        Start Tracking
                                    </button>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="notifications-wrapper" ref={notificationsRef}>
                    <button className="icon-btn" onClick={() => setShowNotifications(!showNotifications)}>
                        <Bell size={20} />
                        {unreadAlertsCount > 0 && <span className="notification-badge">{unreadAlertsCount}</span>}
                    </button>

                    {showNotifications && (
                        <div className="notifications-dropdown card">
                            <div className="notifications-header">
                                <h3>Notifications</h3>
                                {unreadAlertsCount > 0 && <span className="unread-count">{unreadAlertsCount} new</span>}
                            </div>
                            <div className="notifications-list">
                                {alerts.length === 0 ? (
                                    <div className="notifications-empty">No notifications yet.</div>
                                ) : (
                                    alerts.map((alert) => (
                                        <div key={alert.id} className={`notification-item ${alert.readStatus ? 'read' : 'unread'}`}>
                                            <div className="notification-icon">
                                                <AlertCircle size={16} className={alert.type === 'OVER_BUDGET' ? 'text-danger' : 'text-warning'} />
                                            </div>
                                            <div className="notification-content">
                                                <p>{alert.message}</p>
                                                <span className="notification-time">
                                                    {new Date(alert.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                            {!alert.readStatus && (
                                                <button
                                                    className="mark-read-btn"
                                                    onClick={(e) => handleMarkAlertRead(alert.id, e)}
                                                >
                                                    <CheckCircle2 size={14} />
                                                </button>
                                            )}
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    )}
                </div>

                <div className="user-profile">
                    <div className="avatar">
                        {user ? user.name.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'JD'}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{user ? user.name : 'Unknown'}</span>
                        <span className="user-role">{user ? user.role : 'Guest'}</span>
                    </div>
                    <form action={logoutAction}>
                        <button type="submit" className="icon-btn" title="Logout" style={{ marginLeft: '1rem' }}>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
                        </button>
                    </form>
                </div>
            </div>
        </header>
    );
}
