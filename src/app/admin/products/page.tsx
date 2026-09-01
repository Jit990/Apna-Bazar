import { Package, Plus } from 'lucide-react';
import Link from 'next/link';
import { DeleteProductButton } from './DeleteProductButton';

import { createClient } from '@/lib/supabase/server';
import { formatPrice } from '@/lib/utils';

export default async function AdminProductsPage() {
    const supabase = await createClient();

    const { data: products } = await supabase
        .from('products')
        .select('*, category:categories(name)')
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-brand font-bold text-white flex items-center gap-2">
                        <Package size={24} className="text-[#C41E3A]" /> Products
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Manage your catalog, stock, and pricing.</p>
                </div>
                <Link href="/admin/products/new" className="btn-primary px-4 py-2 flex items-center gap-2 shadow-lg shadow-red-900/20 text-sm rounded-xl font-semibold">
                    <Plus size={16} /> Add Product
                </Link>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead className="text-xs uppercase bg-gray-800/50 text-gray-400 border-b border-gray-800">
                            <tr>
                                <th className="px-5 py-4 font-semibold">Product</th>
                                <th className="px-5 py-4 font-semibold">Category</th>
                                <th className="px-5 py-4 font-semibold">Price</th>
                                <th className="px-5 py-4 font-semibold">Stock</th>
                                <th className="px-5 py-4 font-semibold">Status</th>
                                <th className="px-5 py-4 text-right font-semibold">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {products?.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-800/20 transition-colors">
                                    <td className="px-5 py-4 flex flex-col">
                                        <span className="font-semibold text-white">{p.name}</span>
                                        <span className="text-[10px] text-gray-500">{p.sku}</span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="bg-gray-800 text-gray-300 px-2.5 py-1 rounded-md text-xs border border-gray-700">
                                            {p.category?.name ?? 'Unknown'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-white font-medium">{formatPrice(p.price)}</td>
                                    <td className="px-5 py-4">
                                        <span className={`font-semibold ${p.stock_quantity <= p.low_stock_threshold ? 'text-red-400' : 'text-emerald-400'}`}>
                                            {p.stock_quantity}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${p.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400'
                                            }`}>
                                            {p.is_active ? 'Active' : 'Draft'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right text-xs">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/admin/products/${p.id}`} className="text-blue-400 font-semibold hover:underline flex items-center gap-1">
                                                Edit
                                            </Link>
                                            <DeleteProductButton id={p.id} name={p.name} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!products?.length && (
                                <tr>
                                    <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                                        No products found. Add some to get started!
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
