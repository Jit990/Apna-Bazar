import type { Metadata } from 'next';
import Link from 'next/link';
import {
    ShieldCheck, RefreshCw, Clock,
    ChevronRight, Truck,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryCard } from '@/components/product/CategoryCard';
import type { Product, Category } from '@/types';

export const metadata: Metadata = {
    title: 'Apna Bazar – Sab Kuch, Apne Paas | Bajkul',
    description:
        'Apna Bazar – your trusted local shop in Bajkul, West Bengal. Shop jewelry, cosmetics, beauty, gifts, stationery, toys & more. Fast local delivery, Cash on Delivery available.',
};

const USP_ITEMS = [
    { icon: Clock, text: 'Fast Local Delivery', sub: 'Quick to your doorstep' },
    { icon: ShieldCheck, text: '100% Original Products', sub: 'Best Quality Guaranteed' },
    { icon: ShieldCheck, text: 'Secure Payments', sub: 'Safe & Hassle Free' },
    { icon: RefreshCw, text: 'Easy Returns', sub: 'No Questions Asked' },
];

async function getData() {
    try {
        const supabase = await createClient();

        const [categoriesRes, featuredRes, bestsellersRes, newArrivalsRes] = await Promise.all([
            supabase
                .from('categories')
                .select('id, name, slug, image_url, is_active, parent_id, display_order, description, created_at, updated_at')
                .eq('is_active', true)
                .is('parent_id', null)
                .order('display_order', { ascending: true })
                .limit(14),
            supabase
                .from('products')
                .select('*, category:categories!products_category_id_fkey(id,name,slug), images:product_images(id,url,alt_text,display_order,is_primary), variants:product_variants(id,name,value,price_modifier,stock_quantity,is_active)')
                .eq('is_active', true)
                .order('created_at', { ascending: false })
                .limit(8),
            supabase
                .from('products')
                .select('*, category:categories!products_category_id_fkey(id,name,slug), images:product_images(id,url,alt_text,display_order,is_primary), variants:product_variants(id,name,value,price_modifier,stock_quantity,is_active)')
                .eq('is_active', true)
                .order('price', { ascending: false })
                .limit(8),
            supabase
                .from('products')
                .select('*, category:categories!products_category_id_fkey(id,name,slug), images:product_images(id,url,alt_text,display_order,is_primary), variants:product_variants(id,name,value,price_modifier,stock_quantity,is_active)')
                .eq('is_active', true)
                .order('mrp', { ascending: true })
                .limit(8),
        ]);

        return {
            categories: (categoriesRes.data as Category[]) ?? [],
            featuredProducts: (featuredRes.data as unknown as Product[]) ?? [],
            bestsellers: (bestsellersRes.data as unknown as Product[]) ?? [],
            newArrivals: (newArrivalsRes.data as unknown as Product[]) ?? [],
        };
    } catch {
        return { categories: [], featuredProducts: [], bestsellers: [], newArrivals: [] };
    }
}

function ProductSection({
    title, products, href,
}: {
    title: string;
    products: Product[];
    href: string;
}) {
    if (products.length === 0) return null;
    return (
        <section className="bg-white py-6 mt-2 border-t border-gray-100 max-w-[1280px] mx-auto">
            <div className="px-4 lg:px-6 flex items-center justify-between mb-4">
                <h2 className="text-lg lg:text-2xl font-black text-gray-900">{title}</h2>
                <Link href={href} className="text-primary text-xs lg:text-sm font-bold uppercase tracking-wider flex items-center gap-1 group">
                    See All <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>
            {/* Horizontal Scroll / Grid */}
            <div className="pl-4 lg:pl-6 pr-1 pb-4 flex overflow-x-auto gap-3 lg:gap-5 no-scrollbar snap-x">
                {products.map((p) => (
                    <div key={p.id} className="w-[140px] md:w-[180px] lg:w-[220px] flex-shrink-0 snap-start">
                        <ProductCard product={p} className="h-full border border-gray-100 shadow-sm transition-shadow hover:shadow-md bg-white rounded-2xl" />
                    </div>
                ))}
            </div>
        </section>
    );
}

