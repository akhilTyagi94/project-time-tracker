import { prisma } from '@/lib/prisma';
import ThemeToggle from '@/app/settings/ThemeToggle';
import './page.css';
import { updateProfile } from '@/app/settings/actions';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
    const user = await prisma.user.findUnique({
        where: { email: 'alice@onemetric.com' }
    });

    if (!user) {
        return <div className="p-8">User not found</div>;
    }

    return (
        <div className="settings-page">
            <div className="page-header">
                <h1 className="page-title">Settings</h1>
                <p className="page-subtitle">Manage your profile and application preferences.</p>
            </div>

            <div className="settings-grid">
                {/* Profile Section */}
                <section className="settings-section card">
                    <div className="section-header">
                        <h2>Profile Information</h2>
                        <p className="section-desc">Update your personal details below.</p>
                    </div>

                    <form action={async (formData) => { 'use server'; await updateProfile(formData); }} className="settings-form">
                        <div className="form-group">
                            <label htmlFor="name">Full Name</label>
                            <input 
                                type="text" 
                                id="name" 
                                name="name" 
                                defaultValue={user.name} 
                                required 
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="email">Email Address</label>
                            <input 
                                type="email" 
                                id="email" 
                                name="email" 
                                defaultValue={user.email} 
                                disabled 
                                className="disabled-input"
                            />
                            <span className="help-text">Email address cannot be changed.</span>
                        </div>

                        <div className="form-group">
                            <label htmlFor="role">Role</label>
                            <input 
                                type="text" 
                                id="role" 
                                name="role" 
                                defaultValue={user.role} 
                                disabled 
                                className="disabled-input"
                            />
                        </div>

                        <div className="form-actions">
                            <button type="submit" className="btn-primary">Save Profile</button>
                        </div>
                    </form>
                </section>

                {/* Preferences Section */}
                <section className="settings-section card">
                    <div className="section-header">
                        <h2>Appearance</h2>
                        <p className="section-desc">Customize how OneMetric looks on your device.</p>
                    </div>

                    <div className="preferences-content">
                        <div className="preference-item">
                            <div className="pref-info">
                                <h3>Theme</h3>
                                <p>Switch between light and dark mode.</p>
                            </div>
                            <ThemeToggle />
                        </div>
                    </div>
                </section>
            </div>
        </div>
    );
}
