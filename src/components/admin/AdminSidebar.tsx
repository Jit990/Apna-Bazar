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
        <div className="admin-sidebar-inner flex flex-col h-full">
            {/* Logo */}
            <div className="admin-brand flex items-center gap-3 px-5 py-5">
                <div className="admin-brand-mark w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 z-10">
                    <span className="text-white font-black text-sm tracking-widest">AB</span>
                </div>
                <div className="z-10">
                    <div className="text-white font-black text-lg leading-none tracking-tight">Apna Bazar</div>
                    <div className="text-emerald-300 text-[10px] font-semibold uppercase tracking-[0.18em] mt-1">{userRole} workspace</div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-5 overflow-y-auto scrollbar-thin px-3 space-y-1">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = item.href === '/admin'
                        ? pathname === '/admin'
                        : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'admin-nav-link flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-200 relative overflow-hidden group',
                                isActive
                                    ? 'admin-nav-link-active'
                                    : 'text-slate-400 border border-transparent'
                            )}
                            onClick={() => setMobileOpen(false)}
                        >
                            <Icon size={17} className={cn("transition-transform group-hover:scale-110", isActive && "text-emerald-300")} />
                            <span className="font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="admin-sidebar-footer p-3">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/[0.04] border border-white/10 mb-2 relative overflow-hidden cursor-pointer hover:border-emerald-400/40 transition-colors">
                    <div className="w-8 h-8 rounded-lg bg-emerald-400/10 border border-emerald-400/30 flex items-center justify-center flex-shrink-0">
                        <Shield size={14} className="text-emerald-300" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-white text-xs font-semibold truncate">{userName ?? 'Admin'}</div>
                        <div className="text-slate-400 text-[9px] uppercase tracking-widest">{userRole}</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm text-rose-300 border border-rose-400/20 hover:bg-rose-400/10 hover:border-rose-400/50 transition-all disabled:opacity-50 uppercase items-center justify-center"
                >
                    <LogOut size={16} />
                    <span>{loggingOut ? 'Terminating...' : 'Logout Process'}</span>
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
                className="fixed top-4 left-4 z-50 lg:hidden p-2 bg-slate-900 rounded-xl text-white border border-white/10 shadow-lg"
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
                    'admin-sidebar fixed top-0 left-0 h-full w-64 z-50 flex flex-col transform transition-transform duration-300 lg:hidden',
                    mobileOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {renderSidebarContent()}
            </aside>
        </>
    );
}