export default async function HomePage() {
    const { categories, featuredProducts, bestsellers, newArrivals } = await getData();

    return (
        <div className="bg-gray-50 min-h-screen pb-24 lg:pb-0">
            {/* ── MOBILE Hero Search / Location Bar (Hidden on LG) ── */}
            <div className="lg:hidden bg-primary px-4 py-3 sticky top-0 z-30 shadow-sm safe-top">
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                        <span className="text-primary font-black font-brand text-sm">AB</span>
                    </div>
                    <div className="flex-1 text-white overflow-hidden">
                        <div className="text-[10px] text-emerald-200 uppercase font-bold tracking-wider mb-0.5">Delivering to</div>
                        <div className="font-semibold text-sm truncate">Bajkul, Pin-721655</div>
                    </div>
                </div>
                {/* Search Bar */}
                <Link href="/search" className="bg-white rounded-xl py-2.5 px-3 flex items-center gap-2 text-gray-400 text-sm shadow-inner transition-opacity active:opacity-80">
                    <span className="opacity-70">🔍</span> Search products, groceries, household...
                </Link>
            </div>

            <div className="desktop-container relative">
                {/* ── Delivery Info Banner ── */}
                <section className="bg-white px-4 py-3 border-b flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-emerald-50 flex flex-shrink-0 items-center justify-center">
                        <Truck size={20} className="text-primary" />
                    </div>
                    <div className="flex-1">
                        <div className="font-bold text-gray-900 text-sm">Fast Local Delivery</div>
                        <div className="text-gray-500 text-xs text-balance">Get your orders delivered across Bajkul fast. Free above ₹499.</div>
                    </div>
                </section>

                {/* ── Categories ── */}
                <section className="bg-white pt-5 pb-4 mt-2 max-w-[1280px] mx-auto border-t border-gray-100">
                    <div className="px-4 lg:px-6 mb-4">
                        <h2 className="text-lg lg:text-2xl font-black text-gray-900">Shop by Category</h2>
                    </div>
                    {categories.length === 0 ? (
                        <p className="text-center text-sm text-gray-400 py-6">No categories available.</p>
                    ) : (
                        <div className="grid grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-y-6 gap-x-2 lg:gap-x-4 px-3 lg:px-6">
                            {categories.slice(0, 16).map((cat) => (
                                <CategoryCard key={cat.id} category={cat} />
                            ))}
                        </div>
                    )}
                </section>

                {/* ── Bestsellers ── */}
                <ProductSection title="Best Sellers" products={bestsellers} href="/products?bestseller=true" />

                {/* ── Promotional Banner ── */}
                <section className="px-4 py-4 mt-2">
                    <div className="rounded-2xl overflow-hidden bg-gray-900 p-5 text-white relative flex flex-col justify-center items-start shadow-xl border border-gray-800 h-32">
                        <div className="relative z-10 w-full flex justify-between items-center">
                            <div>
                                <div className="text-emerald-400 text-[10px] font-bold uppercase tracking-widest mb-1">Premium Collection</div>
                                <div className="font-bold text-lg mb-1 leading-tight">Elevate Your<br />Beauty Routine</div>
                            </div>
                            <Link href="/categories/makeup" className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-gray-900 hover:bg-emerald-50 transition-all active:scale-95 shadow-md flex-shrink-0">
                                <ChevronRight size={20} />
                            </Link>
                        </div>
                    </div>
                </section>

                {/* ── Featured Products ── */}
                <ProductSection title="Featured Products" products={featuredProducts} href="/products?featured=true" />

                {/* ── New Arrivals ── */}
                <ProductSection title="New Arrivals" products={newArrivals} href="/products?new=true" />

                {/* ── Why Apna Bazar ── */}
                <section className="bg-white py-6 mt-4">
                    <div className="px-4">
                        <h2 className="text-lg font-bold text-gray-900 text-center mb-5">Why Choose Us?</h2>
                        <div className="grid grid-cols-2 gap-4">
                            {USP_ITEMS.map((item) => {
                                const Icon = item.icon;
                                return (
                                    <div key={item.text} className="flex flex-col items-center text-center p-3 rounded-2xl bg-gray-50 border border-gray-100">
                                        <div className="w-10 h-10 rounded-full bg-emerald-50 text-primary flex items-center justify-center flex-shrink-0 mb-2">
                                            <Icon size={20} />
                                        </div>
                                        <div className="font-bold text-gray-900 text-xs mb-1">{item.text}</div>
                                        <div className="text-gray-500 text-[10px] leading-tight text-balance">{item.sub}</div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </section>

                {/* ── Footer ── */}
                <footer className="bg-gray-50 text-gray-400 px-4 py-8 pb-16 text-center text-xs mt-4">
                    <div className="font-brand font-black text-xl text-gray-300 mb-2 tracking-tight">Apna Bazar</div>
                    <p className="mb-4 text-balance px-8 uppercase tracking-widest text-[10px]">Sab Kuch, Apne Paas</p>
                    <div className="flex justify-center gap-4 text-emerald-700 font-semibold mb-4 text-[11px] uppercase tracking-wider">
                        <Link href="/about">About Us</Link>
                        <Link href="/terms">Terms</Link>
                        <Link href="/privacy">Privacy</Link>
                    </div>
                    <div>© {new Date().getFullYear()} Apna Bazar.</div>
                </footer>
            </div>
        </div>
    );
}
