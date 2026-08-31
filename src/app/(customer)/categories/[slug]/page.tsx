import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, PackageSearch } from 'lucide-react';
import { ProductCard } from '@/components/product/ProductCard';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/types';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return { title: `${name} | Apna Bazar`, description: `Shop ${name} at Apna Bazar` };
}

export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;
    const categoryName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    const supabase = await createClient();

    // 1. Fetch category id
    const { data: categoryData } = await supabase
        .from('categories')
        .select('id, name')
        .eq('slug', slug)
        .single();

    let products: Product[] = [];

    if (categoryData && categoryData.id) {
        // 2. Fetch products by category_id
        const { data: productsData } = await supabase
            .from('products')
            .select('*, category:categories!products_category_id_fkey(id,name,slug), images:product_images(id,url,alt_text,display_order,is_primary), variants:product_variants(id,name,value,price_modifier,stock_quantity,is_active)')
            .eq('category_id', categoryData.id)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (productsData) {
            products = productsData as unknown as Product[];
        }
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="px-4 py-4 max-w-7xl mx-auto">
                <nav className="flex items-center gap-1 text-xs text-gray-500 mb-4 overflow-x-auto no-scrollbar">
                    <Link href="/" className="hover:text-[#1A7850] whitespace-nowrap">Home</Link>
                    <ChevronRight size={12} className="flex-shrink-0" />
                    <Link href="/categories" className="hover:text-[#1A7850] whitespace-nowrap">Categories</Link>
                    <ChevronRight size={12} className="flex-shrink-0" />
                    <span className="text-gray-900 font-medium truncate">{categoryData?.name || categoryName}</span>
                </nav>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <h1 className="text-2xl font-brand font-bold text-gray-900">{categoryData?.name || categoryName}</h1>
                    {products.length > 0 && (
                        <select className="text-sm border border-gray-200 rounded-xl px-4 py-2 bg-white text-gray-700 outline-none focus:ring-2 focus:ring-[#1A7850]">
                            <option value="relevance">Relevance</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="newest">Newest First</option>
                        </select>
                    )}
                </div>

                {products.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 py-20 px-6 flex flex-col items-center justify-center text-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                            <PackageSearch size={32} className="text-gray-400" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900 mb-2">No products available</h2>
                        <p className="text-gray-500 text-sm max-w-sm mb-6">We are currently restocking this category. Check back soon for amazing items!</p>
                        <Link href="/categories" className="btn-outline border-[#1A7850] text-[#1A7850] hover:bg-[#1A7850] hover:text-white">
                            Browse other categories
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
                        {products.map((p) => (
                            <ProductCard key={p.id} product={p} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
