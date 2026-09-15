'use client';

import { CartProvider } from '@/context/CartContext';
import { Header } from '@/components/layout/Header';
import { MobileNav } from '@/components/layout/MobileNav';

function LayoutInner({ children }: { children: React.ReactNode }) {
    return (
        <>
            <Header />
            <main className="has-bottom-nav min-h-screen bg-[var(--surface-bg)]">{children}</main>
            <MobileNav />
        </>
    );
}

export default function CustomerLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="customer-shell min-h-screen">
            <div className="customer-frame mx-auto min-h-[100dvh] relative">
                <CartProvider>
                    <LayoutInner>{children}</LayoutInner>
                </CartProvider>
            </div>
        </div>
    );
}
