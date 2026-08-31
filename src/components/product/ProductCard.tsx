'use client';

import Image from 'next/image';
import Link from 'next/link';
import { ShoppingCart, Heart, Star } from 'lucide-react';
import { cn, formatPrice, calculateDiscount } from '@/lib/utils';
import type { Product } from '@/types';
import { useState } from 'react';

interface ProductCardProps {
    product: Product;
    onAddToCart?: (product: Product, quantity: number) => void;
    onWishlist?: (product: Product) => void;
    isWishlisted?: boolean;
    className?: string;
}

export function ProductCard({
    product,
    onAddToCart,
    onWishlist,
    isWishlisted = false,
    className,
}: ProductCardProps) {
    const [quantity, setQuantity] = useState(0);
    const [wishlisted, setWishlisted] = useState(isWishlisted);

    const primaryImage = product.images?.find((i) => i.is_primary) ?? product.images?.[0];
    const discount = calculateDiscount(product.mrp, product.price);
    const isOutOfStock = product.stock_status === 'out_of_stock';
    const isLowStock = product.stock_status === 'low_stock';

    const handleAdd = () => {
        const newQty = 1;
        setQuantity(newQty);
        onAddToCart?.(product, newQty);
    };

    const handleIncrease = () => {
        if (quantity >= product.stock_quantity) return;
        const newQty = quantity + 1;
        setQuantity(newQty);
        onAddToCart?.(product, newQty);
    };

    const handleDecrease = () => {
        if (quantity <= 1) {
            setQuantity(0);
            onAddToCart?.(product, 0);
            return;
        }
        const newQty = quantity - 1;
        setQuantity(newQty);
        onAddToCart?.(product, newQty);
    };

    const handleWishlist = (e: React.MouseEvent) => {
        e.preventDefault();
        setWishlisted(!wishlisted);
        onWishlist?.(product);
    };

    return (
        <article className={cn('product-card group', className)}>
            {/* Image */}
            <div className="product-card-image">
                <Link href={`/products/${product.slug}`} tabIndex={-1}>
                    {primaryImage ? (
                        <Image
                            src={primaryImage.url}
                            alt={primaryImage.alt_text ?? product.name}
                            fill
                            className={cn(
                                'object-cover transition-transform duration-300 group-hover:scale-105',
                                isOutOfStock && 'opacity-60'
                            )}
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-red-50 to-orange-50 flex items-center justify-center">
                            <ShoppingCart size={32} className="text-gray-300" />
                        </div>
                    )}
                </Link>

                {/* Badges */}
                <div className="absolute top-2 left-2 flex flex-col gap-1">
                    {discount > 0 && (
                        <span className="badge-discount text-[10px] px-1.5 py-0.5">{discount}% OFF</span>
                    )}
                    {product.is_new_arrival && (
                        <span className="badge bg-blue-600 text-white text-[10px] px-1.5 py-0.5">New</span>
                    )}
                    {product.is_bestseller && (
                        <span className="badge bg-orange-500 text-white text-[10px] px-1.5 py-0.5">Bestseller</span>
                    )}
                </div>

                {/* Wishlist */}
                <button
                    className="absolute top-2 right-2 p-1.5 rounded-full bg-white/80 backdrop-blur-sm shadow-sm hover:bg-white transition-all duration-200"
                    onClick={handleWishlist}
                    aria-label={wishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                >
                    <Heart
                        size={14}
                        className={cn('transition-colors', wishlisted ? 'fill-[#C41E3A] text-[#C41E3A]' : 'text-gray-400')}
                    />
                </button>

                {/* Out of stock overlay */}
                {isOutOfStock && (
                    <div className="absolute inset-0 bg-gray-900/30 flex items-center justify-center">
                        <span className="bg-gray-800 text-white text-xs font-semibold px-3 py-1 rounded-full">
                            Out of Stock
                        </span>
                    </div>
                )}
            </div>

            {/* Body */}
            <div className="product-card-body">
                {/* Category / Brand */}
                {product.brand && (
                    <span className="text-[10px] text-gray-400 truncate uppercase tracking-wide">{product.brand}</span>
                )}

                {/* Name */}
                <Link
                    href={`/products/${product.slug}`}
                    className="font-semibold text-gray-900 text-sm leading-tight line-clamp-2 hover:text-[#C41E3A] transition-colors"
                >
                    {product.name}
                </Link>

                {/* Rating */}
                {product.average_rating != null && product.review_count != null && (
                    <div className="flex items-center gap-1">
                        <Star size={11} className="fill-orange-400 text-orange-400" />
                        <span className="text-[11px] text-gray-600 font-medium">{product.average_rating.toFixed(1)}</span>
                        <span className="text-[10px] text-gray-400">({product.review_count})</span>
                    </div>
                )}

                {/* Low stock warning */}
                {isLowStock && (
                    <span className="text-[10px] text-orange-500 font-medium">Only a few left!</span>
                )}

                {/* Price + Add */}
                <div className="flex items-end justify-between mt-1">
                    <div>
                        <span className="price text-sm">{formatPrice(product.price)}</span>
                        {discount > 0 && (
                            <div className="flex items-center gap-1">
                                <span className="price-mrp">{formatPrice(product.mrp)}</span>
                            </div>
                        )}
                    </div>

                    {/* Add to cart / Qty selector */}
                    {!isOutOfStock && (
                        <>
                            {quantity === 0 ? (
                                <button
                                    className="add-btn"
                                    onClick={handleAdd}
                                    aria-label={`Add ${product.name} to cart`}
                                >
                                    +
                                </button>
                            ) : (
                                <div className="qty-selector" role="group" aria-label="Quantity">
                                    <button
                                        className="qty-btn"
                                        onClick={handleDecrease}
                                        aria-label="Decrease quantity"
                                    >
                                        −
                                    </button>
                                    <span className="text-white font-bold text-sm w-5 text-center">{quantity}</span>
                                    <button
                                        className="qty-btn"
                                        onClick={handleIncrease}
                                        aria-label="Increase quantity"
                                        disabled={quantity >= product.stock_quantity}
                                    >
                                        +
                                    </button>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </article>
    );
}

// Skeleton loader
export function ProductCardSkeleton() {
    return (
        <div className="card overflow-hidden">
            <div className="skeleton aspect-square" />
            <div className="p-3 space-y-2">
                <div className="skeleton h-3 w-1/2 rounded" />
                <div className="skeleton h-4 w-full rounded" />
                <div className="skeleton h-4 w-3/4 rounded" />
                <div className="flex justify-between items-center mt-2">
                    <div className="skeleton h-5 w-16 rounded" />
                    <div className="skeleton h-8 w-8 rounded-full" />
                </div>
            </div>
        </div>
    );
}
