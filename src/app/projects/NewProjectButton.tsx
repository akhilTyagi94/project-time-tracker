'use client';

import { useState } from 'react';
import { Plus } from 'lucide-react';
import NewProjectModal from './NewProjectModal';

export default function NewProjectButton() {
    const [showModal, setShowModal] = useState(false);

    return (
        <>
            <button className="btn-primary" onClick={() => setShowModal(true)}>
                <Plus size={18} />
                <span>New Project</span>
            </button>
            {showModal && <NewProjectModal onClose={() => setShowModal(false)} />}
        </>
    );
}
