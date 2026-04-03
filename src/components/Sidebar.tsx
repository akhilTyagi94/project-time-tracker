'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Clock, FolderKanban, Users, Settings, Share2, BarChart, X } from 'lucide-react';
import './Sidebar.css';

const navItems = [
    { href: '/', label: 'Dashboard', icon: LayoutDashboard, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'] },
    { href: '/time', label: 'Time Logs', icon: Clock, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'] },
    { href: '/projects', label: 'Projects', icon: FolderKanban, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'USER'] },
    { href: '/manager', label: 'Team', icon: Users, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    { href: '/reports', label: 'Reports', icon: BarChart, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
    { href: '/integrations', label: 'Integrations', icon: Share2, roles: ['SUPER_ADMIN', 'ADMIN', 'MANAGER'] },
];

export default function Sidebar({ 
    user, 
    isOpen, 
    onClose 
}: { 
    user: any;
    isOpen?: boolean;
    onClose?: () => void;
}) {
    const pathname = usePathname();

    const visibleItems = navItems.filter(item => item.roles.includes(user?.role || 'USER'));

    return (
        <aside className={`sidebar glass-panel ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-logo">
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1 }}>
                    <div className="logo-icon">O</div>
                    <h2>OneMetric</h2>
                </div>
                <button className="mobile-close-btn" onClick={onClose}>
                    <X size={20} />
                </button>
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
