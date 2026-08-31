'use client';

import Link from 'next/link';
import { Search, ShoppingCart, Bell, MapPin, ChevronDown, X, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';

interface HeaderProps {
    cartCount?: number;
    notificationCount?: number;
    deliveryLocation?: string;
    isLoggedIn?: boolean;
}

export function Header({
    cartCount = 0,
    notificationCount = 0,
    deliveryLocation = 'Bajkul',
    isLoggedIn = false,
}: HeaderProps) {
    const [searchOpen, setSearchOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const q = fd.get('q');
        if (q) {
            router.push(`/search?q=${encodeURIComponent(q.toString())}`);
        }
    };

    return (
        <header className="sticky top-0 z-40 bg-primary shadow-md safe-top">
            <div className="max-w-[1280px] mx-auto">
                {/* ── MOBILE HEADER (hidden on lg) ── */}
                <div className="lg:hidden flex flex-col">
                    <div className="px-3 py-2.5 flex items-center gap-3">
                        <Link href="/" className="flex-shrink-0" aria-label="Apna Bazar Home">
                            <div className="flex items-center gap-2">
                                <div className="w-9 h-9 bg-white rounded-full flex items-center justify-center shadow-sm">
                                    <span className="text-primary font-black font-brand text-xs leading-none text-center">AB</span>
                                </div>
                                <div className="hidden sm:block">
                                    <div className="font-brand font-black text-white text-lg leading-none">Apna Bazar</div>
                                    <div className="text-emerald-100 text-[9px] font-medium leading-none">Sab Kuch, Apne Paas</div>
                                </div>
                            </div>
                        </Link>

                        <button className="flex-1 min-w-0 flex items-center gap-1 ml-1" aria-label="Change delivery location">
                            <MapPin size={14} className="text-emerald-100 flex-shrink-0" />
                            <div className="min-w-0 flex flex-col items-start">
                                <div className="text-emerald-100 text-[10px] leading-none">Delivering to</div>
                                <div className="text-white font-semibold text-sm flex items-center gap-0.5 truncate">
                                    <span className="truncate">{deliveryLocation}</span>
                                    <ChevronDown size={12} />
                                </div>
                            </div>
                        </button>

                        <div className="flex items-center gap-2.5">
                            <button className="text-white p-1" onClick={() => setSearchOpen(!searchOpen)}>
                                {searchOpen ? <X size={20} /> : <Search size={20} />}
                            </button>
                            <Link href="/cart" className="relative text-white p-1">
                                <ShoppingCart size={22} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-white text-primary text-[9px] font-black rounded-full flex items-center justify-center">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* Expandable Mobile Search */}
                    <div className={cn('overflow-hidden transition-all duration-300', searchOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0')}>
                        <div className="px-3 pb-2.5">
                            <form onSubmit={handleSearch}>
                                <div className="relative">
                                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                                    <input name="q" type="search" placeholder="Search products, groceries..." className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50" />
                                </div>
                            </form>
                        </div>
                    </div>
                </div>

                {/* ── DESKTOP HEADER (visible on lg) ── */}
                <div className="hidden lg:flex items-center justify-between px-6 py-3 gap-8">
                    {/* Brand */}
                    <Link href="/" className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm">
                            <span className="text-primary font-black font-brand text-lg leading-none text-center">AB</span>
                        </div>
                        <div>
                            <div className="font-brand font-black text-white text-2xl leading-none">Apna Bazar</div>
                            <div className="text-emerald-100 text-xs font-semibold mt-1">Sab Kuch, Apne Paas</div>
                        </div>
                    </Link>

                    {/* Desktop Location */}
                    <button className="flex items-center gap-2 hover:bg-black/10 px-3 py-2 rounded-xl transition-colors">
                        <MapPin size={22} className="text-white" />
                        <div className="flex flex-col items-start min-w-[120px] max-w-[200px]">
                            <span className="text-emerald-100 text-[10px] uppercase font-bold tracking-wider">Delivery Location</span>
                            <div className="text-white font-bold text-sm flex items-center gap-1 w-full">
                                <span className="truncate">{deliveryLocation}</span>
                                <ChevronDown size={14} className="flex-shrink-0 text-emerald-100" />
                            </div>
                        </div>
                    </button>

                    {/* Desktop Search */}
                    <div className="flex-1 max-w-2xl">
                        <form onSubmit={handleSearch}>
                            <div className="relative group">
                                <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-primary transition-colors" />
                                <input
                                    name="q"
                                    type="search"
                                    placeholder="Search for groceries, personal care, household items..."
                                    className="w-full bg-white rounded-xl pl-12 pr-6 py-3.5 text-sm font-medium text-gray-900 border-none outline-none shadow-sm focus:ring-4 focus:ring-emerald-500/20 transition-all"
                                />
                                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 bg-primary text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-emerald-800 transition-colors">
                                    Search
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Desktop Navigation */}
                    <div className="flex items-center gap-6 text-white font-bold text-sm">
                        <Link href="/categories" className="hover:text-emerald-200 transition-colors">Categories</Link>

                        <Link href="/account" className="flex items-center gap-2 hover:bg-black/10 px-3 py-2 rounded-xl transition-colors">
                            <User size={20} />
                            <span>Account</span>
                        </Link>

                        <Link href="/cart" className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-xl hover:bg-emerald-50 transition-colors shadow-sm">
                            <div className="relative">
                                <ShoppingCart size={20} />
                                {cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 h-4 w-4 bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center ring-2 ring-white">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </div>
                            <span className="ml-1">Cart</span>
                        </Link>
                    </div>
                </div>
            </div>
        </header>
    );
}
