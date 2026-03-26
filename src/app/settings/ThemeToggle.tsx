'use client';

import { useTheme } from 'next-themes';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const [mounted, setMounted] = useState(false);

    // Prevent hydration mismatch by wait for mount
    useEffect(() => setMounted(true), []);

    if (!mounted) {
        return <div className="theme-toggle-skeleton"></div>;
    }

    return (
        <div className="theme-toggle-group">
            <button 
                className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                onClick={() => setTheme('light')}
                title="Light Mode"
            >
                <Sun size={18} />
                <span>Light</span>
            </button>
            
            <button 
                className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                onClick={() => setTheme('dark')}
                title="Dark Mode"
            >
                <Moon size={18} />
                <span>Dark</span>
            </button>
            
            <button 
                className={`theme-btn ${theme === 'system' ? 'active' : ''}`}
                onClick={() => setTheme('system')}
                title="System Default"
            >
                <Monitor size={18} />
                <span>System</span>
            </button>
        </div>
    );
}
