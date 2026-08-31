import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { AdminSidebar } from '@/components/admin/AdminSidebar';

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        redirect('/admin/login');
    }

    // Verify admin role
    const { data: profile } = await supabase
        .from('profiles')
        .select('role, full_name, is_active')
        .eq('user_id', user.id)
        .single();

    if (!profile || !['admin', 'manager', 'staff'].includes(profile.role) || !profile.is_active) {
        redirect('/admin/login?error=unauthorized');
    }

    return (
        <div className="flex h-screen bg-gray-950 overflow-hidden">
            <AdminSidebar userRole={profile.role} userName={profile.full_name} />
            <main className="flex-1 overflow-auto ml-0 lg:ml-64 bg-gray-950">
                <div className="p-6">
                    {children}
                </div>
            </main>
        </div>
    );
}
