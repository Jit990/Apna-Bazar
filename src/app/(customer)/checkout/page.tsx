'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
    ShieldCheck, ArrowLeft, MapPin, Loader2, CheckCircle2,
    Plus, Package, CreditCard, Truck, AlertCircle
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { formatPrice } from '@/lib/utils';
import { toast } from 'sonner';
import { createClient } from '@/lib/supabase/client';

interface Address {
    id: string;
    full_name: string;
    phone: string;
    house_flat: string;
    street_locality: string;
    landmark?: string;
    city: string;
    state: string;
    pincode: string;
    is_default: boolean;
}

interface OrderResult {
    order_id: string;
    order_number: string;
    payment_method: string;
    razorpay_order_id?: string;
    razorpay_key_id?: string;
    amount?: number;
}

declare global {
    interface Window {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        Razorpay: new (options: Record<string, any>) => { open: () => void };
    }
}

export default function CheckoutPage() {
    const router = useRouter();
    const { items, subtotal, clearCart } = useCart();

    const [loading, setLoading] = useState(false);
    const [addressLoading, setAddressLoading] = useState(true);
    const [success, setSuccess] = useState(false);
    const [successOrder, setSuccessOrder] = useState<{ order_number: string; order_id: string } | null>(null);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [authChecked, setAuthChecked] = useState(false);

    const [addresses, setAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>('');
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'razorpay'>('cod');
    const [couponCode, setCouponCode] = useState('');
    const [deliveryNote, setDeliveryNote] = useState('');
    const [storeOpen, setStoreOpen] = useState(true);

    // Delivery fee calculation (will be verified server-side)
    const deliveryFee = subtotal >= 499 ? 0 : 30;
    const total = subtotal + deliveryFee;

    useEffect(() => {
        // Check auth
        const checkAuth = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            setAuthChecked(true);
        };
        checkAuth();

        // Check store status
        const checkStore = async () => {
            try {
                const res = await fetch('/api/store-settings');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success) {
                        setStoreOpen(data.data?.is_store_open !== false);
                    }
                }
            } catch { /* non-critical */ }
        };
        checkStore();
    }, []);

    useEffect(() => {
        if (!authChecked) return;
        if (!isLoggedIn) return;

        // Load saved addresses
        const loadAddresses = async () => {
            setAddressLoading(true);
            try {
                const res = await fetch('/api/addresses');
                if (res.ok) {
                    const data = await res.json();
                    if (data.success && data.data?.length > 0) {
                        setAddresses(data.data);
                        const defaultAddr = data.data.find((a: Address) => a.is_default) ?? data.data[0];
                        setSelectedAddressId(defaultAddr?.id ?? '');
                    }
                }
            } catch { /* non-critical */ } finally {
                setAddressLoading(false);
            }
        };
        loadAddresses();
    }, [authChecked, isLoggedIn]);

    useEffect(() => {
        if (items.length === 0 && !success) {
            router.push('/cart');
        }
    }, [items, router, success]);

    const handleCODOrder = async () => {
        if (!selectedAddressId) {
            toast.error('Please select a delivery address');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address_id: selectedAddressId,
                    payment_method: 'cod',
                    coupon_code: couponCode.trim() || null,
                    delivery_note: deliveryNote.trim() || null,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                toast.error(data.error ?? 'Failed to place order. Please try again.');
                return;
            }
            clearCart();
            setSuccessOrder({ order_number: data.data.order_number, order_id: data.data.order_id });
            setSuccess(true);
        } catch {
            toast.error('Network error. Please check your connection and try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleRazorpayOrder = async () => {
        if (!selectedAddressId) {
            toast.error('Please select a delivery address');
            return;
        }
        setLoading(true);
        try {
            const res = await fetch('/api/checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    address_id: selectedAddressId,
                    payment_method: 'razorpay',
                    coupon_code: couponCode.trim() || null,
                    delivery_note: deliveryNote.trim() || null,
                }),
            });
            const data = await res.json();
            if (!res.ok || !data.success) {
                toast.error(data.error ?? 'Payment setup failed. Please try again.');
                return;
            }

            const orderData = data.data as OrderResult;

            // Load Razorpay script if not loaded
            if (!window.Razorpay) {
                await new Promise<void>((resolve, reject) => {
                    const script = document.createElement('script');
                    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
                    script.onload = () => resolve();
                    script.onerror = () => reject(new Error('Failed to load Razorpay'));
                    document.head.appendChild(script);
                });
            }

            const rzp = new window.Razorpay({
                key: orderData.razorpay_key_id,
                amount: (orderData.amount ?? total) * 100,
                currency: 'INR',
                order_id: orderData.razorpay_order_id,
                name: 'Apna Bazar',
                description: `Order #${orderData.order_number}`,
                prefill: {},
                theme: { color: '#1A7850' },
                handler: async (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => {
                    // Verify payment on server
                    setLoading(true);
                    try {
                        const verifyRes = await fetch('/api/payments/verify', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                order_id: orderData.order_id,
                            }),
                        });
                        const verifyData = await verifyRes.json();
                        if (verifyData.success) {
                            clearCart();
                            setSuccessOrder({ order_number: orderData.order_number, order_id: orderData.order_id });
                            setSuccess(true);
                        } else {
                            toast.error('Payment verification failed. Please contact support.');
                        }
                    } catch {
                        toast.error('Payment verification error. Please contact support.');
                    } finally {
                        setLoading(false);
                    }
                },
                modal: {
                    ondismiss: () => {
                        setLoading(false);
                        toast('Payment cancelled');
                    }
                }
            });
            rzp.open();
        } catch (err) {
            toast.error(err instanceof Error ? err.message : 'Payment error');
            setLoading(false);
        }
    };

    const handlePlaceOrder = () => {
        if (paymentMethod === 'cod') {
            handleCODOrder();
        } else {
            handleRazorpayOrder();
        }
    };

    // ── Success State ──────────────────────────────────────
    if (success && successOrder) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
                <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-fade-in">
                    <CheckCircle2 size={48} />
                </div>
                <h1 className="text-2xl font-brand font-black text-gray-900 mb-2">Order Confirmed!</h1>
                <p className="text-gray-500 text-center text-sm mb-2">
                    Your order <span className="font-bold text-gray-800">#{successOrder.order_number}</span> has been placed.
                </p>
                <p className="text-gray-400 text-xs text-center mb-8">
                    We will deliver to your address soon.
                </p>
                <div className="w-full max-w-xs space-y-3">
                    <button onClick={() => router.push('/account')} className="btn-primary w-full py-3.5 rounded-xl text-base">
                        Track Your Order
                    </button>
                    <button onClick={() => router.push('/')} className="w-full bg-white text-gray-900 border border-gray-200 font-semibold py-3.5 rounded-xl transition-all active:scale-95">
                        Continue Shopping
                    </button>
                </div>
            </div>
        );
    }

    // ── Auth Gate ──────────────────────────────────────────
    if (authChecked && !isLoggedIn) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-6">
                    <ShieldCheck size={40} className="text-primary" />
                </div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Login Required</h2>
                <p className="text-gray-500 text-sm text-center mb-6">Please login to complete your purchase.</p>
                <button onClick={() => router.push('/account')} className="btn-primary w-full max-w-xs py-3.5 rounded-xl">
                    Login / Sign Up
                </button>
            </div>
        );
    }

    // ── Store Closed ───────────────────────────────────────
    if (!storeOpen) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
                <div className="text-4xl mb-4">🏪</div>
                <h2 className="text-xl font-bold text-gray-900 mb-2">Store is Closed</h2>
                <p className="text-gray-500 text-sm text-center mb-6">We are currently closed. Please try again during our business hours.</p>
                <button onClick={() => router.push('/')} className="btn-primary w-full max-w-xs py-3.5 rounded-xl">Back to Home</button>
            </div>
        );
    }

    const selectedAddress = addresses.find(a => a.id === selectedAddressId);

    return (
        <div className="min-h-screen bg-gray-50 pb-28">
            {/* Header */}
            <div className="bg-white px-4 py-3 border-b flex items-center gap-3 sticky top-0 z-40 shadow-sm">
                <button onClick={() => router.back()} className="text-gray-900 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                    <ArrowLeft size={20} />
                </button>
                <h1 className="font-brand font-bold text-lg text-gray-900">Checkout</h1>
            </div>

            <div className="p-3 space-y-3">
                {/* Delivery Address */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2">
                            <MapPin size={16} className="text-primary" />
                            Delivery Address
                        </h2>
                        <button
                            onClick={() => router.push('/account?tab=addresses')}
                            className="text-primary text-xs font-semibold"
                        >
                            + Add New
                        </button>
                    </div>

                    {addressLoading ? (
                        <div className="skeleton h-16 rounded-xl" />
                    ) : addresses.length === 0 ? (
                        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-2">
                            <AlertCircle size={16} className="text-amber-600 mt-0.5 flex-shrink-0" />
                            <div>
                                <div className="text-amber-800 text-sm font-medium">No saved address</div>
                                <button
                                    onClick={() => router.push('/account?tab=addresses')}
                                    className="text-primary text-xs font-semibold mt-1 flex items-center gap-1"
                                >
                                    <Plus size={12} /> Add delivery address
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2">
                            {addresses.map((addr) => (
                                <label
                                    key={addr.id}
                                    className={`flex items-start gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${selectedAddressId === addr.id ? 'border-primary bg-emerald-50/60' : 'border-gray-200'
                                        }`}
                                >
                                    <input
                                        type="radio"
                                        name="address"
                                        value={addr.id}
                                        checked={selectedAddressId === addr.id}
                                        onChange={() => setSelectedAddressId(addr.id)}
                                        className="mt-0.5 w-4 h-4"
                                    />
                                    <div className="flex-1 min-w-0">
                                        <div className="font-semibold text-gray-900 text-sm flex items-center gap-1">
                                            {addr.full_name}
                                            {addr.is_default && (
                                                <span className="text-[10px] bg-emerald-100 text-primary px-1.5 py-0.5 rounded-full font-medium">Default</span>
                                            )}
                                        </div>
                                        <div className="text-gray-600 text-xs mt-0.5 leading-relaxed">
                                            {addr.house_flat}, {addr.street_locality}
                                            {addr.landmark && `, ${addr.landmark}`}, {addr.city} - {addr.pincode}
                                        </div>
                                        <div className="text-gray-700 text-xs font-medium mt-1">📞 {addr.phone}</div>
                                    </div>
                                </label>
                            ))}
                        </div>
                    )}

                    {selectedAddress && (
                        <div className="mt-3 flex items-center gap-2 text-xs text-emerald-700 bg-emerald-50 rounded-lg px-3 py-2">
                            <Truck size={12} /> Delivering to: <strong>{selectedAddress.city}, {selectedAddress.pincode}</strong>
                        </div>
                    )}
                </div>

                {/* Order Items Summary */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900 text-sm flex items-center gap-2 mb-3">
                        <Package size={16} className="text-primary" />
                        Order Items ({items.length})
                    </h2>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                        {items.map((item) => (
                            <div key={item.product_id} className="flex items-center justify-between text-sm">
                                <span className="text-gray-700 truncate flex-1 mr-2">{item.product.name}</span>
                                <span className="text-gray-500 text-xs">×{item.quantity}</span>
                                <span className="font-semibold text-gray-900 ml-3">{formatPrice(item.unit_price * item.quantity)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Coupon */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900 text-sm mb-3">🏷️ Coupon Code</h2>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                            placeholder="Enter coupon code"
                            className="input flex-1 uppercase"
                        />
                        <button
                            onClick={() => couponCode && toast.info('Coupon will be verified at checkout')}
                            className="btn-outline px-4 py-2 text-sm"
                        >
                            Apply
                        </button>
                    </div>
                </div>

                {/* Payment Method */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900 text-sm mb-3 flex items-center gap-2">
                        <CreditCard size={16} className="text-primary" />
                        Payment Method
                    </h2>
                    <div className="space-y-2">
                        <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-emerald-50/60' : 'border-gray-200'}`}>
                            <input type="radio" name="payment" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-4 h-4" />
                            <div>
                                <div className="font-semibold text-gray-900 text-sm">💵 Cash on Delivery (COD)</div>
                                <div className="text-gray-500 text-xs">Pay when you receive the order</div>
                            </div>
                        </label>
                        <label className={`flex items-center gap-3 p-3 border rounded-xl cursor-pointer transition-colors ${paymentMethod === 'razorpay' ? 'border-primary bg-emerald-50/60' : 'border-gray-200'}`}>
                            <input type="radio" name="payment" checked={paymentMethod === 'razorpay'} onChange={() => setPaymentMethod('razorpay')} className="w-4 h-4" />
                            <div>
                                <div className="font-semibold text-gray-900 text-sm">💳 Online Payment</div>
                                <div className="text-gray-500 text-xs">UPI, Cards, NetBanking via Razorpay</div>
                            </div>
                        </label>
                    </div>
                </div>

                {/* Delivery Note */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900 text-sm mb-2">📝 Delivery Instructions (Optional)</h2>
                    <textarea
                        value={deliveryNote}
                        onChange={(e) => setDeliveryNote(e.target.value)}
                        placeholder="E.g. Ring the bell, leave at door..."
                        rows={2}
                        className="input resize-none text-sm"
                    />
                </div>

                {/* Price Summary */}
                <div className="bg-white rounded-2xl p-4 shadow-sm">
                    <h2 className="font-bold text-gray-900 mb-3 text-sm">Price Details</h2>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between text-gray-600">
                            <span>Item Total ({items.reduce((s, i) => s + i.quantity, 0)} items)</span>
                            <span>{formatPrice(subtotal)}</span>
                        </div>
                        <div className="flex justify-between text-gray-600">
                            <span>Delivery Fee</span>
                            {deliveryFee === 0
                                ? <span className="text-green-600 font-semibold">FREE</span>
                                : <span>{formatPrice(deliveryFee)}</span>
                            }
                        </div>
                        {subtotal < 499 && (
                            <div className="text-xs text-orange-500 bg-orange-50 rounded-lg px-3 py-1.5">
                                Add {formatPrice(499 - subtotal)} more for free delivery!
                            </div>
                        )}
                    </div>
                    <div className="border-t border-gray-100 pt-3 mt-3 flex justify-between font-black text-gray-900">
                        <span>Total To Pay</span>
                        <span className="text-primary text-lg">{formatPrice(total)}</span>
                    </div>
                </div>

                {/* Security Note */}
                <div className="flex items-center gap-2 text-xs text-gray-400 px-2">
                    <ShieldCheck size={14} className="text-green-500" />
                    <span>100% secure checkout. Your data is encrypted and protected.</span>
                </div>
            </div>

            {/* Sticky Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 z-30 shadow-[0_-4px_15px_rgba(0,0,0,0.08)] safe-bottom" style={{ maxWidth: '28rem', margin: '0 auto' }}>
                <button
                    onClick={handlePlaceOrder}
                    disabled={loading || items.length === 0 || (authChecked && isLoggedIn && addresses.length === 0)}
                    className="w-full btn-primary flex justify-center items-center py-3.5 rounded-xl shadow-lg disabled:opacity-70 text-base font-bold"
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
