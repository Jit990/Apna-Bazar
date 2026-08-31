'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3X3, Search, ShoppingCart, User } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { label: 'Home', href: '/', icon: Home },
    { label: 'Categories', href: '/categories', icon: Grid3X3 },
    { label: 'Search', href: '/search', icon: Search },
    { label: 'Cart', href: '/cart', icon: ShoppingCart, isCart: true },
    { label: 'Account', href: '/account', icon: User },
];

interface MobileNavProps {
    cartCount?: number;
}

export function MobileNav({ cartCount = 0 }: MobileNavProps) {
    const pathname = usePathname();

    return (
        <nav
            className="mobile-nav"
            aria-label="Main navigation"
        >
            <div className="flex items-stretch">
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));

                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'mobile-nav-item flex-1',
                                isActive && 'active'
                            )}
                            aria-label={item.label}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <span className="relative">
                                <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
                                {item.isCart && cartCount > 0 && (
                                    <span className="absolute -top-1.5 -right-2 h-4 w-4 bg-[#C41E3A] text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                                        {cartCount > 99 ? '99+' : cartCount}
                                    </span>
                                )}
                            </span>
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
