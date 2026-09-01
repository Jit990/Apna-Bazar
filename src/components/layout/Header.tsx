'use client';

import Link from 'next/link';
import { Search, ShoppingBag, User, ChevronDown, Mic, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
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
        <header className="sticky top-0 z-40 bg-white pb-3 rounded-b-xl shadow-[0_2px_10px_rgba(0,0,0,0.03)] border-b border-gray-100">
            {/* Top Row: Logo, ETA, Account */}
            <div className="flex items-start justify-between px-4 pt-3 pb-2">
                <div className="flex flex-col gap-1">
                    {/* Fake Logo equivalent to the screenshot */}
                    <div className="flex items-center gap-1.5">
                        <div className="text-orange-500">
                            <ShoppingBag size={20} className="fill-orange-500 stroke-orange-500" />
                        </div>
                        <h1 className="font-brand font-black text-xl tracking-tight leading-none flex gap-1">
                            <span className="text-[#1A7850]">Apna</span>
                            <span className="text-orange-500">Bazar</span>
                        </h1>
                    </div>
                    {/* Time & Surge Badges */}
                    <div className="flex items-center gap-2 mt-1.5">
                        <h2 className="font-black text-2xl tracking-tighter text-gray-900 leading-none">18 minutes</h2>
                        <div className="bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded flex items-center gap-1 shadow-sm border border-emerald-100">
                            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                            <span className="text-[9px] font-bold uppercase tracking-wider">Surge applicable</span>
                        </div>
                    </div>

                    {/* Location Selector (matches the screenshot placement) */}
                    <button className="flex items-center gap-1 mt-1 hover:opacity-80 active:opacity-60 transition-opacity">
                        <span className="text-[11px] font-bold text-gray-800 uppercase">HOME</span>
                        <span className="text-[11px] text-gray-500">- {deliveryLocation}</span>
                        <ChevronDown size={14} className="text-gray-500" />
                    </button>
                </div>

                {/* Profile / Wallet Actions */}
                <div className="flex items-center gap-3">
                    {/* Fake Wallet */}
                    <Link href="/account" className="flex items-center gap-1 bg-yellow-50/50 border border-yellow-200/50 px-2 py-1 rounded-full hover:bg-yellow-100/50 transition-colors">
                        <span className="text-yellow-600 text-[10px] font-black tracking-tight">₹0</span>
                    </Link>
                    {/* Profile Icon */}
                    <Link href="/account" className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors border border-gray-200 shadow-inner">
                        <User size={20} className="text-gray-600" />
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
                        className="block w-full pl-10 pr-10 py-3.5 bg-white border border-gray-200 rounded-2xl text-sm font-medium outline-none placeholder-gray-400 focus:ring-1 focus:ring-gray-200 focus:border-gray-300 shadow-[0_2px_8px_rgba(0,0,0,0.04)]"
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
                    <Link href="/cart" className="relative">
                        <ShoppingBag size={24} className="text-gray-800" />
                        {itemCount > 0 && <span className="absolute -top-1.5 -right-2 h-5 min-w-[20px] bg-red-500 text-white text-[10px] items-center justify-center rounded-full flex font-bold">{itemCount > 99 ? '99+' : itemCount}</span>}
                    </Link>
                    <Link href="/account">
                        <User size={24} className="text-gray-800" />
                    </Link>
                </div>
            </div>
        </header>
    );
}
