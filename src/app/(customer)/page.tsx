import type { Metadata } from 'next';
import Link from 'next/link';
import Image from 'next/image';
import {
    ShieldCheck, RefreshCw, Clock, Star, ChevronRight,
    Package, Truck, Tag, Users
} from 'lucide-react';
import { ProductCard, ProductCardSkeleton } from '@/components/product/ProductCard';
import { CategoryCard, CategoryCardSkeleton } from '@/components/product/CategoryCard';

export const metadata: Metadata = {
    title: 'Apna Bazar – Shop Jewelry, Cosmetics, Gifts & More',
    description:
        'Apna Bazar – your trusted local shop in Bajkul, West Bengal. Shop jewelry, cosmetics, beauty, gifts, stationery, toys & more. Fast local delivery, Cash on Delivery available.',
};

// Static category data — replaced by DB once connected
const STATIC_CATEGORIES = [
    { id: '1', name: 'Makeup', slug: 'makeup', image_url: null, is_active: true, parent_id: null, display_order: 1, description: null, created_at: '', updated_at: '' },
    { id: '2', name: 'Skin Care', slug: 'skin-care', image_url: null, is_active: true, parent_id: null, display_order: 2, description: null, created_at: '', updated_at: '' },
    { id: '3', name: 'Hair Care', slug: 'hair-care', image_url: null, is_active: true, parent_id: null, display_order: 3, description: null, created_at: '', updated_at: '' },
    { id: '4', name: 'Perfumes', slug: 'perfumes', image_url: null, is_active: true, parent_id: null, display_order: 4, description: null, created_at: '', updated_at: '' },
    { id: '5', name: 'Jewelry', slug: 'jewelry', image_url: null, is_active: true, parent_id: null, display_order: 5, description: null, created_at: '', updated_at: '' },
    { id: '6', name: 'Bangles', slug: 'bangles', image_url: null, is_active: true, parent_id: null, display_order: 6, description: null, created_at: '', updated_at: '' },
    { id: '7', name: 'Earrings', slug: 'earrings', image_url: null, is_active: true, parent_id: null, display_order: 7, description: null, created_at: '', updated_at: '' },
    { id: '8', name: 'Rings', slug: 'rings', image_url: null, is_active: true, parent_id: null, display_order: 8, description: null, created_at: '', updated_at: '' },
    { id: '9', name: 'Gift Items', slug: 'gift-items', image_url: null, is_active: true, parent_id: null, display_order: 9, description: null, created_at: '', updated_at: '' },
    { id: '10', name: 'Teddy & Toys', slug: 'teddy-toys', image_url: null, is_active: true, parent_id: null, display_order: 10, description: null, created_at: '', updated_at: '' },
    { id: '11', name: 'Stationery', slug: 'stationery', image_url: null, is_active: true, parent_id: null, display_order: 11, description: null, created_at: '', updated_at: '' },
    { id: '12', name: 'Birthday Gifts', slug: 'birthday-gifts', image_url: null, is_active: true, parent_id: null, display_order: 12, description: null, created_at: '', updated_at: '' },
];

const USP_ITEMS = [
    { icon: Clock, text: 'Fast Local Delivery', sub: 'Quick to your doorstep' },
    { icon: ShieldCheck, text: '100% Original Products', sub: 'Best Quality Guaranteed' },
    { icon: ShieldCheck, text: 'Secure Payments', sub: 'Safe & Hassle Free' },
    { icon: RefreshCw, text: 'Easy Returns', sub: 'No Questions Asked' },
];

const TRUST_BADGES = [
    { icon: RefreshCw, label: 'Easy Returns', sub: 'Hassle Free' },
    { icon: Package, label: 'Cash on Delivery', sub: 'Pay When You Receive' },
    { icon: Truck, label: 'Free Delivery', sub: 'On Orders Above ₹499' },
    { icon: Tag, label: 'Exclusive Offers', sub: 'Everyday New Deals' },
];

