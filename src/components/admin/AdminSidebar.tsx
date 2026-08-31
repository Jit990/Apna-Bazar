'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, ShoppingBag, Package, Grid3X3,
    Users, Tag, Image, Truck, CreditCard, BarChart3,
    Bell, Settings, LogOut, Menu, X, Box,
    Shield,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

const navItems = [
    { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
    { label: 'Orders', href: '/admin/orders', icon: ShoppingBag },
    { label: 'Products', href: '/admin/products', icon: Package },
    { label: 'Categories', href: '/admin/categories', icon: Grid3X3 },
    { label: 'Inventory', href: '/admin/inventory', icon: Box },
    { label: 'Customers', href: '/admin/customers', icon: Users },
    { label: 'Coupons', href: '/admin/coupons', icon: Tag },
    { label: 'Banners', href: '/admin/banners', icon: Image },
    { label: 'Delivery', href: '/admin/delivery', icon: Truck },
    { label: 'Payments', href: '/admin/payments', icon: CreditCard },
    { label: 'Reports', href: '/admin/reports', icon: BarChart3 },
    { label: 'Notifications', href: '/admin/notifications', icon: Bell },
    { label: 'Settings', href: '/admin/settings', icon: Settings },
];

interface AdminSidebarProps {
    userRole?: string;
    userName?: string | null;
}

export function AdminSidebar({ userRole = 'admin', userName }: AdminSidebarProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loggingOut, setLoggingOut] = useState(false);

    const handleLogout = async () => {
        setLoggingOut(true);
        try {
            const supabase = createClient();
            await supabase.auth.signOut();
            router.push('/admin/login');
        } catch {
            toast.error('Failed to logout');
        } finally {
            setLoggingOut(false);
        }
    };

    const renderSidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-gray-800">
                <div className="w-9 h-9 rounded-xl bg-[#C41E3A] flex items-center justify-center flex-shrink-0">
                    <span className="text-white font-black text-sm font-brand">AB</span>
                </div>
                <div>
                    <div className="text-white font-brand font-black text-base leading-none">Apna Bazar</div>
                    <div className="text-gray-500 text-[10px] font-medium capitalize">{userRole} Panel</div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-3 overflow-y-auto scrollbar-thin">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn('admin-sidebar-link', isActive && 'active')}
                            onClick={() => setMobileOpen(false)}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="border-t border-gray-800 p-3">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-gray-800 mb-2">
                    <div className="w-8 h-8 rounded-full bg-[#C41E3A] flex items-center justify-center flex-shrink-0">
                        <Shield size={14} className="text-white" />
                    </div>
                    <div className="min-w-0">
                        <div className="text-white text-sm font-semibold truncate">{userName ?? 'Admin'}</div>
                        <div className="text-gray-400 text-[10px] capitalize">{userRole}</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="admin-sidebar-link w-full hover:bg-red-900/50 hover:text-red-400 disabled:opacity-50"
                >
                    <LogOut size={18} />
                    <span>{loggingOut ? 'Logging out...' : 'Logout'}</span>
                </button>
            </div>
        </div>
    );

    return (
        <>
            {/* Desktop sidebar */}
            <aside className="admin-sidebar hidden lg:flex flex-col border-r border-gray-800">
                {renderSidebarContent()}
            </aside>

            {/* Mobile hamburger */}
            <button
                className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-gray-900 rounded-xl text-white border border-gray-700"
                onClick={() => setMobileOpen(!mobileOpen)}
                aria-label="Toggle admin menu"
            >
                {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Mobile overlay */}
            {mobileOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 lg:hidden"
                    onClick={() => setMobileOpen(false)}
                />
            )}

            {/* Mobile drawer */}
            <aside
                className={cn(
                    'fixed top-0 left-0 h-full w-64 z-50 bg-gray-900 border-r border-gray-800 flex flex-col transform transition-transform duration-300 lg:hidden',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {renderSidebarContent()}
            </aside>
        </>
    );
}
