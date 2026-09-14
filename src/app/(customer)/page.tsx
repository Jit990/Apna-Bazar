import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Clock3, Grid3X3, Sparkles, Truck } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryCard } from '@/components/product/CategoryCard';
import type { Product, Category } from '@/types';

export const metadata: Metadata = {
    title: 'Fresh picks, delivered fast | Apna Bazar',
    description: 'Everyday essentials and delightful finds delivered in minutes.',
};

async function getData() {
    try {
        const supabase = await createClient();
        const [categoriesRes, bestsellersRes] = await Promise.all([
            supabase.from('categories').select('id, name, slug, image_url, is_active, display_order')
                .eq('is_active', true).is('parent_id', null).order('display_order', { ascending: true }).limit(12),
            supabase.from('products')
                .select('*, category:categories!products_category_id_fkey(id,name,slug), images:product_images(id,url,alt_text,display_order,is_primary), variants:product_variants(id,name,value,price_modifier,stock_quantity,is_active)')
                .eq('is_active', true).order('created_at', { ascending: false }).limit(12),
        ]);
        return {
            categories: (categoriesRes.data as Category[]) ?? [],
            bestsellers: (bestsellersRes.data as unknown as Product[]) ?? [],
        };
    } catch {
        return { categories: [], bestsellers: [] };
    }
}

export default async function HomePage() {
    const { categories, bestsellers } = await getData();

    return (
        <div className="min-h-screen pb-20">
            <main className="mx-auto max-w-7xl px-4 py-5 sm:px-6 lg:px-8">
                <section className="quick-banner relative overflow-hidden rounded-2xl px-5 py-5 text-white shadow-[0_14px_30px_rgba(26,120,80,0.18)] sm:px-8 sm:py-7">
                    <div className="absolute -right-8 -top-14 h-48 w-48 rounded-full bg-orange-300/25 blur-2xl" />
                    <div className="relative max-w-xl">
                        <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em]">
                            <Sparkles size={12} className="text-orange-200" /> Fresh deals, delivered fast
                        </div>
                        <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
                            Groceries at your door<br /><span className="text-orange-200">in 18 minutes.</span>
                        </h1>
                        <p className="mt-2 max-w-md text-xs leading-5 text-emerald-50 sm:text-sm">
                            Daily essentials, snacks, personal care and more — picked for your day.
                        </p>
                        <div className="mt-4 flex flex-wrap gap-2">
                            <Link href="/categories" className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-black text-emerald-800 shadow-lg">
                                Shop now <ArrowRight size={14} />
                            </Link>
                            <span className="inline-flex items-center gap-2 rounded-xl border border-white/25 px-3 py-2.5 text-[11px] font-bold text-white/90">
                                <Clock3 size={14} /> Live delivery
                            </span>
                        </div>
                    </div>
                    <div className="absolute bottom-4 right-8 hidden rounded-2xl border border-white/20 bg-white/10 p-4 backdrop-blur sm:block">
                        <Truck size={52} strokeWidth={1.2} className="text-orange-100" />
                    </div>
                </section>

                <section className="mt-7">
                    <div className="mb-3 flex items-end justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Quick browse</p>
                            <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">Shop essentials</h2>
                        </div>
                        <Link href="/categories" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">See all <ChevronRight size={15} /></Link>
                    </div>
                    {categories.length > 0 ? (
                        <div className="grid grid-cols-4 gap-2 sm:grid-cols-6 lg:grid-cols-8">
                            {categories.slice(0, 8).map((category) => <CategoryCard key={category.id} category={category} />)}
                        </div>
                    ) : (
                        <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-400">Categories are loading fresh picks.</div>
                    )}
                </section>

                <section className="mt-7">
                    <div className="mb-3 flex items-end justify-between">
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-orange-500">Picked for you</p>
                            <h2 className="mt-1 text-xl font-black text-slate-900 sm:text-2xl">Fresh picks</h2>
                        </div>
                        <Link href="/categories" className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700">Browse all <ChevronRight size={15} /></Link>
                    </div>
                    {bestsellers.length > 0 ? (
                        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6">
                            {bestsellers.slice(0, 6).map((product) => <ProductCard key={product.id} product={product} />)}
                        </div>
                    ) : (
                        <div className="rounded-2xl border border-dashed border-emerald-200 bg-emerald-50/60 p-10 text-center text-sm text-emerald-700">Fresh picks are arriving soon.</div>
                    )}
                </section>

                <section className="mt-8 grid gap-3 sm:grid-cols-3">
                    {[
                        ['Free delivery', 'On your first order', 'bg-orange-100 text-orange-900'],
                        ['Always fresh', 'Quality checked daily', 'bg-emerald-100 text-emerald-900'],
                        ['Easy returns', 'Zero-hassle support', 'bg-sky-100 text-sky-900'],
                    ].map(([title, subtitle, styles]) => (
                        <div key={title} className={`rounded-2xl p-4 ${styles}`}>
                            <p className="text-sm font-black">{title}</p>
                            <p className="mt-1 text-xs opacity-75">{subtitle}</p>
                        </div>
                    ))}
                </section>
            </main>
        </div>
    );
}
