import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Clock, Zap, Shield, Truck, Star, BadgePercent, Sparkles, Timer } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ProductCard } from '@/components/product/ProductCard';
import { CategoryCard } from '@/components/product/CategoryCard';
import type { Product, Category } from '@/types';

export const metadata: Metadata = {
    title: 'Groceries & essentials in 10 minutes | Apna Bazar',
    description: 'Your neighbourhood quick-commerce store. Fresh groceries, daily essentials & more delivered in minutes. Best prices guaranteed.',
};

async function getData() {
    try {
        const supabase = await createClient();
        const productSelect = '*, category:categories!products_category_id_fkey(id,name,slug), images:product_images(id,url,alt_text,display_order,is_primary), variants:product_variants(id,name,value,price_modifier,stock_quantity,is_active)';

        const [categoriesRes, featuredRes, bestsellersRes, newArrivalsRes] = await Promise.all([
            supabase.from('categories').select('id, name, slug, image_url, is_active, display_order, description, parent_id, created_at, updated_at')
                .eq('is_active', true).is('parent_id', null).order('display_order', { ascending: true }).limit(12),
            supabase.from('products').select(productSelect)
                .eq('is_active', true).eq('is_featured', true).order('created_at', { ascending: false }).limit(12),
            supabase.from('products').select(productSelect)
                .eq('is_active', true).eq('is_bestseller', true).order('created_at', { ascending: false }).limit(12),
            supabase.from('products').select(productSelect)
                .eq('is_active', true).eq('is_new_arrival', true).order('created_at', { ascending: false }).limit(12),
        ]);

        return {
            categories: (categoriesRes.data as Category[]) ?? [],
            featured: (featuredRes.data as unknown as Product[]) ?? [],
            bestsellers: (bestsellersRes.data as unknown as Product[]) ?? [],
            newArrivals: (newArrivalsRes.data as unknown as Product[]) ?? [],
        };
    } catch {
        return { categories: [], featured: [], bestsellers: [], newArrivals: [] };
    }
}

