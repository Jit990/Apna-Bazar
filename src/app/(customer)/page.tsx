import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Grid3X3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product, Category } from '@/types';
import Image from 'next/image';

export const metadata: Metadata = {
    title: 'Apna Bazar – Delivery in 18 minutes',
    description: 'Fast local delivery for grocery, electronics, beauty, and more.',
};

async function getData() {
    try {
        const supabase = await createClient();

        const [categoriesRes, bestsellersRes, newArrivalsRes] = await Promise.all([
            supabase
                .from('categories')
                .select('id, name, slug, image_url, is_active, display_order')
                .eq('is_active', true)
                .is('parent_id', null)
                .order('display_order', { ascending: true })
                .limit(20),
            supabase
                .from('products')
                .select('*, category:categories!products_category_id_fkey(id,name,slug), images:product_images(id,url,alt_text,display_order,is_primary), variants:product_variants(id,name,value,price_modifier,stock_quantity,is_active)')
                .eq('is_active', true)
                .order('created_at', { ascending: false }) // Fallback to new logic or similar for mock bestsellers
                .limit(12),
            supabase
                .from('products')
                .select('*, category:categories!products_category_id_fkey(id,name,slug), images:product_images(id,url,alt_text,display_order,is_primary), variants:product_variants(id,name,value,price_modifier,stock_quantity,is_active)')
                .eq('is_active', true)
                .order('price', { ascending: true })
                .limit(12),
        ]);

        return {
            categories: (categoriesRes.data as Category[]) ?? [],
            bestsellers: (bestsellersRes.data as unknown as Product[]) ?? [],
            deals: (newArrivalsRes.data as unknown as Product[]) ?? [],
        };
    } catch {
        return { categories: [], bestsellers: [], deals: [] };
    }
}

