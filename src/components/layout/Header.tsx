'use client';

import Link from 'next/link';
import { ChevronDown, MapPin, Mic, Search, ShoppingBag, User } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/context/CartContext';

export function Header() {
    const router = useRouter();
    const { itemCount } = useCart();
    const deliveryLocation = 'Home · Floor Ground, Bajkul 721655';

    const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const value = new FormData(event.currentTarget).get('q')?.toString().trim();
        if (value) router.push(`/search?q=${encodeURIComponent(value)}`);
    };

    return (
        <header className="customer-header sticky top-0 z-40">
            <div className="mx-auto max-w-7xl px-4 sm:px-6">
                <div className="flex h-14 items-center justify-between gap-4">
                    <Link href="/" className="flex shrink-0 items-center gap-2">
                        <span className="brand-mark"><ShoppingBag size={17} className="fill-white stroke-white" /></span>
                        <span className="font-brand text-xl font-black tracking-tight text-slate-950">Apna<span className="text-orange-500">Bazar</span></span>
                    </Link>

                    <button className="hidden min-w-0 items-center gap-2 rounded-xl px-2 py-1 text-left hover:bg-white/70 sm:flex">
                        <MapPin size={16} className="shrink-0 text-orange-500" />
                        <span className="min-w-0">
                            <span className="block text-[10px] font-black uppercase tracking-wider text-slate-500">Delivering to</span>
                            <span className="block max-w-[230px] truncate text-xs font-bold text-slate-900">{deliveryLocation}</span>
                        </span>
                        <ChevronDown size={14} className="shrink-0 text-slate-500" />
                    </button>

                    <div className="ml-auto flex items-center gap-2">
                        <Link href="/cart" className="relative rounded-xl p-2 text-emerald-900 hover:bg-white/70">
                            <ShoppingBag size={21} />
                            {itemCount > 0 && <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white">{itemCount > 99 ? '99+' : itemCount}</span>}
                        </Link>
                        <Link href="/account" className="rounded-xl p-2 text-emerald-900 hover:bg-white/70"><User size={21} /></Link>
                    </div>
                </div>

                <div className="pb-3">
                    <form onSubmit={handleSearch} className="relative">
                        <Search size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                        <input name="q" type="search" placeholder='Search for "milk, chips, shampoo..."' className="h-11 w-full rounded-xl border border-slate-200 bg-white pl-10 pr-11 text-sm font-medium text-slate-900 outline-none shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100" />
                        <button type="button" className="absolute right-1.5 top-1/2 -translate-y-1/2 rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-emerald-700" aria-label="Voice search"><Mic size={17} /></button>
                    </form>
                </div>
            </div>
        </header>
    );
}