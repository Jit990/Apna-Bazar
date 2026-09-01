'use client';

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { toast } from 'sonner';
import type { Product } from '@/types';
import { createClient } from '@/lib/supabase/client';
import { getDbCart, syncLocalToDbCart, updateDbCartItem, clearDbCart } from '@/app/actions/cart';

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
        [key: string]: any;
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

function loadLocalCart(): CartItemLocal[] {
    if (typeof window === 'undefined') return [];
    try {
        const stored = localStorage.getItem(CART_STORAGE_KEY);
        return stored ? JSON.parse(stored) : [];
    } catch {
        return [];
    }
}

function saveLocalCart(items: CartItemLocal[]) {
    if (typeof window === 'undefined') return;
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItemLocal[]>([]);
    const [loaded, setLoaded] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    const supabase = createClient();

    // Init and listen to auth changes
    useEffect(() => {
        let mounted = true;

        const initializeCart = async (authed: boolean) => {
            if (authed) {
                // User logged in: Sync local items first, then fetch DB cart
                const localItems = loadLocalCart();
                if (localItems.length > 0) {
                    await syncLocalToDbCart(localItems);
                    localStorage.removeItem(CART_STORAGE_KEY); // wipe local after sync
                }
                const dbItems = await getDbCart();
                if (mounted && dbItems) {
                    // map DB items format back to local memory format for consistency
                    const mapped = dbItems.map((dbItem: any) => ({
                        product_id: dbItem.product_id,
                        quantity: dbItem.quantity,
                        unit_price: dbItem.unit_price,
                        product: {
                            id: dbItem.product.id,
                            name: dbItem.product.name,
                            slug: dbItem.product.slug,
                            price: dbItem.product.price,
                            mrp: dbItem.product.mrp,
                            stock_quantity: dbItem.product.stock_quantity,
                            stock_status: dbItem.product.stock_status,
                            image_url: dbItem.product.product_images?.[0]?.url,
                        }
                    }));
                    setItems(mapped);
                }
            } else {
                // Guest
                setItems(loadLocalCart());
            }
            if (mounted) setLoaded(true);
        };

        const checkAuth = async () => {
            const { data } = await supabase.auth.getSession();
            const authed = !!data.session;
            if (mounted) setIsLoggedIn(authed);
            initializeCart(authed);
        };

        checkAuth();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                setIsLoggedIn(true);
                initializeCart(true);
            } else if (event === 'SIGNED_OUT') {
                setIsLoggedIn(false);
                setItems([]); // Clear cart entirely to prevent showing someone else's cart
                localStorage.removeItem(CART_STORAGE_KEY);
            }
        });

        return () => {
            mounted = false;
            subscription.unsubscribe();
        };
    }, []);

    // Sync non-logged in user cart automatically to storage
    useEffect(() => {
        if (loaded && !isLoggedIn) {
            saveLocalCart(items);
        }
    }, [items, loaded, isLoggedIn]);

    const itemCount = items.reduce((sum, i) => sum + i.quantity, 0);
    const subtotal = items.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);

    const addToCart = useCallback(async (product: Product, quantity = 1) => {
        if (product.stock_status === 'out_of_stock') {
            toast.error('This product is out of stock');
            return;
        }

        const primaryImg = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
        let finalizedQty = quantity;

        // Optimistic UI update
        setItems((prev) => {
            const existing = prev.find((i) => i.product_id === product.id);
            if (existing) {
                const newQty = existing.quantity + quantity;
                if (newQty > product.stock_quantity) {
                    toast.error(`Only ${product.stock_quantity} available`);
                    finalizedQty = 0; // stop DB update
                    return prev;
                }
                finalizedQty = newQty;
                if (newQty <= 0) return prev.filter((i) => i.product_id !== product.id);
                return prev.map((i) => i.product_id === product.id ? { ...i, quantity: newQty } : i);
            }
            toast.success(`${product.name} added to cart`);
            finalizedQty = quantity;
            return [...prev, {
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
            }];
        });

        // Background sync if logged in
        if (isLoggedIn && finalizedQty !== 0) {
            updateDbCartItem(product.id, finalizedQty).catch(err => console.error('Cart sync error:', err));
        }
    }, [isLoggedIn]);

    const removeFromCart = useCallback((productId: string) => {
        setItems((prev) => prev.filter((i) => i.product_id !== productId));
        if (isLoggedIn) {
            updateDbCartItem(productId, 0).catch(err => console.error('Cart sync error:', err));
        }
        toast('Item removed from cart');
    }, [isLoggedIn]);

    const updateQuantity = useCallback((productId: string, quantity: number) => {
        let shouldUpdateDb = false;
        if (quantity <= 0) {
            setItems((prev) => prev.filter((i) => i.product_id !== productId));
            shouldUpdateDb = true;
        } else {
            setItems((prev) =>
                prev.map((i) => {
                    if (i.product_id !== productId) return i;
                    if (quantity > i.product.stock_quantity) {
                        toast.error(`Only ${i.product.stock_quantity} available`);
                        return i;
                    }
                    shouldUpdateDb = true;
                    return { ...i, quantity };
                })
            );
        }

        if (isLoggedIn && shouldUpdateDb) {
            updateDbCartItem(productId, quantity).catch(err => console.error('Cart sync error:', err));
        }
    }, [isLoggedIn]);

    const clearCart = useCallback(() => {
        setItems([]);
        if (isLoggedIn) {
            clearDbCart().catch(err => console.error('Cart sync error:', err));
        } else {
            localStorage.removeItem(CART_STORAGE_KEY);
        }
    }, [isLoggedIn]);

    const getItemQuantity = useCallback(
        (productId: string) => items.find((i) => i.product_id === productId)?.quantity ?? 0,
        [items]
    );

    return (
        <CartContext.Provider value={{ items, itemCount, subtotal, addToCart, removeFromCart, updateQuantity, clearCart, getItemQuantity }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const ctx = useContext(CartContext);
    if (!ctx) throw new Error('useCart must be used within CartProvider');
    return ctx;
}
