'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { User, LogOut, Package, MapPin, Heart, ChevronRight, Settings } from 'lucide-react';
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
    const [profile, setProfile] = useState<{ full_name?: string, phone?: string, email?: string } | null>(null);

    useEffect(() => {
        const checkSession = async () => {
            const supabase = createClient();
            const { data: { session } } = await supabase.auth.getSession();
            setIsLoggedIn(!!session);

            if (session) {
                const { data } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
                setProfile(data || { phone: session.user.phone });
            }
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
        } catch {
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
                toast.success('Login successful');
                window.location.reload();
            } else {
                toast.error(data.error || 'Invalid OTP');
            }
        } catch {
            toast.error('Network error');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center pb-20">
                <div className="w-8 h-8 rounded-full border-4 border-gray-200 border-t-[#C41E3A] animate-spin" />
            </div>
        );
    }

    if (!isLoggedIn) {
        return (
            <div className="min-h-screen bg-white pb-20">
                <div className="p-6 pt-12">
                    <h1 className="text-2xl font-brand font-black text-gray-900 mb-2">Login / Sign Up</h1>
                    <p className="text-gray-500 mb-8 text-sm">Enter your phone number to continue shopping with Apna Bazar.</p>

                    {step === 1 ? (
                        <form onSubmit={handleSendOTP} className="space-y-4 animate-fade-in">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Mobile Number</label>
                                <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:ring-2 focus-within:ring-[#C41E3A]/20 focus-within:border-[#C41E3A] transition-all">
                                    <div className="px-4 py-3.5 bg-gray-100 border-r border-gray-200 text-gray-600 font-semibold text-sm flex items-center">
                                        +91
                                    </div>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                                        placeholder="10-digit mobile number"
                                        className="w-full px-4 py-3.5 bg-transparent border-none focus:ring-0 text-gray-900 font-semibold placeholder:font-normal placeholder:text-gray-400"
                                        autoFocus
                                    />
                                </div>
                            </div>
                            <button
                                type="submit"
                                disabled={loading || phone.length < 10}
                                className="w-full btn-primary bg-[#C41E3A] hover:bg-red-700 py-4 font-bold text-base mt-6 shadow-red-900/10 shadow-lg border-2 border-[#C41E3A]"
                            >
                                Send OTP
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOTP} className="space-y-4 animate-fade-in">
                            <div>
                                <div className="flex items-center justify-between mb-2">
                                    <label className="block text-sm font-semibold text-gray-700">Enter OTP</label>
                                    <button
                                        type="button"
                                        onClick={() => setStep(1)}
                                        className="text-xs text-[#C41E3A] font-semibold hover:underline"
                                    >
                                        Change Number
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                    placeholder="Enter 6-digit OTP"
                                    className="input text-center tracking-[0.5em] font-bold text-lg"
                                    autoFocus
                                />
                            </div>
                            {devOtp && (
                                <div className="p-3 bg-blue-50 border border-blue-100 rounded-xl text-center text-sm">
                                    <span className="text-blue-700 font-semibold">Dev Mode:</span> Your OTP is <b className="tracking-widest">{devOtp}</b>
                                </div>
                            )}
                            <button
                                type="submit"
                                disabled={loading || otp.length < 6}
                                className="w-full btn-primary bg-[#C41E3A] hover:bg-red-700 py-4 font-bold text-base mt-6"
                            >
                                Verify & Login
                            </button>
                        </form>
                    )}
                </div>
            </div>
        );
    }

    const handleLogout = async () => {
        setLoading(true);
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success('Logged out successfully');
        setIsLoggedIn(false);
        window.location.reload();
    };

    const MENU_ITEMS = [
        { icon: Package, label: 'My Orders', desc: 'Track, return, or buy again', href: '/orders' },
        { icon: MapPin, label: 'Addresses', desc: 'Edit home, office addresses', href: '/account' },
        { icon: Heart, label: 'Wishlist', desc: 'Your saved items', href: '/wishlist' },
        { icon: Settings, label: 'Settings', desc: 'Update profile details', href: '/account' },
    ];

    const initials = profile?.full_name
        ? profile.full_name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
        : 'AB';

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <div className="bg-[#1A7850] text-white px-4 pt-6 pb-12 rounded-b-3xl relative overflow-hidden shadow-sm">
                <div className="relative z-10">
                    <h1 className="text-2xl font-brand font-black mb-4">My Account</h1>
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-lg flex-shrink-0 text-[#1A7850]">
                            <span className="font-black font-brand text-2xl">{initials}</span>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <div className="text-xl font-bold truncate">{profile?.full_name || 'Valued Customer'}</div>
                            <div className="text-emerald-100 text-sm font-medium">{profile?.phone || profile?.email || 'N/A'}</div>
                        </div>
                    </div>
                </div>
                <div className="absolute right-[-20%] bottom-[-20%] opacity-10">
                    <User size={180} strokeWidth={1} />
                </div>
            </div>

            <div className="px-4 -mt-6 relative z-20">
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-2 space-y-1">
                    {MENU_ITEMS.map((item, idx) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={idx}
                                onClick={() => router.push(item.href || '/account')}
                                className="w-full flex items-center gap-4 p-3 hover:bg-gray-50 rounded-xl transition-colors text-left group"
                            >
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center text-[#1A7850] group-hover:scale-110 transition-transform">
                                    <Icon size={20} />
                                </div>
                                <div className="flex-1">
                                    <div className="font-semibold text-gray-900">{item.label}</div>
                                    <div className="text-[11px] text-gray-500">{item.desc}</div>
                                </div>
                                <ChevronRight size={18} className="text-gray-300 group-hover:text-[#1A7850] group-hover:translate-x-1 transition-all" />
                            </button>
                        );
                    })}
                </div>

                <button
                    onClick={handleLogout}
                    disabled={loading}
                    className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 bg-white border border-red-100 text-red-600 font-bold rounded-xl active:scale-95 transition-all shadow-sm hover:bg-red-50 disabled:opacity-50"
                >
                    <LogOut size={18} />
                    {loading ? 'Logging out...' : 'Log Out securely'}
                </button>
            </div>
        </div>
    );
}
