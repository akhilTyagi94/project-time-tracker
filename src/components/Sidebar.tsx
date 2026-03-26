'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Clock, FolderKanban, Users, Settings } from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'] },
    { href: '/time', label: 'Time Logs', icon: Clock, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'] },
    { href: '/projects', label: 'Projects', icon: FolderKanban, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'] },
    { href: '/manager', label: 'Team', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
];

export default function Sidebar({ user }: { user: any }) {
    const pathname = usePathname();

    const visibleItems = navItems.filter(item => item.roles.includes(user?.role || 'USER'));

    return (
        <aside className="sidebar glass-panel">
            <div className="sidebar-logo">
                <div className="logo-icon">O</div>
                <h2>OneMetric</h2>
            </div>

            <nav className="sidebar-nav">
                <ul>
                    {visibleItems.map(({ href, label, icon: Icon }) => {
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
                <Link href="/settings" className={`nav-item ${pathname === '/settings' ? 'active' : ''}`}>
                    <Settings size={20} />
                    <span>Settings</span>
                </Link>
            </div>
        </aside>
    );
}
