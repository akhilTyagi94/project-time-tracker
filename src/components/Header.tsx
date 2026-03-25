import { Play, Bell, Search } from 'lucide-react';
import './Header.css';

export default function Header() {
    return (
        <header className="header glass-panel">
            <div className="header-search">
                <Search size={18} className="search-icon" />
                <input type="text" placeholder="Search tasks, projects..." className="search-input" />
            </div>

            <div className="header-actions">
                {/* Global 1-Click Timer Button */}
                <button className="btn-primary timer-btn animate-pulse">
                    <Play size={16} fill="currentColor" />
                    <span>Start Timer</span>
                </button>

                <button className="icon-btn">
                    <Bell size={20} />
                    <span className="notification-badge">3</span>
                </button>

                <div className="user-profile">
                    <div className="avatar">JD</div>
                    <div className="user-info">
                        <span className="user-name">John Doe</span>
                        <span className="user-role">Project Manager</span>
                    </div>
                </div>
            </div>
        </header>
    );
}
