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
        <div className="space-y-7">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <span className="admin-icon-badge"><Package size={19} /></span> Products
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Manage your catalog, stock, and pricing.</p>
                </div>
                <Link href="/admin/products/new" className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 px-4 py-2.5 flex items-center gap-2 shadow-lg shadow-emerald-950/20 text-sm rounded-xl font-semibold transition-colors">
                    <Plus size={16} /> Add Product
                </Link>
            </div>

            <div className="admin-panel">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead>
                            <tr>
                                <th className="admin-table-heading text-left px-5 py-4">Product</th>
                                <th className="admin-table-heading text-left px-5 py-4">Category</th>
                                <th className="admin-table-heading text-left px-5 py-4">Price</th>
                                <th className="admin-table-heading text-left px-5 py-4">Stock</th>
                                <th className="admin-table-heading text-left px-5 py-4">Status</th>
                                <th className="admin-table-heading text-right px-5 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {products?.map((p) => (
                                <tr key={p.id} className="admin-table-row">
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
