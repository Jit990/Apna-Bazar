'use client';

import Link from 'next/link';
import { Search, ShoppingCart, Bell, MapPin, ChevronDown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useState } from 'react';

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

    return (
        <header className="sticky top-0 z-40 bg-primary shadow-md safe-top">
            {/* Top bar */}
            <div className="px-3 py-2.5 flex items-center gap-3">
                {/* Logo */}
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

                {/* Delivery location */}
                <button
                    className="flex-1 min-w-0 flex items-center gap-1 ml-1"
                    aria-label="Change delivery location"
                >
                    <MapPin size={14} className="text-emerald-100 flex-shrink-0" />
                    <div className="min-w-0 flex flex-col items-start">
                        <div className="text-emerald-100 text-[10px] leading-none">Delivering to</div>
                        <div className="text-white font-semibold text-sm flex items-center gap-0.5 truncate">
                            <span className="truncate">{deliveryLocation}</span>
                            <ChevronDown size={12} />
                        </div>
                    </div>
                </button>

                {/* Actions */}
                <div className="flex items-center gap-2.5">
                    {/* Search icon */}
                    <button
                        className="text-white p-1"
                        onClick={() => setSearchOpen(!searchOpen)}
                        aria-label="Toggle search"
                    >
                        {searchOpen ? <X size={20} /> : <Search size={20} />}
                    </button>

                    {/* Notifications */}
                    {isLoggedIn && (
                        <Link href="/account/notifications" className="relative text-white p-1" aria-label="Notifications">
                            <Bell size={20} />
                            {notificationCount > 0 && (
                                <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-white text-primary text-[9px] font-black rounded-full flex items-center justify-center">
                                    {notificationCount > 9 ? '9+' : notificationCount}
                                </span>
                            )}
                        </Link>
                    )}

                    {/* Cart */}
                    <Link
                        href="/cart"
                        className="relative text-white p-1"
                        aria-label={`Cart${cartCount > 0 ? `, ${cartCount} items` : ''}`}
                    >
                        <ShoppingCart size={22} />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 h-4 w-4 bg-white text-primary text-[9px] font-black rounded-full flex items-center justify-center">
                                {cartCount > 99 ? '99+' : cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* Search bar — expands below header */}
            <div
                className={cn(
                    'overflow-hidden transition-all duration-300',
                    searchOpen ? 'max-h-16 opacity-100' : 'max-h-0 opacity-0'
                )}
            >
                <div className="px-3 pb-2.5">
                    <form action="/search" method="GET">
                        <div className="relative">
                            <Search
                                size={16}
                                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                            />
                            <input
                                id="header-search"
                                name="q"
                                type="search"
                                placeholder="Search jewelry, cosmetics, gifts..."
                                className="w-full bg-white rounded-xl pl-9 pr-4 py-2.5 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-white/50"
                                autoComplete="off"
                            />
                        </div>
                    </form>
                </div>
            </div>
        </header>
    );
}
