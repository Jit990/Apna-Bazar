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
        <div className="flex flex-col h-full bg-[#0a0a0c] border-r border-[#00f5ff]/20 shadow-[0_0_20px_rgba(0,245,255,0.1)]">
            {/* Logo */}
            <div className="flex items-center gap-3 px-4 py-5 border-b border-[#00f5ff]/20 relative overflow-hidden">
                <div className="absolute inset-0 bg-[#00f5ff]/5 opacity-50 animate-pulse"></div>
                <div className="w-10 h-10 rounded shadow-[0_0_15px_#39ff14] bg-black border border-[#39ff14] flex items-center justify-center flex-shrink-0 z-10">
                    <span className="text-[#39ff14] font-black text-sm tracking-widest font-mono">SYS</span>
                </div>
                <div className="z-10">
                    <div className="text-[#00f5ff] font-mono font-black text-lg leading-none tracking-widest uppercase drop-shadow-[0_0_5px_rgba(0,245,255,0.8)]">Root</div>
                    <div className="text-[#39ff14] text-[10px] font-mono capitalize tracking-widest">{userRole} Access_</div>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 overflow-y-auto scrollbar-thin px-2 space-y-1">
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
                                'flex items-center gap-3 px-3 py-2.5 rounded text-sm font-mono transition-all duration-300 relative overflow-hidden group',
                                isActive
                                    ? 'bg-[#00f5ff]/10 text-[#00f5ff] border border-[#00f5ff]/50 shadow-[inset_4px_0_0_#00f5ff]'
                                    : 'text-gray-400 hover:bg-[#39ff14]/5 hover:text-[#39ff14] border border-transparent'
                            )}
                            onClick={() => setMobileOpen(false)}
                        >
                            {isActive && <div className="absolute left-0 top-0 bottom-0 w-[1px] bg-[#00f5ff] shadow-[0_0_10px_#00f5ff]"></div>}
                            <Icon size={16} className={cn("transition-transform group-hover:scale-110", isActive && "drop-shadow-[0_0_8px_#00f5ff]")} />
                            <span className="tracking-widest">{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* User + Logout */}
            <div className="border-t border-[#00f5ff]/20 p-3 bg-[#0a0a0c]">
                <div className="flex items-center gap-3 px-3 py-2.5 rounded bg-black border border-[#39ff14]/30 shadow-[inset_0_0_10px_rgba(57,255,20,0.1)] mb-2 relative overflow-hidden cursor-pointer hover:border-[#39ff14]/80 transition-colors">
                    <div className="w-8 h-8 rounded bg-black border border-[#00f5ff] flex items-center justify-center flex-shrink-0">
                        <Shield size={14} className="text-[#00f5ff]" />
                    </div>
                    <div className="min-w-0 flex-1">
                        <div className="text-[#39ff14] text-xs font-mono truncate tracking-wider">{userName ?? 'Admin'}</div>
                        <div className="text-[#00f5ff] text-[9px] font-mono uppercase tracking-widest opacity-80">{userRole}_</div>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded text-sm font-mono text-[#ff003c] border border-[#ff003c]/30 hover:bg-[#ff003c]/10 hover:border-[#ff003c]/80 hover:shadow-[0_0_15px_rgba(255,0,60,0.3)] transition-all disabled:opacity-50 tracking-widest uppercase items-center justify-center"
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
