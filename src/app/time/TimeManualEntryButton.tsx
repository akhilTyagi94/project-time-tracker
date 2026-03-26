'use client';

import { Play, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { getActiveTasks, saveTimeLog } from '@/lib/actions';

export default function TimeManualEntryButton() {
    const [showModal, setShowModal] = useState(false);
    const [tasks, setTasks] = useState<any[]>([]);
    const [selectedTaskId, setSelectedTaskId] = useState('');
    const [description, setDescription] = useState('');
    const [hours, setHours] = useState('');
    const [minutes, setMinutes] = useState('');
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (showModal) {
            getActiveTasks().then(res => {
                setTasks(res);
                if (res.length > 0) setSelectedTaskId(res[0].id);
            });
        }
    }, [showModal]);

    async function handleSave() {
        if (!selectedTaskId) return;
        const totalMinutes = (parseInt(hours || '0') * 60) + parseInt(minutes || '0');
        if (totalMinutes <= 0) return;

        setSaving(true);
        try {
            // Need to handle localized date from the input properly without timezone shift dropping a day
            const selectedDate = new Date(date + 'T12:00:00');
            await saveTimeLog({
                taskId: selectedTaskId,
                timeSpentMinutes: totalMinutes,
                description,
                date: selectedDate
            });
            setShowModal(false);
            setDescription('');
            setHours('');
            setMinutes('');
            setDate(new Date().toISOString().split('T')[0]);
        } finally {
            setSaving(false);
        }
    }

    return (
        <>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Play size={16} />
                <span>Manual Entry</span>
            </button>

            {showModal && typeof document !== 'undefined' && createPortal(
                <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) setShowModal(false) }}>
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>Add Manual Time</h2>
                            <button className="icon-btn" onClick={() => setShowModal(false)}>
                                <X size={20} />
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="form-group">
                                <label>Task</label>
                                <select value={selectedTaskId} onChange={e => setSelectedTaskId(e.target.value)}>
                                    {tasks.map(t => (
                                        <option key={t.id} value={t.id}>{t.title} — {t.project.name}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Date</label>
                                <input type="date" value={date} onChange={e => setDate(e.target.value)} max={new Date().toISOString().split('T')[0]} />
                            </div>
                            <div className="form-group" style={{ display: 'flex', gap: '1rem' }}>
                                <div style={{ flex: 1 }}>
                                    <label>Hours</label>
                                    <input type="number" min="0" placeholder="0" value={hours} onChange={e => setHours(e.target.value)} />
                                </div>
                                <div style={{ flex: 1 }}>
                                    <label>Minutes</label>
                                    <input type="number" min="0" max="59" placeholder="0" value={minutes} onChange={e => setMinutes(e.target.value)} />
                                </div>
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea placeholder="What did you work on?" value={description} onChange={e => setDescription(e.target.value)} rows={3} />
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                            <button className="btn-primary" onClick={handleSave} disabled={saving || (!hours && !minutes)}>
                                {saving ? 'Saving...' : 'Save Entry'}
                            </button>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </>
    );
}
