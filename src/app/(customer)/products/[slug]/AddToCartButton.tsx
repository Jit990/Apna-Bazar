'use client';

import { ShoppingCart, Minus, Plus } from 'lucide-react';
import { formatPrice } from '@/lib/utils';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';

interface AddToCartButtonProps {
    product: Product;
}

export function AddToCartButton({ product }: AddToCartButtonProps) {
    const { addToCart, updateQuantity, getItemQuantity } = useCart();

    const quantity = getItemQuantity(product.id);
    const inStock = product.stock_status !== 'out_of_stock' && product.stock_quantity > 0;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-3 pb-8 md:pb-3 flex flex-row items-center gap-3 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] mx-auto" style={{ maxWidth: '28rem' }}>
            <div className="flex-1">
                <div className="text-lg font-black text-gray-900">{formatPrice(product.price)}</div>
                <div className="text-[10px] text-gray-500 truncate">{product.name}</div>
            </div>

            {quantity > 0 ? (
                <div className="flex items-center gap-3 bg-green-50 border border-green-200 text-primary rounded-xl px-2 py-1">
                    <button
                        onClick={() => updateQuantity(product.id, quantity - 1)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-green-200 shadow-sm active:scale-95"
                    >
                        <Minus size={16} />
                    </button>
                    <span className="font-bold w-4 text-center">{quantity}</span>
                    <button
                        onClick={() => updateQuantity(product.id, quantity + 1)}
                        disabled={quantity >= product.stock_quantity}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white border border-green-200 shadow-sm active:scale-95 disabled:opacity-50"
                    >
                        <Plus size={16} />
                    </button>
                </div>
            ) : (
                <button
                    onClick={() => addToCart(product)}
                    disabled={!inStock}
                    className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed text-base font-bold"
                >
                    <ShoppingCart size={16} />
                    {inStock ? 'Add to Cart' : 'Out of Stock'}
                </button>
            )}
        </div>
    );
}
