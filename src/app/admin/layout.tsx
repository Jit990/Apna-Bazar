import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    // Check if we're on the login page — if so, just render children without auth/sidebar
    const headersList = await headers();
    const pathname = headersList.get('x-next-pathname') || headersList.get('x-invoke-path') || '';

    // For /admin/login — render without sidebar/auth
    // Next.js doesn't always provide the pathname in headers, so we check via URL referer or
    // just make the layout resilient to unauthenticated users when they hit login
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            // If no user, just render children (login page will be shown by middleware redirect)
            return <>{children}</>;
        }

        // Verify admin role
        const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name, is_active')
            .eq('user_id', user.id)
            .single();

        if (!profile || !['admin', 'manager', 'staff'].includes(profile.role) || !profile.is_active) {
            // Non-admin user — just render children (login page or unauthorized)
            return <>{children}</>;
        }

        return (
            <div className="flex h-screen bg-[#050505] overflow-hidden text-[#00f5ff] selection:bg-[#39ff14] selection:text-black font-mono">
                <div className="fixed inset-0 pointer-events-none z-0" style={{ background: 'radial-gradient(circle at center, rgba(0,245,255,0.03) 0%, transparent 70%)' }}></div>
                <AdminSidebar userRole={profile.role} userName={profile.full_name} />
                <main className="flex-1 overflow-auto ml-0 lg:ml-64 relative z-10 scrollbar-thin scrollbar-thumb-[#00f5ff]/20">
                    <div className="p-6">
                        {children}
                    </div>
                </main>
            </div>
        );
    } catch {
        // Auth error — render children as-is (login page)
        return <>{children}</>;
    }
}

