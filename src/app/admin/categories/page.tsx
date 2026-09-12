import { Folders, Plus, Pencil, Trash } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { DeleteCategoryButton } from './DeleteCategoryButton';

export default async function AdminCategoriesPage() {
    const supabase = await createClient();

    const { data: categories } = await supabase
        .from('categories')
        .select('*')
        .order('display_order', { ascending: true })
        .order('created_at', { ascending: false });

    return (
        <div className="space-y-7">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black text-white flex items-center gap-3">
                        <span className="admin-icon-badge"><Folders size={19} /></span> Categories
                    </h1>
                    <p className="text-gray-400 text-sm mt-1">Manage product categories and navigation.</p>
                </div>
                <Link href="/admin/categories/new" className="bg-violet-500 hover:bg-violet-400 text-white px-4 py-2.5 flex items-center gap-2 shadow-lg shadow-violet-950/20 text-sm rounded-xl font-semibold transition-colors">
                    <Plus size={16} /> Add Category
                </Link>
            </div>

            <div className="admin-panel">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                        <thead>
                            <tr>
                                <th className="admin-table-heading text-left px-5 py-4">Image</th>
                                <th className="admin-table-heading text-left px-5 py-4">Category Name</th>
                                <th className="admin-table-heading text-left px-5 py-4">Slug</th>
                                <th className="admin-table-heading text-left px-5 py-4">Status</th>
                                <th className="admin-table-heading text-right px-5 py-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                            {categories?.map((c) => (
                                <tr key={c.id} className="admin-table-row">
                                    <td className="px-5 py-4">
                                        {c.image_url ? (
                                            <img src={c.image_url} alt={c.name} className="w-10 h-10 rounded-lg object-cover bg-gray-800" />
                                        ) : (
                                            <div className="w-10 h-10 rounded-lg bg-gray-800 flex items-center justify-center text-gray-600">
                                                <Folders size={16} />
                                            </div>
                                        )}
                                    </td>
                                    <td className="px-5 py-4">
                                        <span className="font-semibold text-white">{c.name}</span>
                                    </td>
                                    <td className="px-5 py-4 text-gray-400">{c.slug}</td>
                                    <td className="px-5 py-4">
                                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${c.is_active ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-gray-800 text-gray-400'
                                            }`}>
                                            {c.is_active ? 'Active' : 'Hidden'}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right text-xs">
                                        <div className="flex items-center justify-end gap-3">
                                            <Link href={`/admin/categories/${c.id}`} className="text-blue-400 font-semibold hover:underline flex items-center gap-1">
                                                <Pencil size={14} /> Edit
                                            </Link>
                                            <DeleteCategoryButton id={c.id} name={c.name} />
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!categories?.length && (
                                <tr>
                                    <td colSpan={5} className="px-5 py-8 text-center text-gray-500">
                                        No categories found. Add some to build your catalog.
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
