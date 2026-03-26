'use client';

import { useState } from 'react';
import { updateTaskStatus } from '../actions';

interface TaskStatusSelectProps {
    taskId: string;
    projectId: string;
    initialStatus: string;
}

export default function TaskStatusSelect({ taskId, projectId, initialStatus }: TaskStatusSelectProps) {
    const [status, setStatus] = useState(initialStatus);
    const [loading, setLoading] = useState(false);

    async function handleChange(newStatus: string) {
        setLoading(true);
        setStatus(newStatus);
        
        const result = await updateTaskStatus(taskId, newStatus, projectId);
        
        if (result?.error) {
            alert(result.error);
            setStatus(status); // Revert on error
        }
        setLoading(false);
    }

    return (
        <select 
            className={`status-select-small ${status.toLowerCase()}`}
            value={status} 
            onChange={(e) => handleChange(e.target.value)}
            disabled={loading}
        >
            <option value="PENDING">Pending</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="COMPLETED">Completed</option>
        </select>
    );
}
