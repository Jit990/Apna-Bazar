'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    Search, MapPin, ShoppingCart, User, Tag, ChevronDown, Zap,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function Header() {
    const router = useRouter();
    const { items } = useCart();
    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const searchRef = useRef<HTMLInputElement>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchQuery.trim().length > 1) {
            router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
            setSearchOpen(false);
        }
    };

    useEffect(() => {
        if (searchOpen && searchRef.current) {
            searchRef.current.focus();
        }
    }, [searchOpen]);

    return (
        <header className="sticky top-0 z-50 bg-white" style={{ boxShadow: '0 1px 6px rgba(0,0,0,0.06)' }}>
            {/* Top bar – Blinkit-style delivery promise */}
            <div className="bg-[#0D6B3D]">
                <div className="container-app">
                    <div className="flex items-center justify-center gap-2 py-1.5">
                        <Zap size={12} className="text-[#F8E71C]" />
                        <span className="text-[11px] font-semibold text-white tracking-wide">
                            Order now & get delivery in <span className="text-[#F8E71C] font-bold">10 minutes</span>
                        </span>
                        <Zap size={12} className="text-[#F8E71C]" />
                    </div>
                </div>
            </div>

            {/* Desktop Header */}
            <div className="hidden lg:block border-b border-[var(--border-light)]">
                <div className="container-app">
                    <div className="flex items-center gap-5 h-[66px]">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-2.5 flex-shrink-0 group">
                            <div className="brand-mark">
                                <ShoppingCart size={18} className="text-white" />
                            </div>
                            <div>
                                <span className="text-[22px] font-extrabold tracking-tight" style={{ fontFamily: 'var(--font-brand)', color: 'var(--brand-primary)' }}>
                                    apna<span className="text-[#F8E71C] bg-[#0D6B3D] px-1.5 py-0.5 rounded-md ml-0.5">bazar</span>
                                </span>
                            </div>
                        </Link>

                        {/* Delivery info */}
                        <button className="flex items-center gap-2 px-3.5 py-2 rounded-xl hover:bg-gray-50 transition group flex-shrink-0 border border-transparent hover:border-[var(--border-light)]">
                            <div className="w-8 h-8 rounded-lg bg-[var(--brand-primary-light)] flex items-center justify-center">
                                <MapPin size={16} className="text-[var(--brand-primary)]" />
                            </div>
                            <div className="text-left">
                                <p className="text-[10px] font-semibold text-gray-400 leading-none uppercase tracking-wider">Deliver to</p>
                                <p className="text-sm font-bold text-gray-800 leading-tight flex items-center gap-1">
                                    Bhubaneswar, 751001
                                    <ChevronDown size={12} className="text-gray-400" />
                                </p>
                            </div>
                        </button>

                        {/* Search */}
                        <form onSubmit={handleSearch} className="flex-1 max-w-xl">
                            <div className="relative">
                                <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder='Search "milk, bread, eggs, fruits..."'
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-[#F4F5F7] rounded-xl pl-11 pr-4 py-2.5 text-sm font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:bg-white transition-all border border-[#E5E7EB] focus:border-[var(--brand-primary)]/30"
                                />
                            </div>
                        </form>

                        {/* Right Actions */}
                        <div className="flex items-center gap-1">
                            <Link
                                href="/categories"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-[var(--brand-primary-light)] hover:text-[var(--brand-primary)] transition"
                            >
                                <Tag size={15} />
                                Offers
                            </Link>
                            <Link
                                href="/account"
                                className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-semibold text-gray-600 hover:bg-[var(--brand-primary-light)] hover:text-[var(--brand-primary)] transition"
                            >
                                <User size={15} />
                                Account
                            </Link>
                            <Link
                                href="/cart"
                                className="relative flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold bg-[var(--brand-primary)] text-white hover:bg-[var(--brand-primary-dark)] transition ml-1 active:scale-[0.97]"
                                style={{ boxShadow: '0 3px 12px rgba(13,107,61,0.3)' }}
                            >
                                <ShoppingCart size={16} />
                                Cart
                                {itemCount > 0 && (
                                    <span className="absolute -top-1.5 -right-1.5 h-5 min-w-5 flex items-center justify-center rounded-full bg-[#F8E71C] text-[#1B1B1E] text-[10px] font-extrabold px-1.5 shadow-md animate-bounce-in">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Header */}
            <div className="lg:hidden">
                <div className="px-4 py-2.5">
                    {/* Top row: logo + delivery + cart */}
                    <div className="flex items-center justify-between mb-2">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="brand-mark" style={{ width: 34, height: 34 }}>
                                <ShoppingCart size={14} className="text-white" />
                            </div>
                            <div>
                                <span className="text-base font-extrabold" style={{ fontFamily: 'var(--font-brand)', color: 'var(--brand-primary)' }}>
                                    apna<span className="text-[#F8E71C] bg-[#0D6B3D] px-1 py-0.5 rounded-md ml-0.5 text-sm">bazar</span>
                                </span>
                            </div>
                        </Link>

                        <div className="flex items-center gap-2">
                            <Link
                                href="/account"
                                className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 transition"
                            >
                                <User size={17} />
                            </Link>
                            <Link
                                href="/cart"
                                className="relative w-9 h-9 rounded-xl bg-[var(--brand-primary)] flex items-center justify-center text-white active:scale-95 transition"
                                style={{ boxShadow: '0 2px 8px rgba(13,107,61,0.3)' }}
                            >
                                <ShoppingCart size={17} />
                                {itemCount > 0 && (
                                    <span className="absolute -top-1 -right-1 h-[18px] min-w-[18px] flex items-center justify-center rounded-full bg-[#F8E71C] text-[#1B1B1E] text-[9px] font-extrabold px-1 shadow-sm animate-bounce-in">
                                        {itemCount}
                                    </span>
                                )}
                            </Link>
                        </div>
                    </div>

                    {/* Delivery row */}
                    <button className="flex items-center gap-1.5 mb-2 text-left w-full">
                        <div className="w-6 h-6 rounded-md bg-[var(--brand-primary-light)] flex items-center justify-center flex-shrink-0">
                            <MapPin size={12} className="text-[var(--brand-primary)]" />
                        </div>
                        <span className="text-[11px] text-gray-500 font-medium">Deliver to ·</span>
                        <span className="text-[11px] font-bold text-gray-800">Bhubaneswar, 751001</span>
                        <span className="text-[11px] text-[var(--brand-primary)] font-bold ml-auto">Change</span>
                    </button>

                    {/* Search */}
                    <form onSubmit={handleSearch}>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                ref={searchRef}
                                type="text"
                                placeholder='Search "milk, bread, eggs..."'
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onFocus={() => setSearchOpen(true)}
                                className="w-full bg-[#F4F5F7] rounded-xl pl-9 pr-4 py-2.5 text-[13px] font-medium placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[var(--brand-primary)] focus:bg-white transition-all border border-[#E5E7EB] focus:border-[var(--brand-primary)]/30"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </header>
    );
}
