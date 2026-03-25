import Link from 'next/link';
import { LayoutDashboard, Clock, FolderKanban, Users, Settings } from 'lucide-react';
import './Sidebar.css';

export default function Sidebar() {
    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-logo">
                <div className="logo-icon">O</div>
                <h2>OneMetric</h2>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    <li>
                        <Link href="/" className="nav-item active">
                            <LayoutDashboard size={20} />
                            <span>Dashboard</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/time" className="nav-item">
                            <Clock size={20} />
                            <span>Time Logs</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/projects" className="nav-item">
                            <FolderKanban size={20} />
                            <span>Projects</span>
                        </Link>
                    </li>
                    <li>
                        <Link href="/manager" className="nav-item">
                            <Users size={20} />
                            <span>Team</span>
                        </Link>
                    </li>
                </ul>
            </nav>

            <div className="sidebar-footer">
                <button className="nav-item">
                    <Settings size={20} />
                    <span>Settings</span>
                </button>
            </div>
        </aside>
    );
}
