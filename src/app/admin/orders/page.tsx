import { ShoppingBag } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatPrice, formatDateTime } from '@/lib/utils';
import Link from 'next/link';

export default async function AdminOrdersPage() {
    const supabase = await createClient();

    const { data: orders } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-brand font-bold text-white flex items-center gap-2">
                        <ShoppingBag size={24} className="text-[#C41E3A]" /> Orders
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">View and manage customer orders.</p>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-xs uppercase bg-gray-800/50 text-gray-400 border-b border-gray-800">
                            <tr>
                                <th className="px-5 py-4 font-semibold">Order ID</th>
                                <th className="px-5 py-4 font-semibold">Date</th>
                                <th className="px-5 py-4 font-semibold">Total</th>
                                <th className="px-5 py-4 font-semibold">Verification</th>
                                <th className="px-5 py-4 font-semibold">Fulfillment</th>
                                <th className="px-5 py-4 text-right font-semibold">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {orders?.map((o) => (
                                <tr key={o.id} className="hover:bg-gray-800/20 transition-colors">
                                    <td className="px-5 py-4 text-white font-bold max-w-[120px] truncate">
                                        #{o.order_number}
                                    </td>
                                    <td className="px-5 py-4 text-xs text-gray-400 whitespace-nowrap">
                                        {formatDateTime(o.created_at)}
                                    </td>
                                    <td className="px-5 py-4">
                                        <div className="text-white font-medium">{formatPrice(o.total_amount)}</div>
                                        <div className="text-[10px] text-gray-500 font-bold uppercase">{o.payment_method}</div>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${o.payment_status === 'paid' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                                : o.payment_status === 'failed' ? 'bg-red-500/10 text-red-400 border border-red-500/20'
                                                    : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'
                                            }`}>
                                            {o.payment_status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${o.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400'
                                                : o.status === 'cancelled' ? 'bg-gray-800 text-gray-500'
                                                    : 'bg-blue-500/10 text-blue-400'
                                            }`}>
                                            {o.status.replace(/_/g, ' ')}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right text-xs">
                                        <button className="text-[#C41E3A] font-semibold hover:underline">Manage</button>
                                    </td>
                                </tr>
                            ))}
                            {!orders?.length && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-12 text-center text-gray-500">
                                        <ShoppingBag size={48} className="mx-auto mb-3 opacity-20" />
                                        No orders have been placed yet.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
