'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Clock, FolderKanban, Users, Settings } from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/time', label: 'Time Logs', icon: Clock },
    { href: '/projects', label: 'Projects', icon: FolderKanban },
    { href: '/manager', label: 'Team', icon: Users },
];

export default function Sidebar() {
    const pathname = usePathname();

    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-logo">
                <div className="logo-icon">O</div>
                <h2>OneMetric</h2>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {navItems.map(({ href, label, icon: Icon }) => {
                        const isActive = href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(href);

                        return (
                            <li key={href}>
                                <Link href={href} className={`nav-item ${isActive ? 'active' : ''}`}>
                                    <Icon size={20} />
                                    <span>{label}</span>
                                </Link>
                            </li>
                        );
                    })}
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
