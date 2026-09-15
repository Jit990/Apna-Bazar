import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

interface AdminProfile {
    role: string;
    full_name: string | null;
    is_active: boolean;
}

async function getAdminProfile(): Promise<AdminProfile | null> {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) return null;

        const { data: profile } = await supabase
            .from('profiles')
            .select('role, full_name, is_active')
            .eq('user_id', user.id)
            .single();

        if (!profile || !['admin', 'manager', 'staff'].includes(profile.role) || !profile.is_active) {
            return null;
        }

        return profile as AdminProfile;
    } catch {
        return null;
    }
}

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const profile = await getAdminProfile();

    if (!profile) {
        // Unauthenticated or non-admin — render children (login page via middleware redirect)
        return <>{children}</>;
    }

    return (
        <div className="admin-shell flex h-screen overflow-hidden selection:bg-emerald-200 selection:text-emerald-950">
            <div className="admin-shell-glow fixed inset-0 pointer-events-none z-0" />
            <AdminSidebar userRole={profile.role} userName={profile.full_name} />
            <main className="flex-1 overflow-auto ml-0 lg:ml-64 relative z-10 scrollbar-thin">
                <div className="admin-content p-4 sm:p-6 lg:p-8">
                    {children}
                </div>
            </main>
        </div>
    );
}
