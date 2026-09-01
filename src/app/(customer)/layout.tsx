'use client';

import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { useCart } from '@/context/CartContext';

function LayoutInner({ children }: { children: React.ReactNode }) {
    const { itemCount } = useCart();
    return (
        <>
            <Header cartCount={itemCount} />
            <main className="has-bottom-nav min-h-screen">{children}</main>
            <MobileNav cartCount={itemCount} />
        </>
    );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="bg-gray-100 sm:bg-gray-200 min-h-screen">
            <div className="mx-auto max-w-md sm:max-w-md lg:max-w-full min-h-[100dvh] relative bg-gray-50 shadow-2xl sm:my-0 lg:my-0 sm:rounded-none lg:rounded-none overflow-hidden">
                <CartProvider>
                    <LayoutInner>{children}</LayoutInner>
                </CartProvider>
            </div>
        </div>
    );
}

