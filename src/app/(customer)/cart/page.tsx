'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { Trash2, ShoppingBag, ArrowRight, ShieldCheck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
    const { items, subtotal, updateQuantity, removeFromCart } = useCart();
    const router = useRouter();

    // Assuming delivery fee is ₹30 and free delivery over ₹499
    const deliveryFee = subtotal >= 499 ? 0 : 30;
    const total = subtotal + deliveryFee;

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center mb-4">
                    <ShoppingBag size={48} className="text-[#C41E3A]" />
                </div>
                <h1 className="text-xl font-brand font-bold text-gray-900 mb-2">Your cart is empty</h1>
                <p className="text-gray-500 text-sm text-center mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
                <Link href="/categories" className="btn-primary px-8 py-3 rounded-xl font-semibold">
                    Start Shopping
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            <div className="bg-[#C41E3A] px-4 py-4 text-white">
                <h1 className="font-brand font-black text-xl">My Cart ({items.length})</h1>
            </div>

            <div className="p-3">
                {/* Cart Items */}
                <div className="space-y-3 mb-4">
                    {items.map((item) => (
                        <div key={item.product_id} className="bg-white rounded-2xl p-3 flex gap-3 shadow-sm relative">
                            {/* Product Image */}
                            <div className="w-20 h-20 rounded-xl bg-gray-100 flex-shrink-0 relative overflow-hidden">
                                {item.product.image_url ? (
                                    <Image src={item.product.image_url} alt={item.product.name} fill className="object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-400">
                                        <ShoppingBag size={24} />
                                    </div>
                                )}
                            </div>

                            {/* Product Info */}
                            <div className="flex-1 flex flex-col justify-between">
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 leading-tight pr-6">
                                        {item.product.name}
                                    </h3>
                                    <div className="text-[#C41E3A] font-bold text-sm mt-1">{formatPrice(item.unit_price)}</div>
                                </div>

                                {/* Quantity Control */}
                                <div className="flex items-center justify-between mt-2">
                                    <div className="inline-flex items-center bg-gray-100 rounded-lg p-0.5" role="group">
                                        <button
                                            onClick={() => updateQuantity(item.product_id, item.quantity - 1)}
                                            className="w-7 h-7 flex items-center justify-center text-gray-600 bg-white rounded-md shadow-sm"
                                        >
                                            <span className="text-lg font-medium leading-none">−</span>
                                        </button>
                                        <span className="w-8 text-center text-sm font-bold text-gray-900">{item.quantity}</span>
                                        <button
                                            onClick={() => updateQuantity(item.product_id, item.quantity + 1)}
                                            className="w-7 h-7 flex items-center justify-center text-gray-600 bg-white rounded-md shadow-sm"
                                            disabled={item.quantity >= item.product.stock_quantity}
                                        >
                                            <span className="text-lg font-medium leading-none">+</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Remove BTN */}
                            <button
                                onClick={() => removeFromCart(item.product_id)}
                                className="absolute top-3 right-3 text-gray-400 hover:text-red-500 p-1"
                            >
                                <Trash2 size={16} />
                            </button>
                        </div>
                    ))}
                </div>

                {/* Bill Details */}
                <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
                    <h2 className="font-bold text-gray-900 mb-3 text-sm">Bill Details</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Item Total</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery Fee</span>
                            {deliveryFee === 0 ? (
                                <span className="text-green-600 font-semibold">FREE</span>
                            ) : (
                                <span>{formatPrice(deliveryFee)}</span>
                            )}
                        </div>
                        <div className="border-t border-gray-100 pt-2 mt-2 flex justify-between font-bold text-gray-900">
                            <span>To Pay</span>
                            <span>{formatPrice(total)}</span>
                        </div>
                    </div>
                </div>

                {/* Trust */}
                <div className="bg-green-50 text-green-800 rounded-xl p-3 text-xs flex items-center gap-2 mb-4">
                    <ShieldCheck size={18} className="text-green-600 flex-shrink-0" />
                    <span><strong className="font-semibold">Safe & Secure:</strong> 100% secure payment and buyer protection.</span>
                </div>
            </div>

            {/* Sticky Bottom Checkout */}
            <div className="fixed bottom-[65px] left-0 right-0 p-3 bg-white border-t border-gray-200 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] safe-bottom">
                <button
                    onClick={() => router.push('/checkout')}
                    className="w-full btn-primary flex items-center justify-between px-4 py-3 rounded-xl shadow-lg"
                >
                    <div className="text-left flex flex-col">
                        <span className="text-[10px] uppercase font-bold text-red-200">Total To Pay</span>
                        <span className="text-lg font-black leading-none">{formatPrice(total)}</span>
                    </div>
                    <div className="flex items-center gap-1 font-bold text-sm">
                        Checkout <ArrowRight size={18} />
                    </div>
                </button>
            </div>
        </div>
    );
}
