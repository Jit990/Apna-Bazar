'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Grid3X3, Search, ClipboardList, User } from 'lucide-react';

const navItems = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/categories', label: 'Categories', icon: Grid3X3 },
    { href: '/search', label: 'Search', icon: Search },
    { href: '/orders', label: 'Orders', icon: ClipboardList },
    { href: '/account', label: 'Account', icon: User },
];

export function MobileNav() {
    const pathname = usePathname();

    return (
        <nav className="mobile-nav lg:hidden">
            <div className="flex items-stretch justify-around">
                {navItems.map(({ href, label, icon: Icon }) => {
                    const isActive =
                        href === '/'
                            ? pathname === '/'
                            : pathname.startsWith(href);

                    return (
                        <Link
                            key={href}
                            href={href}
                            className={`mobile-nav-item flex-1 ${isActive ? 'active' : ''}`}
                        >
                            <div className={`relative flex items-center justify-center transition-all duration-200 ${isActive ? '' : ''}`}>
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-200 ${isActive ? 'bg-[var(--brand-primary)] shadow-sm' : ''}`}>
                                    <Icon
                                        size={18}
                                        strokeWidth={isActive ? 2.5 : 1.8}
                                        className={`transition-colors duration-200 ${isActive ? 'text-white' : 'text-gray-400'}`}
                                    />
                                </div>
                            </div>
                            <span className={`text-[10px] mt-0.5 transition-colors duration-200 ${isActive ? 'font-bold text-[var(--brand-primary)]' : 'font-semibold text-gray-400'}`}>
                                {label}
                            </span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}
