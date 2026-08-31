import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { ProductCardSkeleton } from '@/components/product/ProductCard';

interface Props {
    params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const { slug } = await params;
    const name = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
    return { title: name, description: `Shop ${name} at Apna Bazar` };
}

export default async function CategoryPage({ params }: Props) {
    const { slug } = await params;
    const categoryName = slug.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="px-4 py-4">
                <nav className="flex items-center gap-1 text-xs text-gray-500 mb-4">
                    <Link href="/" className="hover:text-[#C41E3A]">Home</Link>
                    <ChevronRight size={12} />
                    <Link href="/categories" className="hover:text-[#C41E3A]">Categories</Link>
                    <ChevronRight size={12} />
                    <span className="text-gray-900 font-medium">{categoryName}</span>
                </nav>

                <div className="flex items-center justify-between mb-4">
                    <h1 className="text-xl font-brand font-bold text-gray-900">{categoryName}</h1>
                    <select className="text-sm border border-gray-200 rounded-xl px-3 py-1.5 bg-white text-gray-700">
                        <option value="relevance">Relevance</option>
                        <option value="price_asc">Price: Low to High</option>
                        <option value="price_desc">Price: High to Low</option>
                        <option value="newest">Newest First</option>
                        <option value="popular">Most Popular</option>
                    </select>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <ProductCardSkeleton key={i} />
                    ))}
                </div>
                <p className="text-center text-sm text-gray-500 mt-8 py-4">
                    🔌 Connect Supabase to load products for &quot;{categoryName}&quot;
                </p>
            </div>
        </div>
    );
}
