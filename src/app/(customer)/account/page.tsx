'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
    User, MapPin, Package, Heart, HelpCircle, LogOut,
    ChevronRight, Phone, Shield, Loader2, Sparkles,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';

type Profile = {
    full_name: string | null;
    phone: string | null;
    email: string | null;
    role: string;
};

export default function AccountPage() {
    const router = useRouter();
    const [profile, setProfile] = useState<Profile | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [phone, setPhone] = useState('');
    const [otp, setOtp] = useState('');
    const [step, setStep] = useState<'phone' | 'otp'>('phone');
    const [authLoading, setAuthLoading] = useState(false);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const supabase = createClient();
                const { data: { user } } = await supabase.auth.getUser();

                if (user) {
                    const { data } = await supabase
                        .from('profiles')
                        .select('full_name, phone, email, role')
                        .eq('user_id', user.id)
                        .single();
                    setProfile(data as Profile);
                }
            } catch {
                // Not logged in
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handleSendOtp = async () => {
        if (phone.length !== 10) {
            toast.error('Please enter a valid 10-digit mobile number');
            return;
        }
        setAuthLoading(true);
        try {
            const res = await fetch('/api/auth/send-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `+91${phone}` }),
            });
            const data = await res.json();
            if (data.success) {
                setStep('otp');
                toast.success('OTP sent to your phone');
            } else {
                toast.error(data.error || 'Failed to send OTP');
            }
        } catch {
            toast.error('Something went wrong');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleVerifyOtp = async () => {
        if (otp.length !== 6) {
            toast.error('Please enter a valid 6-digit OTP');
            return;
        }
        setAuthLoading(true);
        try {
            const res = await fetch('/api/auth/verify-otp', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ phone: `+91${phone}`, otp }),
            });
            const data = await res.json();
            if (data.success) {
                toast.success('Logged in successfully!');
                window.location.reload();
            } else {
                toast.error(data.error || 'Invalid OTP');
            }
        } catch {
            toast.error('Verification failed');
        } finally {
            setAuthLoading(false);
        }
    };

    const handleLogout = async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        toast.success('Logged out');
        window.location.reload();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 size={28} className="animate-spin text-[var(--brand-primary)]" />
            </div>
        );
    }

    const menuItems = [
        { icon: Package, label: 'My Orders', href: '/orders', desc: 'Track & manage your orders', color: '#0D6B3D', bg: '#E8F5EE' },
        { icon: MapPin, label: 'My Addresses', href: '/addresses', desc: 'Manage delivery addresses', color: '#3B82F6', bg: '#EFF6FF' },
        { icon: Heart, label: 'Wishlist', href: '/wishlist', desc: 'Your saved items', color: '#E74C3C', bg: '#FFEBEE' },
        { icon: HelpCircle, label: 'Help & Support', href: '/terms', desc: 'FAQs, complaints & feedback', color: '#F59E0B', bg: '#FFFDE7' },
        { icon: Shield, label: 'Privacy Policy', href: '/privacy', desc: 'How we protect your data', color: '#8B5CF6', bg: '#F3E5F5' },
    ];

    return (
        <div className="min-h-screen bg-[var(--surface-bg)]">
            {/* Profile Section */}
            <div className="bg-white border-b border-[var(--border-light)]">
                <div className="container-app py-6">
                    {profile ? (
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D6B3D] to-[#22C55E] flex items-center justify-center flex-shrink-0 shadow-md">
                                <User size={26} className="text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2">
                                    <h1 className="text-lg font-bold text-gray-900 truncate" style={{ fontFamily: 'var(--font-brand)' }}>
                                        {profile.full_name || 'Hello there!'}
                                    </h1>
                                    <Sparkles size={14} className="text-[#F8E71C] flex-shrink-0" />
                                </div>
                                <p className="text-sm text-gray-500 truncate">
                                    {profile.phone || profile.email || 'Welcome to Apna Bazar'}
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gray-100 flex items-center justify-center flex-shrink-0">
                                <User size={26} className="text-gray-400" />
                            </div>
                            <div className="flex-1">
                                <h1 className="text-lg font-bold text-gray-900" style={{ fontFamily: 'var(--font-brand)' }}>
                                    Welcome to Apna Bazar
                                </h1>
                                <p className="text-sm text-gray-500">Sign in to manage your account</p>
                            </div>
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="btn-primary btn-sm rounded-xl"
                            >
                                Login
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Menu */}
            <div className="container-app py-4">
                <div className="bg-white rounded-2xl border border-[var(--border-light)] overflow-hidden shadow-sm divide-y divide-[var(--border-light)]">
                    {menuItems.map(({ icon: Icon, label, href, desc, color, bg }) => (
                        <Link
                            key={href}
                            href={href}
                            className="flex items-center gap-4 px-4 py-3.5 hover:bg-gray-50 transition group"
                        >
                            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200 group-hover:scale-105 group-hover:shadow-sm" style={{ background: bg, color }}>
                                <Icon size={18} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-800">{label}</p>
                                <p className="text-xs text-gray-400 font-medium">{desc}</p>
                            </div>
                            <ChevronRight size={16} className="text-gray-300 group-hover:text-[var(--brand-primary)] group-hover:translate-x-0.5 transition-all" />
                        </Link>
                    ))}
                </div>

                {/* Logout */}
                {profile && (
                    <button
                        onClick={handleLogout}
                        className="w-full mt-4 bg-white rounded-2xl border border-[var(--border-light)] px-4 py-3.5 flex items-center gap-4 text-red-500 hover:bg-red-50 transition shadow-sm group"
                    >
                        <div className="w-10 h-10 rounded-xl bg-red-50 flex items-center justify-center group-hover:bg-red-100 transition">
                            <LogOut size={18} />
                        </div>
                        <span className="text-sm font-semibold">Log Out</span>
                    </button>
                )}
            </div>

            {/* Login Modal */}
            {showLoginModal && (
                <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-fade-in" onClick={() => setShowLoginModal(false)}>
                    <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full sm:max-w-md p-6 shadow-xl animate-slide-up" onClick={(e) => e.stopPropagation()}>
                        <div className="text-center mb-6">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0D6B3D] to-[#22C55E] flex items-center justify-center mx-auto mb-3 shadow-md">
                                <Phone size={24} className="text-white" />
                            </div>
                            <h2 className="text-xl font-bold text-gray-900" style={{ fontFamily: 'var(--font-brand)' }}>
                                {step === 'phone' ? 'Enter your number' : 'Verify OTP'}
                            </h2>
                            <p className="text-sm text-gray-500 mt-1">
                                {step === 'phone' ? 'We\'ll send you a verification code' : `Code sent to +91 ${phone}`}
                            </p>
                        </div>

                        {step === 'phone' ? (
                            <div>
                                <div className="relative mb-4">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm text-gray-500 font-semibold">+91</span>
                                    <input
                                        type="tel"
                                        maxLength={10}
                                        value={phone}
                                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                                        placeholder="Enter 10 digit number"
                                        className="input pl-12"
                                        autoFocus
                                    />
                                </div>
                                <button
                                    onClick={handleSendOtp}
                                    disabled={authLoading || phone.length !== 10}
                                    className="btn-primary w-full py-3 rounded-xl"
                                >
                                    {authLoading ? <Loader2 size={18} className="animate-spin" /> : 'Send OTP'}
                                </button>
                            </div>
                        ) : (
                            <div>
                                <input
                                    type="text"
                                    maxLength={6}
                                    value={otp}
                                    onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                                    placeholder="Enter 6-digit OTP"
                                    className="input text-center text-2xl tracking-[0.5em] mb-4 font-bold"
                                    autoFocus
                                />
                                <button
                                    onClick={handleVerifyOtp}
                                    disabled={authLoading || otp.length !== 6}
                                    className="btn-primary w-full py-3 rounded-xl"
                                >
                                    {authLoading ? <Loader2 size={18} className="animate-spin" /> : 'Verify & Login'}
                                </button>
                                <button
                                    onClick={() => { setStep('phone'); setOtp(''); }}
                                    className="w-full text-center text-sm text-gray-500 mt-3 hover:text-[var(--brand-primary)] font-medium"
                                >
                                    Change number
                                </button>
                            </div>
                        )}

                        <button
                            onClick={() => setShowLoginModal(false)}
                            className="w-full text-center text-sm text-gray-400 mt-4 hover:text-gray-600 font-medium"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
