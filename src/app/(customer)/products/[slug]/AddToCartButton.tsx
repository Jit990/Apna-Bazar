'use client';

import { ShoppingCart } from 'lucide-react';
import { formatPrice } from '@/lib/utils';

interface AddToCartButtonProps {
    productName: string;
    price: number;
    inStock: boolean;
}

export function AddToCartButton({ productName, price, inStock }: AddToCartButtonProps) {
    return (
        <div className="fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-gray-200 px-4 py-3 flex items-center gap-3 safe-bottom">
            <div className="flex-1">
                <div className="text-lg font-black text-gray-900">{formatPrice(price)}</div>
                <div className="text-[10px] text-gray-500 truncate">{productName}</div>
            </div>
            <button
                disabled={!inStock}
                className="btn-primary flex items-center gap-2 px-6 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <ShoppingCart size={16} />
                {inStock ? 'Add to Cart' : 'Out of Stock'}
            </button>
        </div>
    );
}
