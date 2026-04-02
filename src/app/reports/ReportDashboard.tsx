'use client';

import { useState, useEffect } from 'react';
import { getReportData } from './actions';
import { PieChart, Pie, Cell, BarChart as RechartsBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Clock, TrendingUp, Users, CalendarDays, Activity } from 'lucide-react';
import './page.css';

export default function ReportDashboard() {
    const [timeRange, setTimeRange] = useState<'week' | 'month'>('week');
    const [viewMode, setViewMode] = useState<'user' | 'team'>('user');
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        setLoading(true);
        getReportData(timeRange, viewMode).then((res) => {
            if (isMounted) {
                setData(res);
                setLoading(false);
            }
        });
        return () => { isMounted = false; };
    }, [timeRange, viewMode]);

    const COLORS = ['#4ade80', '#f43f5e', '#3b82f6', '#facc15', '#a855f7'];

    const renderProgressBar = (value: number) => {
        const fillClass = value > 100 ? 'progress-danger' : value > 80 ? 'progress-good' : 'progress-warn';
        const width = Math.min(value, 150); // cap visual at 150%
        return (
            <div className="progress-bar-bg">
                <div 
                    className={`progress-bar-fill ${fillClass}`} 
                    style={{ width: `${width}%` }}
                />
            </div>
        );
    };

    return (
        <div className="reports-container">
            <div className="reports-header">
                <h1>Reports Dashboard</h1>
                <div className="reports-controls">
                    <div className="control-group">
                        <button 
                            className={`control-btn ${timeRange === 'week' ? 'active' : ''}`}
                            onClick={() => setTimeRange('week')}
                        >
                            <CalendarDays size={16} style={{display:'inline', marginRight: '4px', verticalAlign: 'text-bottom'}} />
                            Weekly
                        </button>
                        <button 
                            className={`control-btn ${timeRange === 'month' ? 'active' : ''}`}
                            onClick={() => setTimeRange('month')}
                        >
                            Monthly
                        </button>
                    </div>
                    <div className="control-group">
                        <button 
                            className={`control-btn ${viewMode === 'user' ? 'active' : ''}`}
                            onClick={() => setViewMode('user')}
                        >
                            <Users size={16} style={{display:'inline', marginRight: '4px', verticalAlign: 'text-bottom'}} />
                            Individual View
                        </button>
                        <button 
                            className={`control-btn ${viewMode === 'team' ? 'active' : ''}`}
                            onClick={() => setViewMode('team')}
                        >
                            Team-wise View
                        </button>
                    </div>
                </div>
            </div>

            {loading ? (
                <div style={{color: '#a0aec0', padding: '2rem 0'}}>Loading reports...</div>
            ) : (
                <>
                    <div className="overview-grid">
                        {/* Billable vs Non-Billable Chart */}
                        <div className="chart-card">
                            <h3><Activity size={20} /> Billable vs Non-Billable</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={data.overview.billableRatio}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {data.overview.billableRatio.map((entry: any, index: number) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: 'rgba(20,20,30,0.9)', border: '1px solid #333' }}
                                        formatter={(value) => [`${value} hrs`, 'Hours']}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                            <div style={{display:'flex', justifyContent:'center', gap:'1rem', marginTop: '1rem', fontSize:'0.85rem'}}>
                                {data.overview.billableRatio.map((entry: any, idx: number) => (
                                    <span key={entry.name} style={{color: '#a0aec0'}}>
                                        <div style={{display:'inline-block', width:'10px', height:'10px', backgroundColor: COLORS[idx], marginRight:'4px', borderRadius:'2px'}}></div>
                                        {entry.name}: {entry.value}h
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Top Tasks Chart */}
                        <div className="chart-card">
                            <h3><TrendingUp size={20} /> Top Time-Consuming Tasks</h3>
                            <ResponsiveContainer width="100%" height="100%">
                                <RechartsBarChart data={data.overview.topTasks} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                    <XAxis type="number" />
                                    <YAxis dataKey="name" type="category" width={100} tick={{fill: '#a0aec0', fontSize: 12}} />
                                    <Tooltip 
                                        cursor={{fill: 'rgba(255,255,255,0.05)'}}
                                        contentStyle={{ backgroundColor: 'rgba(20,20,30,0.9)', border: '1px solid #333' }}
                                    />
                                    <Bar dataKey="hours" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                                </RechartsBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="data-table-container">
                        <table className="reports-table">
                            <thead>
                                <tr>
                                    <th>{viewMode === 'user' ? 'Member Name' : 'Team / Manager'}</th>
                                    <th>Total Logged</th>
                                    <th>Billable Breakup</th>
                                    <th>Capacity Usage</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.records.map((record: any) => (
                                    <tr key={record.id}>
                                        <td style={{ fontWeight: 500 }}>{record.name}</td>
                                        <td>
                                            <div className="metric-cell">
                                                <span className="metric-value"><Clock size={14} style={{display:'inline', verticalAlign:'middle', marginRight:'4px'}}/>{record.totalHours} hrs</span>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="metric-cell">
                                                <span className="metric-value">{record.billablePercentage}% Billable</span>
                                                <span className="metric-sub">{record.billableHours}h / {record.nonBillableHours}h n/b</span>
                                                {renderProgressBar(record.billablePercentage)}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="metric-cell">
                                                <span className="metric-value">{record.capacityUsagePercentage}%</span>
                                                <span className="metric-sub">of available hours</span>
                                                {renderProgressBar(record.capacityUsagePercentage)}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {data.records.length === 0 && (
                                    <tr>
                                        <td colSpan={4} style={{ textAlign: 'center', padding: '2rem', color: '#a0aec0' }}>
                                            No time logs found for the selected period.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </>
            )}
        </div>
    );
}
