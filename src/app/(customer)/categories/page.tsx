import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { CategoryCard } from '@/components/product/CategoryCard';
import { createClient } from '@/lib/supabase/server';
import type { Category } from '@/types';

export const metadata: Metadata = { title: 'All Categories – Apna Bazar' };

export default async function CategoriesPage() {
    let categories: Category[] = [];
    try {
        const supabase = await createClient();
        const { data } = await supabase
            .from('categories')
            .select('id, name, slug, image_url, is_active, parent_id, display_order, description, created_at, updated_at')
            .eq('is_active', true)
            .is('parent_id', null)
            .order('display_order', { ascending: true });
        categories = (data as Category[]) ?? [];
    } catch {
        categories = [];
    }

    return (
        <div className="customer-shell min-h-screen pb-20">
            <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
                <nav className="mb-5 flex items-center gap-1 text-xs text-slate-500">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <ChevronRight size={12} />
                    <span className="text-gray-900 font-medium">Categories</span>
                </nav>
                <div className="mb-6 rounded-[24px] bg-gradient-to-r from-emerald-900 to-emerald-700 px-5 py-6 text-white shadow-[0_14px_30px_rgba(26,120,80,0.18)]">
                    <p className="text-[11px] font-black uppercase tracking-[0.2em] text-orange-200">Find your next favorite</p>
                    <h1 className="mt-1 text-3xl font-black">Shop every aisle</h1>
                    <p className="mt-1 text-sm text-emerald-100">Fresh essentials and fun finds, organized for faster shopping.</p>
                </div>
                {categories.length === 0 ? (
                    <div className="rounded-2xl bg-white p-12 text-center text-slate-400 shadow-sm">No categories available right now.</div>
                ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-2">
                        {categories.map((cat) => (
                            <CategoryCard key={cat.id} category={cat} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
