'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Package, MapPin, Heart, ChevronRight, Settings, Phone } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

export default function AccountPage() {
    const router = useRouter();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [loading, setLoading] = useState(true);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState(1);
    const [devOtp, setDevOtp] = useState<string | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);
            setLoading(false);
        };
        checkSession();
    }, []);

    const handleSendOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (phone.length < 10) return toast.error('Enter valid phone number');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('OTP sent successfully');
                setStep(2);
                if (data.data?.devOtp) setDevOtp(data.data.devOtp);
            } else {
                toast.error(data.error || 'Failed to send OTP');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async (e: React.FormEvent) => {
        e.preventDefault();
        if (otp.length < 6) return toast.error('Enter valid OTP');
        setLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone, otp })
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Logged in successfully');
                setIsLoggedIn(true);
                router.refresh();
            } else {
                toast.error(data.error || 'Invalid OTP');
            }
        } catch (err) {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (loading && !isLoggedIn && step === 1) {
        return <div className="min-h-[85vh] bg-gray-50 flex items-center justify-center">Loading...</div>;
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-[85vh] bg-gray-50 pt-10 px-6 flex flex-col items-center">
                <div className="w-20 h-20 bg-red-100 text-[#C41E3A] rounded-full flex items-center justify-center mb-6">
                    <User size={40} />
                </div>
                <h1 className="text-2xl font-brand font-black text-gray-900 mb-2">My Account</h1>
                <p className="text-gray-500 text-sm text-center mb-10 max-w-xs">
                    Login or create an account to track orders, save addresses, and manage your wishlist.
                </p>

                {step === 1 ? (
                    <form onSubmit={handleSendOTP} className="w-full max-w-sm space-y-4">
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold text-sm">+91</span>
                            <input
                                type="tel"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                                placeholder="Phone Number"
                                className="input pl-12"
                                required
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading || phone.length < 10}
                            className="w-full btn-primary py-3.5 rounded-xl font-bold text-base"
                        >
                            {loading ? 'Sending...' : 'Get OTP'}
                        </button>
                    </form>
                ) : (
                    <form onSubmit={handleVerifyOTP} className="w-full max-w-sm space-y-4">
                        <div className="text-sm text-center text-gray-600 mb-2">
                            Sent to +91 {phone} <button type="button" onClick={() => setStep(1)} className="text-[#C41E3A] font-medium ml-1">Edit</button>
                        </div>
                        <input
                            type="text"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            placeholder="Enter 6-digit OTP"
                            className="input text-center tracking-[0.5em] text-lg font-bold placeholder:tracking-normal placeholder:font-normal"
                            required
                        />
                        {devOtp && (
                            <div className="text-xs text-center text-green-600 font-mono bg-green-50 p-2 rounded-lg">
                                Dev OTP: {devOtp}
                            </div>
                        )}
                        <button
                            type="submit"
                            disabled={loading || otp.length < 6}
                            className="w-full btn-primary py-3.5 rounded-xl font-bold text-base"
                        >
                            {loading ? 'Verifying...' : 'Verify Login'}
                        </button>
                    </form>
                )}
            </div>
        );
    }

    const handleLogout = async () => {
        setLoading(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success('Logged out successfully');
        setIsLoggedIn(false);
        setLoading(false);
    };

    const MENU_ITEMS = [
        { icon: Package, label: 'My Orders', desc: 'Track, return, or buy things again' },
        { icon: MapPin, label: 'Saved Addresses', desc: 'Edit home, office, and other addresses' },
        { icon: Heart, label: 'Wishlist', desc: 'Your saved items' },
        { icon: Settings, label: 'Profile Settings', desc: 'Update name, email, and phone' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-[#C41E3A] text-white px-4 pt-6 pb-12 rounded-b-3xl">
                <h1 className="text-2xl font-brand font-black mb-4">My Account</h1>
                <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center border-2 border-red-300">
                        <span className="text-[#C41E3A] font-black font-brand text-2xl">JD</span>
                    </div>
                    <div>
                        <div className="text-xl font-bold">John Doe</div>
                        <div className="text-red-200 text-sm font-medium">+91 9876543210</div>
                    </div>
                </div>
            </div>

            <div className="px-4 -mt-6">
                <div className="bg-white rounded-2xl shadow-md p-2 space-y-1">
                    {MENU_ITEMS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button key={idx} className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left group">
                                <div className="w-10 h-10 rounded-full bg-red-50 flex items-center justify-center text-[#C41E3A] group-hover:scale-110 transition-transform">
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{item.label}</div>
                                    <div className="text-xs text-gray-500">{item.desc}</div>
                                </div>
                                <ChevronRight size={18} className="text-gray-400 group-hover:text-[#C41E3A] group-hover:translate-x-1 transition-all" />
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 bg-white border border-gray-200 text-red-600 font-bold rounded-xl active:scale-95 transition-all shadow-sm disabled:opacity-50"
                >
                    <LogOut size={18} />
                    {loading ? 'Logging out...' : 'Log Out'}
                </button>
            </div>
        </div>
    );
}
