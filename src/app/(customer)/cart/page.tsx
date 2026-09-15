'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck, Plus, Minus, Truck, Clock, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
    const { items, subtotal, updateQuantity, removeFromCart } = useCart();
    const router = useRouter();

    const deliveryFee = subtotal >= 199 ? 0 : 30;
    const total = subtotal + deliveryFee;
    const freeDeliveryDiff = 199 - subtotal;

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-6">
                <div className="w-24 h-24 rounded-3xl bg-[var(--brand-primary-light)] flex items-center justify-center mb-5 shadow-md">
                    <ShoppingBag size={44} className="text-[var(--brand-primary)]" />
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-2" style={{ fontFamily: 'var(--font-brand)' }}>
                    Your cart is empty
                </h1>
                <p className="text-gray-500 text-sm text-center mb-6 max-w-xs">
                    Looks like you haven&apos;t added anything to your cart yet. Start shopping for fresh groceries!
                </p>
                <Link href="/categories" className="btn-primary px-8 py-3 rounded-xl font-bold text-sm">
                    🛒 Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-36 bg-[var(--surface-bg)]">
            {/* Header */}
            <div className="bg-white px-4 py-4 border-b border-[var(--border-light)]">
                <div className="container-app flex items-center justify-between">
                    <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-brand)' }}>
                        My Cart <span className="text-gray-400 text-base font-medium">({items.length} item{items.length > 1 ? 's' : ''})</span>
                    </h1>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[var(--brand-primary)] bg-[var(--brand-primary-light)] px-3 py-1.5 rounded-full">
                        <Clock size={12} /> Delivery in 10 mins
                    </div>
                </div>
            </div>

            {/* Free delivery nudge */}
            {freeDeliveryDiff > 0 && (
                <div className="container-app mt-3">
                    <div className="bg-[#FFFDE7] rounded-xl px-4 py-3 flex items-center gap-2 border border-[#F8E71C]/30">
                        <div className="w-8 h-8 rounded-lg bg-[#F8E71C] flex items-center justify-center flex-shrink-0">
                            <Truck size={14} className="text-[#1B1B1E]" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs font-bold text-gray-800">
                                Add <span className="text-[var(--brand-primary)]">{formatPrice(freeDeliveryDiff)}</span> more for <span className="text-[var(--brand-primary)]">FREE Delivery</span>
                            </p>
                            <div className="h-1.5 rounded-full bg-gray-200 mt-1.5">
                                <div
                                    className="h-full rounded-full bg-[var(--brand-primary)] transition-all duration-500"
                                    style={{ width: `${Math.min((subtotal / 199) * 100, 100)}%` }}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="container-app mt-3">
                <div className="grid lg:grid-cols-3 gap-4">
                    {/* Cart Items */}
                    <div className="lg:col-span-2 space-y-2.5">
                        {items.map((item) => {
                            const imgUrl = (item.product?.image_url as string | undefined) ?? null;
                            const discount = item.product && Number(item.product.mrp) > item.unit_price
                                ? Math.round(((Number(item.product.mrp) - item.unit_price) / Number(item.product.mrp)) * 100)
                                : 0;

                            return (
                                <div key={item.product_id} className="bg-white rounded-2xl p-3 sm:p-4 flex gap-3 sm:gap-4 shadow-sm border border-[var(--border-light)] relative group hover:border-[var(--brand-primary)]/20 transition-all">
                                    {/* Image */}
                                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl bg-gray-50 flex-shrink-0 relative overflow-hidden border border-gray-100">
                                        {imgUrl ? (
                                            <Image src={imgUrl} alt={item.product?.name ?? ''} fill className="object-contain p-2" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                <ShoppingBag size={28} />
                                            </div>
                                        )}
                                        {discount > 0 && (
                                            <div className="absolute top-1 left-1 bg-[#3B82F6] text-white text-[8px] font-bold px-1.5 py-0.5 rounded">
                                                {discount}% OFF
                                            </div>
                                        )}
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 flex flex-col justify-between min-w-0">
                                        <div>
                                            <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight pr-6">
                                                {item.product?.name ?? 'Product'}
                                            </h3>
                                            {item.product?.weight_grams && (
                                                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">
                                                    {Number(item.product.weight_grams) >= 1000
                                                        ? `${(Number(item.product.weight_grams) / 1000).toFixed(Number(item.product.weight_grams) % 1000 === 0 ? 0 : 1)} kg`
                                                        : `${item.product.weight_grams} g`}
                                                </p>
                                            )}
                                        </div>

                                        <div className="flex items-center justify-between mt-2">
                                            <div>
                                                <span className="text-base font-bold text-gray-900" style={{ fontFamily: 'var(--font-brand)' }}>
                                                    {formatPrice(item.unit_price * item.quantity)}
                                                </span>
                                                {discount > 0 && item.product && (
                                                    <span className="ml-1.5 text-xs text-gray-400 line-through">
                                                        {formatPrice(Number(item.product.mrp) * item.quantity)}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Quantity – green pill */}
                                            <div className="flex items-center bg-[var(--brand-primary)] rounded-lg px-1 py-0.5 gap-0.5 shadow-sm">
                                                <button
                                                    onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                                    className="w-7 h-7 flex items-center justify-center text-white rounded-md hover:bg-white/20 transition active:scale-90"
                                                    aria-label="Decrease quantity"
                                                >
                                                    <Minus size={14} strokeWidth={3} />
                                                </button>
                                                <span className="w-7 text-center text-sm font-bold text-white">{item.quantity}</span>
                                                <button
                                                    onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                                    className="w-7 h-7 flex items-center justify-center text-white rounded-md hover:bg-white/20 transition active:scale-90"
                                                    disabled={item.product ? item.quantity >= item.product.stock_quantity : false}
                                                    aria-label="Increase quantity"
                                                >
                                                    <Plus size={14} strokeWidth={3} />
                                                </button>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Remove */}
                                    <button
                                        onClick={() => removeFromCart(item.product_id)}
                                        className="absolute top-3 right-3 w-7 h-7 flex items-center justify-center rounded-full text-gray-300 hover:text-red-500 hover:bg-red-50 transition"
                                        aria-label="Remove item"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            );
                        })}
                    </div>

                    {/* Bill Summary (Desktop sidebar) */}
                    <div className="hidden lg:block">
                        <div className="bg-white rounded-2xl p-5 shadow-sm border border-[var(--border-light)] sticky top-24">
                            <h2 className="font-bold text-gray-900 mb-4 text-base" style={{ fontFamily: 'var(--font-brand)' }}>
                                Bill Details
                            </h2>
                            <div className="space-y-3 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Item Total</span>
                                    <span className="font-medium">{formatPrice(subtotal)}</span>
                                </div>
                                <div className="flex justify-between text-gray-600">
                                    <span>Delivery Fee</span>
                                    {deliveryFee === 0 ? (
                                        <span className="text-[var(--brand-primary)] font-bold flex items-center gap-1">
                                            <Zap size={12} /> FREE
                                        </span>
                                    ) : (
                                        <span className="font-medium">{formatPrice(deliveryFee)}</span>
                                    )}
                                </div>
                                <div className="border-t border-dashed border-gray-200 pt-3 flex justify-between font-bold text-gray-900 text-base">
                                    <span>To Pay</span>
                                    <span style={{ fontFamily: 'var(--font-brand)' }}>{formatPrice(total)}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => router.push('/checkout')}
                                className="w-full btn-primary mt-5 py-3.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2"
                            >
                                Proceed to Checkout <ArrowRight size={16} />
                            </button>

                            <div className="mt-4 flex items-center gap-2 text-xs text-gray-400 font-medium">
                                <ShieldCheck size={14} className="text-[var(--brand-primary)]" />
                                100% secure payment & buyer protection
                            </div>
                        </div>
                    </div>
                </div>

                {/* Mobile Bill */}
                <div className="lg:hidden bg-white rounded-2xl p-4 shadow-sm border border-[var(--border-light)] mt-3">
                    <h2 className="font-bold text-gray-900 mb-3 text-sm">Bill Details</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Item Total</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery Fee</span>
                            {deliveryFee === 0 ? (
                                <span className="text-[var(--brand-primary)] font-bold">FREE</span>
                            ) : (
                                <span>{formatPrice(deliveryFee)}</span>
                            )}
                        </div>
                        <div className="border-t border-dashed border-gray-200 pt-2 flex justify-between font-bold text-gray-900">
                            <span>To Pay</span>
                            <span style={{ fontFamily: 'var(--font-brand)' }}>{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>

                <div className="lg:hidden mt-3 flex items-center gap-2 bg-[var(--brand-primary-light)] text-[var(--brand-primary)] rounded-xl px-4 py-3 text-xs font-medium">
                    <ShieldCheck size={16} className="flex-shrink-0" />
                    <span><strong>Safe & Secure:</strong> 100% secure payment and buyer protection.</span>
                </div>
            </div>

            {/* Sticky mobile checkout */}
            <div className="lg:hidden fixed bottom-[64px] left-0 right-0 p-3 bg-white border-t border-[var(--border-light)] z-30 shadow-[0_-4px_16px_rgba(0,0,0,0.06)]" style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}>
                <button
                    onClick={() => router.push('/checkout')}
                    className="w-full bg-[var(--brand-primary)] text-white flex items-center justify-between px-5 py-3.5 rounded-xl font-bold text-sm active:scale-[0.98] transition"
                    style={{ boxShadow: '0 4px 16px rgba(13,107,61,0.3)' }}
                >
                    <div className="text-left">
                        <span className="text-[10px] uppercase font-bold text-green-200 block">Total</span>
                        <span className="text-lg font-extrabold leading-none" style={{ fontFamily: 'var(--font-brand)' }}>{formatPrice(total)}</span>
                    </div>
                    <div className="flex items-center gap-1.5 bg-white/15 px-3 py-1.5 rounded-lg">
                        Checkout <ArrowRight size={16} />
                    </div>
                </button>
            </div>
        </div>
    );
}
