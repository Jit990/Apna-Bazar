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
        <div className="bg-gray-50 min-h-screen">
            <div className="px-4 py-4">
                <nav className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                    <Link href="/" className="hover:text-primary">Home</Link>
                    <ChevronRight size={12} />
                    <span className="text-gray-900 font-medium">Categories</span>
                </nav>
                <h1 className="text-xl font-brand font-bold text-gray-900 mb-4">All Categories</h1>
                {categories.length === 0 ? (
                    <p className="text-center text-gray-400 py-12">No categories available right now.</p>
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
