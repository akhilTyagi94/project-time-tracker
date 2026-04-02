import ReportDashboard from './ReportDashboard';
import { redirect } from 'next/navigation';

// We could add server-side auth checks here
export default async function ReportsPage() {
    // In a real app we would verify the user role here
    // e.g. const session = await getSession();
    // if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER'].includes(session.user.role)) return redirect('/');
    
    return <ReportDashboard />;
}
