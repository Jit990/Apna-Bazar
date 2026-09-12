'use client';

import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';
import { useCart } from '@/context/CartContext';

function LayoutInner({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="pb-16 min-h-screen">{children}</main>
            <MobileNav />
        </>
    );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="customer-shell min-h-screen">
            <div className="customer-frame mx-auto min-h-[100dvh] relative overflow-hidden">
                <CartProvider>
                    <LayoutInner>{children}</LayoutInner>
                </CartProvider>
            </div>
        </div>
    );
}