export default async function HomePage() {
    const { categories, featured, bestsellers, newArrivals } = await getData();

    // Combine all products for fallback display
    const allProducts = [...featured, ...bestsellers, ...newArrivals];
    const uniqueProducts = allProducts.filter((p, i, arr) => arr.findIndex(x => x.id === p.id) === i);
    const flashDeals = uniqueProducts.filter(p => p.mrp > p.price).slice(0, 8);
    const displayBestsellers = bestsellers.length > 0 ? bestsellers : uniqueProducts.slice(0, 8);

    return (
        <div className="min-h-screen">
            {/* ==========================================
                HERO BANNER – Blinkit/Zepto style yellow+green
               ========================================== */}
            <section className="container-app pt-3 sm:pt-5">
                <div className="relative overflow-hidden rounded-2xl sm:rounded-3xl" style={{
                    background: 'linear-gradient(135deg, #0D6B3D 0%, #15803D 35%, #22C55E 65%, #F8E71C 100%)',
                    minHeight: 200,
                }}>
                    {/* Decorative blobs */}
                    <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-white/8 blur-3xl" />
                    <div className="absolute bottom-[-50px] right-32 h-48 w-48 rounded-full bg-[#F8E71C]/15 blur-2xl" />
                    <div className="absolute top-[-30px] left-[40%] h-32 w-32 rounded-full bg-white/5 blur-2xl" />

                    <div className="relative px-5 py-6 sm:px-10 sm:py-10 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                        <div className="max-w-lg flex-1">
                            {/* Timer badge */}
                            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-[#F8E71C] px-3.5 py-1.5 text-[11px] font-extrabold uppercase tracking-wider text-[#1B1B1E] shadow-md">
                                <Timer size={14} className="text-[#0D6B3D]" /> Delivery in 10 minutes
                            </div>

                            <h1 className="text-3xl sm:text-5xl font-extrabold text-white leading-[1.08] tracking-tight" style={{ fontFamily: 'var(--font-brand)' }}>
                                Groceries & Daily{'\n'}Essentials{' '}
                                <span className="relative">
                                    <span className="bg-[#F8E71C] text-[#1B1B1E] px-3 py-1 rounded-xl inline-block mt-1">Delivered Fast</span>
                                </span>
                            </h1>
                            <p className="mt-4 text-sm sm:text-base text-white/85 max-w-md font-medium">
                                Fresh products · Best prices · Same day delivery to your doorstep
                            </p>
                            <div className="mt-5 flex flex-wrap gap-3">
                                <Link href="/categories" className="inline-flex items-center gap-2 bg-white text-[#0D6B3D] px-6 py-3 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-all hover:-translate-y-0.5 active:scale-95">
                                    Shop Now <ArrowRight size={16} />
                                </Link>
                                <span className="inline-flex items-center gap-2 rounded-full border-2 border-white/30 px-4 py-2.5 text-xs font-bold text-white/90 backdrop-blur-sm">
                                    <Sparkles size={14} className="text-[#F8E71C]" /> ₹1 delivery on first order
                                </span>
                            </div>
                        </div>
                        <div className="hidden lg:flex items-center justify-center flex-shrink-0">
                            <div className="relative w-52 h-52 rounded-3xl border-2 border-white/20 bg-white/10 backdrop-blur-sm flex items-center justify-center rotate-[-5deg] hover:rotate-0 transition-transform duration-500">
                                <div className="text-center">
                                    <Truck size={56} strokeWidth={1.2} className="text-white/70 mx-auto" />
                                    <p className="text-white/80 text-sm font-bold mt-2">Lightning Fast</p>
                                </div>
                                <div className="absolute -top-3 -right-3 bg-[#F8E71C] text-[#1B1B1E] text-xs font-extrabold px-3 py-1.5 rounded-full shadow-lg rotate-12 animate-glow-pulse">
                                    ⚡ 10 MIN
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ==========================================
                SERVICE BENEFITS – Zepto-style compact strip
               ========================================== */}
            <section className="container-app mt-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
                    {[
                        { icon: Clock, title: '10 Min Delivery', sub: 'Super fast service', color: '#0D6B3D', bg: '#E8F5EE' },
                        { icon: BadgePercent, title: 'Best Prices', sub: 'Guaranteed savings', color: '#F59E0B', bg: '#FFFDE7' },
                        { icon: Star, title: 'Fresh Quality', sub: 'Sourced daily', color: '#E74C3C', bg: '#FFEBEE' },
                        { icon: Shield, title: 'Safe Checkout', sub: '100% secure', color: '#3B82F6', bg: '#EFF6FF' },
                    ].map((item) => (
                        <div key={item.title} className="service-badge">
                            <div className="service-badge-icon" style={{ background: item.bg, color: item.color }}>
                                <item.icon size={16} />
                            </div>
                            <div>
                                <p className="text-xs font-bold text-gray-800 leading-tight">{item.title}</p>
                                <p className="text-[10px] text-gray-400 font-medium">{item.sub}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* ==========================================
                CATEGORIES – Blinkit-style category circles
               ========================================== */}
            {categories.length > 0 && (
                <section className="container-app mt-6 sm:mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h2 className="section-title">Shop by Category</h2>
                            <p className="text-[13px] text-gray-500 font-medium">What are you looking for?</p>
                        </div>
                        <Link href="/categories" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-primary)] hover:underline px-3 py-1.5 rounded-full bg-[var(--brand-primary-light)] hover:bg-[var(--brand-primary)] hover:text-white transition-all">
                            See All <ChevronRight size={14} />
                        </Link>
                    </div>
                    {/* Desktop grid */}
                    <div className="hidden sm:grid grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
                        {categories.slice(0, 8).map((cat) => <CategoryCard key={cat.id} category={cat} />)}
                    </div>
                    {/* Mobile horizontal scroll */}
                    <div className="sm:hidden flex gap-3 overflow-x-auto no-scrollbar pb-2">
                        {categories.map((cat) => (
                            <div key={cat.id} className="flex-shrink-0 w-[80px]">
                                <CategoryCard category={cat} />
                            </div>
                        ))}
                    </div>
                </section>
            )}

            {/* ==========================================
                FLASH DEALS – with Blinkit-style Zap icon
               ========================================== */}
            {flashDeals.length > 0 && (
                <section className="container-app mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-2">
                                <div className="w-8 h-8 rounded-lg bg-[#FFFDE7] flex items-center justify-center">
                                    <Zap size={18} className="text-[#F59E0B]" fill="currentColor" />
                                </div>
                                <div>
                                    <h2 className="section-title !mb-0">Flash Deals</h2>
                                    <p className="text-[11px] text-gray-400 font-medium">Limited time offers</p>
                                </div>
                            </div>
                        </div>
                        <Link href="/categories" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-primary)] hover:underline px-3 py-1.5 rounded-full bg-[var(--brand-primary-light)] hover:bg-[var(--brand-primary)] hover:text-white transition-all">
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {flashDeals.slice(0, 6).map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                </section>
            )}

            {/* ==========================================
                BEST SELLERS
               ========================================== */}
            {displayBestsellers.length > 0 && (
                <section className="container-app mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#FFF3E0] flex items-center justify-center">
                                <span className="text-base">🏆</span>
                            </div>
                            <div>
                                <h2 className="section-title !mb-0">Best Sellers</h2>
                                <p className="text-[11px] text-gray-400 font-medium">Most loved by customers</p>
                            </div>
                        </div>
                        <Link href="/categories" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-primary)] hover:underline px-3 py-1.5 rounded-full bg-[var(--brand-primary-light)] hover:bg-[var(--brand-primary)] hover:text-white transition-all">
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {displayBestsellers.slice(0, 6).map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                </section>
            )}

            {/* ==========================================
                PROMOTIONAL BANNERS – Blinkit bold colorful
               ========================================== */}
            <section className="container-app mt-8">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { title: 'Personal Care', offer: 'Upto 40% OFF', gradient: 'linear-gradient(135deg, #E74C3C, #FF6B6B)', link: '/categories', emoji: '🧴', tag: 'TRENDING' },
                        { title: 'Healthy & Organic', offer: 'Upto 30% OFF', gradient: 'linear-gradient(135deg, #0D6B3D, #22C55E)', link: '/categories', emoji: '🥗', tag: 'POPULAR' },
                        { title: 'Home & Cleaning', offer: 'Upto 50% OFF', gradient: 'linear-gradient(135deg, #3B82F6, #60A5FA)', link: '/categories', emoji: '🧹', tag: 'DEALS' },
                    ].map((promo) => (
                        <Link
                            key={promo.title}
                            href={promo.link}
                            className="promo-banner relative p-5 text-white shadow-md hover:shadow-lg group"
                            style={{ background: promo.gradient }}
                        >
                            <div className="absolute -right-4 -bottom-4 text-7xl opacity-15 group-hover:opacity-25 transition-opacity duration-500 group-hover:scale-110 transform">{promo.emoji}</div>
                            <span className="inline-block text-[9px] font-extrabold uppercase tracking-widest bg-white/20 backdrop-blur-sm rounded-full px-2.5 py-1 mb-2">{promo.tag}</span>
                            <p className="text-xs font-semibold text-white/85 uppercase tracking-wider">{promo.title}</p>
                            <p className="text-2xl font-extrabold mt-1" style={{ fontFamily: 'var(--font-brand)' }}>{promo.offer}</p>
                            <span className="inline-flex items-center gap-1 mt-3 text-xs font-bold bg-white text-gray-800 rounded-full px-4 py-2 hover:bg-white/90 transition shadow-sm">
                                Shop Now <ArrowRight size={12} />
                            </span>
                        </Link>
                    ))}
                </div>
            </section>

            {/* ==========================================
                NEW ARRIVALS
               ========================================== */}
            {newArrivals.length > 0 && (
                <section className="container-app mt-8">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-[#F3E5F5] flex items-center justify-center">
                                <Sparkles size={16} className="text-purple-500" />
                            </div>
                            <div>
                                <h2 className="section-title !mb-0">New Arrivals</h2>
                                <p className="text-[11px] text-gray-400 font-medium">Just landed on Apna Bazar</p>
                            </div>
                        </div>
                        <Link href="/categories" className="inline-flex items-center gap-1 text-xs font-bold text-[var(--brand-primary)] hover:underline px-3 py-1.5 rounded-full bg-[var(--brand-primary-light)] hover:bg-[var(--brand-primary)] hover:text-white transition-all">
                            View All <ChevronRight size={14} />
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {newArrivals.slice(0, 6).map((product) => <ProductCard key={product.id} product={product} />)}
                    </div>
                </section>
            )}

            {/* ==========================================
                VALUE PROPOSITIONS FOOTER
               ========================================== */}
            <section className="container-app mt-8 mb-8">
                <div className="bg-white rounded-2xl border border-[var(--border-light)] p-5 sm:p-6 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                        {[
                            { emoji: '🚚', title: 'Free Delivery', desc: 'On orders above ₹199', color: '#0D6B3D' },
                            { emoji: '🌿', title: 'Always Fresh', desc: 'Quality checked daily', color: '#F59E0B' },
                            { emoji: '💬', title: 'Easy Returns', desc: 'Zero-hassle support', color: '#3B82F6' },
                        ].map(({ emoji, title, desc, color }) => (
                            <div key={title} className="flex items-center gap-3">
                                <div className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 border border-gray-100" style={{ background: `${color}08` }}>
                                    <span className="text-xl">{emoji}</span>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-gray-800">{title}</p>
                                    <p className="text-xs text-gray-400 font-medium">{desc}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
