'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus, Minus } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import type { Product } from '@/types';
import { formatPrice, calculateDiscount } from '@/lib/utils';
import { useState } from 'react';

interface ProductCardProps {
    product: Product;
    compact?: boolean;
}

export function ProductCard({ product, compact }: ProductCardProps) {
    const { addToCart, removeFromCart, updateQuantity, getItemQuantity } = useCart();
    const quantity = getItemQuantity(product.id);
    const discount = calculateDiscount(product.mrp, product.price);
    const isOutOfStock = product.stock_status === 'out_of_stock';
    const [imgError, setImgError] = useState(false);

    const primaryImage = product.images?.find((img) => img.is_primary)?.url
        ?? product.images?.[0]?.url
        ?? null;

    const handleAdd = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isOutOfStock) return;
        addToCart(product, 1);
    };

    const handleIncrease = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        addToCart(product, 1);
    };

    const handleDecrease = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (quantity <= 1) {
            removeFromCart(product.id);
        } else {
            updateQuantity(product.id, quantity - 1);
        }
    };

    return (
        <Link href={`/products/${product.slug}`} className="product-card group">
            {/* Image */}
            <div className="product-card-image">
                {primaryImage && !imgError ? (
                    <Image
                        src={primaryImage}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-contain p-3 group-hover:scale-105 transition-transform duration-300"
                        onError={() => setImgError(true)}
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
                        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1">
                            <rect x="3" y="3" width="18" height="18" rx="2" />
                            <circle cx="8.5" cy="8.5" r="1.5" />
                            <path d="M21 15l-5-5L5 21" />
                        </svg>
                    </div>
                )}

                {/* Discount badge – Blinkit style blue */}
                {discount > 0 && (
                    <div className="absolute top-2 left-2 bg-[#3B82F6] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-md shadow-sm">
                        {discount}% OFF
                    </div>
                )}

                {/* Stock badges */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-white/75 backdrop-blur-[2px] flex items-center justify-center">
                        <span className="bg-gray-800 text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full">
                            Out of Stock
                        </span>
                    </div>
                )}
                {product.stock_status === 'low_stock' && !isOutOfStock && (
                    <div className="absolute top-2 right-2 bg-amber-500 text-white text-[9px] font-bold px-2 py-0.5 rounded-md shadow-sm">
                        Few left
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="product-card-body">
                {/* Delivery time tag – Blinkit signature */}
                <div className="flex items-center gap-1 mb-0.5">
                    <span className="inline-flex items-center text-[9px] font-bold text-[#0D6B3D] bg-[#E8F5EE] px-1.5 py-0.5 rounded">
                        ⚡ 10 MINS
                    </span>
                </div>

                {/* Brand */}
                {product.brand && (
                    <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider truncate">
                        {product.brand}
                    </p>
                )}

                {/* Name */}
                <h3 className="text-[13px] font-semibold text-gray-800 leading-tight line-clamp-2 min-h-[36px]">
                    {product.name}
                </h3>

                {/* Unit/Weight */}
                {product.weight_grams && (
                    <p className="text-[11px] text-gray-400 font-medium">
                        {product.weight_grams >= 1000 ? `${(product.weight_grams / 1000).toFixed(product.weight_grams % 1000 === 0 ? 0 : 1)} kg` : `${product.weight_grams} g`}
                    </p>
                )}

                {/* Price + cart */}
                <div className="flex items-end justify-between mt-auto pt-2">
                    <div>
                        <span className="text-base font-bold text-gray-900" style={{ fontFamily: 'var(--font-brand)' }}>
                            {formatPrice(product.price)}
                        </span>
                        {discount > 0 && (
                            <span className="ml-1.5 text-[11px] text-gray-400 line-through">
                                {formatPrice(product.mrp)}
                            </span>
                        )}
                    </div>

                    {/* Cart controls – Blinkit green style */}
                    {!isOutOfStock && (
                        <div>
                            {quantity === 0 ? (
                                <button
                                    onClick={handleAdd}
                                    className="h-8 px-3 rounded-lg border-2 border-[var(--brand-primary)] text-[var(--brand-primary)] bg-white flex items-center justify-center hover:bg-[var(--brand-primary)] hover:text-white transition-all active:scale-90 font-bold text-xs gap-1"
                                    aria-label={`Add ${product.name} to cart`}
                                >
                                    ADD <Plus size={14} strokeWidth={3} />
                                </button>
                            ) : (
                                <div className="qty-selector">
                                    <button onClick={handleDecrease} className="qty-btn" aria-label="Decrease quantity">
                                        <Minus size={14} strokeWidth={3} />
                                    </button>
                                    <span className="text-sm font-bold min-w-[20px] text-center">{quantity}</span>
                                    <button onClick={handleIncrease} className="qty-btn" aria-label="Increase quantity">
                                        <Plus size={14} strokeWidth={3} />
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </Link>
    );
}
