import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import {
    ShoppingBag, TrendingUp, Users, Package, AlertTriangle,
    CheckCircle, XCircle, Clock, DollarSign, ArrowUpRight,
} from 'lucide-react';
import { formatPrice, formatDateTime } from '@/lib/utils';
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

        const [todayOrders, pendingOrders, lowStockProducts, recentOrders, totalCustomers] = await Promise.all([
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
            recentOrders: [],
        };
    }
}

export default async function AdminDashboard() {
    const stats = await getDashboardStats();

    const statCards = [
        { title: "Today's Revenue", value: formatPrice(stats.todayRevenue), icon: DollarSign, color: 'text-green-400', bg: 'bg-green-500/10', trend: '↑' },
        { title: "Today's Orders", value: stats.todayOrderCount.toString(), icon: ShoppingBag, color: 'text-blue-400', bg: 'bg-blue-500/10', trend: '' },
        { title: 'Pending Orders', value: stats.pendingOrderCount.toString(), icon: Clock, color: 'text-yellow-400', bg: 'bg-yellow-500/10', trend: '' },
        { title: 'Low Stock Items', value: stats.lowStockCount.toString(), icon: AlertTriangle, color: 'text-red-400', bg: 'bg-red-500/10', trend: '' },
        { title: 'Total Customers', value: stats.totalCustomers.toString(), icon: Users, color: 'text-purple-400', bg: 'bg-purple-500/10', trend: '' },
        { title: 'Completed Today', value: stats.todayCompleted.toString(), icon: CheckCircle, color: 'text-emerald-400', bg: 'bg-emerald-500/10', trend: '' },
    ];

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-brand font-bold text-white">Dashboard</h1>
                <p className="text-gray-400 text-sm mt-1">Welcome back! Here&apos;s what&apos;s happening today.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
                {statCards.map((stat) => {
                    const Icon = stat.icon;
                    return (
                        <div key={stat.title} className="bg-gray-900 rounded-2xl p-4 border border-gray-800">
                            <div className="flex items-start justify-between mb-3">
                                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}>
                                    <Icon size={20} className={stat.color} />
                                </div>
                                {stat.trend && (
                                    <span className="text-green-400 text-xs font-semibold flex items-center gap-1">
                                        <ArrowUpRight size={12} /> +{stat.trend}
                                    </span>
                                )}
                            </div>
                            <div className="text-2xl font-brand font-bold text-white">{stat.value}</div>
                            <div className="text-gray-400 text-xs mt-1">{stat.title}</div>
                        </div>
                    );
                })}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {[
                    { label: 'Add Product', href: '/admin/products/new', color: 'bg-[#C41E3A]' },
                    { label: 'View Orders', href: '/admin/orders', color: 'bg-blue-600' },
                    { label: 'Add Category', href: '/admin/categories/new', color: 'bg-purple-600' },
                    { label: 'View Reports', href: '/admin/reports', color: 'bg-green-600' },
                ].map((action) => (
                    <Link
                        key={action.label}
                        href={action.href}
                        className={`${action.color} text-white font-semibold text-sm px-4 py-3 rounded-xl text-center hover:opacity-90 transition-opacity active:scale-95`}
                    >
                        {action.label}
                    </Link>
                ))}
            </div>

            {/* Recent Orders */}
            <div className="bg-gray-900 rounded-2xl border border-gray-800 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
                    <h2 className="text-white font-semibold text-sm">Recent Orders</h2>
                    <Link href="/admin/orders" className="text-[#C41E3A] text-xs font-semibold hover:underline">
                        View All
                    </Link>
                </div>

                {stats.recentOrders.length === 0 ? (
                    <div className="py-12 text-center text-gray-500">
                        <ShoppingBag size={32} className="mx-auto mb-2 opacity-30" />
                        <p className="text-sm">No orders yet</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-800">
                                    <th className="text-left text-gray-400 font-medium px-4 py-3">Order</th>
                                    <th className="text-left text-gray-400 font-medium px-4 py-3">Amount</th>
                                    <th className="text-left text-gray-400 font-medium px-4 py-3">Status</th>
                                    <th className="text-left text-gray-400 font-medium px-4 py-3">Date</th>
                                    <th className="text-right text-gray-400 font-medium px-4 py-3">Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentOrders.map((order: {
                                    id: string; order_number: string; total_amount: number;
                                    status: string; payment_status: string; created_at: string;
                                }) => (
                                    <tr key={order.id} className="border-b border-gray-800/50 hover:bg-gray-800/30 transition-colors">
                                        <td className="px-4 py-3">
                                            <span className="text-white font-semibold">#{order.order_number}</span>
                                        </td>
                                        <td className="px-4 py-3 text-white">{formatPrice(order.total_amount)}</td>
                                        <td className="px-4 py-3">
                                            <OrderStatusBadge status={order.status} />
                                        </td>
                                        <td className="px-4 py-3 text-gray-400 text-xs">{formatDateTime(order.created_at)}</td>
                                        <td className="px-4 py-3 text-right">
                                            <Link
                                                href={`/admin/orders/${order.id}`}
                                                className="text-[#C41E3A] text-xs font-semibold hover:underline"
                                            >
                                                View
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Alert: Low stock */}
            {stats.lowStockCount > 0 && (
                <div className="bg-red-950/50 border border-red-800 rounded-2xl p-4 flex items-center gap-3">
                    <AlertTriangle size={20} className="text-red-400 flex-shrink-0" />
                    <div>
                        <div className="text-red-300 font-semibold text-sm">Low Stock Alert</div>
                        <div className="text-red-400 text-xs">{stats.lowStockCount} product(s) are low on stock or out of stock.</div>
                    </div>
                    <Link href="/admin/inventory" className="ml-auto text-red-400 text-xs font-semibold hover:underline">
                        View →
                    </Link>
                </div>
            )}
        </div>
    );
}

function OrderStatusBadge({ status }: { status: string }) {
    const map: Record<string, { label: string; color: string }> = {
        pending: { label: 'Pending', color: 'bg-yellow-500/20 text-yellow-400' },
        confirmed: { label: 'Confirmed', color: 'bg-blue-500/20 text-blue-400' },
        preparing: { label: 'Preparing', color: 'bg-purple-500/20 text-purple-400' },
        out_for_delivery: { label: 'Out for Delivery', color: 'bg-cyan-500/20 text-cyan-400' },
        delivered: { label: 'Delivered', color: 'bg-green-500/20 text-green-400' },
        cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400' },
    };
    const info = map[status] ?? { label: status, color: 'bg-gray-500/20 text-gray-400' };
    return (
        <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${info.color}`}>
            {info.label}
        </span>
    );
}
