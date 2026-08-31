'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, ArrowLeft, MapPin, Loader2, CheckCircle2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();
    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);

    const deliveryFee = subtotal >= 499 ? 0 : 30;
    const total = subtotal + deliveryFee;

    const [address, setAddress] = useState('Bajkul, West Bengal 721655');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');

    useEffect(() => {
        if (items.length === 0 && !success) {
            router.push('/cart');
        }
    }, [items, router, success]);

    const handlePlaceOrder = async () => {
        // Basic mock checkout logic for the frontend since auth flow might not be signed in during dev testing yet
        setLoading(true);

        // Simulating API call
        setTimeout(() => {
            setLoading(false);
            setSuccess(true);
            clearCart();
            toast.success('Order placed successfully!');
        }, 1500);
    };

    if (success) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6">
                    <CheckCircle2 size={40} />
                </div>
                <h1 className="text-2xl font-brand font-black text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 text-center text-sm mb-6 max-w-sm">
                    Thank you for shopping at Apna Bazar! Your order will be delivered soon.
                </p>
                <button
                    onClick={() => router.push('/account')}
                    className="btn-primary w-full max-w-xs py-3 rounded-xl mb-3"
                >
                    Track Order
                </button>
                <button
                    onClick={() => router.push('/')}
                    className="bg-white text-gray-900 border border-gray-200 font-semibold w-full max-w-xs py-3 rounded-xl"
                >
                    Continue Shopping
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b flex items-center gap-3 sticky top-0 z-40">
                <button onClick={() => router.back()} className="text-gray-900 p-1">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-brand font-bold text-lg text-gray-900">Checkout</h1>
            </div>

            <div className="p-3 space-y-3">
                {/* Delivery Address */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <MapPin size={16} className="text-[#C41E3A]" /> Delivery Address
                        </h2>
                        <button className="text-[#C41E3A] text-xs font-semibold">Change</button>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                        <div className="font-semibold text-gray-800 text-sm mb-1">Home</div>
                        <div className="text-gray-600 text-xs leading-relaxed">{address}</div>
                        <div className="text-gray-800 font-medium text-xs mt-2">+91 9876543210</div>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900 text-sm mb-3">Payment Method</h2>

                    <div className="space-y-2">
                        <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-[#C41E3A] bg-red-50/50' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'cod'}
                                    onChange={() => setPaymentMethod('cod')}
                                    className="w-4 h-4 text-[#C41E3A] border-gray-300 focus:ring-[#C41E3A]"
                                />
                                <div>
                                    <div className="font-semibold text-gray-900 text-sm">Cash on Delivery (COD)</div>
                                    <div className="text-gray-500 text-[10px]">Pay when you receive the order</div>
                                </div>
                            </div>
                        </label>

                        <label className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-[#C41E3A] bg-red-50/50' : 'border-gray-200'}`}>
                            <div className="flex items-center gap-3">
                                <input
                                    type="radio"
                                    name="payment"
                                    checked={paymentMethod === 'razorpay'}
                                    onChange={() => setPaymentMethod('razorpay')}
                                    className="w-4 h-4 text-[#C41E3A] border-gray-300 focus:ring-[#C41E3A]"
                                />
                                <div>
                                    <div className="font-semibold text-gray-900 text-sm">Online Payment</div>
                                    <div className="text-gray-500 text-[10px]">UPI, Cards, NetBanking via Razorpay</div>
                                </div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Order Summary */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900 mb-3 text-sm flex items-center justify-between">
                        <span>Order Summary</span>
                        <span className="text-xs font-normal text-gray-500">{items.length} items</span>
                    </h2>
                    <div className="space-y-2 text-sm mb-3">
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
                    </div>
                    <div className="border-t border-gray-100 pt-3 flex justify-between font-black text-gray-900">
                        <span>Total To Pay</span>
                        <span className="text-[#C41E3A] text-lg">{formatPrice(total)}</span>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom Actions */}
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 z-30 shadow-[0_-4px_10px_rgba(0,0,0,0.05)] safe-bottom">
                <button
                    onClick={handlePlaceOrder}
                    disabled={loading || items.length === 0}
                    className="w-full btn-primary flex justify-center items-center py-3.5 rounded-xl shadow-lg disabled:opacity-70 text-base"
                >
                    {loading ? (
                        <span className="flex items-center gap-2">
                            <Loader2 size={20} className="animate-spin" /> Processing...
                        </span>
                    ) : (
                        `Place Order • ${formatPrice(total)}`
                    )}
                </button>
            </div>
        </div>
    );
}
