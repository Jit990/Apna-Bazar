'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3X3, Search, ShoppingBag, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useCart } from '@/context/CartContext';

export function MobileNav() {
    const pathname = usePathname();
    const { itemCount } = useCart(); // Use real context

    const navItems = [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Categories', href: '/categories', icon: Grid3X3 },
        { label: 'Search', href: '/search', icon: Search },
        { label: 'Cart', href: '/cart', icon: ShoppingBag, isCart: true },
        { label: 'Account', href: '/account', icon: User },
    ];

    return (
        <nav className="fixed bottom-0 left-0 right-0 lg:hidden bg-white border-t border-gray-100 pb-safe z-50 shadow-[0_-2px_10px_rgba(0,0,0,0.02)]">
            <div className="flex justify-around items-center h-14">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative',
                                isActive ? 'text-[#1A7850]' : 'text-gray-400 hover:text-gray-600'
                            )}
                        >
                            <div className="relative">
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} className={cn(isActive && "fill-[#1A7850]/10")} />
                                {item.isCart && itemCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 h-[18px] min-w-[18px] bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center px-1 border-2 border-white shadow-sm">
                                        {itemCount > 99 ? '99+' : itemCount}
                                    </span>
                                )}
                            </div>
                            <span className={cn("text-[10px] font-medium leading-none", isActive && "font-bold text-[#1A7850]")}>
                                {item.label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
