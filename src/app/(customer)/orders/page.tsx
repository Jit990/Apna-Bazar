'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Package, Clock, CheckCircle2, Truck, XCircle, ShoppingBag, Loader2, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatPrice, formatDateTime } from '@/lib/utils';
import type { Order } from '@/types';

export default function OrdersPage() {
    const router = useRouter();
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const supabase = createClient();
        let channel: ReturnType<typeof supabase.channel>;

        const fetchOrders = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (!session) {
                router.replace('/account');
                return;
            }

            const { data, error } = await supabase
                .from('orders')
                .select('*, items:order_items(*, product:products(*))')
                .eq('user_id', session.user.id)
                .order('created_at', { ascending: false });

            if (!error && data) {
                setOrders(data);
            }
            setLoading(false);

            // Subscribe to realtime updates for this user's orders
            channel = supabase
                .channel('realtime_orders')
                .on(
                    'postgres_changes',
                    { event: 'UPDATE', schema: 'public', table: 'orders', filter: `user_id=eq.${session.user.id}` },
                    (payload) => {
                        console.log('Realtime Order Update: ', payload);
                        setOrders(current =>
                            current.map(order =>
                                order.id === payload.new.id ? { ...order, ...payload.new } : order
                            )
                        );
                    }
                )
                .subscribe();
        };

        fetchOrders();

        return () => {
            if (channel) {
                supabase.removeChannel(channel);
            }
        };
    }, [router]);

    const getStatusInfo = (status: string) => {
        const map: Record<string, { label: string, color: string, bg: string, icon: any, desc: string }> = {
            pending: { label: 'Order Placed', color: 'text-yellow-600', bg: 'bg-yellow-50', icon: Clock, desc: 'Waiting for confirmation' },
            confirmed: { label: 'Confirmed', color: 'text-blue-600', bg: 'bg-blue-50', icon: CheckCircle2, desc: 'Store is processing your order' },
            preparing: { label: 'Preparing', color: 'text-purple-600', bg: 'bg-purple-50', icon: Package, desc: 'Packing your items' },
            out_for_delivery: { label: 'Out for Delivery', color: 'text-cyan-600', bg: 'bg-cyan-50', icon: Truck, desc: 'Agent is on the way' },
            delivered: { label: 'Delivered', color: 'text-emerald-600', bg: 'bg-emerald-50', icon: CheckCircle2, desc: 'Order delivered successfully' },
            cancelled: { label: 'Cancelled', color: 'text-red-600', bg: 'bg-red-50', icon: XCircle, desc: 'Order was cancelled' },
        };
        return map[status] || { label: status, color: 'text-gray-600', bg: 'bg-gray-100', icon: Package, desc: '' };
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
                <Loader2 size={32} className="animate-spin text-[#1A7850]" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-24">
            <div className="bg-white border-b border-gray-100 shadow-sm px-4 py-4 safe-top sticky top-0 z-30 flex items-center gap-3">
                <button onClick={() => router.back()} className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={24} className="text-gray-900" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">My Orders</h1>

                {/* Realtime Badge indicator */}
                <span className="ml-auto flex h-3 w-3 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
                </span>
            </div>

            <div className="p-4">
                {orders.length === 0 ? (
                    <div className="empty-state bg-white rounded-2xl shadow-sm border border-gray-100 mt-4 py-20 px-6">
                        <ShoppingBag size={48} className="text-gray-300 mb-4" />
                        <h2 className="text-lg font-bold text-gray-900 mb-2">No Orders Found</h2>
                        <p className="text-gray-500 text-sm mb-6 max-w-[250px] mx-auto text-center">Looks like you haven&apos;t placed any orders yet.</p>
                        <button
                            onClick={() => router.push('/categories')}
                            className="bg-[#1A7850] text-white px-6 py-3 rounded-xl font-bold active:scale-95 transition-transform"
                        >
                            Start Shopping
                        </button>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => {
                            const status = getStatusInfo(order.status);
                            const StatusIcon = status.icon;

                            // Get first 3 items safely
                            const items = (order as any).items || [];
                            const previewItems = items.slice(0, 3);
                            const moreCount = items.length - 3;

                            return (
                                <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden cursor-pointer active:scale-[0.98] transition-transform animate-fade-in" onClick={() => router.push(`/orders/${order.id}`)}>

                                    <div className={`px-4 py-3 border-b border-gray-100 flex items-center justify-between ${status.bg}`}>
                                        <div className="flex items-center gap-2">
                                            <StatusIcon size={20} className={status.color} />
                                            <div>
                                                <div className={`text-sm font-bold ${status.color}`}>{status.label}</div>
                                                <div className={`text-[10px] uppercase font-bold opacity-70 ${status.color}`}>Realtime Sync</div>
                                            </div>
                                        </div>
                                        <ChevronRight size={20} className={status.color} />
                                    </div>

                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-4">
                                            <div>
                                                <div className="text-xs text-gray-500 font-medium">Order #{order.order_number}</div>
                                                <div className="text-xs text-gray-400 mt-0.5">{formatDateTime(order.created_at)}</div>
                                            </div>
                                            <div className="text-right">
                                                <div className="font-bold text-gray-900">{formatPrice(order.total_amount)}</div>
                                                <div className="text-[10px] text-gray-500 font-bold uppercase">{order.payment_method}</div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap items-center gap-2 mt-2">
                                            {previewItems.map((item: any, idx: number) => (
                                                <div key={idx} className="bg-gray-50 border border-gray-100 px-2 py-1 rounded text-[11px] font-medium text-gray-700 flex items-center gap-1 max-w-[150px] truncate">
                                                    <span className="text-[#1A7850] font-bold">{item.quantity}x</span>
                                                    {item.product?.name || 'Item'}
                                                </div>
                                            ))}
                                            {moreCount > 0 && (
                                                <div className="bg-gray-50 border border-gray-100 px-2 py-1 rounded text-[11px] font-bold text-gray-500">
                                                    +{moreCount} more
                                                </div>
                                            )}
                                        </div>

                                        <div className="mt-4 pt-3 border-t border-gray-50 text-xs text-gray-500 flex items-center justify-between">
                                            <span><span className="font-semibold text-gray-700">{items.length}</span> items</span>
                                            <span>Deliver to: <span className="font-semibold text-gray-700">{order.address_snapshot?.house_flat?.substring(0, 15)}...</span></span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