export default async function HomePage() {
    const { categories, bestsellers, deals } = await getData();

    return (
        <div className="bg-white min-h-screen pb-20">
            {/* Horizontal Category Tab Ribbon */}
            <div className="sticky top-[138px] lg:top-20 z-30 bg-white border-b border-gray-100 shadow-[0_4px_10px_rgba(0,0,0,0.02)] pt-1 pb-2">
                <div className="flex overflow-x-auto no-scrollbar gap-5 px-4 snap-x">
                    <Link href="/categories" className="flex flex-col items-center gap-1 min-w-[56px] snap-start group pb-1">
                        <div className="w-11 h-11 bg-gray-100 rounded-xl flex items-center justify-center p-2 group-active:scale-95 transition-transform">
                            <Grid3X3 className="text-gray-800" size={24} />
                        </div>
                        <span className="text-[10px] font-bold text-gray-800 leading-tight">All</span>
                        <div className="h-0.5 w-[80%] bg-[#1A7850] rounded-full mx-auto absolute -bottom-1"></div>
                    </Link>
                    {categories.slice(0, 10).map((cat) => (
                        <Link href={`/categories/${cat.slug}`} key={cat.id} className="flex flex-col items-center gap-1 min-w-[56px] snap-start relative group pb-1">
                            <div className="w-11 h-11 bg-gray-50 rounded-xl flex items-center justify-center p-1.5 border border-gray-100 group-active:scale-95 transition-transform relative overflow-hidden">
                                {cat.image_url ? (
                                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-contain" />
                                ) : (
                                    <span className="text-[10px] font-bold text-gray-400 capitalize">{cat.name.substring(0, 2)}</span>
                                )}
                            </div>
                            <span className="text-[10px] font-medium text-gray-600 leading-tight truncate w-14 text-center">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <div className="lg:max-w-5xl lg:mx-auto">
                {/* Promo/Festival Banner Grid */}
                <div className="px-4 mt-6">
                    <div className="flex justify-between items-center mb-3">
                        <h2 className="font-brand font-bold text-2xl text-[#1A7850] italic tracking-tight relative">
                            CELEBRATE <br />
                            <span className="text-3xl font-black not-italic text-emerald-800">Janmashtami</span>
                        </h2>
                        {/* Decorative generic image for festival vibes */}
                        <div className="w-20 h-20 opacity-80 rounded-full bg-gradient-to-tr from-yellow-200 to-green-100 mix-blend-multiply flex items-center justify-center">
                            ✨
                        </div>
                    </div>
                    {/* Masonry-Style Promo Box Layout */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 rounded-2xl bg-[#E8F5E9] p-2 aspect-[4/5] flex flex-col items-center justify-between overflow-hidden shadow-sm border border-emerald-50 relative group cursor-pointer">
                            <div className="text-center mt-2 z-10">
                                <h3 className="font-bold text-[#145F3E] text-xs px-2 leading-tight">Poshak, Idol<br />& More</h3>
                                <div className="mt-2 bg-yellow-400 text-yellow-900 font-bold px-1.5 py-0.5 rounded text-[10px] inline-block shadow-sm">₹349</div>
                            </div>
                            <div className="w-full h-16 bg-white/50 backdrop-blur-md absolute bottom-0"></div>
                        </div>
                        <div className="col-span-1 grid grid-rows-2 gap-2 max-h-48">
                            <div className="rounded-xl bg-orange-50 p-2 flex flex-col items-center border border-orange-100 shadow-sm cursor-pointer justify-center overflow-hidden relative">
                                <h3 className="font-bold text-orange-800 text-[11px] leading-tight text-center z-10 bg-white/70 w-full mb-1">Prasad<br />Corner</h3>
                                <div className="flex-1 w-full flex items-end justify-center">🛍️</div>
                            </div>
                            <div className="rounded-xl bg-emerald-50 p-2 border border-emerald-100 shadow-sm cursor-pointer flex flex-col items-center justify-center relative overflow-hidden">
                                <h3 className="font-bold text-emerald-800 text-[11px] leading-tight text-center z-10 bg-white/70 w-full mb-1">Fasting & <br /> Handi</h3>
                                <div className="flex-1 w-full flex items-end justify-center">🥜</div>
                            </div>
                        </div>
                        <div className="col-span-1 grid grid-rows-2 gap-2 max-h-48">
                            <div className="rounded-xl bg-yellow-50 p-2 border border-yellow-100 shadow-sm cursor-pointer flex flex-col items-center justify-center">
                                <h3 className="font-bold text-yellow-800 text-[11px] leading-tight text-center mb-1">Kids' Costume & Shringar</h3>
                                <div className="flex-1 w-full flex items-end justify-center">👗</div>
                            </div>
                            <div className="rounded-xl bg-amber-50 p-2 border border-amber-100 shadow-sm cursor-pointer flex flex-col items-center justify-center">
                                <h3 className="font-bold text-amber-800 text-[11px] leading-tight text-center mb-1">Pooja &<br />Temple Decor</h3>
                                <div className="flex-1 w-full flex items-end justify-center">📿</div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-6 border-dashed border-gray-200" />

                {/* Bestsellers Blocks */}
                <div className="px-4">
                    <h2 className="text-xl font-bold text-gray-900 mb-4 tracking-tight">Bestsellers</h2>
                    <div className="flex overflow-x-auto gap-3 no-scrollbar pb-4 snap-x">
                        <div className="min-w-[130px] w-[130px] bg-white rounded-2xl border border-gray-100 shadow-sm p-3 snap-start relative overflow-hidden flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-1 mb-2">
                                {bestsellers.slice(0, 4).map((b, i) => (
                                    <div key={b.id} className="bg-gray-50 rounded-lg aspect-square p-1 flex items-center justify-center overflow-hidden mix-blend-multiply">
                                        {b.images?.[0]?.url ? <img src={b.images[0].url} className="object-contain" /> : <div className="bg-gray-200 w-full h-full rounded" />}
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white/90 backdrop-blur-sm absolute bottom-0 left-0 right-0 p-2">
                                <div className="text-[9px] font-bold text-gray-500 uppercase">+{bestsellers.length} more</div>
                                <div className="text-xs font-bold text-gray-900 leading-tight truncate">Hot Deals</div>
                            </div>
                        </div>
                        <div className="min-w-[130px] w-[130px] bg-white rounded-2xl border border-gray-100 shadow-sm p-3 snap-start relative overflow-hidden flex flex-col gap-2">
                            <div className="grid grid-cols-2 gap-1 mb-2">
                                {deals.slice(0, 4).map((d, i) => (
                                    <div key={d.id} className="bg-gray-50 rounded-lg aspect-square p-1 flex items-center justify-center overflow-hidden mix-blend-multiply">
                                        {d.images?.[0]?.url ? <img src={d.images[0].url} className="object-contain" /> : <div className="bg-gray-200 w-full h-full rounded" />}
                                    </div>
                                ))}
                            </div>
                            <div className="bg-white/90 backdrop-blur-sm absolute bottom-0 left-0 right-0 p-2">
                                <div className="text-[9px] font-bold text-gray-500 uppercase">+{deals.length} more</div>
                                <div className="text-xs font-bold text-gray-900 leading-tight truncate">Smart Savings</div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr className="my-2 border-solid border-gray-100 w-full" />
                <hr className="mb-6 border-solid border-gray-100 w-full h-1 bg-gray-50 outline-none" />

                {/* Vertical Real Product List (Matching quick commerce product density) */}
                <div className="px-4">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold text-gray-900 tracking-tight">Daily Essentials</h2>
                        <Link href="/categories" className="text-[#1A7850] text-xs font-bold uppercase tracking-wider">See All</Link>
                    </div>
                    {/* Render Zepto-style horizontal product grid */}
                    <div className="flex overflow-x-auto gap-3 no-scrollbar pb-4 snap-x pr-4 -mx-4 pl-4">
                        {bestsellers.map(p => (
                            <div key={p.id} className="min-w-[140px] w-[140px] snap-start shrink-0">
                                <ProductCard product={p} className="h-full border border-gray-100 shadow-[0_2px_8px_rgba(0,0,0,0.04)] hover:shadow-md bg-white rounded-2xl" />
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
