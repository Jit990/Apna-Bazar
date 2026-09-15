import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import {
    ShoppingBag, Users, AlertTriangle,
    CheckCircle, Clock, DollarSign, ArrowUpRight,
    TrendingUp, Package,
} from 'lucide-react';
import { formatPrice, formatDateTime, getOrderStatusInfo } from '@/lib/utils';
import Link from 'next/link';

export const metadata: Metadata = {
    title: 'Dashboard',
};

async function getDashboardStats() {
    try {
        const supabase = await createClient();

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayStr = today.toISOString();

        const [todayOrders, pendingOrders, lowStockProducts, recentOrders, totalCustomers, totalProducts] = await Promise.all([
            supabase
                .from('orders')
                .select('total_amount, status')
                .gte('created_at', todayStr),
            supabase
                .from('orders')
                .select('id', { count: 'exact' })
                .in('status', ['pending', 'confirmed', 'preparing']),
            supabase
                .from('products')
                .select('id', { count: 'exact' })
                .eq('is_active', true)
                .in('stock_status', ['low_stock', 'out_of_stock']),
            supabase
                .from('orders')
                .select('id, order_number, total_amount, status, payment_status, created_at, user_id')
                .order('created_at', { ascending: false })
                .limit(10),
            supabase
                .from('profiles')
                .select('id', { count: 'exact' })
                .eq('role', 'customer'),
            supabase
                .from('products')
                .select('id', { count: 'exact' })
                .eq('is_active', true),
        ]);

        const todayRevenue = todayOrders.data?.reduce((sum, o) =>
            o.status !== 'cancelled' && o.status !== 'payment_failed' ? sum + (o.total_amount ?? 0) : sum, 0) ?? 0;

        return {
            todayRevenue,
            todayOrderCount: todayOrders.data?.length ?? 0,
            todayCompleted: todayOrders.data?.filter(o => o.status === 'delivered').length ?? 0,
            pendingOrderCount: pendingOrders.count ?? 0,
            lowStockCount: lowStockProducts.count ?? 0,
            totalCustomers: totalCustomers.count ?? 0,
            totalProducts: totalProducts.count ?? 0,
            recentOrders: recentOrders.data ?? [],
        };
    } catch {
        return {
            todayRevenue: 0,
            todayOrderCount: 0,
            todayCompleted: 0,
            pendingOrderCount: 0,
            lowStockCount: 0,
            totalCustomers: 0,
            totalProducts: 0,
            recentOrders: [],
        };
    }
}

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    const statCards = [
        { title: 'Today\'s Revenue', value: formatPrice(stats.todayRevenue), icon: DollarSign, tone: 'emerald', bg: 'from-emerald-500/20 to-emerald-600/5' },
        { title: 'Orders Today', value: stats.todayOrderCount.toString(), icon: ShoppingBag, tone: 'sky', bg: 'from-sky-500/20 to-sky-600/5' },
        { title: 'Needs Attention', value: stats.pendingOrderCount.toString(), icon: Clock, tone: 'amber', bg: 'from-amber-500/20 to-amber-600/5' },
        { title: 'Low Stock Items', value: stats.lowStockCount.toString(), icon: AlertTriangle, tone: 'rose', bg: 'from-rose-500/20 to-rose-600/5' },
        { title: 'Total Customers', value: stats.totalCustomers.toString(), icon: Users, tone: 'violet', bg: 'from-violet-500/20 to-violet-600/5' },
        { title: 'Delivered Today', value: stats.todayCompleted.toString(), icon: CheckCircle, tone: 'emerald', bg: 'from-emerald-500/20 to-emerald-600/5' },
    ];

    const toneClasses: Record<string, string> = {
        emerald: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/25',
        sky: 'text-sky-400 bg-sky-400/10 border-sky-400/25',
        amber: 'text-amber-400 bg-amber-400/10 border-amber-400/25',
        rose: 'text-rose-400 bg-rose-400/10 border-rose-400/25',
        violet: 'text-violet-400 bg-violet-400/10 border-violet-400/25',
    };

    return (
        <div className="space-y-7 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-white/10 pb-6">
                <div>
                    <p className="text-emerald-400 text-xs font-semibold uppercase tracking-[0.22em] mb-2">Operations Overview</p>
                    <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
                        Dashboard
                    </h1>
                    <p className="text-slate-400 text-sm mt-2">Here&apos;s what&apos;s happening across your store today.</p>
                </div>
                <div className="text-left sm:text-right">
                    <p className="text-slate-500 text-xs uppercase tracking-wider">Live Workspace</p>
                    <p className="text-emerald-400 text-sm font-semibold mt-1 flex items-center gap-2 sm:justify-end">
                        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" /> Synced just now
                    </p>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className={`relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br ${stat.bg} p-5 shadow-xl shadow-slate-950/10 transition-all hover:-translate-y-0.5 hover:border-emerald-400/30`}>
                            <div className="absolute -right-8 -top-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl border flex items-center justify-center ${toneClasses[stat.tone]}`}>
                                    <Icon size={18} />
                                </div>
                                <ArrowUpRight size={16} className="text-slate-500" />
                            </div>
                            <div className="text-2xl font-extrabold text-white">{stat.value}</div>
                            <div className="text-slate-400 text-sm mt-1">{stat.title}</div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                    { label: 'Add Product', href: '/admin/products/new', icon: Package, color: 'from-emerald-500 to-teal-600' },
                    { label: 'Review Orders', href: '/admin/orders', icon: ShoppingBag, color: 'from-sky-500 to-blue-600' },
                    { label: 'Add Category', href: '/admin/categories/new', icon: TrendingUp, color: 'from-violet-500 to-purple-600' },
                    { label: 'View Products', href: '/admin/products', icon: Package, color: 'from-amber-500 to-orange-600' },
                ].map((action) => {
                    const Icon = action.icon;
                    return (
                        <Link
                            key={action.label}
                            href={action.href}
                            className={`bg-gradient-to-r ${action.color} text-white font-semibold text-sm px-4 py-3.5 rounded-xl text-center shadow-lg shadow-slate-950/20 hover:brightness-110 transition active:scale-95 flex items-center justify-center gap-2`}
                        >
                            <Icon size={16} /> {action.label}
                        </Link>
                    );
                })}
            </div>

            {/* Recent Orders */}
            <div className="bg-white/[0.045] rounded-2xl border border-white/10 overflow-hidden shadow-xl shadow-slate-950/10">
                <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                    <div>
                        <h2 className="text-white font-semibold">Recent Orders</h2>
                        <p className="text-slate-500 text-xs mt-1">Latest activity from your store</p>
                    </div>
                    <Link href="/admin/orders" className="text-emerald-400 text-xs font-semibold hover:text-emerald-300 transition">
                        View All →
                    </Link>
                </div>

                {stats.recentOrders.length === 0 ? (
                    <div className="py-16 text-center">
                        <ShoppingBag size={40} className="mx-auto mb-3 text-slate-600" />
                        <p className="text-slate-500 text-sm">No orders yet</p>
                        <p className="text-slate-600 text-xs mt-1">Orders will appear here once customers start shopping</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-white/10">
                                    <th className="admin-table-heading text-left px-5 py-3">Order</th>
                                    <th className="admin-table-heading text-left px-5 py-3">Amount</th>
                                    <th className="admin-table-heading text-left px-5 py-3">Status</th>
                                    <th className="admin-table-heading text-left px-5 py-3">Date</th>
                                    <th className="admin-table-heading text-right px-5 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order: {
                                    id: string; order_number: string; total_amount: number;
                                    status: string; payment_status: string; created_at: string;
                                }) => {
                                    const statusInfo = getOrderStatusInfo(order.status);
                                    return (
                                        <tr key={order.id} className="admin-table-row">
                                            <td className="px-5 py-4">
                                                <span className="text-white font-semibold">#{order.order_number}</span>
                                            </td>
                                            <td className="px-5 py-4 text-white font-medium">{formatPrice(order.total_amount)}</td>
                                            <td className="px-5 py-4">
                                                <span className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${statusInfo.color.replace('text-', 'text-').replace('-700', '-400')} bg-white/5`}>
                                                    {statusInfo.label}
                                                </span>
                                            </td>
                                            <td className="px-5 py-4 text-slate-400 text-xs">{formatDateTime(order.created_at)}</td>
                                            <td className="px-5 py-4 text-right">
                                                <Link
                                                    href={`/admin/orders`}
                                                    className="text-emerald-400 text-xs font-semibold hover:text-emerald-300 hover:underline transition"
                                                >
                                                    View →
                                                </Link>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Alert: Low stock */}
            {stats.lowStockCount > 0 && (
                <div className="bg-rose-400/10 border border-rose-400/20 rounded-2xl p-4 flex items-center gap-3">
                    <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
                    <div className="flex-1">
                        <div className="text-rose-200 font-semibold text-sm">Low Stock Alert</div>
                        <div className="text-rose-300/80 text-xs">{stats.lowStockCount} product(s) need restocking.</div>
                    </div>
                    <Link href="/admin/products" className="text-rose-200 text-xs font-semibold hover:underline flex-shrink-0">
                        View Products →
                    </Link>
                </div>
            )}
        </div>
    );
}
