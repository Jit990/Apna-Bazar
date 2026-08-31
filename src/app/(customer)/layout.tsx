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
        <CartProvider>
            <LayoutInner>{children}</LayoutInner>
        </CartProvider>
    );
}
