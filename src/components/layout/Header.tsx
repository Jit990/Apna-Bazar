'use client';

import Link from 'next/link';
import { Search, ShoppingBag, User, ChevronDown, Mic, MapPin, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export function Header() {
    const router = useRouter();
    const { itemCount } = useCart();
    // Default mock data tailored to typical Qcommerce metrics pending backend configuration
    const deliveryLocation = 'Floor Ground, Bajkul 721655';

    const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const fd = new FormData(e.currentTarget);
        const q = fd.get('q');
        if (q) {
            router.push(`/search?q=${encodeURIComponent(q.toString())}`);
        }
    };

    return (
        <header className="customer-header sticky top-0 z-40 pb-4">
            {/* Top Row: Logo, ETA, Account */}
            <div className="flex items-start justify-between px-4 pt-3 pb-2">
                <div className="flex flex-col gap-1">
                    {/* Fake Logo equivalent to the screenshot */}
                    <div className="flex items-center gap-1.5">
                        <div className="brand-mark">
                            <ShoppingBag size={19} className="fill-white stroke-white" />
                        </div>
                        <h1 className="font-brand font-black text-xl tracking-tight leading-none flex gap-1">
                            <span className="text-emerald-950">Apna</span>
                            <span className="text-orange-500">Bazar</span>
                        </h1>
                    </div>
                    {/* Time & Surge Badges */}
                    <div className="flex items-center gap-2 mt-1.5">
                        <h2 className="font-black text-2xl tracking-tighter text-slate-950 leading-none">18 min</h2>
                        <div className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full flex items-center gap-1 border border-emerald-200">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[9px] font-black uppercase tracking-wider">Live delivery</span>
                        </div>
                    </div>

                    {/* Location Selector (matches the screenshot placement) */}
                    <button className="flex items-center gap-1 mt-1 hover:opacity-80 active:opacity-60 transition-opacity">
                        <MapPin size={13} className="text-orange-500" />
                        <span className="text-[11px] font-bold text-slate-800 uppercase">HOME</span>
                        <span className="text-[11px] text-slate-500">· {deliveryLocation}</span>
                        <ChevronDown size={14} className="text-gray-500" />
                    </button>
                </div>

                {/* Profile / Wallet Actions */}
                <div className="flex items-center gap-3">
                    {/* Fake Wallet */}
                    <Link href="/account" className="hidden sm:flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
                        <Sparkles size={12} className="text-amber-500" />
                        <span className="text-amber-700 text-[10px] font-black tracking-tight">₹0 credits</span>
                    </Link>
                    {/* Profile Icon */}
                    <Link href="/account" className="w-10 h-10 bg-white/80 rounded-full flex items-center justify-center hover:bg-white transition-colors border border-white shadow-sm">
                        <User size={19} className="text-emerald-900" />
                    </Link>
                </div>
            </div>

            {/* Desktop Wrapper (Hidden on mobile entirely as we built a dedicated mobile first layout) */}
            <div className="px-4 lg:hidden">
                <form onSubmit={handleSearch} className="relative mt-1">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-900 stroke-[2.5]" />
                    </div>
                    <input
                        name="q"
                        type="search"
                        placeholder='Search "kurkure, shampoo, milk..."'
                        className="customer-search block w-full pl-10 pr-10 py-3.5 bg-white/95 border border-white rounded-2xl text-sm font-medium outline-none placeholder-slate-400 focus:ring-2 focus:ring-orange-200 focus:border-orange-300 shadow-[0_8px_24px_rgba(15,23,42,0.08)]"
                    />
                    <button type="button" className="absolute inset-y-0 right-0 pr-3 flex items-center group">
                        <div className="bg-gray-50 p-1.5 rounded-full border border-gray-200 group-hover:bg-gray-100 transition-colors">
                            <Mic size={14} className="text-gray-600" />
                        </div>
                    </button>
                </form>
            </div>

            {/* Desktop Fallback */}
            <div className="hidden lg:flex items-center justify-between px-8 pt-4 pb-2">
                <div className="flex items-center gap-2">
                    <h1 className="font-brand font-black text-3xl tracking-tight leading-none flex gap-1">
                        <span className="text-[#1A7850]">Apna</span>
                        <span className="text-orange-500">Bazar</span>
                    </h1>
                </div>
                <form onSubmit={handleSearch} className="relative w-[500px]">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                        <Search size={18} className="text-gray-900 stroke-[2.5]" />
                    </div>
                    <input name="q" type="search" placeholder='Search "kurkure, shampoo, milk..."' className="block w-full pl-10 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none placeholder-gray-400 focus:border-gray-300 shadow-sm" />
                </form>
                <div className="flex items-center gap-6">
                    <Link href="/cart" className="relative p-2 rounded-xl hover:bg-white/60">
                        <ShoppingBag size={24} className="text-emerald-900" />
                        {itemCount > 0 && <span className="absolute -top-1.5 -right-2 h-5 min-w-[20px] bg-red-500 text-white text-[10px] items-center justify-center rounded-full flex font-bold">{itemCount > 99 ? '99+' : itemCount}</span>}
                    </Link>
                    <Link href="/account" className="p-2 rounded-xl hover:bg-white/60">
                        <User size={24} className="text-emerald-900" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
