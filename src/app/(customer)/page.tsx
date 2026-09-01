import type { Metadata } from 'next';
import Link from 'next/link';
import { ChevronRight, Grid3X3 } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';
import type { Product, Category } from '@/types';

export const metadata: Metadata = {
    title: 'Apna Bazar | CYBER-SENTINEL',
    description: 'Advanced Forensic Commerce System',
};

async function getData() {
    try {
        const supabase = await createClient();
        const [categoriesRes, bestsellersRes] = await Promise.all([
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
                .order('created_at', { ascending: false })
                .limit(12),
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
        <div className="min-h-screen pb-20 font-mono text-[#00ffcc] relative z-10 w-full max-w-md mx-auto sm:max-w-none">
            {/* Horizontal Category Tab Ribbon */}
            <div className="sticky top-[138px] lg:top-20 z-30 bg-black/80 backdrop-blur border-b border-[#00ffcc]/30 pt-1 pb-2 shadow-[0_4px_15px_rgba(0,255,204,0.1)]">
                <div className="flex overflow-x-auto no-scrollbar gap-5 px-4 snap-x">
                    <Link href="/categories" className="flex flex-col items-center gap-1 min-w-[56px] snap-start group pb-1">
                        <div className="w-11 h-11 bg-black border border-[#ff00ff]/30 shadow-[0_0_10px_rgba(255,0,255,0.2)] flex items-center justify-center p-2 group-active:scale-95 transition-all">
                            <Grid3X3 className="text-[#ff00ff]" size={20} />
                        </div>
                        <span className="text-[10px] uppercase font-bold text-[#ff00ff] tracking-widest leading-tight">ALL_SYS</span>
                        <div className="h-0.5 w-[80%] bg-[#ff00ff] mx-auto absolute -bottom-1 shadow-[0_0_5px_#ff00ff]"></div>
                    </Link>
                    {categories.slice(0, 10).map((cat) => (
                        <Link href={`/categories/${cat.slug}`} key={cat.id} className="flex flex-col items-center gap-1 min-w-[56px] snap-start relative group pb-1">
                            <div className="w-11 h-11 bg-black flex items-center justify-center p-1.5 border border-[#00ffcc]/30 group-active:scale-95 group-hover:border-[#00ffcc] transition-all relative overflow-hidden shadow-[inset_0_0_8px_rgba(0,255,204,0.1)]">
                                {cat.image_url ? (
                                    <img src={cat.image_url} alt={cat.name} className="w-full h-full object-contain filter hue-rotate-180 mix-blend-screen opacity-80" />
                                ) : (
                                    <span className="text-[10px] font-bold text-[#0066ff] uppercase">{cat.name.substring(0, 2)}</span>
                                )}
                            </div>
                            <span className="text-[9px] font-bold text-[#00ffcc] uppercase leading-tight truncate w-14 text-center tracking-widest">{cat.name}</span>
                        </Link>
                    ))}
                </div>
            </div>

            <main className="lg:max-w-5xl lg:mx-auto">
                {/* Promo/Festival Banner Grid */}
                <div className="px-4 mt-6">
                    <div className="flex justify-between items-center mb-4 border-b border-[#ff00ff]/30 pb-2">
                        <h2 className="font-mono font-bold text-2xl text-[#00ffcc] italic tracking-tight relative drop-shadow-[0_0_8px_#00ffcc]">
                            SYSTEM_INIT <br />
                            <span className="text-3xl font-black not-italic text-white">JANMASHTAMI</span>
                        </h2>
                        <div className="w-16 h-16 opacity-80 border border-[#ff00ff] flex items-center justify-center shadow-[0_0_15px_rgba(255,0,255,0.4)] bg-[#ff00ff]/10">
                            <span className="glitch text-lg">SYS</span>
                        </div>
                    </div>
                    {/* Masonry-Style Promo Box Layout */}
                    <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-1 border border-[#00ffcc]/50 bg-black backdrop-blur rounded p-2 aspect-[4/5] flex flex-col items-center justify-between shadow-[0_0_15px_rgba(0,255,204,0.2)] relative group cursor-pointer hover:border-[#00ffcc]">
                            <div className="text-center mt-2 z-10 w-full bg-black/80 p-1 border border-[#00ffcc]/30">
                                <h3 className="font-bold text-[#00ffcc] text-[10px] px-1 leading-tight tracking-widest uppercase">POSHAK_DATA</h3>
                                <div className="mt-2 bg-[#ff00ff]/20 text-[#ff00ff] border border-[#ff00ff] font-bold px-1 py-0.5 text-[9px] inline-block">VAL 349</div>
                            </div>
                        </div>
                        <div className="col-span-2 grid grid-rows-2 gap-2">
                            <div className="row-span-1 bg-black p-2 flex items-center justify-between shadow-[0_0_10px_rgba(0,102,255,0.2)] border border-[#0066ff]/50 relative overflow-hidden group cursor-pointer hover:border-[#0066ff]">
                                <div className="z-10 pl-2">
                                    <h3 className="font-bold text-[#0066ff] text-xs tracking-widest drop-shadow-[0_0_5px_#0066ff]">DECOR_MOD</h3>
                                    <p className="text-[#0066ff]/70 text-[9px] uppercase tracking-widest">THREAT LVL: LOW</p>
                                </div>
                            </div>
                            <div className="row-span-1 bg-black p-2 flex items-center justify-between shadow-[0_0_10px_rgba(255,0,85,0.2)] border border-[#ff0055]/50 relative overflow-hidden group hover:border-[#ff0055]">
                                <div className="z-10 pl-2">
                                    <h3 className="font-bold text-[#ff0055] text-xs tracking-widest drop-shadow-[0_0_5px_#ff0055]">SWEETS_PKG</h3>
                                    <p className="text-[#ff0055]/70 text-[9px] uppercase tracking-widest">FESTIVE PROTOCOL</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bestsellers Header */}
                <div className="px-4 mt-6">
                    <div className="flex items-center justify-between mb-3 border-b border-[#00ffcc]/30 pb-2">
                        <h2 className="text-[#00ffcc] font-black text-sm uppercase tracking-widest drop-shadow-[0_0_5px_#00ffcc] flex items-center gap-2">
                            <span className="text-[#ff00ff] animate-pulse">&gt;&gt;</span> TOP_MODULES
                        </h2>
                        <Link href="/products" className="text-[#0066ff] text-[10px] font-bold flex items-center uppercase tracking-widest hover:text-white transition-colors">
                            EXE_ALL <ChevronRight size={12} />
                        </Link>
                    </div>
                    {/* Horizontal Scroll Bestsellers */}
                    <div className="flex overflow-x-auto gap-3 pb-4 snap-x scrollbar-none">
                        {bestsellers.length > 0 ? (
                            bestsellers.map(product => (
                                <div key={product.id} className="min-w-[140px] snap-start border border-[#00ffcc]/20 bg-black/80 backdrop-blur p-2 shadow-[0_0_10px_rgba(0,255,204,0.1)] hover:border-[#00ffcc] transition-colors group">
                                    <ProductCard product={product} />
                                </div>
                            ))
                        ) : (
                            <div className="text-[#ff0055] text-[10px] py-4 p-4 border border-dashed border-[#ff0055]/50 bg-black/50 w-full text-center tracking-widest uppercase">
                                STATUS: NO_ACTIVE_MODULES
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
}
