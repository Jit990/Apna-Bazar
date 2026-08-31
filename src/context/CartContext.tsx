'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { Product } from '@/types';

export interface CartItemLocal {
    product_id: string;
    variant_id?: string | null;
    quantity: number;
    unit_price: number;
    product: {
        id: string;
        name: string;
        slug: string;
        price: number;
        mrp: number;
        stock_quantity: number;
        stock_status: string;
        image_url?: string;
        brand?: string | null;
    };
}

interface CartContextType {
    items: CartItemLocal[];
    itemCount: number;
    subtotal: number;
    addToCart: (product: Product, quantity?: number) => void;
    removeFromCart: (productId: string) => void;
    updateQuantity: (productId: string, quantity: number) => void;
    clearCart: () => void;
    getItemQuantity: (productId: string) => number;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_STORAGE_KEY = 'apna_bazar_cart';

function loadCart(): CartItemLocal[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveCart(items: CartItemLocal[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItemLocal[]>([]);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setItems(loadCart());
        setLoaded(true);
    }, []);

    useEffect(() => {
        if (loaded) saveCart(items);
    }, [items, loaded]);

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

    const addToCart = useCallback((product: Product, quantity = 1) => {
        if (product.stock_status === 'out_of_stock') {
            toast.error('This product is out of stock');
            return;
        }
        const primaryImg = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
        setItems((prev) => {
            const existing = prev.find((i) => i.product_id === product.id);
            if (existing) {
                const newQty = existing.quantity + quantity;
                if (newQty > product.stock_quantity) {
                    toast.error(`Only ${product.stock_quantity} available`);
                    return prev;
                }
                if (newQty <= 0) return prev.filter((i) => i.product_id !== product.id);
                return prev.map((i) =>
                    i.product_id === product.id ? { ...i, quantity: newQty } : i
                );
            }
            toast.success(`${product.name} added to cart`);
            return [
                ...prev,
                {
                    product_id: product.id,
                    variant_id: null,
                    quantity,
                    unit_price: product.price,
                    product: {
                        id: product.id,
                        name: product.name,
                        slug: product.slug,
                        price: product.price,
                        mrp: product.mrp,
                        stock_quantity: product.stock_quantity,
                        stock_status: product.stock_status,
                        image_url: primaryImg?.url,
                        brand: product.brand,
                    },
                },
            ];
        });
    }, []);

    const removeFromCart = useCallback((productId: string) => {
        setItems((prev) => prev.filter((i) => i.product_id !== productId));
        toast('Item removed from cart');
    }, []);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        if (quantity <= 0) {
            setItems((prev) => prev.filter((i) => i.product_id !== productId));
            return;
        }
        setItems((prev) =>
            prev.map((i) => {
                if (i.product_id !== productId) return i;
                if (quantity > i.product.stock_quantity) {
                    toast.error(`Only ${i.product.stock_quantity} available`);
                    return i;
                }
                return { ...i, quantity };
            })
        );
    }, []);

    const clearCart = useCallback(() => {
        setItems([]);
    }, []);

    const getItemQuantity = useCallback(
        (productId: string) => items.find((i) => i.product_id === productId)?.quantity ?? 0,
        [items]
    );

    return (
        <CartContext.Provider
            value={{ items, itemCount, subtotal, addToCart, removeFromCart, updateQuantity, clearCart, getItemQuantity }}
        >
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
