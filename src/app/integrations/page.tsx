import { ArrowRightLeft, CheckCircle2, CloudLightning } from 'lucide-react';
import './page.css';
import { getSessionUser } from '@/lib/auth';
import { redirect } from 'next/navigation';

export default async function IntegrationsPage() {
    const session = await getSessionUser();
    
    // Only SUPER_ADMIN, ADMIN, and MANAGER can access this page
    if (!session || session.role === 'USER') {
        redirect('/');
    }

    return (
        <div className="integrations-page animate-slide-in">
            <header className="page-header">
                <div>
                    <h1 className="page-title">Integrations</h1>
                    <p className="page-subtitle">Manage connections between OneMetric and your external tools.</p>
                </div>
            </header>

            <div className="integration-cards">
                <div className="integration-card card active">
                    <div className="integration-header">
                        <div className="integration-logo hubspot">HS</div>
                        <div className="integration-title">
                            <h3>HubSpot CRM</h3>
                            <span className="status-connected">
                                <CheckCircle2 size={12} /> Connected
                            </span>
                        </div>
                    </div>
                    <div className="integration-body">
                        <p className="description">
                            Automatically sync "Closed Won" deals as new Projects and import Quoted Hours directly from line items.
                        </p>

                        <div className="sync-simulator">
                            <h4>Sync Simulator (MVP)</h4>
                            <p className="muted-text">Manually trigger the sync process to pull the latest deals.</p>

                            <div className="simulator-actions">
                                <button className="btn-primary w-full">
                                    <CloudLightning size={16} />
                                    <span>Fetch New Deals</span>
                                </button>
                            </div>

                            <div className="recent-syncs">
                                <div className="sync-item">
                                    <span className="sync-time">Today, 09:41 AM</span>
                                    <span className="sync-result success">1 Project Created</span>
                                </div>
                                <div className="sync-item">
                                    <span className="sync-time">Yesterday, 14:20 PM</span>
                                    <span className="sync-result neutral">No new deals found</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="integration-card card inactive">
                    <div className="integration-header">
                        <div className="integration-logo slack">Sl</div>
                        <div className="integration-title">
                            <h3>Slack</h3>
                            <span className="status-disconnected">Not Connected</span>
                        </div>
                    </div>
                    <div className="integration-body">
                        <p className="description">
                            Get direct alerts for over-budget projects and automated daily summaries of your team's logged time.
                        </p>
                        <button className="btn-secondary w-full mt-4">Connect to Slack</button>
                    </div>
                </div>

                <div className="integration-card card inactive">
                    <div className="integration-header">
                        <div className="integration-logo clickup">CU</div>
                        <div className="integration-title">
                            <h3>ClickUp Migration</h3>
                            <span className="status-disconnected">Not Connected</span>
                        </div>
                    </div>
                    <div className="integration-body">
                        <p className="description">
                            One-time import tool to migrate historical projects, tasks, and time logs from ClickUp.
                        </p>
                        <button className="btn-secondary w-full mt-4">Start Migration</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
