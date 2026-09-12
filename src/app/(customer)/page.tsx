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
                <section className="relative overflow-hidden rounded-[28px] bg-gradient-to-br from-emerald-900 via-emerald-700 to-orange-500 px-6 py-7 text-white shadow-[0_18px_40px_rgba(26,120,80,0.24)] sm:px-10 sm:py-10">
                    <div className="absolute -right-10 -top-16 h-56 w-56 rounded-full bg-orange-300/25 blur-2xl" />
                    <div className="absolute bottom-[-70px] right-24 h-44 w-44 rounded-full bg-emerald-300/20 blur-xl" />
                    <div className="relative max-w-xl">
                        <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.18em]">
                            <Sparkles size={14} className="text-orange-200" /> Your everyday shortcut
                        </div>
                        <h1 className="text-4xl font-black leading-[0.95] tracking-tight sm:text-6xl">
                            Good stuff.<br /><span className="text-orange-200">Right now.</span>
                        </h1>
                        <p className="mt-4 max-w-md text-sm leading-6 text-emerald-50 sm:text-base">
                            Snacks, self-care, home finds and little surprises — picked for your day and at your door in minutes.
                        </p>
                        <div className="mt-6 flex flex-wrap gap-3">
                            <Link href="/categories" className="inline-flex items-center gap-2 rounded-full bg-white px-5 py-3 text-sm font-black text-emerald-800 shadow-lg transition-transform hover:-translate-y-0.5">
                                Shop the drop <ArrowRight size={16} />
                            </Link>
                            <span className="inline-flex items-center gap-2 rounded-full border border-white/25 px-4 py-3 text-xs font-bold text-white/90">
                                <Clock3 size={15} /> 18 min delivery
                            </span>
                        </div>
                    </div>
                    <div className="absolute bottom-5 right-6 hidden rotate-[-8deg] rounded-3xl border border-white/20 bg-white/10 p-4 backdrop-blur sm:block">
                        <Truck size={64} strokeWidth={1.2} className="text-orange-100" />
                    </div>
                </section>

                <section className="mt-8">
                    <div className="mb-3 flex items-end justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Explore the aisle</p>
                            <h2 className="mt-1 text-2xl font-black text-slate-900">Shop by category</h2>
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

                <section className="mt-8">
                    <div className="mb-3 flex items-end justify-between">
                        <div>
                            <p className="text-xs font-black uppercase tracking-[0.18em] text-orange-500">Made for today</p>
                            <h2 className="mt-1 text-2xl font-black text-slate-900">Fresh picks for you</h2>
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