export default function HomePage() {
    return (
        <div className="bg-gray-50">
            {/* ── Hero Banner ── */}
            <section className="brand-gradient px-4 pt-4 pb-6">
                <div className="max-w-2xl mx-auto text-center text-white">
                    <p className="text-red-200 text-sm font-medium mb-1">
                        Bajkul, West Bengal · Est. 2025
                    </p>
                    <h1 className="font-brand font-black text-3xl sm:text-4xl mb-1">
                        Apna Bazar
                    </h1>
                    <p className="text-red-100 font-medium text-sm mb-4">
                        Han Rishta, Han Ehsaas, Humare Saath...
                    </p>
                    {/* USP chips */}
                    <div className="flex flex-wrap justify-center gap-2 mb-5">
                        <span className="bg-white/20 text-white text-xs rounded-full px-3 py-1 font-medium">⚡ Fast Delivery</span>
                        <span className="bg-white/20 text-white text-xs rounded-full px-3 py-1 font-medium">✅ Original Products</span>
                        <span className="bg-white/20 text-white text-xs rounded-full px-3 py-1 font-medium">🔒 Secure Payment</span>
                        <span className="bg-white/20 text-white text-xs rounded-full px-3 py-1 font-medium">🎁 COD Available</span>
                    </div>
                    {/* CTA */}
                    <Link
                        href="/categories"
                        className="inline-flex items-center gap-2 bg-white text-[#C41E3A] font-bold px-6 py-3 rounded-2xl text-sm hover:bg-red-50 transition-all duration-200 active:scale-95 shadow-lg"
                    >
                        Shop Now
                        <ChevronRight size={16} />
                    </Link>
                </div>
            </section>

            {/* ── Trust Badges ── */}
            <section className="bg-white px-3 py-3 border-b border-gray-100">
                <div className="grid grid-cols-4 gap-1">
                    {TRUST_BADGES.map((badge) => {
                        const Icon = badge.icon;
                        return (
                            <div key={badge.label} className="flex flex-col items-center text-center gap-1">
                                <Icon size={18} className="text-[#C41E3A]" />
                                <span className="text-[10px] font-semibold text-gray-800 leading-tight">{badge.label}</span>
                                <span className="text-[9px] text-gray-500 leading-tight hidden sm:block">{badge.sub}</span>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Delivery Info Banner ── */}
            <section className="mx-3 my-3">
                <div className="rounded-2xl bg-gradient-to-r from-orange-500 to-orange-400 p-4 flex items-center gap-3 shadow-sm">
                    <div className="text-3xl">🛵</div>
                    <div>
                        <div className="font-bold text-white text-sm">Fast Local Delivery</div>
                        <div className="text-orange-100 text-xs">Delivering across Bajkul & nearby areas</div>
                    </div>
                    <div className="ml-auto">
                        <span className="bg-white/20 text-white text-xs font-semibold px-3 py-1 rounded-full">FREE above ₹499</span>
                    </div>
                </div>
            </section>

            {/* ── Categories ── */}
            <section className="section bg-white mx-3 rounded-2xl shadow-sm mb-3">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="section-title mb-0">🛍️ Shop by Category</h2>
                    <Link href="/categories" className="text-[#C41E3A] text-sm font-semibold flex items-center gap-1">
                        See All <ChevronRight size={14} />
                    </Link>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-6">
                    {STATIC_CATEGORIES.map((cat) => (
                        <CategoryCard key={cat.id} category={cat} />
                    ))}
                </div>
            </section>

            {/* ── Promotional Banner ── */}
            <section className="mx-3 mb-3">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-red-700 to-[#C41E3A] p-5 text-white relative">
                    <div className="relative z-10">
                        <div className="text-orange-300 text-xs font-semibold uppercase tracking-widest mb-1">Limited Time Offer</div>
                        <div className="font-brand font-black text-2xl mb-1">Up to 50% OFF</div>
                        <div className="text-red-200 text-sm mb-4">On Top Beauty Brands</div>
                        <Link href="/categories/makeup" className="inline-flex items-center gap-1 bg-white text-[#C41E3A] text-sm font-bold px-4 py-2 rounded-xl hover:bg-red-50 transition-all active:scale-95">
                            Shop Now <ChevronRight size={14} />
                        </Link>
                    </div>
                    {/* Decorative */}
                    <div className="absolute right-3 top-3 text-5xl opacity-20 select-none">✨</div>
                    <div className="absolute right-10 bottom-3 text-3xl opacity-20 select-none">💄</div>
                </div>
            </section>

            {/* ── Featured Products (Placeholder) ── */}
            <section className="mx-3 mb-3 bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 pt-4 flex items-center justify-between">
                    <h2 className="section-title mb-0">⭐ Featured Products</h2>
                    <Link href="/products?featured=true" className="text-[#C41E3A] text-sm font-semibold flex items-center gap-1">
                        See All <ChevronRight size={14} />
                    </Link>
                </div>
                <div className="px-3 pb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                        {/* Will be populated from DB — show skeletons for now */}
                        {Array.from({ length: 4 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                    <p className="text-center text-sm text-gray-500 mt-6 py-4">
                        🔌 Connect Supabase to see real products
                    </p>
                </div>
            </section>

            {/* ── Best Sellers ── */}
            <section className="mx-3 mb-3 bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 pt-4 flex items-center justify-between">
                    <h2 className="section-title mb-0">🔥 Best Sellers</h2>
                    <Link href="/products?bestseller=true" className="text-[#C41E3A] text-sm font-semibold flex items-center gap-1">
                        See All <ChevronRight size={14} />
                    </Link>
                </div>
                <div className="px-3 pb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Jewelry Section ── */}
            <section className="mx-3 mb-3">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-yellow-700 to-amber-600 p-5 text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">💎</span>
                        <div className="text-yellow-200 text-xs font-semibold uppercase tracking-widest">Jewelry Collection</div>
                    </div>
                    <div className="font-brand font-black text-xl mb-1">Jewelry That Shines,<br />Bonds That Last</div>
                    <div className="text-yellow-100 text-sm mb-4">Bangles · Earrings · Rings · Necklaces</div>
                    <Link href="/categories/jewelry" className="inline-flex items-center gap-1 bg-white text-amber-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-yellow-50 transition-all active:scale-95">
                        Explore Jewelry <ChevronRight size={14} />
                    </Link>
                </div>
            </section>

            {/* ── New Arrivals ── */}
            <section className="mx-3 mb-3 bg-white rounded-2xl shadow-sm overflow-hidden">
                <div className="px-4 pt-4 flex items-center justify-between">
                    <h2 className="section-title mb-0">🆕 New Arrivals</h2>
                    <Link href="/products?new=true" className="text-[#C41E3A] text-sm font-semibold flex items-center gap-1">
                        See All <ChevronRight size={14} />
                    </Link>
                </div>
                <div className="px-3 pb-4">
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 mt-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <ProductCardSkeleton key={i} />
                        ))}
                    </div>
                </div>
            </section>

            {/* ── Gift Section ── */}
            <section className="mx-3 mb-3">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-purple-700 to-pink-600 p-5 text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🎁</span>
                        <div className="text-purple-200 text-xs font-semibold uppercase tracking-widest">Gift Section</div>
                    </div>
                    <div className="font-brand font-black text-xl mb-1">Perfect Gifts<br />For Every Occasion</div>
                    <div className="text-purple-100 text-sm mb-4">Birthdays · Anniversaries · Festivals</div>
                    <div className="flex gap-2 flex-wrap">
                        <Link href="/categories/gift-items" className="bg-white text-purple-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-purple-50 transition-all active:scale-95">
                            Gift Items
                        </Link>
                        <Link href="/categories/birthday-gifts" className="bg-white/20 text-white text-sm font-semibold px-4 py-2 rounded-xl hover:bg-white/30 transition-all active:scale-95">
                            Birthday Gifts
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── Stationery Section ── */}
            <section className="mx-3 mb-3">
                <div className="rounded-2xl overflow-hidden bg-gradient-to-r from-blue-700 to-indigo-600 p-5 text-white">
                    <div className="flex items-center gap-2 mb-1">
                        <span className="text-2xl">🖊️</span>
                        <div className="text-blue-200 text-xs font-semibold uppercase tracking-widest">Stationery</div>
                    </div>
                    <div className="font-brand font-black text-xl mb-1">Everything for<br />School & Office</div>
                    <div className="text-blue-100 text-sm mb-4">Pens · Notebooks · Craft Supplies</div>
                    <Link href="/categories/stationery" className="inline-flex items-center gap-1 bg-white text-blue-700 text-sm font-bold px-4 py-2 rounded-xl hover:bg-blue-50 transition-all active:scale-95">
                        Shop Stationery <ChevronRight size={14} />
                    </Link>
                </div>
            </section>

            {/* ── Why Apna Bazar ── */}
            <section className="mx-3 mb-3 bg-white rounded-2xl shadow-sm p-4">
                <h2 className="section-title text-center justify-center">Why Apna Bazar?</h2>
                <div className="grid grid-cols-2 gap-3 mt-2">
                    {USP_ITEMS.map((item) => {
                        const Icon = item.icon;
                        return (
                            <div key={item.text} className="flex items-start gap-3 p-3 rounded-xl bg-red-50">
                                <div className="w-9 h-9 rounded-xl bg-[#C41E3A] flex items-center justify-center flex-shrink-0">
                                    <Icon size={18} className="text-white" />
                                </div>
                                <div>
                                    <div className="font-semibold text-gray-900 text-xs">{item.text}</div>
                                    <div className="text-gray-500 text-[10px]">{item.sub}</div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </section>

            {/* ── Footer ── */}
            <footer className="bg-gray-900 text-gray-300 px-4 py-8 mt-4">
                <div className="max-w-md mx-auto">
                    <div className="flex items-center gap-2 mb-3">
                        <div className="w-10 h-10 rounded-full bg-[#C41E3A] flex items-center justify-center">
                            <span className="text-white font-black text-sm font-brand">AB</span>
                        </div>
                        <div>
                            <div className="text-white font-brand font-black text-lg">Apna Bazar</div>
                            <div className="text-gray-500 text-[10px]">Because You Deserve The Best!</div>
                        </div>
                    </div>
                    <p className="text-sm text-gray-400 mb-4">
                        Your trusted local shop in Bajkul, West Bengal – serving the community with quality products.
                    </p>
                    <div className="space-y-1 text-sm text-gray-400">
                        <div>📍 Bajkul, Pin-721655, West Bengal, India</div>
                        <div>📞 Contact us for more details</div>
                        <div>🌐 www.apnabazar.in</div>
                    </div>
                    <div className="border-t border-gray-800 mt-4 pt-4 flex flex-wrap gap-3 text-xs text-gray-500">
                        <Link href="/about" className="hover:text-gray-300 transition-colors">About</Link>
                        <Link href="/contact" className="hover:text-gray-300 transition-colors">Contact</Link>
                        <Link href="/privacy" className="hover:text-gray-300 transition-colors">Privacy Policy</Link>
                        <Link href="/terms" className="hover:text-gray-300 transition-colors">Terms</Link>
                    </div>
                    <div className="mt-3 text-[10px] text-gray-600">
                        © {new Date().getFullYear()} Apna Bazar. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}
